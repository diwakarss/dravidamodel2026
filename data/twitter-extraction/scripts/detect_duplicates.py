#!/usr/bin/env python3
"""
Phase 5: Duplicate Detection

Compares aggregated entities from twitter extraction against existing project data
to find duplicates, suggest source additions, and identify new candidates.

Usage:
  python3 detect_duplicates.py --category infrastructure
  python3 detect_duplicates.py --all
  python3 detect_duplicates.py --category industries --dry-run
"""

import json
import os
import sys
import argparse
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple
from difflib import SequenceMatcher

# Configuration
BASE_DIR = Path("data/twitter-extraction")
AGGREGATED_DIR = BASE_DIR / "aggregated"
ENHANCED_DIR = BASE_DIR / "aggregated" / "enhanced"
DUPLICATES_DIR = BASE_DIR / "duplicates"
PROJECTS_DIR = Path("app/src/data/projects")

# Category mapping (aggregated category -> project type hints)
# Maps to existing project types: Other, Education/Health, Water/Sanitation, Public Transport, Roads/Highways, Power/Utilities
CATEGORY_TYPE_MAP = {
    "infrastructure": ["Public Transport", "Roads", "Highway", "Water", "Sanitation", "Power", "Utilities", "Other"],
    "industries": ["Other", "Industrial", "Manufacturing"],
    "education": ["Education", "Health", "Other"],
    "healthcare": ["Education", "Health", "Other"],
    "employment": ["Other", "Education"],
    "agriculture": ["Other"],
    "environment": ["Power", "Utilities", "Other"],
    "social-welfare": ["Other", "Education", "Health"],
    "sports-culture": ["Other"],
    "tamil-history": ["Other"],
}

# Minimum scores for matching
EXACT_MATCH_THRESHOLD = 0.85
PARTIAL_MATCH_THRESHOLD = 0.60
FUZZY_MATCH_THRESHOLD = 0.40


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    if not text:
        return ""
    # Lowercase, remove special chars, collapse whitespace
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_keywords(text: str) -> set:
    """Extract meaningful keywords from text."""
    normalized = normalize_text(text)
    # Remove common stop words
    stop_words = {
        'the', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'or', 'at', 'by',
        'tamil', 'nadu', 'government', 'project', 'scheme', 'phase', 'new',
        'thiru', 'hon', 'minister', 'cm', 'chief'
    }
    words = normalized.split()
    return {w for w in words if w not in stop_words and len(w) > 2}


def similarity_score(text1: str, text2: str) -> float:
    """Calculate similarity between two strings."""
    if not text1 or not text2:
        return 0.0

    n1 = normalize_text(text1)
    n2 = normalize_text(text2)

    # Direct sequence matching
    seq_score = SequenceMatcher(None, n1, n2).ratio()

    # Keyword overlap
    kw1 = extract_keywords(text1)
    kw2 = extract_keywords(text2)
    if kw1 and kw2:
        overlap = len(kw1 & kw2)
        kw_score = overlap / max(len(kw1), len(kw2))
    else:
        kw_score = 0.0

    # Combined score (weighted)
    return 0.6 * seq_score + 0.4 * kw_score


def location_match(entity: dict, project: dict) -> float:
    """Check if locations match."""
    # Get entity location hints from name or sources
    entity_text = entity.get('name', '') + ' ' + ' '.join(
        s.get('summary', '')[:200] for s in entity.get('sources', [])[:3]
    )

    # Get project location
    proj_loc = project.get('location', {})
    proj_location = f"{proj_loc.get('district', '')} {proj_loc.get('city', '')}"
    proj_name = project.get('name', {})
    if isinstance(proj_name, dict):
        proj_name = proj_name.get('en', '')

    # Check for location keywords in entity
    entity_lower = entity_text.lower()

    loc_matches = 0
    loc_checks = 0

    for loc in [proj_loc.get('district'), proj_loc.get('city')]:
        if loc and len(loc) > 2:
            loc_checks += 1
            if loc.lower() in entity_lower:
                loc_matches += 1

    return loc_matches / loc_checks if loc_checks > 0 else 0.5


def investment_match(entity: dict, project: dict) -> float:
    """Check if investment amounts are similar."""
    entity_inv = entity.get('numbers', {}).get('investmentCrore')
    proj_budget = project.get('budget', {}).get('crore')

    if entity_inv and proj_budget:
        # Within 20% tolerance
        ratio = min(entity_inv, proj_budget) / max(entity_inv, proj_budget)
        return ratio if ratio > 0.5 else 0.0

    return 0.5  # Neutral if missing


def load_existing_projects(category: str = None) -> List[dict]:
    """Load all existing project files."""
    projects = []

    if not PROJECTS_DIR.exists():
        print(f"Warning: Projects directory not found: {PROJECTS_DIR}")
        return projects

    type_hints = CATEGORY_TYPE_MAP.get(category, []) if category else []

    for pf in PROJECTS_DIR.glob("*.json"):
        try:
            with open(pf) as f:
                project = json.load(f)
                project['_file'] = str(pf)

                # Filter by type if category specified
                if type_hints:
                    proj_type = project.get('type', '')
                    # Include if any type hint matches
                    if any(hint.lower() in proj_type.lower() for hint in type_hints):
                        projects.append(project)
                    # Also include if no type but name suggests match
                    elif not proj_type:
                        projects.append(project)
                else:
                    projects.append(project)
        except Exception as e:
            print(f"Error loading {pf}: {e}")

    return projects


def load_aggregated_entities(category: str, use_enhanced: bool = True) -> List[dict]:
    """Load aggregated entities for a category."""
    # Prefer enhanced data if available
    if use_enhanced:
        enhanced_file = ENHANCED_DIR / f"{category}_enhanced.json"
        if enhanced_file.exists():
            print(f"Using enhanced aggregation: {enhanced_file}")
            with open(enhanced_file) as f:
                data = json.load(f)
            return data.get('entities', [])

    # Fall back to regular aggregation
    agg_file = AGGREGATED_DIR / f"{category}_aggregated.json"
    if not agg_file.exists():
        print(f"Aggregated file not found: {agg_file}")
        return []

    with open(agg_file) as f:
        data = json.load(f)

    return data.get('entities', [])


def find_matches(entity: dict, projects: List[dict]) -> List[Tuple[dict, float, str, list]]:
    """Find matching projects for an entity.

    Returns: List of (project, score, match_type, matched_on)
    """
    matches = []
    entity_name = entity.get('name', '')

    for project in projects:
        # Get project name
        proj_name = project.get('name', {})
        if isinstance(proj_name, dict):
            proj_name_en = proj_name.get('en', '')
            proj_name_ta = proj_name.get('ta', '')
        else:
            proj_name_en = str(proj_name)
            proj_name_ta = ''

        # Calculate various match scores
        name_score = max(
            similarity_score(entity_name, proj_name_en),
            similarity_score(entity_name, proj_name_ta) if proj_name_ta else 0
        )

        loc_score = location_match(entity, project)
        inv_score = investment_match(entity, project)

        # Composite score
        composite = 0.5 * name_score + 0.25 * loc_score + 0.25 * inv_score

        matched_on = []
        if name_score > 0.5:
            matched_on.append('name')
        if loc_score > 0.7:
            matched_on.append('location')
        if inv_score > 0.7:
            matched_on.append('investment')

        if composite >= FUZZY_MATCH_THRESHOLD:
            if composite >= EXACT_MATCH_THRESHOLD:
                match_type = 'exact'
            elif composite >= PARTIAL_MATCH_THRESHOLD:
                match_type = 'partial'
            else:
                match_type = 'fuzzy'

            matches.append((project, composite, match_type, matched_on))

    # Sort by score descending
    matches.sort(key=lambda x: x[1], reverse=True)
    return matches


def generate_source_additions(entity: dict, project: dict) -> List[dict]:
    """Generate list of sources to add from entity to project."""
    existing_urls = set()

    # Get existing source URLs from project
    for src in project.get('sources', []):
        if 'url' in src:
            existing_urls.add(src['url'])

    new_sources = []
    for src in entity.get('sources', []):
        fx_url = src.get('fxUrl', '')
        # Convert fxtwitter to regular twitter URL for comparison
        if fx_url and fx_url not in existing_urls:
            new_sources.append({
                'date': src.get('date'),
                'handle': src.get('handle'),
                'tweetId': src.get('tweetId'),
                'fxUrl': fx_url,
                'eventType': src.get('eventType'),
                'summary': src.get('summary', '')[:200]
            })

    return new_sources


def assess_new_candidate(entity: dict) -> Tuple[float, List[str]]:
    """Assess confidence and flags for a new candidate entity."""
    flags = []

    sources = entity.get('sources', [])
    source_count = len(sources)

    # Single source flag
    if source_count == 1:
        flags.append('single_source')

    # Check for missing data
    numbers = entity.get('numbers', {})
    if not numbers.get('investmentCrore'):
        flags.append('missing_investment')

    # Check name quality
    name = entity.get('name', '')
    if len(name.split()) < 2:
        flags.append('needs_verification')

    # Calculate confidence
    confidence = 0.5
    if source_count >= 5:
        confidence += 0.2
    elif source_count >= 3:
        confidence += 0.1

    if numbers.get('investmentCrore'):
        confidence += 0.15

    if len(name.split()) >= 3:
        confidence += 0.1

    # Check for event types
    event_types = {s.get('eventType') for s in sources}
    if 'inauguration' in event_types or 'groundbreaking' in event_types:
        confidence += 0.1

    confidence = min(1.0, confidence)

    return confidence, flags


def detect_duplicates(category: str, dry_run: bool = False) -> dict:
    """Main duplicate detection for a category."""
    print(f"\n{'='*60}")
    print(f"Phase 5: Duplicate Detection - {category}")
    print(f"{'='*60}")

    # Load data
    entities = load_aggregated_entities(category)
    projects = load_existing_projects(category)

    print(f"Loaded {len(entities)} aggregated entities")
    print(f"Loaded {len(projects)} existing projects")

    if not entities:
        print("No entities to process")
        return None

    # Results
    matches = []
    new_candidates = []
    source_additions = []

    exact_count = 0
    partial_count = 0

    for entity in entities:
        entity_id = entity.get('entityId', '')
        entity_name = entity.get('name', '')

        # Skip generic/low-quality entities
        if len(entity_name) < 3:
            continue

        # Find matches
        found_matches = find_matches(entity, projects)

        if found_matches:
            # Take best match
            best_project, score, match_type, matched_on = found_matches[0]

            proj_name = best_project.get('name', {})
            if isinstance(proj_name, dict):
                proj_name = proj_name.get('en', '')

            match_record = {
                'aggregatedEntityId': entity_id,
                'aggregatedEntityName': entity_name,
                'existingEntryId': best_project.get('id'),
                'existingEntryName': proj_name,
                'existingDataFile': best_project.get('_file'),
                'category': category,
                'matchType': match_type,
                'matchScore': round(score, 3),
                'matchedOn': matched_on,
                'action': 'add_sources' if match_type == 'exact' else 'review',
                'newSourcesToAdd': len(entity.get('sources', []))
            }

            matches.append(match_record)

            if match_type == 'exact':
                exact_count += 1
                # Generate source additions
                new_srcs = generate_source_additions(entity, best_project)
                if new_srcs:
                    source_additions.append({
                        'existingEntryId': best_project.get('id'),
                        'existingDataFile': best_project.get('_file'),
                        'newSources': new_srcs
                    })
            else:
                partial_count += 1
        else:
            # New candidate
            confidence, flags = assess_new_candidate(entity)

            new_candidates.append({
                'aggregatedEntityId': entity_id,
                'name': entity_name,
                'category': category,
                'sourceCount': len(entity.get('sources', [])),
                'firstMention': entity.get('timeline', {}).get('firstMention'),
                'lastMention': entity.get('timeline', {}).get('lastMention'),
                'confidence': round(confidence, 2),
                'reviewFlags': flags,
                'numbers': entity.get('numbers', {})
            })

    # Build report
    report = {
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'category': category,
        'summary': {
            'totalEntitiesProcessed': len(entities),
            'exactMatches': exact_count,
            'partialMatches': partial_count,
            'newCandidates': len(new_candidates),
            'existingProjects': len(projects)
        },
        'matches': matches,
        'newCandidates': new_candidates,
        'sourceAdditions': source_additions
    }

    # Print summary
    print(f"\n--- Results ---")
    print(f"Exact matches:    {exact_count}")
    print(f"Partial matches:  {partial_count}")
    print(f"New candidates:   {len(new_candidates)}")
    print(f"Source additions: {len(source_additions)}")

    # Save report
    if not dry_run:
        DUPLICATES_DIR.mkdir(parents=True, exist_ok=True)
        output_file = DUPLICATES_DIR / f"{category}_duplicates.json"
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\nReport saved: {output_file}")
    else:
        print("\n[DRY RUN - not saved]")

    return report


def main():
    parser = argparse.ArgumentParser(description="Phase 5: Duplicate Detection")
    parser.add_argument("--category", type=str, help="Category to process")
    parser.add_argument("--all", action="store_true", help="Process all categories")
    parser.add_argument("--dry-run", action="store_true", help="Don't save output")
    args = parser.parse_args()

    categories = list(CATEGORY_TYPE_MAP.keys())

    if args.all:
        for cat in categories:
            detect_duplicates(cat, args.dry_run)
    elif args.category:
        if args.category not in categories:
            print(f"Unknown category: {args.category}")
            print(f"Available: {', '.join(categories)}")
            return 1
        detect_duplicates(args.category, args.dry_run)
    else:
        print("Specify --category <name> or --all")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
