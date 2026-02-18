#!/usr/bin/env python3
"""
Phase 4.5: Enhanced Entity Aggregation

Re-processes verified entries with better entity extraction to produce
higher-quality aggregated data for duplicate detection.

Key improvements:
1. Better regex patterns for Tamil Nadu project names
2. Extract project names from enriched link titles
3. Group by actual project identifiers, not generic terms
4. Filter out generic entities (Tamil Nadu, Chief Minister, etc.)

Usage:
  python3 enhance_aggregation.py --category infrastructure
  python3 enhance_aggregation.py --all
  python3 enhance_aggregation.py --dry-run
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
from difflib import SequenceMatcher
from typing import List, Dict, Optional, Tuple

# Configuration
VERIFIED_DIR = Path("data/twitter-extraction/verified")
AGGREGATED_DIR = Path("data/twitter-extraction/aggregated")
ENHANCED_DIR = Path("data/twitter-extraction/aggregated/enhanced")
PROJECTS_DIR = Path("app/src/data/projects")

# Categories
CATEGORIES = [
    "infrastructure", "industries", "education", "healthcare",
    "employment", "agriculture", "environment", "social-welfare",
    "sports-culture", "tamil-history"
]

# Generic terms to filter out (not real projects)
GENERIC_TERMS = {
    "tamil nadu", "chief minister", "cm", "government", "minister",
    "dmk", "bjp", "congress", "india", "honourable", "hon'ble",
    "thiru", "selvi", "dr", "mr", "ms", "sri", "shri",
    "prime minister", "union", "state", "country", "nation",
    "people", "public", "citizen", "resident", "voter",
    "today", "yesterday", "tomorrow", "morning", "evening",
    "good", "great", "best", "new", "old", "first", "last",
    "mobile app", "website", "portal", "online", "digital",
    "self respect", "dravidian model", "dravidianmodel",
}

# Project-specific patterns for Tamil Nadu government
PROJECT_PATTERNS = [
    # Metro patterns
    (r"chennai\s+metro(?:\s+rail)?\s*(?:phase\s*)?(\d+)?(?:\s*corridor\s*(\d+))?", "Chennai Metro"),
    (r"cmrl\s*(?:phase\s*)?(\d+)?(?:\s*corridor\s*(\d+))?", "Chennai Metro"),
    (r"madurai\s+metro", "Madurai Metro"),
    (r"coimbatore\s+metro", "Coimbatore Metro"),

    # Flyovers & Roads
    (r"([\w\s]+)\s+flyover", "Flyover"),
    (r"([\w\s]+)\s+underpass", "Underpass"),
    (r"([\w\s]+)\s+ring\s+road", "Ring Road"),
    (r"peripheral\s+ring\s+road", "Chennai Peripheral Ring Road"),

    # Bus terminals
    (r"([\w\s]+)\s+bus\s+(?:terminal|terminus|stand)", "Bus Terminal"),
    (r"kcbt|kilambakkam", "Kilambakkam Bus Terminal"),

    # Water/Sewage
    (r"([\w\s]+)\s+(?:stp|sewage\s+treatment)", "STP"),
    (r"([\w\s]+)\s+(?:desal|desalination)", "Desalination Plant"),
    (r"underground\s+sewerage.*?([\w]+)", "Underground Sewerage"),

    # Industrial
    (r"sipcot\s+([\w\s]+)", "SIPCOT Industrial Park"),
    (r"tidel\s+(?:park|neo)?\s*([\w]+)?", "TIDEL Park"),
    (r"([\w\s]+)\s+(?:ev|electric\s+vehicle)\s+(?:plant|factory|unit)", "EV Plant"),
    (r"([\w\s]+)\s+(?:manufacturing|factory|plant)\b", "Manufacturing Unit"),

    # Healthcare
    (r"([\w\s]+)\s+(?:hospital|medical\s+college)", "Hospital"),
    (r"([\w\s]+)\s+(?:gh|government\s+hospital)", "Government Hospital"),

    # Education
    (r"([\w\s]+)\s+(?:school|college|university|iti)", "Educational Institution"),
    (r"smart\s+classroom", "Smart Classroom Initiative"),

    # Welfare
    (r"([\w\s]+)\s+(?:hostel|housing)", "Housing/Hostel"),
    (r"([\w\s]+)\s+scheme", "Welfare Scheme"),

    # Sports/Culture
    (r"([\w\s]+)\s+stadium", "Stadium"),
    (r"([\w\s]+)\s+museum", "Museum"),
    (r"keezhadi", "Keezhadi Archaeological Site"),
    (r"porunai", "Porunai Museum"),

    # Energy
    (r"([\w\s]+)\s+(?:solar|wind)\s+(?:plant|park|farm)", "Renewable Energy"),
    (r"pumped\s+storage|bess", "Energy Storage"),
]

# Investment patterns
INVESTMENT_PATTERNS = [
    (r"(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)\b", "crore"),
    (r"([\d,]+(?:\.\d+)?)\s*(?:crore|cr)(?:\s+(?:rupees|rs))?\b", "crore"),
    (r"\$([\d,]+(?:\.\d+)?)\s*(?:million|mn|m)\b", "million_usd"),
    (r"\$([\d,]+(?:\.\d+)?)\s*(?:billion|bn|b)\b", "billion_usd"),
]

# TN Districts for location extraction
TN_DISTRICTS = [
    "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem",
    "tirunelveli", "tiruppur", "vellore", "erode", "thoothukudi", "tuticorin",
    "dindigul", "thanjavur", "ranipet", "sivaganga", "virudhunagar", "namakkal",
    "cuddalore", "kanchipuram", "tiruvallur", "chengalpattu", "villupuram",
    "tiruvannamalai", "krishnagiri", "dharmapuri", "ariyalur", "perambalur",
    "nagapattinam", "mayiladuthurai", "karur", "pudukkottai", "ramanathapuram",
    "theni", "nilgiris", "ooty", "kanyakumari", "tenkasi", "tirupattur", "kallakurichi",
    "hosur", "porur", "tambaram", "ambattur", "velachery", "adyar", "t nagar",
]


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def is_generic_term(text: str) -> bool:
    """Check if text is a generic term that shouldn't be an entity."""
    normalized = normalize_text(text)

    # Direct match
    if normalized in GENERIC_TERMS:
        return True

    # Partial match for short terms
    if len(normalized.split()) <= 2:
        for term in GENERIC_TERMS:
            if normalized == term or term in normalized.split():
                return True

    return False


def extract_location(text: str) -> Optional[str]:
    """Extract location from text."""
    text_lower = text.lower()

    for district in TN_DISTRICTS:
        if re.search(r'\b' + district + r'\b', text_lower):
            return district.title()

    return None


def extract_investment(text: str) -> Optional[float]:
    """Extract investment in crores."""
    for pattern, unit in INVESTMENT_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                amount = float(match.group(1).replace(",", ""))
                if unit == "million_usd":
                    amount = amount * 8.3 / 100  # Approx USD to crore
                elif unit == "billion_usd":
                    amount = amount * 8.3 * 10  # Approx USD to crore
                return amount
            except ValueError:
                continue
    return None


def extract_project_name(text: str, category: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract project name from text using patterns.
    Returns (project_name, project_type)
    """
    text_lower = text.lower()

    # Try each pattern
    for pattern, proj_type in PROJECT_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            groups = match.groups()

            # Build project name from pattern
            if proj_type == "Chennai Metro":
                phase = groups[0] if groups[0] else ""
                corridor = groups[1] if len(groups) > 1 and groups[1] else ""
                name = "Chennai Metro"
                if phase:
                    name += f" Phase {phase}"
                if corridor:
                    name += f" Corridor {corridor}"
                return name, proj_type

            elif proj_type in ["Flyover", "Underpass", "Bus Terminal", "STP", "Stadium", "Museum"]:
                prefix = groups[0].strip() if groups else ""
                if prefix and not is_generic_term(prefix):
                    # Get location for better name
                    location = extract_location(prefix) or prefix.title()
                    name = f"{location} {proj_type}"
                    return name, proj_type

            elif "SIPCOT" in proj_type or "TIDEL" in proj_type:
                suffix = groups[0] if groups else ""
                location = extract_location(text) or suffix.title() if suffix else ""
                name = f"{proj_type}"
                if location:
                    name = f"{proj_type} {location}"
                return name, proj_type

            else:
                # Generic extraction
                return proj_type, proj_type

    # Fallback: look for common project indicators in text
    # Try to find capitalized multi-word names
    caps_pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+(?:Project|Scheme|Plant|Factory|Hospital|College|Stadium|Metro)'
    match = re.search(caps_pattern, text)
    if match:
        name = match.group(0)
        if not is_generic_term(name):
            return name, "project"

    return None, None


def extract_entity_from_entry(entry: dict) -> Optional[dict]:
    """Extract entity information from a verified entry."""
    text = entry.get("tweetText", "")
    category = entry.get("category", "")

    # Try to extract project name
    project_name, project_type = extract_project_name(text, category)

    # Also check enriched links for better names
    enriched_links = entry.get("enrichedLinks", [])
    for link in enriched_links:
        title = link.get("title", "")
        if title:
            link_name, link_type = extract_project_name(title, category)
            if link_name and (not project_name or len(link_name) > len(project_name)):
                project_name = link_name
                project_type = link_type

    if not project_name:
        return None

    # Skip generic terms
    if is_generic_term(project_name):
        return None

    # Build entity
    entity = {
        "name": project_name,
        "type": project_type or "project",
        "location": extract_location(text),
        "investment": extract_investment(text),
    }

    return entity


def generate_entity_key(entity: dict) -> str:
    """Generate a unique key for entity deduplication."""
    name = normalize_text(entity.get("name", ""))
    location = normalize_text(entity.get("location", "") or "")

    # Remove common words
    stopwords = {"the", "a", "an", "of", "in", "at", "for", "to", "and"}
    words = [w for w in name.split() if w not in stopwords]
    key = "-".join(words[:5])  # Limit to 5 words

    if location:
        key = f"{location}-{key}"

    return key or "unknown"


def similarity_score(a: str, b: str) -> float:
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def find_similar_entity(key: str, name: str, entities: dict, threshold: float = 0.75) -> Optional[str]:
    """Find similar existing entity."""
    # Exact key match
    if key in entities:
        return key

    # Fuzzy match on name
    for existing_key, entity in entities.items():
        if similarity_score(name, entity.get("name", "")) >= threshold:
            return existing_key

    return None


def aggregate_entities(entries: List[dict], category: str) -> List[dict]:
    """Aggregate entries into entities with enhanced extraction."""
    entities = {}  # key -> entity

    for entry in entries:
        if entry.get("category") != category:
            continue

        # Extract entity
        extracted = extract_entity_from_entry(entry)
        if not extracted:
            continue

        entity_name = extracted["name"]
        entity_key = generate_entity_key(extracted)

        # Find or create entity
        existing_key = find_similar_entity(entity_key, entity_name, entities)

        if existing_key:
            entity = entities[existing_key]
        else:
            entity = {
                "entityId": entity_key,
                "name": entity_name,
                "nameVariants": [],
                "category": category,
                "entityType": extracted.get("type", "project"),
                "location": extracted.get("location"),
                "numbers": {},
                "timeline": {},
                "sources": [],
                "accountsCovering": set(),
            }
            entities[entity_key] = entity

        # Add name variant
        if entity_name != entity["name"] and entity_name not in entity["nameVariants"]:
            entity["nameVariants"].append(entity_name)

        # Update investment (take highest)
        if extracted.get("investment"):
            current = entity["numbers"].get("investmentCrore", 0)
            entity["numbers"]["investmentCrore"] = max(current, extracted["investment"])

        # Update location if not set
        if extracted.get("location") and not entity.get("location"):
            entity["location"] = extracted["location"]

        # Add source
        source = {
            "date": entry.get("date", ""),
            "handle": entry["sourceHandle"],
            "tweetId": entry["sourceTweetId"],
            "fxUrl": entry.get("fxUrl", ""),
            "eventType": entry.get("eventType", "other"),
            "summary": entry.get("tweetText", "")[:150],
        }
        entity["sources"].append(source)
        entity["accountsCovering"].add(entry["sourceHandle"])

        # Update timeline
        date = entry.get("date", "")
        if date:
            if not entity["timeline"].get("firstMention") or date < entity["timeline"]["firstMention"]:
                entity["timeline"]["firstMention"] = date
            if not entity["timeline"].get("lastMention") or date > entity["timeline"]["lastMention"]:
                entity["timeline"]["lastMention"] = date

    # Finalize entities
    results = []
    for entity in entities.values():
        entity["sources"].sort(key=lambda x: x.get("date", ""))
        entity["accountsCovering"] = list(entity["accountsCovering"])
        entity["tweetCount"] = len(entity["sources"])

        # Only include entities with multiple sources or high-value
        if entity["tweetCount"] >= 2 or entity["numbers"].get("investmentCrore", 0) >= 100:
            results.append(entity)

    # Sort by tweet count
    results.sort(key=lambda x: x["tweetCount"], reverse=True)

    return results


def main():
    parser = argparse.ArgumentParser(description="Enhanced entity aggregation")
    parser.add_argument("--category", type=str, help="Process specific category")
    parser.add_argument("--all", action="store_true", help="Process all categories")
    parser.add_argument("--dry-run", action="store_true", help="Don't save output")
    args = parser.parse_args()

    # Load verified entries
    verified_file = VERIFIED_DIR / "all_verified.json"
    print(f"Loading verified entries from {verified_file}...")

    with open(verified_file) as f:
        data = json.load(f)

    entries = data.get("entries", [])
    print(f"Loaded {len(entries)} entries")

    # Determine categories
    if args.category:
        categories = [args.category]
    elif args.all:
        categories = CATEGORIES
    else:
        categories = ["infrastructure"]  # Default to infrastructure for testing

    ENHANCED_DIR.mkdir(parents=True, exist_ok=True)

    all_entities = []

    for category in categories:
        cat_entries = [e for e in entries if e.get("category") == category]
        print(f"\n{'='*60}")
        print(f"Processing {category}: {len(cat_entries)} entries")
        print(f"{'='*60}")

        entities = aggregate_entities(entries, category)

        print(f"Extracted {len(entities)} entities (filtered from generic terms)")

        # Show top entities
        print("\nTop entities:")
        for e in entities[:10]:
            inv = e["numbers"].get("investmentCrore", 0)
            inv_str = f"₹{inv:,.0f}cr" if inv else ""
            print(f"  {e['name']} ({e['tweetCount']} tweets) {inv_str}")

        if not args.dry_run:
            # Save enhanced aggregated file
            output_file = ENHANCED_DIR / f"{category}_enhanced.json"
            with open(output_file, "w") as f:
                json.dump({
                    "category": category,
                    "aggregatedAt": datetime.now(timezone.utc).isoformat(),
                    "stats": {
                        "entries": len(cat_entries),
                        "entities": len(entities),
                    },
                    "entities": entities
                }, f, indent=2, ensure_ascii=False)
            print(f"\nSaved to {output_file}")

        all_entities.extend(entities)

    print(f"\n{'='*60}")
    print(f"TOTAL: {len(all_entities)} enhanced entities")
    print(f"{'='*60}")

    return 0


if __name__ == "__main__":
    exit(main())
