#!/usr/bin/env python3
"""
Enrich new candidates with additional information from tweets.
Deduplicate and format according to website data structures.
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from difflib import SequenceMatcher

BASE_DIR = Path('/Users/b2sell/claude-projects/projects/dravidamodel2026/data/twitter-extraction')


def extract_investment(text: str) -> float | None:
    """Extract investment amount in crores from text."""
    patterns = [
        r'₹\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)',
        r'Rs\.?\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)',
        r'INR\s*([\d,]+(?:\.\d+)?)\s*(?:crore|cr)',
        r'([\d,]+(?:\.\d+)?)\s*(?:crore|cr)\s*(?:investment|rupees|rs)',
    ]
    for p in patterns:
        match = re.search(p, text, re.I)
        if match:
            try:
                val = float(match.group(1).replace(',', ''))
                if val > 0 and val < 10000000:  # Sanity check
                    return val
            except:
                pass
    return None


def extract_jobs(text: str) -> int | None:
    """Extract job count from text."""
    patterns = [
        r'([\d,]+)\s*(?:direct\s+)?jobs',
        r'creating\s*([\d,]+)\s*(?:direct\s+)?(?:jobs|employment)',
        r'([\d,]+)\s*(?:people|workers|employees)',
    ]
    for p in patterns:
        match = re.search(p, text, re.I)
        if match:
            try:
                val = int(match.group(1).replace(',', ''))
                if val > 0 and val < 1000000:
                    return val
            except:
                pass
    return None


def extract_location(text: str) -> str | None:
    """Extract location from text."""
    locations = [
        'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur',
        'Hosur', 'Oragadam', 'Sriperumbudur', 'Ranipet', 'Vellore',
        'Tirunelveli', 'Thoothukudi', 'Krishnagiri', 'Dharmapuri',
        'Sipcot', 'SIPCOT', 'Irungattukottai', 'Maraimalai Nagar',
        'Pillaipakkam', 'Navalur', 'Siruseri', 'Guindy', 'Egmore',
        'Connemara', 'Nandambakkam', 'OMR', 'ECR',
    ]
    for loc in locations:
        if loc.lower() in text.lower():
            return loc
    return None


def extract_date(text: str, timeline: dict) -> dict:
    """Extract dates from text and timeline."""
    result = {}

    # From timeline
    if timeline.get('inauguration'):
        result['inaugurated'] = timeline['inauguration']
    if timeline.get('mouSigned'):
        result['mou_date'] = timeline['mouSigned']
    if timeline.get('firstMention'):
        result['first_mention'] = timeline['firstMention']
    if timeline.get('lastMention'):
        result['last_mention'] = timeline['lastMention']

    return result


def clean_name(name: str) -> str:
    """Clean up entity name."""
    # Remove common prefixes
    prefixes = [
        'Inaugurated ', 'Launched ', 'Announced ', 'Brand New ',
        'Gw ', 'Decker ', 'Installing ', 'Tamil Nadu ', 'Tn ',
    ]
    for p in prefixes:
        if name.startswith(p):
            name = name[len(p):]

    # Clean up common suffixes
    suffixes = [' Se', ' Ev', ' Ac']
    for s in suffixes:
        if name.endswith(s):
            name = name[:-len(s)]

    return name.strip()


def get_proper_name(entity: dict) -> str:
    """Get proper name from entity and sources."""
    name = entity.get('name', '')
    sources = entity.get('sources', [])

    # Try to find better name from tweet text
    for src in sources[:3]:
        text = src.get('summary', '')

        # Look for quoted names
        quoted = re.findall(r'"([^"]+)"', text)
        for q in quoted:
            if 5 < len(q) < 50 and not any(w in q.lower() for w in ['http', '@', '#']):
                return q

        # Look for specific patterns
        patterns = [
            r'(?:inaugurated|launched|unveiled)\s+(?:the\s+)?([A-Z][A-Za-z\s]+(?:Park|Museum|Statue|Centre|Center|Hospital|Stadium|Plant|Facility))',
            r'([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})\s+(?:in|at|near)\s+(?:SIPCOT|Chennai|Coimbatore)',
        ]
        for p in patterns:
            match = re.search(p, text)
            if match:
                return match.group(1).strip()

    return clean_name(name)


def deduplicate_candidates(candidates: list) -> list:
    """Remove duplicate candidates across categories."""
    seen = {}  # name_key -> best candidate

    for c in candidates:
        name_lower = c['name'].lower()
        key = re.sub(r'[^a-z0-9]', '', name_lower)

        if key in seen:
            # Keep the one with more tweets or investment
            existing = seen[key]
            if (c.get('tweets', 0) > existing.get('tweets', 0) or
                (c.get('investment') and not existing.get('investment'))):
                seen[key] = c
        else:
            seen[key] = c

    return list(seen.values())


def categorize_for_tab(candidate: dict) -> str:
    """Determine the best tab for this candidate."""
    name_lower = candidate['name'].lower()
    sample = candidate.get('sample', '').lower()

    # History tab
    if any(kw in name_lower or kw in sample for kw in ['statue', 'museum', 'marx', 'periyar', 'marshall', 'kalaignar memorial']):
        return 'history'

    # Healthcare
    if any(kw in name_lower or kw in sample for kw in ['hospital', 'medical', 'cancer', 'health']):
        return 'healthcare'

    # Education
    if any(kw in name_lower or kw in sample for kw in ['school', 'college', 'university', 'library', 'education']):
        return 'education'

    # Sports
    if any(kw in name_lower or kw in sample for kw in ['chess', 'stadium', 'sports', 'kabaddi', 'hockey', 'shooting']):
        return 'sports'

    # Welfare
    if any(kw in name_lower or kw in sample for kw in ['scheme', 'pension', 'welfare', 'relief', 'assistance']):
        return 'welfare'

    # Environment
    if any(kw in name_lower or kw in sample for kw in ['lake', 'park', 'eco', 'green', 'solar', 'electric bus', 'climate']):
        return 'environment'

    # Industries (default for investments)
    if candidate.get('investment') or any(kw in name_lower for kw in ['sipcot', 'factory', 'plant', 'manufacturing', 'datacenter']):
        return 'industries'

    return candidate.get('category', 'industries')


def enrich_from_aggregated():
    """Load aggregated data and enrich candidates."""

    # Load aggregated entities
    with open(BASE_DIR / 'aggregated' / 'all_aggregated.json') as f:
        data = json.load(f)

    entities = data.get('entities', [])
    print(f"Loaded {len(entities)} aggregated entities")

    # Filter and enrich
    candidates = []

    # Keywords for real projects
    real_kw = [
        'metro', 'airport', 'port', 'sipcot', 'tidco', 'tidel', 'stadium', 'arena',
        'hospital', 'medical', 'health', 'cancer',
        'university', 'college', 'school', 'institute', 'library',
        'factory', 'plant', 'manufacturing', 'facility', 'industrial', 'datacenter',
        'park', 'lake', 'reservoir', 'dam',
        'statue', 'memorial', 'museum', 'marx', 'periyar', 'ambedkar', 'kalaignar', 'marshall',
        'scheme', 'pension', 'taps',
        'robots', 'robotics', 'solar', 'ev', 'electric',
        'tata', 'foxconn', 'corning', 'hyundai', 'hinduja',
        'conclave', 'summit',
        'chess', 'shooting', 'hockey', 'kabaddi',
        'porunai', 'connemara', 'egmore',
    ]

    # Noise patterns
    noise = [
        r'^(chief|honourable|hon|thiru|cm|pm|mp|minister)',
        r'^(union|bjp|dmk|govt|government)',
        r'^(four|three|two|one|five|another|every|some)',
        r'^(tamil\sna(du)?|india|state)',
        r'(thiru|avl|avargal)$',
    ]

    for e in entities:
        name = e.get('name', '')
        name_lower = name.lower()

        # Skip noise
        if any(re.search(p, name_lower) for p in noise):
            continue
        if len(name) < 4:
            continue

        # Must have real keyword OR significant investment
        has_kw = any(kw in name_lower for kw in real_kw)
        investment = e.get('numbers', {}).get('investmentCrore')
        jobs = e.get('numbers', {}).get('jobs')
        sources = e.get('sources', [])

        if not has_kw and not (investment and investment > 50):
            continue

        # Get sample tweet
        sample = sources[0].get('summary', '')[:300] if sources else ''
        url = sources[0].get('fxUrl', '') if sources else ''

        # Extract additional info from all sources
        all_text = ' '.join(s.get('summary', '') for s in sources)

        if not investment:
            investment = extract_investment(all_text)
        if not jobs:
            jobs = extract_jobs(all_text)

        location = extract_location(all_text)
        dates = extract_date(all_text, e.get('timeline', {}))

        proper_name = get_proper_name(e)

        candidate = {
            'original_name': name,
            'name': proper_name,
            'category': categorize_for_tab({
                'name': name,
                'sample': sample,
                'investment': investment,
                'category': e.get('category', ''),
            }),
            'original_category': e.get('category', ''),
            'tweets': len(sources),
            'investment_crore': investment,
            'jobs': jobs,
            'location': location,
            'dates': dates,
            'sample': sample,
            'url': url,
            'accounts': list(set(s.get('handle') for s in sources if s.get('handle'))),
        }

        candidates.append(candidate)

    print(f"After filtering: {len(candidates)} candidates")

    # Deduplicate
    candidates = deduplicate_candidates(candidates)
    print(f"After deduplication: {len(candidates)} candidates")

    # Sort by category and tweet count
    candidates.sort(key=lambda x: (x['category'], -x['tweets']))

    return candidates


def format_for_industries(c: dict) -> dict:
    """Format candidate for industries.ts IndustrialPark structure."""
    return {
        'id': re.sub(r'[^a-z0-9-]', '-', c['name'].lower())[:30],
        'name': c['name'],
        'company': None,  # Would need to extract from tweet
        'location': c.get('location') or 'Tamil Nadu',
        'district': c.get('location') or 'Multiple',
        'sector': [],  # Would need classification
        'status': 'announced' if c.get('dates', {}).get('mou_date') else 'operational',
        'investmentCrore': c.get('investment_crore'),
        'jobsCreated': c.get('jobs'),
        'notes': c.get('sample', '')[:200],
        'year': int(c.get('dates', {}).get('inaugurated', c.get('dates', {}).get('first_mention', '2025'))[:4]) if c.get('dates') else 2025,
        'source': c.get('url'),
    }


def format_for_welfare(c: dict) -> dict:
    """Format candidate for socialWelfare.ts WelfareScheme structure."""
    return {
        'id': re.sub(r'[^a-z0-9-]', '-', c['name'].lower())[:30],
        'name': {'en': c['name'], 'ta': ''},  # Tamil translation needed
        'description': {'en': c.get('sample', '')[:200], 'ta': ''},
        'launchDate': c.get('dates', {}).get('inaugurated'),
        'beneficiaries': {
            'count': '',
            'description': {'en': '', 'ta': ''},
        },
        'budget': {
            'amount': f"₹{c.get('investment_crore'):,.0f} crore" if c.get('investment_crore') else '',
        },
        'highlights': [],
        'icon': '📋',
        'sources': [{'title': 'Twitter Source', 'url': c.get('url'), 'type': 'media'}] if c.get('url') else [],
    }


def format_for_history(c: dict) -> dict:
    """Format candidate for tamilHistory.ts HistoryScheme structure."""
    return {
        'id': re.sub(r'[^a-z0-9-]', '-', c['name'].lower())[:30],
        'name': {'en': c['name'], 'ta': ''},
        'description': {'en': c.get('sample', '')[:200], 'ta': ''},
        'launchDate': c.get('dates', {}).get('inaugurated'),
        'beneficiaries': {
            'count': '',
            'description': {'en': '', 'ta': ''},
        },
        'budget': {
            'amount': f"₹{c.get('investment_crore'):,.0f} crore" if c.get('investment_crore') else '',
        },
        'highlights': [],
        'icon': '🏛️',
        'sources': [{'title': 'Twitter Source', 'url': c.get('url'), 'type': 'media'}] if c.get('url') else [],
    }


def main():
    print("Enriching candidates from aggregated data...")
    candidates = enrich_from_aggregated()

    # Group by category
    by_cat = defaultdict(list)
    for c in candidates:
        by_cat[c['category']].append(c)

    print("\n=== CANDIDATES BY CATEGORY ===\n")

    all_formatted = {}

    for cat in ['industries', 'infrastructure', 'welfare', 'education', 'healthcare', 'environment', 'sports', 'history', 'employment', 'agriculture']:
        items = by_cat.get(cat, [])
        if not items:
            continue

        print(f"\n## {cat.upper()} ({len(items)} items)")
        print("-" * 50)

        formatted = []
        for c in items[:20]:  # Top 20 per category
            inv = f"₹{c['investment_crore']:,.0f} Cr" if c.get('investment_crore') else '-'
            jobs = f"{c['jobs']:,} jobs" if c.get('jobs') else '-'
            loc = c.get('location') or '-'
            inaug = c.get('dates', {}).get('inaugurated') or '-'

            print(f"\n{c['name']}")
            print(f"  Investment: {inv} | Jobs: {jobs} | Location: {loc}")
            print(f"  Inaugurated: {inaug} | Tweets: {c['tweets']}")
            print(f"  Accounts: {', '.join(c.get('accounts', [])[:3])}")
            print(f"  URL: {c.get('url', '-')}")

            # Format for export
            if cat == 'industries':
                formatted.append(format_for_industries(c))
            elif cat == 'welfare':
                formatted.append(format_for_welfare(c))
            elif cat == 'history':
                formatted.append(format_for_history(c))
            else:
                formatted.append(c)

        all_formatted[cat] = formatted

    # Save enriched data
    output_file = BASE_DIR / 'new_entities' / 'enriched_candidates.json'
    with open(output_file, 'w') as f:
        json.dump({
            'generated': '2026-02-18',
            'total': len(candidates),
            'by_category': {k: len(v) for k, v in by_cat.items()},
            'formatted': all_formatted,
            'raw': candidates,
        }, f, indent=2, ensure_ascii=False)

    print(f"\n\nSaved to: {output_file}")


if __name__ == '__main__':
    main()
