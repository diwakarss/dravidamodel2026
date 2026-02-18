#!/usr/bin/env python3
"""
Analyze Unmatched Tweets

Examines tweets that didn't match any existing items to find:
1. New projects/schemes that should be added
2. Gaps in current pattern matching
3. Potential data quality issues

Usage:
  python3 analyze_unmatched.py --all
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict, Counter
from typing import List, Dict, Set

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
MATCHED_FILE = Path("data/twitter-extraction/matched/all_sources_matches.json")
OUTPUT_DIR = Path("data/twitter-extraction/analysis")

# Key phrases that indicate important announcements
IMPORTANT_INDICATORS = [
    r"inaugurat",
    r"laid\s+foundation",
    r"foundation\s+stone",
    r"ground\s*breaking",
    r"₹\s*[\d,]+\s*(?:crore|cr)",
    r"rs\.?\s*[\d,]+\s*(?:crore|cr)",
    r"[\d,]+\s*(?:jobs|employment)",
    r"[\d,]+\s*(?:acres|hectares)",
    r"mou\s+signed",
    r"agreement\s+signed",
    r"launched",
    r"commenced",
    r"completed",
    r"operational",
]

# Extract patterns for specific entity types
ENTITY_EXTRACTORS = {
    "companies": [
        # Major tech companies
        r"\b(foxconn|tata|reliance|adani|hyundai|samsung|apple|google|microsoft|amazon|dell|hp|lenovo)\b",
        # Auto/EV companies
        r"\b(vinfast|byd|tesla|ola electric|ather|tvs|mahindra|ashok leyland|jlr|bmw|daimler|stellantis)\b",
        # Others
        r"\b(vedanta|jsw|ambuja|ultratech|l&t|larsen|siemens|bosch|zf|continental)\b",
        r"\b(nokia|ericsson|qualcomm|amd|intel|nvidia|micron)\b",
        # Taiwanese companies
        r"\b(pegatron|wistron|salcomp|kaynes|pou chen|hong fu)\b",
    ],
    "schemes": [
        r"(pudhumai\s*penn|புதுமைப்\s*பெண்)",
        r"(naan\s*mudhalvan|நான்\s*முதல்வன்)",
        r"(magalir\s*urimai|மகளிர்\s*உரிமை)",
        r"(illam\s*thedi\s*kalvi|இல்லம்\s*தேடி)",
        r"(vidiyal\s*payanam|விடியல்\s*பயணம்)",
        r"(kalaignar\s*kanavu|கலைஞர்\s*கனவு)",
        r"(breakfast\s+scheme|காலை\s*உணவு)",
        r"(cm\s+breakfast)",
        r"(free\s+laptop|இலவச\s*மடிக்கணினி)",
        r"(free\s+bus|இலவச\s*பேருந்து)",
    ],
    "infrastructure": [
        r"(metro\s+(?:phase|corridor|rail|station))",
        r"(flyover|மேம்பாலம்)",
        r"(bus\s+(?:terminal|terminus|stand|depot))",
        r"((?:sewage|water)\s+treatment|stp)",
        r"(desalination|desal)",
        r"(smart\s+city)",
        r"(ring\s+road|bypass)",
        r"(airport|port\s+expansion)",
    ],
    "industrial": [
        r"(sipcot|திடெல்|tidel)",
        r"(industrial\s+(?:park|estate|corridor))",
        r"(manufacturing\s+(?:plant|unit|facility))",
        r"((?:ev|electric\s+vehicle)\s+(?:plant|factory))",
        r"(data\s+cent(?:er|re))",
        r"(semiconductor|fab)",
        r"(solar\s+(?:plant|park|manufacturing))",
        r"(battery\s+(?:plant|manufacturing))",
    ],
    "healthcare": [
        r"(medical\s+college|மருத்துவக்\s*கல்லூரி)",
        r"(government\s+hospital|அரசு\s*மருத்துவமனை)",
        r"(super\s+specialty)",
        r"(primary\s+health|phc)",
        r"(108\s+ambulance)",
    ],
    "education": [
        r"(school\s+of\s+excellence)",
        r"(smart\s+classroom)",
        r"(vetri\s+palligal)",
        r"(iti\s+upgrade)",
        r"(knowledge\s+city)",
    ],
}


def load_matched_tweet_ids() -> Set[str]:
    """Load tweet IDs that were matched to existing items."""
    matched_ids = set()

    if MATCHED_FILE.exists():
        with open(MATCHED_FILE) as f:
            data = json.load(f)

        for item_id, item_data in data.get("results", {}).items():
            for match in item_data.get("matches", []):
                tweet_id = match.get("tweetId")
                if tweet_id:
                    matched_ids.add(tweet_id)

    return matched_ids


def is_important_tweet(text: str) -> bool:
    """Check if tweet contains important announcements."""
    text_lower = text.lower()
    for pattern in IMPORTANT_INDICATORS:
        if re.search(pattern, text_lower):
            return True
    return False


def extract_entities(text: str) -> Dict[str, List[str]]:
    """Extract entities from tweet text."""
    text_lower = text.lower()
    found = defaultdict(list)

    for entity_type, patterns in ENTITY_EXTRACTORS.items():
        for pattern in patterns:
            for match in re.finditer(pattern, text_lower):
                entity = match.group(1) if match.groups() else match.group(0)
                entity = entity.strip().title()
                if entity and entity not in found[entity_type]:
                    found[entity_type].append(entity)

    return dict(found)


def extract_investment(text: str) -> float:
    """Extract investment amount in crores."""
    patterns = [
        r"(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)\b",
        r"([\d,]+(?:\.\d+)?)\s*(?:crore|cr)(?:\s+(?:rupees|rs))?",
    ]

    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            try:
                return float(match.group(1).replace(",", ""))
            except ValueError:
                pass
    return 0


def extract_jobs(text: str) -> int:
    """Extract job count."""
    match = re.search(r"([\d,]+)\s*(?:jobs|employment)", text.lower())
    if match:
        try:
            return int(match.group(1).replace(",", ""))
        except ValueError:
            pass
    return 0


def analyze_unmatched(entries: List[dict], matched_ids: Set[str]) -> Dict:
    """Analyze unmatched tweets to find gaps."""

    unmatched = [e for e in entries if e.get("sourceTweetId") not in matched_ids]

    print(f"Unmatched tweets: {len(unmatched)} / {len(entries)} ({100*len(unmatched)/len(entries):.1f}%)")

    # Separate important unmatched
    important_unmatched = [e for e in unmatched if is_important_tweet(e.get("tweetText", ""))]
    print(f"Important unmatched: {len(important_unmatched)}")

    # Analyze by category
    by_category = defaultdict(list)
    for entry in unmatched:
        cat = entry.get("category", "other")
        by_category[cat].append(entry)

    print("\nUnmatched by category:")
    for cat, items in sorted(by_category.items(), key=lambda x: -len(x[1])):
        print(f"  {cat}: {len(items)}")

    # Extract entities from unmatched
    entity_mentions = defaultdict(lambda: {
        "count": 0,
        "type": "",
        "tweets": [],
        "handles": set(),
        "investment_total": 0,
        "jobs_total": 0,
    })

    for entry in unmatched:
        text = entry.get("tweetText", "")
        entities = extract_entities(text)
        investment = extract_investment(text)
        jobs = extract_jobs(text)

        for entity_type, entity_list in entities.items():
            for entity in entity_list:
                key = f"{entity}|{entity_type}"
                entity_mentions[key]["count"] += 1
                entity_mentions[key]["type"] = entity_type
                entity_mentions[key]["tweets"].append({
                    "date": entry.get("date"),
                    "handle": entry.get("sourceHandle"),
                    "tweetId": entry.get("sourceTweetId"),
                    "category": entry.get("category"),
                    "summary": text[:200],
                })
                entity_mentions[key]["handles"].add(entry.get("sourceHandle"))
                if investment:
                    entity_mentions[key]["investment_total"] += investment
                if jobs:
                    entity_mentions[key]["jobs_total"] += jobs

    # Finalize entities
    entities_list = []
    for key, data in entity_mentions.items():
        name, entity_type = key.split("|")
        data["name"] = name
        data["entity_type"] = entity_type
        data["handles"] = list(data["handles"])
        data["tweets"] = data["tweets"][:10]  # Keep only first 10
        entities_list.append(data)

    # Sort by count
    entities_list.sort(key=lambda x: -x["count"])

    # Group by type
    by_type = defaultdict(list)
    for entity in entities_list:
        by_type[entity["entity_type"]].append(entity)

    return {
        "total_tweets": len(entries),
        "matched_tweets": len(entries) - len(unmatched),
        "unmatched_tweets": len(unmatched),
        "important_unmatched": len(important_unmatched),
        "by_category": {k: len(v) for k, v in by_category.items()},
        "entities_by_type": {k: v[:20] for k, v in by_type.items()},
        "top_entities": entities_list[:50],
        "important_samples": [
            {
                "date": e.get("date"),
                "handle": e.get("sourceHandle"),
                "category": e.get("category"),
                "text": e.get("tweetText", "")[:500],
                "fxUrl": e.get("fxUrl"),
            }
            for e in sorted(important_unmatched, key=lambda x: x.get("date", ""), reverse=True)[:50]
        ]
    }


def main():
    parser = argparse.ArgumentParser(description="Analyze unmatched tweets")
    parser.add_argument("--all", action="store_true", help="Full analysis")
    args = parser.parse_args()

    print("=" * 70)
    print("ANALYZE UNMATCHED TWEETS")
    print("=" * 70)

    # Load matched tweet IDs
    print("\nLoading matched tweet IDs...")
    matched_ids = load_matched_tweet_ids()
    print(f"Loaded {len(matched_ids)} matched tweet IDs")

    # Load all tweets
    verified_file = VERIFIED_DIR / "all_verified.json"
    print(f"\nLoading tweets from {verified_file}...")
    with open(verified_file) as f:
        data = json.load(f)
    entries = data.get("entries", [])
    print(f"Loaded {len(entries)} tweets")

    # Analyze
    analysis = analyze_unmatched(entries, matched_ids)

    # Print summary
    print(f"\n{'=' * 70}")
    print("TOP UNMATCHED ENTITIES (potential new additions)")
    print(f"{'=' * 70}")

    for entity_type, entities in analysis["entities_by_type"].items():
        if entities:
            print(f"\n{entity_type.upper()}:")
            for entity in entities[:10]:
                inv = f"₹{entity['investment_total']:.0f}cr" if entity['investment_total'] else ""
                jobs = f"{entity['jobs_total']:,} jobs" if entity['jobs_total'] else ""
                extra = f" | {inv} {jobs}".strip(" |") if inv or jobs else ""
                print(f"  {entity['count']:4d}x {entity['name']}{extra}")

    print(f"\n{'=' * 70}")
    print("SAMPLE IMPORTANT UNMATCHED TWEETS")
    print(f"{'=' * 70}")

    for sample in analysis["important_samples"][:10]:
        print(f"\n[{sample['date']}] @{sample['handle']} ({sample['category']})")
        print(f"  {sample['text'][:200]}...")

    # Save
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_file = OUTPUT_DIR / "unmatched_analysis.json"

    with open(output_file, "w") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n\nSaved full analysis to {output_file}")

    return 0


if __name__ == "__main__":
    exit(main())
