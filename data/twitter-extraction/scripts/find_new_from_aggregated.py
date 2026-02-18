#!/usr/bin/env python3
"""
Find NEW entities from aggregated data that don't exist in the website.
Uses the already-extracted aggregated entities instead of re-parsing tweets.
"""

import json
import os
import re
from pathlib import Path
from difflib import SequenceMatcher
from typing import Dict, List, Set, Tuple

# Paths
BASE_DIR = Path(__file__).parent.parent
APP_DIR = BASE_DIR.parent.parent / "app"
PROJECTS_DIR = APP_DIR / "src" / "data" / "projects"
LIB_DATA_DIR = APP_DIR / "src" / "lib" / "data"


def load_existing_items() -> Dict[str, Set[str]]:
    """Load all existing items from the website by category."""
    existing = {
        "infrastructure": set(),
        "industries": set(),
        "education": set(),
        "healthcare": set(),
        "welfare": set(),
        "environment": set(),
        "sports": set(),
        "history": set(),
        "agriculture": set(),
        "employment": set(),
    }

    # Load infrastructure projects (JSON files)
    if PROJECTS_DIR.exists():
        for f in PROJECTS_DIR.glob("*.json"):
            try:
                with open(f) as fp:
                    data = json.load(fp)
                    if isinstance(data, dict):
                        name = data.get("name", "")
                        if name:
                            existing["infrastructure"].add(name.lower())
                        # Also add key
                        existing["infrastructure"].add(f.stem.lower())
            except:
                pass

    # Load TypeScript data files
    ts_files = {
        "industries.ts": "industries",
        "education.ts": "education",
        "healthcare.ts": "healthcare",
        "socialWelfare.ts": "welfare",
        "environment.ts": "environment",
        "sportsCulture.ts": "sports",
        "history.ts": "history",
        "agriculture.ts": "agriculture",
        "employment.ts": "employment",
    }

    for filename, category in ts_files.items():
        filepath = LIB_DATA_DIR / filename
        if filepath.exists():
            try:
                content = filepath.read_text()
                # Extract names/titles from TS
                for pattern in [
                    r'name:\s*["\']([^"\']+)["\']',
                    r'title:\s*["\']([^"\']+)["\']',
                    r'company:\s*["\']([^"\']+)["\']',
                    r'id:\s*["\']([^"\']+)["\']',
                ]:
                    for match in re.finditer(pattern, content):
                        existing[category].add(match.group(1).lower())
            except:
                pass

    # Print summary
    for cat, items in existing.items():
        print(f"  {cat}: {len(items)} existing items")

    return existing


def is_match(name: str, existing: Set[str], threshold: float = 0.7) -> bool:
    """Check if name matches any existing item."""
    name_lower = name.lower()

    # Direct match
    if name_lower in existing:
        return True

    # Check substrings (both directions)
    for ex in existing:
        if name_lower in ex or ex in name_lower:
            return True

    # Fuzzy match
    for ex in existing:
        ratio = SequenceMatcher(None, name_lower, ex).ratio()
        if ratio >= threshold:
            return True

    return False


def is_noise(entity: Dict) -> bool:
    """Filter out noisy/generic entities."""
    name = entity.get("name", "").lower()
    entity_id = entity.get("entityId", "").lower()

    # Skip very generic names
    generic = [
        "tamil nadu", "government", "state", "india", "chennai",
        "honourable", "minister", "chief", "cmotamilnadu",
        "dravidian", "dmk", "bjp", "congress", "aiadmk",
        "today", "this", "that", "yesterday", "tomorrow",
        "new", "old", "first", "second", "third",
        "crore", "lakh", "million", "billion",
        "year", "month", "day", "week",
        "get out", "dont miss", "washing machine", "out control",
        "viksit bharat", "our dmk", "map one",
    ]

    for g in generic:
        if name == g or entity_id == g.replace(" ", "-"):
            return True

    # Skip if name is too short
    if len(name) < 4:
        return True

    # Skip if mostly numbers/punctuation
    alpha = sum(c.isalpha() for c in name)
    if alpha < len(name) * 0.5:
        return True

    return False


def categorize(entity: Dict) -> str:
    """Map aggregated category to website tab."""
    cat = entity.get("category", "").lower()

    mapping = {
        "infrastructure": "infrastructure",
        "industries": "industries",
        "education": "education",
        "healthcare": "healthcare",
        "social-welfare": "welfare",
        "environment": "environment",
        "sports-culture": "sports",
        "tamil-history": "history",
        "agriculture": "agriculture",
        "employment": "employment",
    }

    return mapping.get(cat, cat)


def main():
    print("Loading existing website items...")
    existing = load_existing_items()

    print("\nLoading aggregated entities...")
    agg_file = BASE_DIR / "aggregated" / "all_aggregated.json"
    with open(agg_file) as f:
        data = json.load(f)

    entities = data.get("entities", [])
    print(f"Total aggregated entities: {len(entities)}")

    # Find new entities
    new_entities = []
    matched = 0
    noise = 0

    for entity in entities:
        name = entity.get("name", "")
        category = categorize(entity)

        # Skip noise
        if is_noise(entity):
            noise += 1
            continue

        # Check against existing items for this category
        category_existing = existing.get(category, set())
        all_existing = set()
        for ex_set in existing.values():
            all_existing.update(ex_set)

        if is_match(name, all_existing):
            matched += 1
            continue

        # This is a NEW entity
        new_entities.append({
            "name": name,
            "entityId": entity.get("entityId"),
            "category": category,
            "entityType": entity.get("entityType"),
            "investment_crore": entity.get("numbers", {}).get("investmentCrore"),
            "jobs": entity.get("numbers", {}).get("jobs"),
            "firstMention": entity.get("timeline", {}).get("firstMention"),
            "lastMention": entity.get("timeline", {}).get("lastMention"),
            "inauguration": entity.get("timeline", {}).get("inauguration"),
            "mouSigned": entity.get("timeline", {}).get("mouSigned"),
            "tweetCount": len(entity.get("sources", [])),
            "accounts": list(set(s.get("handle") for s in entity.get("sources", []) if s.get("handle"))),
            "sampleTweet": entity.get("sources", [{}])[0].get("summary", "")[:200] if entity.get("sources") else "",
            "sampleUrl": entity.get("sources", [{}])[0].get("fxUrl", "") if entity.get("sources") else "",
        })

    print(f"\nResults:")
    print(f"  Matched existing: {matched}")
    print(f"  Filtered as noise: {noise}")
    print(f"  NEW entities: {len(new_entities)}")

    # Sort by tweet count (most mentioned first)
    new_entities.sort(key=lambda x: (-x["tweetCount"], x["name"]))

    # Group by category
    by_category = {}
    for entity in new_entities:
        cat = entity["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(entity)

    print(f"\nBy category:")
    for cat, items in sorted(by_category.items()):
        print(f"  {cat}: {len(items)}")

    # Save results
    output_file = BASE_DIR / "new_entities" / "all_new_candidates.json"
    output_file.parent.mkdir(exist_ok=True)

    result = {
        "generatedAt": "2026-02-18",
        "totalNew": len(new_entities),
        "totalMatched": matched,
        "totalNoise": noise,
        "byCategory": {cat: len(items) for cat, items in by_category.items()},
        "candidates": new_entities
    }

    with open(output_file, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\nSaved to: {output_file}")

    # Also print top 50 most mentioned
    print(f"\n=== TOP 50 NEW ENTITIES (by tweet count) ===\n")
    for i, entity in enumerate(new_entities[:50], 1):
        inv = f"₹{entity['investment_crore']} Cr" if entity.get('investment_crore') else ""
        jobs = f"{entity['jobs']} jobs" if entity.get('jobs') else ""
        extra = " | ".join(filter(None, [inv, jobs]))
        if extra:
            extra = f" ({extra})"

        print(f"{i:2}. [{entity['category']:12}] {entity['name'][:40]:40} - {entity['tweetCount']} tweets{extra}")


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    main()
