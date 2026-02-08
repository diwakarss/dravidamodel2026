#!/usr/bin/env python3
"""
Update CSV with newly researched budget data.
"""

import csv
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
CSV_PATH = PROJECT_ROOT / "data-collection" / "projects-150-final.csv"

# Budget updates from research (Sessions 1-3)
BUDGET_UPDATES = {
    # Session 1
    "ELECTRIC-BUSES-TNSTC": {
        "budget_crore": "560",
        "budget_notes": "500 buses: 320 AC (MTC), 100 non-AC (Madurai), 80 (Coimbatore incl 20 AC). Estimated proportional to MTC's ₹697cr for 625 buses"
    },
    # Session 2 - Smart Cities (9 cities × ₹1,000cr each)
    "SMART-COIMBATORE": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-MADURAI": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-THANJAVUR": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-VELLORE": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-TIRUPPUR": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-THOOTHUKUDI": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-TIRUNELVELI": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "SMART-ERODE": {
        "budget_crore": "1000",
        "budget_notes": "Smart Cities Mission allocation: ₹490cr central + ₹500cr state/ULB (50-50 split)"
    },
    "MADURAI-METRO-DPR": {
        "budget_crore": "11368",
        "budget_notes": "DPR estimated cost for 31 km with 27 stations (26 km elevated, 5 km underground). Project submitted Dec 2024, rejected Nov 2025 - doesn't meet population criteria"
    },
    "TIDEL-NEO-TIRUVANNAMALAI": {
        "budget_crore": "37",
        "budget_notes": "Mini TIDEL Park, foundation laid by CM"
    },
    # Session 3 - Chennai Flyovers & Social Programs
    "MEDAVAKKAM-FLYOVERS": {
        "budget_crore": "146.41",
        "budget_notes": "Chennai's longest unidirectional flyover, 2.03 km connecting Tambaram and Velachery. Inaugurated May 13, 2022 by CM Stalin"
    },
    "VANDALUR-FLYOVER": {
        "budget_crore": "55",
        "budget_notes": "Three-way paths on either side. Completed Sept 2020"
    },
    "PALLAVARAM-FLYOVER": {
        "budget_crore": "80.74",
        "budget_notes": "Completed Sept 2020"
    },
    "MUDHALVAR-MARUNDHAGAM": {
        "budget_crore": "300",
        "budget_notes": "1,000 pharmacies: ₹3L per SHG unit. 75% discount on medicines. Inaugurated Feb 24, 2025 by CM Stalin"
    },
    "NEMMELI-DESAL-P2": {
        "budget_crore": "1516.82",
        "budget_notes": "150 MLD capacity desalination plant Phase 2. RO process with DAF and UF pre-treatment. Commissioned Feb 2024"
    }
}

def update_csv_budgets():
    """Update CSV with budget research findings."""

    print("Updating CSV with budget data...")
    print(f"Input: {CSV_PATH}")

    # Read all rows
    rows = []
    updated_count = 0

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        # Filter out None keys from fieldnames (trailing commas)
        fieldnames = [f for f in reader.fieldnames if f is not None]

        for row in reader:
            # Remove None keys from row dict
            clean_row = {k: v for k, v in row.items() if k is not None}
            project_id = clean_row['id']

            if project_id in BUDGET_UPDATES:
                update = BUDGET_UPDATES[project_id]
                clean_row['budget_crore'] = update['budget_crore']
                clean_row['budget_notes'] = update['budget_notes']
                updated_count += 1
                print(f"✓ Updated: {project_id} - ₹{update['budget_crore']} crore")

            rows.append(clean_row)

    # Write back
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Update complete!")
    print(f"   Projects updated: {updated_count}/{len(BUDGET_UPDATES)}")
    print(f"   Output: {CSV_PATH}")

if __name__ == "__main__":
    update_csv_budgets()
