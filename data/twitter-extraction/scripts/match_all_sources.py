#!/usr/bin/env python3
"""
Comprehensive Multi-Source Tweet Matcher

Matches tweets against ALL data sources on the dravidamodel website:
1. Projects (150 JSON files) - Infrastructure, metro, flyovers, etc.
2. Industries (TS file) - Industrial investments, companies, sectors
3. Education (TS file) - Schemes like Pudhumai Penn, Naan Mudhalvan
4. Social Welfare (TS file) - KMUT, Pongal gifts, pensions
5. Healthcare, Employment, Agriculture, Environment, Sports/Culture, Tamil History

Usage:
  python3 match_all_sources.py --test      # Test on sample
  python3 match_all_sources.py --all       # Full matching
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Tuple

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
PROJECTS_DIR = Path("app/src/data/projects")
LIB_DATA_DIR = Path("app/src/lib/data")
OUTPUT_DIR = Path("data/twitter-extraction/matched")

# Tamil keywords for matching
TAMIL_STOPWORDS = {"திட்டம்", "அரசு", "தமிழ்நாடு", "முதலமைச்சர்"}


def extract_ts_data(file_path: Path) -> List[Dict]:
    """Extract data objects from TypeScript files."""
    if not file_path.exists():
        return []

    content = file_path.read_text()
    items = []

    # Different extraction patterns based on file
    name = file_path.stem

    if name == "industries":
        # Extract from industrialParks array
        items.extend(extract_industrial_parks(content))
        # Extract sector names
        items.extend(extract_sectors(content))
    elif name == "education":
        items.extend(extract_schemes(content, "educationSchemes"))
    elif name == "socialWelfare":
        items.extend(extract_schemes(content, "welfareSchemes"))
    elif name == "healthcare":
        items.extend(extract_schemes(content, "healthcareSchemes"))
    elif name == "employment":
        items.extend(extract_schemes(content, "employmentSchemes"))
    elif name == "agriculture":
        items.extend(extract_schemes(content, "agricultureSchemes"))
    elif name == "environment":
        items.extend(extract_schemes(content, "environmentSchemes"))
    elif name == "sportsCulture":
        items.extend(extract_schemes(content, "sportsSchemes"))
    elif name == "tamilHistory":
        items.extend(extract_schemes(content, "historyItems"))

    return items


def extract_industrial_parks(content: str) -> List[Dict]:
    """Extract industrial park entries from industries.ts."""
    items = []

    # Use a more flexible pattern to extract each object block
    # Look for each id: "..." pattern and extract surrounding fields

    # First get all IDs
    id_pattern = r'id:\s*"([^"]+)"'

    # Split content by objects (each starts with {)
    # Find the industrialParks array section
    parks_start = content.find("export const industrialParks")
    if parks_start == -1:
        return items

    parks_section = content[parks_start:]

    # Extract each object
    current_pos = 0
    brace_count = 0
    in_object = False
    object_start = 0
    objects = []

    for i, char in enumerate(parks_section):
        if char == '{':
            if brace_count == 0:
                object_start = i
                in_object = True
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and in_object:
                objects.append(parks_section[object_start:i+1])
                in_object = False

        # Stop when we hit the next export
        if i > 1000 and "export const " in parks_section[i:i+15] and brace_count == 0:
            break

    for obj in objects:
        # Extract fields
        id_match = re.search(r'id:\s*"([^"]+)"', obj)
        name_match = re.search(r'name:\s*"([^"]+)"', obj)
        company_match = re.search(r'company:\s*"([^"]*)"', obj)
        location_match = re.search(r'location:\s*"([^"]+)"', obj)
        district_match = re.search(r'district:\s*"([^"]+)"', obj)
        sector_match = re.search(r'sector:\s*\[([^\]]*)\]', obj)
        notes_match = re.search(r'notes:\s*"([^"]*)"', obj)

        if not id_match or not name_match:
            continue

        park_id = id_match.group(1)
        name = name_match.group(1)
        company = company_match.group(1) if company_match else ""
        location = location_match.group(1) if location_match else ""
        district = district_match.group(1) if district_match else ""
        notes = notes_match.group(1) if notes_match else ""

        # Extract sector names
        sectors = []
        if sector_match:
            sectors = re.findall(r'"([^"]+)"', sector_match.group(1))

        search_terms = [name.lower()]
        if company:
            search_terms.append(company.lower())
            # Add company variations - split by spaces
            for word in company.split():
                if len(word) >= 3:
                    search_terms.append(word.lower())
        if location:
            search_terms.append(location.lower())
        if district and district.lower() != "multiple":
            search_terms.append(district.lower())
        search_terms.extend([s.lower() for s in sectors])

        # Extract key terms from notes
        if notes:
            # Look for important keywords in notes
            keywords = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', notes)
            for kw in keywords:
                if len(kw) >= 5 and kw.lower() not in ["phase", "crore", "lakh", "annual"]:
                    search_terms.append(kw.lower())

        # Build display name
        full_name = f"{company} - {name}" if company else name

        items.append({
            "source": "industries",
            "id": f"IND-{park_id}",
            "name": full_name,
            "company": company,
            "type": "industrial_investment",
            "patterns": list(set(t for t in search_terms if len(t) >= 3))
        })

    return items


def extract_sectors(content: str) -> List[Dict]:
    """Extract sector definitions from industries.ts."""
    items = []

    # Extract from sectors array
    sector_pattern = r'id:\s*"([^"]+)"[^}]*name:\s*\{\s*en:\s*"([^"]+)"[^}]*ta:\s*"([^"]+)"'

    for match in re.finditer(sector_pattern, content):
        sector_id, en_name, ta_name = match.groups()

        search_terms = [en_name.lower()]
        search_terms.extend(en_name.lower().split())
        if ta_name:
            search_terms.append(ta_name)

        items.append({
            "source": "industries",
            "id": f"SECTOR-{sector_id}",
            "name": en_name,
            "type": "sector",
            "patterns": list(set(t for t in search_terms if len(t) >= 2))
        })

    return items


def extract_schemes(content: str, array_name: str) -> List[Dict]:
    """Extract scheme entries from TS files."""
    items = []

    # Pattern to find scheme objects
    scheme_pattern = r'\{\s*id:\s*"([^"]+)"[^}]*name:\s*\{\s*en:\s*"([^"]+)"[^}]*ta:\s*"([^"]+)"'

    for match in re.finditer(scheme_pattern, content):
        scheme_id, en_name, ta_name = match.groups()

        search_terms = [en_name.lower()]
        # Split camelCase or multi-word names
        search_terms.extend(en_name.lower().split())

        # Add Tamil name
        if ta_name and ta_name not in TAMIL_STOPWORDS:
            search_terms.append(ta_name)
            # Extract Tamil words
            tamil_words = re.findall(r'[\u0B80-\u0BFF]+', ta_name)
            search_terms.extend([w for w in tamil_words if len(w) >= 3 and w not in TAMIL_STOPWORDS])

        # Add common variations
        name_lower = en_name.lower()
        if "scheme" in name_lower:
            search_terms.append(name_lower.replace(" scheme", ""))
        if "program" in name_lower:
            search_terms.append(name_lower.replace(" program", ""))

        # Extract the source category from array name
        source_map = {
            "educationSchemes": "education",
            "welfareSchemes": "welfare",
            "healthcareSchemes": "healthcare",
            "employmentSchemes": "employment",
            "agricultureSchemes": "agriculture",
            "environmentSchemes": "environment",
            "sportsSchemes": "sports",
            "historyItems": "history"
        }

        items.append({
            "source": source_map.get(array_name, "other"),
            "id": scheme_id,
            "name": en_name,
            "name_ta": ta_name,
            "type": "scheme",
            "patterns": list(set(t for t in search_terms if len(t) >= 3))
        })

    return items


def build_project_patterns() -> Dict[str, Dict]:
    """Build search patterns for each project from JSON files."""
    patterns = {}

    for pf in PROJECTS_DIR.glob("*.json"):
        try:
            with open(pf) as f:
                project = json.load(f)

            project_id = project.get("id")
            name = project.get("name", {})

            if isinstance(name, dict):
                en_name = name.get("en", "")
                ta_name = name.get("ta", "")
            else:
                en_name = str(name)
                ta_name = ""

            search_terms = []

            # Full name
            if en_name:
                search_terms.append(en_name.lower())

            # Extract key parts
            if en_name:
                clean_name = re.sub(r'\([^)]+\)', '', en_name)
                parts = [p.strip() for p in clean_name.split('-')]

                for part in parts:
                    if len(part) > 5:
                        search_terms.append(part.lower())

                # Project-specific keywords
                if "metro" in en_name.lower():
                    search_terms.extend(["chennai metro", "cmrl", "metro phase", "மெட்ரோ"])
                    corridor = re.search(r'corridor\s*(\d+)', en_name, re.I)
                    if corridor:
                        search_terms.append(f"corridor {corridor.group(1)}")

                if "tidel" in en_name.lower():
                    search_terms.extend(["tidel park", "tidel neo", "tidel"])

                if "sipcot" in en_name.lower():
                    search_terms.extend(["sipcot", "industrial park"])

                if "bus" in en_name.lower():
                    search_terms.extend(["bus terminus", "bus terminal", "bus stand", "பேருந்து நிலையம்"])

                if "medical college" in en_name.lower():
                    search_terms.extend(["medical college", "மருத்துவக்கல்லூரி"])

                if "flyover" in en_name.lower():
                    search_terms.extend(["flyover", "மேம்பாலம்"])

                if "stadium" in en_name.lower():
                    search_terms.extend(["stadium", "அரங்கம்", "மைதானம்"])

                if "museum" in en_name.lower():
                    search_terms.extend(["museum", "அருங்காட்சியகம்"])

                if "sewerage" in en_name.lower() or "stp" in en_name.lower():
                    search_terms.extend(["sewerage", "stp", "sewage treatment"])

                if "desalination" in en_name.lower():
                    search_terms.extend(["desalination", "desal"])

                if "smart" in en_name.lower() and "city" in en_name.lower():
                    search_terms.append("smart city")

                # Specific identifiers
                if "keezhadi" in en_name.lower():
                    search_terms.extend(["keezhadi", "கீழடி"])
                if "porunai" in en_name.lower():
                    search_terms.extend(["porunai", "பொருநை", "adichanallur"])
                if "kilambakkam" in en_name.lower() or "kcbt" in project_id.lower():
                    search_terms.extend(["kilambakkam", "kcbt", "கிளாம்பாக்கம்"])
                if "breakfast" in en_name.lower():
                    search_terms.extend(["breakfast scheme", "காலை உணவு"])
                if "naan mudhalvan" in en_name.lower():
                    search_terms.extend(["naan mudhalvan", "நான் முதல்வன்"])

            # Tamil name
            if ta_name:
                search_terms.append(ta_name.lower())
                tamil_words = re.findall(r'[\u0B80-\u0BFF]{3,}', ta_name)
                search_terms.extend([w for w in tamil_words if w not in TAMIL_STOPWORDS])

            # Clean and dedupe
            clean_patterns = []
            seen = set()
            for term in search_terms:
                term = term.strip().lower()
                if term and len(term) >= 3 and term not in seen:
                    seen.add(term)
                    clean_patterns.append(term)

            if clean_patterns:
                patterns[project_id] = {
                    "source": "projects",
                    "id": project_id,
                    "name": en_name,
                    "name_ta": ta_name,
                    "type": project.get("type", "Other"),
                    "subType": project.get("subType", ""),
                    "patterns": clean_patterns,
                    "file": str(pf)
                }

        except Exception as e:
            print(f"Error processing {pf}: {e}")

    return patterns


def build_all_patterns() -> Dict[str, Dict]:
    """Build patterns from ALL data sources."""
    all_patterns = {}

    # 1. Projects (JSON files)
    print("Loading projects...")
    project_patterns = build_project_patterns()
    all_patterns.update(project_patterns)
    print(f"  Loaded {len(project_patterns)} projects")

    # 2. Industries (TS file)
    print("Loading industries...")
    industries_data = extract_ts_data(LIB_DATA_DIR / "industries.ts")
    for item in industries_data:
        all_patterns[item["id"]] = item
    print(f"  Loaded {len(industries_data)} industrial entries")

    # 3. Education schemes
    print("Loading education schemes...")
    edu_data = extract_ts_data(LIB_DATA_DIR / "education.ts")
    for item in edu_data:
        all_patterns[item["id"]] = item
    print(f"  Loaded {len(edu_data)} education schemes")

    # 4. Social welfare schemes
    print("Loading welfare schemes...")
    welfare_data = extract_ts_data(LIB_DATA_DIR / "socialWelfare.ts")
    for item in welfare_data:
        all_patterns[item["id"]] = item
    print(f"  Loaded {len(welfare_data)} welfare schemes")

    # 5. Other data files
    for ts_file in ["healthcare.ts", "employment.ts", "agriculture.ts",
                    "environment.ts", "sportsCulture.ts", "tamilHistory.ts"]:
        file_path = LIB_DATA_DIR / ts_file
        if file_path.exists():
            data = extract_ts_data(file_path)
            for item in data:
                all_patterns[item["id"]] = item
            print(f"  Loaded {len(data)} items from {ts_file}")

    return all_patterns


def match_tweet(tweet: dict, patterns: dict) -> List[Tuple[str, float, List[str]]]:
    """Match a tweet against all patterns."""
    text = tweet.get("tweetText", "").lower()

    matches = []

    for item_id, config in patterns.items():
        matched_terms = []
        for pattern in config.get("patterns", []):
            if pattern in text:
                matched_terms.append(pattern)

        if matched_terms:
            # Score based on match quality
            score = 0
            for term in matched_terms:
                term_score = min(1.0, len(term) / 20)
                score += term_score

            score = min(1.0, score / max(1, len(config.get("patterns", [])) / 3))
            matches.append((item_id, score, matched_terms))

    matches.sort(key=lambda x: x[1], reverse=True)
    return matches


def find_all_mentions(entries: List[dict], patterns: dict) -> Dict[str, dict]:
    """Find tweet mentions for all items across all sources."""
    results = defaultdict(lambda: {
        "item": None,
        "matches": [],
        "unique_tweets": set(),
        "accounts": set(),
        "event_types": defaultdict(int),
    })

    for entry in entries:
        tweet_matches = match_tweet(entry, patterns)

        if tweet_matches:
            best_match = tweet_matches[0]
            item_id, score, terms = best_match

            if score < 0.1:
                continue

            result = results[item_id]
            if result["item"] is None:
                result["item"] = patterns[item_id]

            tweet_id = entry.get("sourceTweetId")
            if tweet_id not in result["unique_tweets"]:
                result["unique_tweets"].add(tweet_id)
                result["matches"].append({
                    "entryId": entry.get("entryId"),
                    "date": entry.get("date"),
                    "handle": entry.get("sourceHandle"),
                    "tweetId": tweet_id,
                    "fxUrl": entry.get("fxUrl"),
                    "category": entry.get("category"),
                    "eventType": entry.get("eventType"),
                    "matchScore": score,
                    "matchedTerms": terms,
                    "summary": entry.get("tweetText", "")[:150],
                })

                result["accounts"].add(entry.get("sourceHandle"))
                result["event_types"][entry.get("eventType", "other")] += 1

    # Finalize
    for item_id, data in results.items():
        data["unique_tweets"] = len(data["unique_tweets"])
        data["accounts"] = list(data["accounts"])
        data["event_types"] = dict(data["event_types"])
        data["matches"].sort(key=lambda x: x.get("date", ""))

    return dict(results)


def main():
    parser = argparse.ArgumentParser(description="Multi-source tweet matching")
    parser.add_argument("--test", action="store_true", help="Test on sample")
    parser.add_argument("--all", action="store_true", help="Full matching")
    parser.add_argument("--min-matches", type=int, default=1, help="Minimum matches to include")
    args = parser.parse_args()

    print("=" * 70)
    print("COMPREHENSIVE MULTI-SOURCE TWEET MATCHER")
    print("=" * 70)

    # Build patterns from all sources
    patterns = build_all_patterns()
    print(f"\nTotal items to match: {len(patterns)}")

    # Source breakdown
    sources = defaultdict(int)
    for item_id, config in patterns.items():
        sources[config.get("source", "unknown")] += 1
    print("\nBy source:")
    for src, count in sorted(sources.items()):
        print(f"  {src}: {count}")

    # Load tweets
    verified_file = VERIFIED_DIR / "all_verified.json"
    print(f"\nLoading tweets from {verified_file}...")
    with open(verified_file) as f:
        data = json.load(f)
    entries = data.get("entries", [])
    print(f"Loaded {len(entries)} tweets")

    if args.test:
        entries = entries[:500]
        print(f"Testing on {len(entries)} tweets")

    # Match
    print("\nMatching tweets to all sources...")
    results = find_all_mentions(entries, patterns)

    # Filter
    results = {k: v for k, v in results.items() if v["unique_tweets"] >= args.min_matches}

    # Summary
    print(f"\n{'=' * 70}")
    print("MATCHING RESULTS")
    print(f"{'=' * 70}")
    print(f"Items with matches: {len(results)}")

    total_tweets = sum(r["unique_tweets"] for r in results.values())
    print(f"Total tweet matches: {total_tweets}")

    # By source
    print("\nMatches by source:")
    source_stats = defaultdict(lambda: {"items": 0, "tweets": 0})
    for item_id, data in results.items():
        src = data["item"].get("source", "unknown")
        source_stats[src]["items"] += 1
        source_stats[src]["tweets"] += data["unique_tweets"]

    for src, stats in sorted(source_stats.items(), key=lambda x: -x[1]["tweets"]):
        print(f"  {src}: {stats['items']} items, {stats['tweets']} tweets")

    # Top items
    print("\nTop items by tweet mentions:")
    sorted_results = sorted(results.items(), key=lambda x: x[1]["unique_tweets"], reverse=True)
    for item_id, data in sorted_results[:25]:
        item = data["item"]
        name = item.get("name", "")[:50]
        src = item.get("source", "unknown")
        print(f"  {data['unique_tweets']:4d} tweets: [{src}] {name}")

    # Save results
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / "all_sources_matches.json"

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalItems": len(patterns),
        "matchedItems": len(results),
        "totalTweetMatches": total_tweets,
        "sourceBreakdown": {
            src: {"items": s["items"], "tweets": s["tweets"]}
            for src, s in source_stats.items()
        },
        "results": {
            item_id: {
                "itemId": item_id,
                "source": data["item"].get("source", "unknown"),
                "name": data["item"].get("name", ""),
                "name_ta": data["item"].get("name_ta", ""),
                "type": data["item"].get("type", ""),
                "tweetCount": data["unique_tweets"],
                "accounts": data["accounts"],
                "eventTypes": data["event_types"],
                "matches": data["matches"]
            }
            for item_id, data in sorted_results
        }
    }

    with open(output_file, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to {output_file}")

    return 0


if __name__ == "__main__":
    exit(main())
