#!/usr/bin/env python3
"""
Find New Candidates Not in Existing Data

Identifies projects, schemes, and investments mentioned in tweets that
DON'T exist in the current website data. These are candidates for adding.

Approach:
1. Load all existing items from all data sources
2. Process tweets to extract entity mentions
3. Aggregate mentions that don't match existing items
4. Rank by frequency and confidence

Usage:
  python3 find_new_candidates.py --test
  python3 find_new_candidates.py --all
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Set, Tuple

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
OUTPUT_DIR = Path("data/twitter-extraction/candidates")
MATCHED_FILE = Path("data/twitter-extraction/matched/all_sources_matches.json")

# Entity extraction patterns for TN government projects
PROJECT_PATTERNS = [
    # Infrastructure
    (r"chennai\s+metro(?:\s+rail)?(?:\s+phase\s*(\d+))?(?:\s+corridor\s*(\d+))?", "metro"),
    (r"cmrl(?:\s+phase\s*(\d+))?(?:\s+corridor\s*(\d+))?", "metro"),
    (r"madurai\s+metro", "metro"),
    (r"coimbatore\s+metro", "metro"),
    (r"(\w+(?:\s+\w+)?)\s+flyover", "flyover"),
    (r"(\w+(?:\s+\w+)?)\s+underpass", "underpass"),
    (r"(\w+(?:\s+\w+)?)\s+ring\s+road", "road"),
    (r"(\w+(?:\s+\w+)?)\s+bus\s+(?:terminal|terminus|stand)", "bus_terminal"),
    (r"(\w+)\s+(?:stp|sewage\s+treatment)", "water"),
    (r"(\w+)\s+desalination", "water"),

    # Industrial
    (r"(\w+(?:\s+\w+)?)\s+(?:factory|plant|unit)\s+(?:in|at)\s+(\w+)", "industrial"),
    (r"sipcot\s+(\w+)", "industrial_park"),
    (r"tidel\s+(?:park|neo)?\s*(\w+)?", "it_park"),
    (r"(\w+)\s+industrial\s+park", "industrial_park"),
    (r"(\w+)\s+(?:ev|electric\s+vehicle)\s+(?:plant|factory)", "ev_plant"),

    # Healthcare
    (r"(\w+)\s+(?:medical\s+college|medcol)", "medical_college"),
    (r"(\w+)\s+(?:government\s+hospital|gh)", "hospital"),
    (r"(\w+)\s+super\s+specialty", "hospital"),

    # Education
    (r"(\w+)\s+(?:school|college|university|iti)", "education"),
    (r"smart\s+classroom", "education"),

    # Welfare schemes
    (r"(\w+(?:\s+\w+)?)\s+scheme", "scheme"),
    (r"(\w+(?:\s+\w+)?)\s+yojana", "scheme"),
    (r"(\w+(?:\s+\w+)?)\s+திட்டம்", "scheme"),

    # Sports/Culture
    (r"(\w+)\s+stadium", "sports"),
    (r"(\w+)\s+museum", "culture"),
    (r"(\w+)\s+memorial", "culture"),

    # Energy
    (r"(\w+)\s+(?:solar|wind)\s+(?:plant|park|farm)", "energy"),
    (r"(\w+)\s+power\s+plant", "energy"),
]

# Company/investor patterns
COMPANY_PATTERNS = [
    (r"(foxconn|tata|ola|hyundai|samsung|apple|google|microsoft|amazon)", "company"),
    (r"(adani|reliance|ambuja|jsw|vedanta|hindalco)", "company"),
    (r"(vinfast|byd|tesla|nio)", "ev_company"),
    (r"(infosys|tcs|wipro|cognizant|hcl)", "it_company"),
]

# Investment patterns
INVESTMENT_PATTERN = r"(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)\b"
JOBS_PATTERN = r"([\d,]+)\s*(?:jobs|employment)"

# Generic terms to filter out
GENERIC_TERMS = {
    "tamil nadu", "tamilnadu", "chief minister", "cm", "government", "minister",
    "dmk", "bjp", "congress", "india", "thiru", "hon", "dr", "mr", "ms",
    "prime minister", "union", "state", "today", "yesterday", "new", "first",
    "project", "scheme", "government", "official", "announcement"
}

# Tamil Nadu districts for validation
TN_DISTRICTS = {
    "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem",
    "tirunelveli", "tiruppur", "vellore", "erode", "thoothukudi", "tuticorin",
    "dindigul", "thanjavur", "ranipet", "sivaganga", "virudhunagar", "namakkal",
    "cuddalore", "kanchipuram", "tiruvallur", "chengalpattu", "villupuram",
    "tiruvannamalai", "krishnagiri", "dharmapuri", "ariyalur", "perambalur",
    "nagapattinam", "mayiladuthurai", "karur", "pudukkottai", "ramanathapuram",
    "theni", "nilgiris", "kanyakumari", "tenkasi", "tirupattur", "kallakurichi",
    "hosur", "sriperumbudur", "oragadam"
}


def load_matched_items() -> Set[str]:
    """Load IDs of items that already have matches."""
    matched_ids = set()

    if MATCHED_FILE.exists():
        with open(MATCHED_FILE) as f:
            data = json.load(f)
        for item_id in data.get("results", {}).keys():
            matched_ids.add(item_id.lower())

    return matched_ids


def extract_entities_from_text(text: str) -> List[Dict]:
    """Extract potential project/scheme entities from tweet text."""
    entities = []
    text_lower = text.lower()

    # Try each pattern
    for pattern, entity_type in PROJECT_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            groups = match.groups()
            name_parts = [g for g in groups if g]

            if name_parts:
                name = " ".join(name_parts).strip()
            else:
                name = match.group(0).strip()

            # Skip generic terms
            if any(term in name.lower() for term in GENERIC_TERMS):
                continue

            # Skip very short names
            if len(name) < 4:
                continue

            entities.append({
                "name": name.title(),
                "type": entity_type,
                "raw_match": match.group(0),
            })

    # Extract company mentions
    for pattern, entity_type in COMPANY_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            company = match.group(1).title()
            entities.append({
                "name": company,
                "type": entity_type,
                "raw_match": match.group(0),
            })

    # Extract investment amounts
    inv_match = re.search(INVESTMENT_PATTERN, text_lower)
    if inv_match:
        try:
            amount = float(inv_match.group(1).replace(",", ""))
            for entity in entities:
                entity["investment_crore"] = amount
        except ValueError:
            pass

    # Extract jobs
    jobs_match = re.search(JOBS_PATTERN, text_lower)
    if jobs_match:
        try:
            jobs = int(jobs_match.group(1).replace(",", ""))
            for entity in entities:
                entity["jobs"] = jobs
        except ValueError:
            pass

    # Extract location
    for district in TN_DISTRICTS:
        if district in text_lower:
            for entity in entities:
                entity["location"] = district.title()
            break

    return entities


def generate_entity_key(entity: Dict) -> str:
    """Generate a unique key for entity deduplication."""
    name = entity.get("name", "").lower()
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', '-', name.strip())

    entity_type = entity.get("type", "unknown")
    location = entity.get("location", "").lower()

    if location:
        return f"{location}-{name}-{entity_type}"
    return f"{name}-{entity_type}"


def find_new_candidates(entries: List[dict], matched_ids: Set[str]) -> Dict[str, Dict]:
    """Find entities in tweets that don't exist in current data."""
    candidates = defaultdict(lambda: {
        "name": "",
        "type": "",
        "locations": set(),
        "investments": [],
        "jobs": [],
        "sources": [],
        "accounts": set(),
        "event_types": defaultdict(int),
        "categories": defaultdict(int),
    })

    for entry in entries:
        text = entry.get("tweetText", "")

        # Extract entities from tweet
        entities = extract_entities_from_text(text)

        for entity in entities:
            key = generate_entity_key(entity)

            # Skip if this matches an existing item (very loose check)
            name_lower = entity["name"].lower()
            if any(name_lower in mid or mid in name_lower for mid in matched_ids if len(mid) > 5):
                continue

            candidate = candidates[key]

            if not candidate["name"]:
                candidate["name"] = entity["name"]
                candidate["type"] = entity["type"]

            if entity.get("location"):
                candidate["locations"].add(entity["location"])

            if entity.get("investment_crore"):
                candidate["investments"].append(entity["investment_crore"])

            if entity.get("jobs"):
                candidate["jobs"].append(entity["jobs"])

            # Add source
            source = {
                "date": entry.get("date", ""),
                "handle": entry.get("sourceHandle"),
                "tweetId": entry.get("sourceTweetId"),
                "fxUrl": entry.get("fxUrl"),
                "eventType": entry.get("eventType", "other"),
                "summary": text[:200],
            }
            candidate["sources"].append(source)
            candidate["accounts"].add(entry.get("sourceHandle"))
            candidate["event_types"][entry.get("eventType", "other")] += 1
            candidate["categories"][entry.get("category", "other")] += 1

    # Finalize candidates
    results = {}
    for key, candidate in candidates.items():
        # Require at least 2 mentions
        if len(candidate["sources"]) < 2:
            continue

        # Calculate confidence
        confidence = 0.3
        if len(candidate["sources"]) >= 5:
            confidence += 0.2
        if len(candidate["accounts"]) >= 3:
            confidence += 0.15
        if candidate["investments"]:
            confidence += 0.15
        if candidate["jobs"]:
            confidence += 0.1
        if candidate["locations"]:
            confidence += 0.1

        # Convert sets to lists
        candidate["locations"] = list(candidate["locations"])
        candidate["accounts"] = list(candidate["accounts"])
        candidate["event_types"] = dict(candidate["event_types"])
        candidate["categories"] = dict(candidate["categories"])
        candidate["mention_count"] = len(candidate["sources"])
        candidate["confidence"] = round(min(1.0, confidence), 2)

        # Calculate average investment
        if candidate["investments"]:
            candidate["avg_investment_crore"] = round(
                sum(candidate["investments"]) / len(candidate["investments"]), 2
            )

        # Sort sources by date
        candidate["sources"].sort(key=lambda x: x.get("date", ""))

        # Timeline
        dates = [s["date"] for s in candidate["sources"] if s["date"]]
        if dates:
            candidate["first_mention"] = min(dates)
            candidate["last_mention"] = max(dates)

        results[key] = candidate

    return results


def categorize_candidates(candidates: Dict[str, Dict]) -> Dict[str, List[Dict]]:
    """Group candidates by category for easier review."""
    categorized = defaultdict(list)

    type_to_category = {
        "metro": "infrastructure",
        "flyover": "infrastructure",
        "underpass": "infrastructure",
        "road": "infrastructure",
        "bus_terminal": "infrastructure",
        "water": "infrastructure",
        "industrial": "industries",
        "industrial_park": "industries",
        "it_park": "industries",
        "ev_plant": "industries",
        "company": "industries",
        "ev_company": "industries",
        "it_company": "industries",
        "medical_college": "healthcare",
        "hospital": "healthcare",
        "education": "education",
        "scheme": "welfare",
        "sports": "sports",
        "culture": "culture",
        "energy": "infrastructure",
    }

    for key, candidate in candidates.items():
        category = type_to_category.get(candidate["type"], "other")
        categorized[category].append({
            "key": key,
            **candidate
        })

    # Sort each category by mention count
    for cat in categorized:
        categorized[cat].sort(key=lambda x: -x["mention_count"])

    return dict(categorized)


def main():
    parser = argparse.ArgumentParser(description="Find new candidates not in existing data")
    parser.add_argument("--test", action="store_true", help="Test on sample")
    parser.add_argument("--all", action="store_true", help="Full analysis")
    parser.add_argument("--min-mentions", type=int, default=2, help="Minimum mentions")
    args = parser.parse_args()

    print("=" * 70)
    print("FIND NEW CANDIDATES")
    print("=" * 70)

    # Load matched items
    print("\nLoading matched items...")
    matched_ids = load_matched_items()
    print(f"Found {len(matched_ids)} already-matched items")

    # Load tweets
    verified_file = VERIFIED_DIR / "all_verified.json"
    print(f"\nLoading tweets from {verified_file}...")
    with open(verified_file) as f:
        data = json.load(f)
    entries = data.get("entries", [])
    print(f"Loaded {len(entries)} tweets")

    if args.test:
        entries = entries[:1000]
        print(f"Testing on {len(entries)} tweets")

    # Find candidates
    print("\nExtracting entities and finding new candidates...")
    candidates = find_new_candidates(entries, matched_ids)

    # Filter by minimum mentions
    candidates = {k: v for k, v in candidates.items()
                  if v["mention_count"] >= args.min_mentions}

    print(f"\nFound {len(candidates)} new candidate entities")

    # Categorize
    categorized = categorize_candidates(candidates)

    # Summary
    print(f"\n{'=' * 70}")
    print("NEW CANDIDATES BY CATEGORY")
    print(f"{'=' * 70}")

    total_mentions = 0
    for category, items in sorted(categorized.items(), key=lambda x: -len(x[1])):
        mentions = sum(i["mention_count"] for i in items)
        total_mentions += mentions
        print(f"\n{category.upper()}: {len(items)} candidates, {mentions} mentions")
        for item in items[:5]:
            conf = item["confidence"]
            locs = ", ".join(item["locations"][:2]) if item["locations"] else ""
            inv = f"₹{item.get('avg_investment_crore', 0):.0f}cr" if item.get("avg_investment_crore") else ""
            print(f"  {item['mention_count']:4d}x [{conf:.2f}] {item['name'][:40]} {locs} {inv}")

    print(f"\n{'=' * 70}")
    print(f"TOTAL: {len(candidates)} candidates with {total_mentions} mentions")

    # Save results
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / "new_candidates.json"

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalCandidates": len(candidates),
        "totalMentions": total_mentions,
        "categoryBreakdown": {
            cat: {"count": len(items), "mentions": sum(i["mention_count"] for i in items)}
            for cat, items in categorized.items()
        },
        "candidates": categorized
    }

    with open(output_file, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to {output_file}")

    # Also save a simpler review format
    review_file = OUTPUT_DIR / "candidates_for_review.json"
    review_data = []
    for cat, items in categorized.items():
        for item in items:
            review_data.append({
                "category": cat,
                "name": item["name"],
                "type": item["type"],
                "mentions": item["mention_count"],
                "confidence": item["confidence"],
                "locations": item["locations"],
                "investment_crore": item.get("avg_investment_crore"),
                "accounts": item["accounts"][:5],
                "first_mention": item.get("first_mention"),
                "sample_tweet": item["sources"][0]["summary"] if item["sources"] else "",
            })

    review_data.sort(key=lambda x: -x["mentions"])

    with open(review_file, "w") as f:
        json.dump(review_data, f, indent=2, ensure_ascii=False)
    print(f"Saved review format to {review_file}")

    return 0


if __name__ == "__main__":
    exit(main())
