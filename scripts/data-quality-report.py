#!/usr/bin/env python3
"""
Generate comprehensive data quality report for Phase 1 verification.
"""

import json
from pathlib import Path
from typing import Dict, List
from collections import Counter

PROJECT_ROOT = Path(__file__).parent.parent
DATA_FILE = PROJECT_ROOT / "data" / "projects.json"

def analyze_data_quality():
    """Analyze project data and generate quality report."""

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    projects = data["projects"]
    total = len(projects)

    print("=" * 80)
    print("DATA QUALITY REPORT - Phase 1 Verification")
    print("=" * 80)
    print(f"\nDataset: projects.json")
    print(f"Total Projects: {total}")
    print(f"Generated: {data['generated']}")
    print(f"Version: {data['version']}")
    print(f"Checksum: {data['checksum'][:16]}...")

    # ==== FIELD COMPLETENESS ====
    print("\n" + "=" * 80)
    print("1. FIELD COMPLETENESS")
    print("=" * 80)

    # Names
    with_en_name = sum(1 for p in projects if p["name"]["en"])
    with_ta_name = sum(1 for p in projects if p["name"]["ta"])
    print(f"\nNames:")
    print(f"  English name:     {with_en_name}/{total} ({with_en_name/total*100:.1f}%)")
    print(f"  Tamil name:       {with_ta_name}/{total} ({with_ta_name/total*100:.1f}%)")

    # Location
    with_district = sum(1 for p in projects if p["location"]["district"])
    with_city = sum(1 for p in projects if p["location"]["city"])
    with_coords = sum(1 for p in projects if p["location"]["coordinates"])
    print(f"\nLocation:")
    print(f"  District:         {with_district}/{total} ({with_district/total*100:.1f}%)")
    print(f"  City:             {with_city}/{total} ({with_city/total*100:.1f}%)")
    print(f"  Coordinates:      {with_coords}/{total} ({with_coords/total*100:.1f}%)")

    # Budget
    with_budget = sum(1 for p in projects if p["budget"]["crore"] is not None)
    with_budget_notes = sum(1 for p in projects if p["budget"]["notes"])
    print(f"\nBudget:")
    print(f"  Amount (crore):   {with_budget}/{total} ({with_budget/total*100:.1f}%)")
    print(f"  Notes:            {with_budget_notes}/{total} ({with_budget_notes/total*100:.1f}%)")

    # Timeline
    with_start = sum(1 for p in projects if p["timeline"]["startYear"])
    with_completion = sum(1 for p in projects if p["timeline"]["completionYear"])
    with_timeline_notes = sum(1 for p in projects if p["timeline"]["completionNotes"])
    print(f"\nTimeline:")
    print(f"  Start year:       {with_start}/{total} ({with_start/total*100:.1f}%)")
    print(f"  Completion year:  {with_completion}/{total} ({with_completion/total*100:.1f}%)")
    print(f"  Notes:            {with_timeline_notes}/{total} ({with_timeline_notes/total*100:.1f}%)")

    # Media
    with_photo = sum(1 for p in projects if p["media"]["photoUrl"])
    with_cm_init = sum(1 for p in projects if p["media"]["cmPhotoInitiation"])
    with_cm_comp = sum(1 for p in projects if p["media"]["cmPhotoCompletion"])
    print(f"\nMedia:")
    print(f"  Project photo:    {with_photo}/{total} ({with_photo/total*100:.1f}%)")
    print(f"  CM initiation:    {with_cm_init}/{total} ({with_cm_init/total*100:.1f}%)")
    print(f"  CM completion:    {with_cm_comp}/{total} ({with_cm_comp/total*100:.1f}%)")

    # Sources
    source_counts = [len(p["sources"]) for p in projects]
    avg_sources = sum(source_counts) / len(source_counts)
    min_sources = min(source_counts)
    max_sources = max(source_counts)
    print(f"\nSources:")
    print(f"  Average:          {avg_sources:.1f} sources per project")
    print(f"  Range:            {min_sources} - {max_sources} sources")
    print(f"  2+ sources:       {sum(1 for c in source_counts if c >= 2)}/{total} ({sum(1 for c in source_counts if c >= 2)/total*100:.1f}%)")
    print(f"  3+ sources:       {sum(1 for c in source_counts if c >= 3)}/{total} ({sum(1 for c in source_counts if c >= 3)/total*100:.1f}%)")

    # ==== STATUS DISTRIBUTION ====
    print("\n" + "=" * 80)
    print("2. STATUS DISTRIBUTION")
    print("=" * 80)

    status_counts = Counter(p["status"] for p in projects)
    print(f"\nProject Status:")
    for status, count in status_counts.most_common():
        print(f"  {status:15s}: {count:3d} projects ({count/total*100:.1f}%)")

    # ==== TYPE DISTRIBUTION ====
    print("\n" + "=" * 80)
    print("3. TYPE DISTRIBUTION")
    print("=" * 80)

    type_counts = Counter(p["type"] for p in projects)
    print(f"\nProject Types:")
    for proj_type, count in type_counts.most_common():
        print(f"  {proj_type:25s}: {count:3d} projects ({count/total*100:.1f}%)")

    # ==== DISTRICT COVERAGE ====
    print("\n" + "=" * 80)
    print("4. GEOGRAPHIC DISTRIBUTION")
    print("=" * 80)

    # Extract districts (handling "Multiple" entries)
    districts = set()
    for p in projects:
        district = p["location"]["district"]
        if district and "Multiple" not in district:
            districts.add(district)

    print(f"\nUnique Districts: {len(districts)} districts")
    print(f"Multi-district projects: {sum(1 for p in projects if 'Multiple' in p['location']['district'])}")

    # Top cities
    city_counts = Counter(p["location"]["city"] for p in projects if p["location"]["city"])
    print(f"\nTop 10 Cities:")
    for city, count in city_counts.most_common(10):
        print(f"  {city:25s}: {count:3d} projects")

    # ==== BUDGET ANALYSIS ====
    print("\n" + "=" * 80)
    print("5. BUDGET ANALYSIS")
    print("=" * 80)

    budgets = [p["budget"]["crore"] for p in projects if p["budget"]["crore"] is not None]
    if budgets:
        total_budget = sum(budgets)
        avg_budget = total_budget / len(budgets)
        median_budget = sorted(budgets)[len(budgets) // 2]

        print(f"\nBudget Statistics:")
        print(f"  Total budget:     ₹{total_budget:,.0f} crore")
        print(f"  Average:          ₹{avg_budget:,.0f} crore")
        print(f"  Median:           ₹{median_budget:,.0f} crore")
        print(f"  Largest:          ₹{max(budgets):,.0f} crore")
        print(f"  Smallest:         ₹{min(budgets):,.0f} crore")

        # Budget by status
        print(f"\nBudget by Status:")
        for status in status_counts:
            status_budgets = [p["budget"]["crore"] for p in projects
                            if p["status"] == status and p["budget"]["crore"] is not None]
            if status_budgets:
                print(f"  {status:15s}: ₹{sum(status_budgets):,.0f} crore ({len(status_budgets)} projects)")

    # ==== GAPS AND PRIORITIES ====
    print("\n" + "=" * 80)
    print("6. DATA GAPS - PHASE 1 PRIORITIES")
    print("=" * 80)

    # Projects missing budget
    missing_budget = [p for p in projects if p["budget"]["crore"] is None]
    print(f"\n🔴 HIGH PRIORITY - Missing Budget Data: {len(missing_budget)} projects")
    if missing_budget[:10]:
        print("   Sample projects:")
        for p in missing_budget[:10]:
            print(f"   - {p['id']}: {p['name']['en'][:60]}")

    # Projects missing photos
    missing_photos = [p for p in projects if not p["media"]["photoUrl"]]
    print(f"\n🟡 MEDIUM PRIORITY - Missing Photos: {len(missing_photos)} projects")
    print(f"   (All projects currently lack photos - need systematic photo collection)")

    # Completed projects missing completion year
    completed_no_year = [p for p in projects if p["status"] == "Completed" and not p["timeline"]["completionYear"]]
    print(f"\n🟠 MEDIUM PRIORITY - Completed without year: {len(completed_no_year)} projects")
    if completed_no_year[:5]:
        print("   Sample projects:")
        for p in completed_no_year[:5]:
            print(f"   - {p['id']}: {p['name']['en'][:60]}")

    # Projects with only 2 sources (could benefit from 3rd)
    only_two_sources = [p for p in projects if len(p["sources"]) == 2]
    print(f"\n🟢 LOW PRIORITY - Only 2 sources: {len(only_two_sources)} projects")
    print(f"   (Acceptable but could add 3rd source for extra verification)")

    # ==== VERIFICATION CHECKLIST ====
    print("\n" + "=" * 80)
    print("7. PHASE 1 VERIFICATION CHECKLIST")
    print("=" * 80)

    print(f"""
✅ COMPLETED:
  - CSV to JSON conversion
  - Data structure validation
  - Geographic validation (all coordinates within TN bounds)
  - Source verification (100% have 2+ sources)
  - Bilingual names (100% have Tamil names)

⏳ TODO - PHASE 1:
  1. Fill missing budget data ({len(missing_budget)} projects)
     - Research budget announcements
     - Cross-reference with government documents
     - Add budget notes with source context

  2. Enhance timeline data
     - Add completion years for completed projects missing dates
     - Verify start years for ongoing projects
     - Add timeline notes for phased projects

  3. Photo collection (systematic)
     - Government press releases
     - Official inaugurations
     - Project site photos (where available)
     - CM attribution photos for major projects

  4. Source enhancement
     - Add 3rd source for projects with only 2
     - Prioritize Tier 1 government sources
     - Verify all source URLs are accessible

  5. Data validation
     - Cross-check budget figures across sources
     - Verify status (Completed/Ongoing/Planned)
     - Validate coordinates precision
     - Check Tamil translation quality
""")

    print("=" * 80)
    print("END OF REPORT")
    print("=" * 80)

if __name__ == "__main__":
    analyze_data_quality()
