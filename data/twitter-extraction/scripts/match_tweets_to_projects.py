#!/usr/bin/env python3
"""
Direct Tweet-to-Project Matching

Instead of extracting entities first, directly search for mentions of
the 150 known projects in the tweet corpus. This gives much better
matches because we know exactly what we're looking for.

Usage:
  python3 match_tweets_to_projects.py --test     # Test on sample
  python3 match_tweets_to_projects.py --all      # Full matching
  python3 match_tweets_to_projects.py --project CMRL-P2-C4  # Match specific project
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Optional, Tuple

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
PROJECTS_DIR = Path("app/src/data/projects")
OUTPUT_DIR = Path("data/twitter-extraction/matched")

# Build search patterns for each project
def build_project_patterns():
    """Build regex patterns for each project from the database."""
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

            # Build patterns from English name
            search_terms = []

            # Full name (with word boundaries)
            if en_name:
                search_terms.append(en_name)

            # Extract key parts
            # For "Chennai Metro Phase II - Corridor 3" extract: chennai metro, metro phase ii, corridor 3
            if en_name:
                # Remove parentheses content and split on dashes
                clean_name = re.sub(r'\([^)]+\)', '', en_name)
                parts = [p.strip() for p in clean_name.split('-')]

                for part in parts:
                    if len(part) > 5:  # Skip very short parts
                        search_terms.append(part)

                # Add specific keyword combinations based on project type
                if "metro" in en_name.lower():
                    # Chennai Metro, CMRL, metro phase 2, phase ii
                    search_terms.extend([
                        "chennai metro",
                        "cmrl",
                        "metro phase",
                        "மெட்ரோ",  # Tamil for metro
                    ])
                    # Add corridor-specific
                    corridor_match = re.search(r'corridor\s*(\d+)', en_name, re.I)
                    if corridor_match:
                        search_terms.append(f"corridor {corridor_match.group(1)}")

                if "tidel" in en_name.lower():
                    search_terms.extend(["tidel park", "tidel neo", "tidel"])
                    # Location specific
                    loc_match = re.search(r'tidel.*?-\s*(\w+)', en_name, re.I)
                    if loc_match:
                        search_terms.append(loc_match.group(1))

                if "sipcot" in en_name.lower():
                    search_terms.extend(["sipcot", "industrial park"])

                if "bus" in en_name.lower():
                    search_terms.extend(["bus terminus", "bus terminal", "bus stand", "பேருந்து நிலையம்"])

                if "medical college" in en_name.lower():
                    search_terms.extend(["medical college", "medcol", "மருத்துவக்கல்லூரி"])
                    # Add district name
                    for district in ["ariyalur", "dindigul", "kallakurichi", "krishnagiri",
                                   "nagapattinam", "namakkal", "ramanathapuram", "tiruppur"]:
                        if district in en_name.lower():
                            search_terms.append(f"{district} medical")
                            search_terms.append(district)

                if "flyover" in en_name.lower():
                    search_terms.extend(["flyover", "மேம்பாலம்"])
                    # Location before flyover
                    loc = re.search(r'^(\w+)\s+flyover', en_name, re.I)
                    if loc:
                        search_terms.append(loc.group(1))

                if "stadium" in en_name.lower():
                    search_terms.extend(["stadium", "அரங்கம்", "மைதானம்"])

                if "museum" in en_name.lower():
                    search_terms.extend(["museum", "அருங்காட்சியகம்"])

                if "sewerage" in en_name.lower() or "stp" in en_name.lower():
                    search_terms.extend(["sewerage", "stp", "sewage treatment"])

                if "desalination" in en_name.lower() or "desal" in en_name.lower():
                    search_terms.extend(["desalination", "desal"])

                if "smart" in en_name.lower() and "city" in en_name.lower():
                    search_terms.append("smart city")

                # Specific project identifiers
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

            # Tamil name patterns
            if ta_name:
                # Add full Tamil name
                search_terms.append(ta_name)
                # Extract key Tamil words (3+ chars)
                tamil_words = re.findall(r'[\u0B80-\u0BFF]{3,}', ta_name)
                search_terms.extend(tamil_words)

            # Clean and dedupe patterns
            clean_patterns = []
            seen = set()
            for term in search_terms:
                term = term.strip().lower()
                if term and len(term) >= 3 and term not in seen:
                    seen.add(term)
                    clean_patterns.append(term)

            if clean_patterns:
                patterns[project_id] = {
                    "project": project,
                    "patterns": clean_patterns,
                    "file": str(pf),
                }

        except Exception as e:
            print(f"Error processing {pf}: {e}")

    return patterns


def match_tweet_to_projects(tweet: dict, patterns: dict) -> List[Tuple[str, float, List[str]]]:
    """
    Match a tweet against all project patterns.
    Returns list of (project_id, score, matched_terms)
    """
    text = tweet.get("tweetText", "").lower()

    matches = []

    for project_id, config in patterns.items():
        matched_terms = []
        for pattern in config["patterns"]:
            # Check if pattern exists in text
            if pattern in text:
                matched_terms.append(pattern)

        if matched_terms:
            # Score based on number of matched terms and their specificity
            # More matches = higher confidence
            # Longer matches = more specific
            score = 0
            for term in matched_terms:
                # Longer terms are more specific
                term_score = min(1.0, len(term) / 20)  # Normalize by 20 chars
                score += term_score

            # Normalize by number of patterns available
            score = min(1.0, score / max(1, len(config["patterns"]) / 3))

            matches.append((project_id, score, matched_terms))

    # Sort by score descending
    matches.sort(key=lambda x: x[1], reverse=True)

    return matches


def find_project_mentions(entries: List[dict], patterns: dict) -> Dict[str, dict]:
    """
    Find all tweet mentions for each project.
    Returns dict of project_id -> {project_info, matches: [...]}
    """
    results = defaultdict(lambda: {
        "project": None,
        "file": None,
        "matches": [],
        "unique_tweets": set(),
        "accounts": set(),
        "event_types": defaultdict(int),
    })

    for entry in entries:
        tweet_matches = match_tweet_to_projects(entry, patterns)

        # Only take best match if confident
        if tweet_matches:
            best_match = tweet_matches[0]
            project_id, score, terms = best_match

            # Require minimum score
            if score < 0.1:
                continue

            # Check for ambiguous matches (multiple high-scoring)
            if len(tweet_matches) > 1 and tweet_matches[1][1] > score * 0.8:
                # Ambiguous - skip or take both?
                # For now, take the best one
                pass

            result = results[project_id]
            if result["project"] is None:
                result["project"] = patterns[project_id]["project"]
                result["file"] = patterns[project_id]["file"]

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

    # Convert sets to lists for JSON serialization
    for project_id, data in results.items():
        data["unique_tweets"] = len(data["unique_tweets"])
        data["accounts"] = list(data["accounts"])
        data["event_types"] = dict(data["event_types"])
        # Sort matches by date
        data["matches"].sort(key=lambda x: x.get("date", ""))

    return dict(results)


def main():
    parser = argparse.ArgumentParser(description="Direct tweet-to-project matching")
    parser.add_argument("--test", action="store_true", help="Test on sample")
    parser.add_argument("--all", action="store_true", help="Full matching")
    parser.add_argument("--project", type=str, help="Match specific project")
    parser.add_argument("--min-matches", type=int, default=1, help="Minimum matches to include")
    args = parser.parse_args()

    # Build patterns
    print("Building project patterns...")
    patterns = build_project_patterns()
    print(f"Built patterns for {len(patterns)} projects")

    # Show sample patterns
    if args.test:
        print("\nSample patterns:")
        for pid in list(patterns.keys())[:3]:
            print(f"  {pid}: {patterns[pid]['patterns'][:5]}")

    # Load verified entries
    verified_file = VERIFIED_DIR / "all_verified.json"
    print(f"\nLoading tweets from {verified_file}...")
    with open(verified_file) as f:
        data = json.load(f)
    entries = data.get("entries", [])
    print(f"Loaded {len(entries)} tweets")

    # Filter if testing
    if args.test:
        entries = entries[:500]
        print(f"Testing on {len(entries)} tweets")

    # Filter by project if specified
    if args.project:
        if args.project not in patterns:
            print(f"Unknown project: {args.project}")
            print(f"Available: {list(patterns.keys())[:10]}...")
            return 1
        patterns = {args.project: patterns[args.project]}

    # Match
    print("\nMatching tweets to projects...")
    results = find_project_mentions(entries, patterns)

    # Filter by min matches
    results = {k: v for k, v in results.items() if v["unique_tweets"] >= args.min_matches}

    # Summary
    print(f"\n{'='*70}")
    print("MATCHING RESULTS")
    print(f"{'='*70}")
    print(f"Projects with matches: {len(results)}")

    total_tweets = sum(r["unique_tweets"] for r in results.values())
    print(f"Total tweet matches: {total_tweets}")

    # Top projects by tweet count
    print("\nTop projects by tweet mentions:")
    sorted_results = sorted(results.items(), key=lambda x: x[1]["unique_tweets"], reverse=True)
    for project_id, data in sorted_results[:20]:
        project = data["project"]
        name = project.get("name", {})
        if isinstance(name, dict):
            name = name.get("en", "")[:50]
        print(f"  {data['unique_tweets']:4d} tweets: {name}")
        print(f"       Accounts: {', '.join(list(data['accounts'])[:3])}")

    # Save results
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / "project_matches.json"

    # Prepare output
    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalProjects": len(patterns),
        "matchedProjects": len(results),
        "totalTweetMatches": total_tweets,
        "results": {
            pid: {
                "projectId": pid,
                "projectName": data["project"].get("name", {}).get("en", "") if isinstance(data["project"].get("name"), dict) else str(data["project"].get("name", "")),
                "projectFile": data["file"],
                "tweetCount": data["unique_tweets"],
                "accounts": data["accounts"],
                "eventTypes": data["event_types"],
                "sources": data["matches"]
            }
            for pid, data in sorted_results
        }
    }

    with open(output_file, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to {output_file}")

    return 0


if __name__ == "__main__":
    exit(main())
