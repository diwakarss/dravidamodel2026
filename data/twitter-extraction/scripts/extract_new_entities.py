#!/usr/bin/env python3
"""
Extract NEW Entities from Tweets for Website Addition

Finds projects, schemes, and investments mentioned in tweets that
DON'T exist in the current website data. These are candidates for adding.

Goal: Find new items to add to the 10 website tabs:
1. Infrastructure (projects/*.json)
2. Industries (industries.ts)
3. Education (education.ts)
4. Healthcare (healthcare.ts)
5. Employment (employment.ts)
6. Social Welfare (socialWelfare.ts)
7. Agriculture (agriculture.ts)
8. Environment (environment.ts)
9. Sports & Culture (sportsCulture.ts)
10. Tamil History (tamilHistory.ts)

Usage:
  python3 extract_new_entities.py --all
  python3 extract_new_entities.py --category industries
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Set, Tuple
from difflib import SequenceMatcher

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
PROJECTS_DIR = Path("app/src/data/projects")
LIB_DATA_DIR = Path("app/src/lib/data")
OUTPUT_DIR = Path("data/twitter-extraction/new_entities")

# Load existing item names for deduplication
def load_existing_names() -> Dict[str, Set[str]]:
    """Load all existing item names from website data for deduplication."""
    existing = defaultdict(set)

    # 1. Load projects (JSON files)
    for pf in PROJECTS_DIR.glob("*.json"):
        try:
            with open(pf) as f:
                project = json.load(f)
            name = project.get("name", {})
            if isinstance(name, dict):
                if name.get("en"):
                    existing["projects"].add(name["en"].lower())
                if name.get("ta"):
                    existing["projects"].add(name["ta"])
            else:
                existing["projects"].add(str(name).lower())
            # Also add ID
            existing["projects"].add(project.get("id", "").lower())
        except:
            pass

    # 2. Load TypeScript data files
    ts_files = {
        "industries": "industries.ts",
        "education": "education.ts",
        "healthcare": "healthcare.ts",
        "employment": "employment.ts",
        "welfare": "socialWelfare.ts",
        "agriculture": "agriculture.ts",
        "environment": "environment.ts",
        "sports": "sportsCulture.ts",
        "history": "tamilHistory.ts",
    }

    for category, filename in ts_files.items():
        filepath = LIB_DATA_DIR / filename
        if filepath.exists():
            content = filepath.read_text()
            # Extract names
            for match in re.finditer(r'name:\s*["\']([^"\']+)["\']', content):
                existing[category].add(match.group(1).lower())
            for match in re.finditer(r'en:\s*["\']([^"\']+)["\']', content):
                existing[category].add(match.group(1).lower())
            for match in re.finditer(r'id:\s*["\']([^"\']+)["\']', content):
                existing[category].add(match.group(1).lower())
            # Company names for industries
            if category == "industries":
                for match in re.finditer(r'company:\s*["\']([^"\']+)["\']', content):
                    existing[category].add(match.group(1).lower())

    return existing


def is_duplicate(name: str, existing_names: Set[str], threshold: float = 0.75) -> bool:
    """Check if name is a duplicate of existing items."""
    name_lower = name.lower()

    # Exact match
    if name_lower in existing_names:
        return True

    # Fuzzy match
    for existing in existing_names:
        if len(existing) < 5:
            continue
        similarity = SequenceMatcher(None, name_lower, existing).ratio()
        if similarity >= threshold:
            return True
        # Check if one contains the other
        if name_lower in existing or existing in name_lower:
            return True

    return False


# Extraction patterns by category
EXTRACTION_PATTERNS = {
    "infrastructure": [
        # Metro
        (r"([\w\s]+)\s+metro\s+(?:phase|corridor|line)\s*(\d+)?", "metro", 0.8),
        (r"(madurai|coimbatore|trichy)\s+metro", "metro", 0.9),

        # Roads & Bridges
        (r"([\w]+(?:\s+[\w]+)?)\s+flyover", "flyover", 0.7),
        (r"([\w]+(?:\s+[\w]+)?)\s+underpass", "underpass", 0.7),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:ring\s+road|bypass)", "road", 0.7),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:rob|railway\s+over\s+bridge)", "bridge", 0.7),

        # Bus & Transport
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:bus\s+terminal|bus\s+terminus|bus\s+stand)", "bus_terminal", 0.8),
        (r"([\w]+)\s+(?:mofussil|omni)\s+bus", "bus_terminal", 0.7),

        # Water & Sanitation
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:stp|sewage\s+treatment)", "stp", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+desalination", "desalination", 0.9),
        (r"([\w]+(?:\s+[\w]+)?)\s+water\s+(?:supply|scheme|project)", "water", 0.7),

        # Power
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:substation|transmission)", "power", 0.7),
        (r"(\d+)\s*(?:mw|gw)\s+(?:solar|wind|power)", "power_plant", 0.8),

        # Buildings
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:police\s+station|fire\s+station)", "station", 0.7),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:collectorate|government\s+building)", "govt_building", 0.7),
    ],

    "industries": [
        # Companies with investment
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:to\s+)?invest(?:s|ing|ment)?\s+(?:rs\.?|₹)?\s*([\d,]+)\s*(?:crore|cr)", "investment", 0.9),
        (r"([\w]+)\s+(?:plant|factory|unit|facility)\s+(?:at|in)\s+([\w]+)", "factory", 0.8),
        (r"([\w]+)\s+(?:ev|electric\s+vehicle)\s+(?:plant|factory|manufacturing)", "ev_plant", 0.9),
        (r"([\w]+)\s+(?:semiconductor|chip|fab)\s+(?:plant|facility)", "semiconductor", 0.95),
        (r"([\w]+)\s+(?:data\s+cent(?:er|re)|cloud)", "data_center", 0.85),
        (r"([\w]+)\s+(?:solar|wind)\s+(?:manufacturing|plant)", "renewable_mfg", 0.85),
        (r"([\w]+)\s+(?:battery|cell)\s+(?:manufacturing|plant|gigafactory)", "battery", 0.9),

        # Industrial parks
        (r"sipcot\s+([\w]+(?:\s+[\w]+)?)", "sipcot", 0.85),
        (r"([\w]+)\s+industrial\s+(?:park|estate|corridor)", "industrial_park", 0.8),
        (r"tidel\s+(?:neo\s+)?([\w]+)", "tidel", 0.85),

        # Known companies (capture with context)
        (r"(foxconn|pegatron|wistron|salcomp|tata\s+electronics)\s+[\w\s]+(?:plant|factory|expansion)", "electronics", 0.9),
        (r"(hyundai|kia|vinfast|byd|ola\s+electric|ather|tvs)\s+[\w\s]+(?:plant|factory|expansion)", "auto", 0.9),
    ],

    "education": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:school\s+of\s+excellence|model\s+school)", "school", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:iti|polytechnic)\s+(?:new|upgrade)", "iti", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:university|deemed\s+university)", "university", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:engineering\s+college|engg\s+college)", "engineering", 0.8),
        (r"([\w]+)\s+(?:skill|training)\s+(?:centre|center|institute)", "skill_center", 0.75),
        (r"new\s+([\w]+(?:\s+[\w]+)?)\s+(?:scheme|scholarship)\s+for\s+(?:students|education)", "scheme", 0.7),
    ],

    "healthcare": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:medical\s+college|medcol)", "medical_college", 0.9),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:government\s+hospital|gh|district\s+hospital)", "hospital", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:super\s+specialty|multispecialty)", "specialty_hospital", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:primary\s+health|phc|health\s+centre)", "phc", 0.75),
        (r"(\d+)\s+(?:new\s+)?(?:108\s+)?ambulance", "ambulance", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:dialysis|blood\s+bank)", "health_facility", 0.8),
    ],

    "employment": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:job\s+fair|placement\s+drive|mega\s+job)", "job_fair", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:skill\s+training|vocational)", "skill_training", 0.75),
        (r"([\d,]+)\s+(?:jobs|employment)\s+(?:created|generated|in)\s+([\w]+)", "jobs_created", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:apprenticeship|internship)\s+(?:scheme|program)", "apprenticeship", 0.8),
    ],

    "welfare": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:pension|ஓய்வூதியம்)", "pension", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:housing\s+scheme|வீட்டு\s+வசதி)", "housing", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:marriage\s+assistance|திருமண\s+உதவி)", "marriage", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:relief|நிவாரணம்)", "relief", 0.7),
        (r"free\s+([\w]+(?:\s+[\w]+)?)\s+(?:scheme|distribution)", "free_scheme", 0.75),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:welfare\s+board|நலவாரியம்)", "welfare_board", 0.8),
    ],

    "agriculture": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:irrigation|நீர்ப்பாசன)", "irrigation", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:dam|reservoir|அணை)", "dam", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:cold\s+storage|godown)", "storage", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:mandis?|uzhavar\s+sandhai)", "market", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:milk\s+(?:plant|cooperative)|aavin)", "dairy", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:farm\s+loan|crop\s+insurance)", "farm_scheme", 0.75),
    ],

    "environment": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:eco\s+park|ecological\s+park)", "eco_park", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:wetland|lake)\s+(?:restoration|rejuvenation)", "wetland", 0.8),
        (r"([\d,]+)\s+(?:trees?|saplings?)\s+(?:planted|plantation)", "tree_planting", 0.75),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:solar\s+park|wind\s+farm)", "renewable", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:waste\s+management|garbage\s+processing)", "waste", 0.75),
    ],

    "sports": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:stadium|sports\s+complex|arena)", "stadium", 0.85),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:sports\s+academy|coaching\s+centre)", "academy", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:chess|badminton|hockey|cricket)\s+(?:centre|academy)", "sports_center", 0.8),
        (r"([\w]+)\s+(?:tournament|championship|trophy)", "tournament", 0.7),
    ],

    "history": [
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:museum|அருங்காட்சியகம்)", "museum", 0.9),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:archaeological|excavation|கீழடி)", "archaeology", 0.9),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:memorial|நினைவிடம்|statue)", "memorial", 0.8),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:temple\s+renovation|திருக்கோயில்)", "temple", 0.7),
        (r"([\w]+(?:\s+[\w]+)?)\s+(?:heritage|பாரம்பரிய)", "heritage", 0.8),
    ],
}

# Investment/Jobs extraction
INVESTMENT_PATTERN = r"(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)\b"
JOBS_PATTERN = r"([\d,]+)\s*(?:jobs|employment|workers)"

# District names for location extraction
TN_DISTRICTS = [
    "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem",
    "tirunelveli", "tiruppur", "vellore", "erode", "thoothukudi", "tuticorin",
    "dindigul", "thanjavur", "ranipet", "sivaganga", "virudhunagar", "namakkal",
    "cuddalore", "kanchipuram", "tiruvallur", "chengalpattu", "villupuram",
    "tiruvannamalai", "krishnagiri", "dharmapuri", "ariyalur", "perambalur",
    "nagapattinam", "mayiladuthurai", "karur", "pudukkottai", "ramanathapuram",
    "theni", "nilgiris", "kanyakumari", "tenkasi", "tirupattur", "kallakurichi",
    "hosur", "sriperumbudur", "oragadam", "ambattur", "tambaram"
]


def extract_location(text: str) -> str:
    """Extract district/location from text."""
    text_lower = text.lower()
    for district in TN_DISTRICTS:
        if re.search(r'\b' + district + r'\b', text_lower):
            return district.title()
    return ""


def extract_entities_from_tweets(entries: List[dict], category: str, existing_names: Set[str]) -> Dict[str, Dict]:
    """Extract new entities for a specific category."""
    patterns = EXTRACTION_PATTERNS.get(category, [])
    if not patterns:
        return {}

    entities = defaultdict(lambda: {
        "name": "",
        "type": "",
        "confidence": 0,
        "locations": set(),
        "investments": [],
        "jobs": [],
        "sources": [],
        "accounts": set(),
        "event_types": defaultdict(int),
        "raw_matches": [],
    })

    for entry in entries:
        text = entry.get("tweetText", "")
        text_lower = text.lower()

        for pattern, entity_type, base_confidence in patterns:
            for match in re.finditer(pattern, text_lower):
                groups = match.groups()

                # Build entity name from captured groups
                if groups:
                    name_parts = [g for g in groups if g and not g.replace(",", "").isdigit()]
                    if name_parts:
                        name = " ".join(name_parts).strip().title()
                    else:
                        continue
                else:
                    name = match.group(0).strip().title()

                # Skip generic/short/garbage names
                if len(name) < 5:
                    continue

                # Filter out common false positives
                garbage_words = [
                    "the", "new", "tamil", "nadu", "government", "state", "india", "will",
                    "today", "this", "that", "with", "from", "have", "been", "are", "was",
                    "its", "for", "and", "has", "our", "his", "her", "their", "all",
                    "also", "just", "more", "most", "over", "under", "very", "some",
                    "chief", "minister", "hon", "thiru", "selvi", "shri", "sri",
                    "bjp", "dmk", "aiadmk", "congress", "party",
                    "crore", "lakh", "rupees", "inr", "year", "month", "day",
                    "first", "second", "third", "last", "next", "soon", "now",
                    "being", "going", "coming", "done", "made", "given", "taken",
                    "strong", "good", "great", "best", "top", "big", "major",
                    "several", "many", "few", "other", "another", "such", "same",
                    "organised", "organized", "launched", "inaugurated", "announced",
                    "immediate", "disaster", "rescue", "relief", "urbanisation",
                    "oversee", "incometax", "candidates", "size", "enduring",
                    "cultural", "commanding", "natural", "unesco", "world",
                    "friendly", "solid", "ready", "plans", "group", "parks", "neos",
                ]
                name_lower = name.lower()
                if any(word == name_lower or name_lower.startswith(word + " ") or name_lower.endswith(" " + word)
                       for word in garbage_words):
                    continue

                # Skip if name is mostly numbers or special chars
                alpha_ratio = sum(c.isalpha() for c in name) / len(name) if name else 0
                if alpha_ratio < 0.6:
                    continue

                # Skip very common partial phrases
                skip_patterns = [
                    r"^(to|at|in|on|by|of|or|as|is|it)\s",
                    r"\s(to|at|in|on|by|of|or|as|is|it)$",
                    r"^(and|the|this|that|with|from|have|been)\s",
                ]
                if any(re.match(p, name_lower) for p in skip_patterns):
                    continue

                # Skip if duplicate of existing
                if is_duplicate(name, existing_names):
                    continue

                # Generate key
                key = f"{name.lower().replace(' ', '-')}|{entity_type}"

                entity = entities[key]
                if not entity["name"]:
                    entity["name"] = name
                    entity["type"] = entity_type
                    entity["confidence"] = base_confidence

                # Extract additional info
                location = extract_location(text)
                if location:
                    entity["locations"].add(location)

                inv_match = re.search(INVESTMENT_PATTERN, text_lower)
                if inv_match:
                    try:
                        entity["investments"].append(float(inv_match.group(1).replace(",", "")))
                    except:
                        pass

                jobs_match = re.search(JOBS_PATTERN, text_lower)
                if jobs_match:
                    try:
                        entity["jobs"].append(int(jobs_match.group(1).replace(",", "")))
                    except:
                        pass

                # Add source
                source = {
                    "date": entry.get("date", ""),
                    "handle": entry.get("sourceHandle"),
                    "tweetId": entry.get("sourceTweetId"),
                    "fxUrl": entry.get("fxUrl"),
                    "eventType": entry.get("eventType", "other"),
                    "text": text[:300],
                }
                entity["sources"].append(source)
                entity["accounts"].add(entry.get("sourceHandle"))
                entity["event_types"][entry.get("eventType", "other")] += 1
                entity["raw_matches"].append(match.group(0))

    # Finalize entities
    results = {}
    for key, entity in entities.items():
        mention_count = len(entity["sources"])

        # Require minimum mentions
        if mention_count < 2:
            continue

        # Boost confidence based on signals
        confidence = entity["confidence"]
        if mention_count >= 5:
            confidence += 0.1
        if len(entity["accounts"]) >= 3:
            confidence += 0.05
        if entity["investments"]:
            confidence += 0.1
        if entity["jobs"]:
            confidence += 0.05
        if entity["locations"]:
            confidence += 0.05

        confidence = min(1.0, confidence)

        # Finalize
        entity["locations"] = list(entity["locations"])
        entity["accounts"] = list(entity["accounts"])
        entity["event_types"] = dict(entity["event_types"])
        entity["mention_count"] = mention_count
        entity["confidence"] = round(confidence, 2)

        if entity["investments"]:
            entity["total_investment_crore"] = sum(entity["investments"])
            entity["avg_investment_crore"] = round(sum(entity["investments"]) / len(entity["investments"]), 2)

        if entity["jobs"]:
            entity["total_jobs"] = sum(entity["jobs"])

        # Keep only first 5 sources
        entity["sources"] = sorted(entity["sources"], key=lambda x: x.get("date", ""))[:5]
        entity["raw_matches"] = list(set(entity["raw_matches"]))[:5]

        # Timeline
        dates = [s["date"] for s in entity["sources"] if s["date"]]
        if dates:
            entity["first_mention"] = min(dates)
            entity["last_mention"] = max(dates)

        results[key] = entity

    return results


def main():
    parser = argparse.ArgumentParser(description="Extract new entities from tweets")
    parser.add_argument("--all", action="store_true", help="Process all categories")
    parser.add_argument("--category", type=str, help="Process specific category")
    parser.add_argument("--min-mentions", type=int, default=2, help="Minimum mentions")
    args = parser.parse_args()

    print("=" * 70)
    print("EXTRACT NEW ENTITIES FROM TWEETS")
    print("=" * 70)

    # Load existing names
    print("\nLoading existing website data...")
    existing = load_existing_names()
    for cat, names in existing.items():
        print(f"  {cat}: {len(names)} existing items")

    # Load tweets
    verified_file = VERIFIED_DIR / "all_verified.json"
    print(f"\nLoading tweets from {verified_file}...")
    with open(verified_file) as f:
        data = json.load(f)
    entries = data.get("entries", [])
    print(f"Loaded {len(entries)} tweets")

    # Determine categories to process
    if args.category:
        categories = [args.category]
    else:
        categories = list(EXTRACTION_PATTERNS.keys())

    # Process each category
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    all_results = {}

    for category in categories:
        print(f"\n{'=' * 70}")
        print(f"Processing: {category.upper()}")
        print(f"{'=' * 70}")

        # Get existing names for this category
        cat_existing = existing.get(category, set())
        # Also include projects for infrastructure
        if category == "infrastructure":
            cat_existing = cat_existing | existing.get("projects", set())

        # Extract entities
        entities = extract_entities_from_tweets(entries, category, cat_existing)

        # Filter by min mentions
        entities = {k: v for k, v in entities.items() if v["mention_count"] >= args.min_mentions}

        if not entities:
            print(f"  No new entities found")
            continue

        # Sort by confidence * mentions
        sorted_entities = sorted(
            entities.items(),
            key=lambda x: (x[1]["confidence"] * x[1]["mention_count"], x[1]["mention_count"]),
            reverse=True
        )

        print(f"\nFound {len(entities)} new candidates:")
        for key, entity in sorted_entities[:15]:
            locs = ", ".join(entity["locations"][:2]) if entity["locations"] else ""
            inv = f"₹{entity.get('total_investment_crore', 0):.0f}cr" if entity.get("total_investment_crore") else ""
            jobs = f"{entity.get('total_jobs', 0):,} jobs" if entity.get("total_jobs") else ""
            extra = " | ".join(filter(None, [locs, inv, jobs]))
            print(f"  [{entity['confidence']:.2f}] {entity['mention_count']:3d}x {entity['name'][:35]:35s} {extra}")

        # Save
        output_file = OUTPUT_DIR / f"{category}_new.json"
        output_data = {
            "category": category,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "existingItemsCount": len(cat_existing),
            "newCandidatesCount": len(entities),
            "candidates": [
                {
                    "name": entity["name"],
                    "type": entity["type"],
                    "confidence": entity["confidence"],
                    "mentions": entity["mention_count"],
                    "locations": entity["locations"],
                    "investment_crore": entity.get("total_investment_crore"),
                    "jobs": entity.get("total_jobs"),
                    "accounts": entity["accounts"][:5],
                    "first_mention": entity.get("first_mention"),
                    "last_mention": entity.get("last_mention"),
                    "sample_matches": entity["raw_matches"],
                    "sources": entity["sources"],
                }
                for key, entity in sorted_entities
            ]
        }

        with open(output_file, "w") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        print(f"\nSaved to {output_file}")

        all_results[category] = output_data

    # Summary
    print(f"\n{'=' * 70}")
    print("SUMMARY - NEW CANDIDATES BY CATEGORY")
    print(f"{'=' * 70}")

    total = 0
    for category, data in all_results.items():
        count = data["newCandidatesCount"]
        total += count
        print(f"  {category:15s}: {count:3d} new candidates")

    print(f"\n  TOTAL: {total} new candidates to review")

    return 0


if __name__ == "__main__":
    exit(main())
