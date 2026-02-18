#!/usr/bin/env python3
"""
Phase 4: Entity Aggregation

Groups classified tweets by entity, merging multiple mentions of the same
project/scheme/company into unified records with timeline and sources.

Usage:
  python3 aggregate_entities.py --all              # Process all categories
  python3 aggregate_entities.py --category industries  # Process one category
  python3 aggregate_entities.py --test             # Test on sample data
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
from difflib import SequenceMatcher
from typing import List, Dict, Optional

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
AGGREGATED_DIR = Path("data/twitter-extraction/aggregated")
LOG_FILE = Path("data/twitter-extraction/logs/aggregate.log")

# Categories
CATEGORIES = [
    "infrastructure", "industries", "education", "healthcare",
    "employment", "agriculture", "environment", "social-welfare",
    "sports-culture", "tamil-history"
]

# Status derivation from event types
EVENT_TO_STATUS = {
    "mou_signed": "announced",
    "ground_breaking": "under_construction",
    "inauguration": "operational",
    "progress_update": "under_construction",
    "expansion": "operational",
    "production_start": "operational",
    "scheme_launch": "operational",
    "beneficiary_update": "ongoing",
    "milestone": "ongoing",
}


def log(msg: str):
    """Log message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def normalize_name(name: str) -> str:
    """Normalize entity name for matching."""
    if not name:
        return ""
    name = name.lower()
    # Remove common words
    stopwords = ["the", "a", "an", "of", "in", "at", "for", "to", "and", "or"]
    words = name.split()
    words = [w for w in words if w not in stopwords]
    name = " ".join(words)
    # Remove special chars
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', '-', name.strip())
    return name


def similarity(a: str, b: str) -> float:
    """Calculate string similarity."""
    return SequenceMatcher(None, a, b).ratio()


def extract_entity_key(entry: dict) -> str:
    """Extract the best key for entity matching."""
    # Use extracted entity name if available
    entity = entry.get("extractedEntity", {})
    if entity.get("name"):
        return normalize_name(entity["name"])

    # Fall back to extracting from tweet text
    text = entry.get("tweetText", "")

    # Try to extract project/scheme names
    patterns = [
        r"([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+(?:\s+(?:Phase|Corridor|Scheme|Project|Plant|Factory))?)",
        r"#(\w+(?:Phase\d+|Project|Scheme))",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return normalize_name(match.group(1))

    # Use investment + category as fallback key
    numbers = entry.get("extractedNumbers", {})
    if numbers.get("investmentCrore"):
        return f"{entry['category']}-{numbers['investmentCrore']:.0f}cr"

    return ""


def find_matching_entity(key: str, existing: Dict[str, dict], threshold: float = 0.7) -> Optional[str]:
    """Find matching entity in existing entities."""
    if not key:
        return None

    # Exact match
    if key in existing:
        return key

    # Fuzzy match
    for existing_key in existing:
        if similarity(key, existing_key) >= threshold:
            return existing_key

    return None


def merge_numbers(existing: dict, new: dict) -> dict:
    """Merge numbers, taking highest values."""
    result = existing.copy() if existing else {}

    for key, value in (new or {}).items():
        if value is None:
            continue
        if key not in result or (isinstance(value, (int, float)) and value > result.get(key, 0)):
            result[key] = value

    return result


def derive_status(events: List[str]) -> str:
    """Derive latest status from event types."""
    # Priority order for status
    status_priority = ["operational", "under_construction", "announced", "ongoing"]

    statuses = set()
    for event in events:
        status = EVENT_TO_STATUS.get(event)
        if status:
            statuses.add(status)

    for status in status_priority:
        if status in statuses:
            return status

    return "announced"


def aggregate_category(entries: List[dict], category: str) -> List[dict]:
    """Aggregate entries for a single category."""
    entities = {}  # key -> aggregated entity

    for entry in entries:
        if entry.get("category") != category:
            continue

        key = extract_entity_key(entry)
        if not key:
            continue

        # Find or create entity
        matching_key = find_matching_entity(key, entities)

        if matching_key:
            # Merge into existing
            entity = entities[matching_key]
        else:
            # Create new
            matching_key = key
            entity = {
                "entityId": key,
                "name": entry.get("extractedEntity", {}).get("name") or key.replace("-", " ").title(),
                "nameVariants": [],
                "category": category,
                "entityType": entry.get("extractedEntity", {}).get("type", "project"),
                "numbers": {},
                "timeline": {},
                "sources": [],
                "accountsCovering": set(),
            }
            entities[matching_key] = entity

        # Add name variant
        name = entry.get("extractedEntity", {}).get("name")
        if name and name not in entity["nameVariants"] and name != entity["name"]:
            entity["nameVariants"].append(name)

        # Merge numbers
        entity["numbers"] = merge_numbers(
            entity["numbers"],
            entry.get("extractedNumbers", {})
        )

        # Update location
        location = entry.get("extractedEntity", {}).get("location")
        if location and not entity.get("location"):
            entity["location"] = location

        # Add source
        source = {
            "date": entry.get("date", ""),
            "handle": entry["sourceHandle"],
            "tweetId": entry["sourceTweetId"],
            "fxUrl": entry.get("fxUrl", ""),
            "eventType": entry.get("eventType", "other"),
            "summary": entry.get("tweetText", "")[:150] + "..." if len(entry.get("tweetText", "")) > 150 else entry.get("tweetText", ""),
        }

        # Add enriched links
        if entry.get("enrichedLinks"):
            source["enrichedLinks"] = entry["enrichedLinks"]

        entity["sources"].append(source)
        entity["accountsCovering"].add(entry["sourceHandle"])

        # Update timeline
        date = entry.get("date", "")
        event_type = entry.get("eventType", "")

        if date:
            if not entity["timeline"].get("firstMention") or date < entity["timeline"]["firstMention"]:
                entity["timeline"]["firstMention"] = date
            if not entity["timeline"].get("lastMention") or date > entity["timeline"]["lastMention"]:
                entity["timeline"]["lastMention"] = date

            # Event-specific dates
            if event_type == "mou_signed" and not entity["timeline"].get("mouSigned"):
                entity["timeline"]["mouSigned"] = date
            elif event_type == "ground_breaking" and not entity["timeline"].get("groundBreaking"):
                entity["timeline"]["groundBreaking"] = date
            elif event_type == "inauguration" and not entity["timeline"].get("inauguration"):
                entity["timeline"]["inauguration"] = date
            elif event_type == "production_start" and not entity["timeline"].get("productionStart"):
                entity["timeline"]["productionStart"] = date

    # Finalize entities
    results = []
    for key, entity in entities.items():
        # Sort sources by date
        entity["sources"].sort(key=lambda x: x.get("date", ""))

        # Convert set to list
        entity["accountsCovering"] = list(entity["accountsCovering"])

        # Derive status
        event_types = [s["eventType"] for s in entity["sources"]]
        entity["latestStatus"] = derive_status(event_types)

        # Add counts
        entity["tweetCount"] = len(entity["sources"])

        # Timestamp
        entity["aggregatedAt"] = datetime.now(timezone.utc).isoformat()

        results.append(entity)

    # Sort by tweet count (most mentioned first)
    results.sort(key=lambda x: x["tweetCount"], reverse=True)

    return results


def main():
    parser = argparse.ArgumentParser(description="Aggregate entities from classified tweets")
    parser.add_argument("--all", action="store_true", help="Process all categories")
    parser.add_argument("--category", type=str, help="Process specific category")
    parser.add_argument("--test", action="store_true", help="Test on sample")
    parser.add_argument("--input", type=str, default=str(VERIFIED_DIR / "all_verified.json"))
    args = parser.parse_args()

    # Load verified entries
    input_path = Path(args.input)
    log(f"Loading verified entries from {input_path}...")

    with open(input_path) as f:
        data = json.load(f)

    entries = data.get("entries", [])
    log(f"Loaded {len(entries)} entries")

    # Determine categories to process
    if args.category:
        categories = [args.category]
    elif args.test:
        categories = ["industries", "infrastructure"]
    else:
        categories = CATEGORIES

    AGGREGATED_DIR.mkdir(parents=True, exist_ok=True)

    all_entities = []
    stats = {}

    for category in categories:
        cat_entries = [e for e in entries if e.get("category") == category]
        log(f"Processing {category}: {len(cat_entries)} entries")

        entities = aggregate_category(entries, category)

        stats[category] = {
            "entries": len(cat_entries),
            "entities": len(entities),
        }

        # Save category file
        output_file = AGGREGATED_DIR / f"{category}_aggregated.json"
        with open(output_file, "w") as f:
            json.dump({
                "category": category,
                "aggregatedAt": datetime.now(timezone.utc).isoformat(),
                "stats": stats[category],
                "entities": entities
            }, f, indent=2, ensure_ascii=False)

        log(f"  -> {len(entities)} entities saved to {output_file.name}")
        all_entities.extend(entities)

    # Save combined file
    combined_file = AGGREGATED_DIR / "all_aggregated.json"
    with open(combined_file, "w") as f:
        json.dump({
            "aggregatedAt": datetime.now(timezone.utc).isoformat(),
            "totalEntities": len(all_entities),
            "stats": stats,
            "entities": all_entities
        }, f, indent=2, ensure_ascii=False)

    log(f"\n=== AGGREGATION COMPLETE ===")
    log(f"Total entities: {len(all_entities)}")
    log(f"\nBy category:")
    for cat, s in stats.items():
        log(f"  {cat}: {s['entries']} entries -> {s['entities']} entities")
    log(f"\nSaved to {combined_file}")

    # Show top entities
    if args.test or len(all_entities) > 0:
        print("\n=== TOP ENTITIES ===")
        for entity in all_entities[:5]:
            print(f"\n{entity['name']} [{entity['category']}]")
            print(f"  Status: {entity.get('latestStatus', 'N/A')}")
            print(f"  Tweets: {entity['tweetCount']}")
            if entity.get("numbers", {}).get("investmentCrore"):
                print(f"  Investment: Rs. {entity['numbers']['investmentCrore']:,.0f} crore")
            if entity.get("numbers", {}).get("jobsCreated"):
                print(f"  Jobs: {entity['numbers']['jobsCreated']:,}")
            print(f"  Accounts: {', '.join(entity['accountsCovering'][:3])}")

    return 0


if __name__ == "__main__":
    exit(main())
