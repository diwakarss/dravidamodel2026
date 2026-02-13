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
    },
    # Session 4 - TIDEL Parks, Power Projects, Sports
    "TIDEL-NEO-KARAIKUDI": {
        "budget_crore": "28",
        "budget_notes": "G+2 Mini IT Park, 50,000 sq.ft., 5 acres. Inaugurated Jan 31, 2026 by CM Stalin. Creates 600+ jobs"
    },
    "TIDEL-PATTABIRAM": {
        "budget_crore": "330",
        "budget_notes": "21-storey TIDEL Park, 5.57 lakh sq.ft. Inaugurated Nov 22, 2024. Third largest in state, creates 6,000 jobs"
    },
    "PUMPED-STORAGE-KUNDAH": {
        "budget_crore": "1850",
        "budget_notes": "500 MW pumped storage project with four 125 MW units. TANGEDCO project. Commissioning by 2026-27"
    },
    "HOCKEY-STADIUM-COIMBATORE": {
        "budget_crore": "9.67",
        "budget_notes": "6,500 sq.m artificial turf, international standards. Inaugurated Dec 30, 2025 by Deputy CM Udhayanidhi Stalin"
    },
    # Session 5 - Sports Infrastructure, Expressways, Airports
    "COIMBATORE-CRICKET-STADIUM": {
        "budget_crore": "500",
        "budget_notes": "30 acres, 30,000 capacity, inspired by Optus Stadium Perth. Blueprint being prepared for CM approval. Expected completion 2027"
    },
    "GLOBAL-SPORTS-CITY-OMR": {
        "budget_crore": "301",
        "budget_notes": "Phase 1: 76.44 acres of 127.44 total. Multiple sports facilities including aquatics, rowing, shooting. Construction to begin within 3 months"
    },
    "CHENNAI-PORT-MADURAVOYAL-P2": {
        "budget_crore": "1616.97",
        "budget_notes": "Phase 2 of 4-phase 19 km elevated corridor (5.10 km). Total project ₹5,570cr. NHAI project, completion target 2027"
    },
    "CHENNAI-SALEM-8L-EXPRESSWAY": {
        "budget_crore": "9681",
        "budget_notes": "277.3 km, 6-lane (revised from 8-lane). NHAI Bharatmala project. Facing delays due to litigation and land acquisition"
    },
    "TRICHY-AIRPORT-TERMINAL": {
        "budget_crore": "951",
        "budget_notes": "75,000 sq.m integrated terminal, 3.52M passengers capacity by 2025-26. Inaugurated January 2024 by AAI"
    },
    "CM-MINI-STADIUMS-234": {
        "budget_crore": "702",
        "budget_notes": "₹3cr × 234 constituencies. Athletics, football, basketball, volleyball, kabaddi. 4 completed March 2025, 19 in progress"
    },
    # Session 6 - Chennai Flyovers, Coworking Spaces
    "VELACHERY-FLYOVER": {
        "budget_crore": "108",
        "budget_notes": "Double-decker flyover at Vijayanagar Junction. Taramani-Velachery bypass connection. Completed by PWD"
    },
    "KOYAMBEDU-FLYOVER": {
        "budget_crore": "93.50",
        "budget_notes": "1.15 km four-lane flyover near CMBT and Koyambedu markets. Inaugurated November 2021"
    },
    "PERUNGALATHUR-FLYOVER": {
        "budget_crore": "206",
        "budget_notes": "Railway overbridge connecting Tambaram eastern bypass. Cost escalated from ₹86cr due to 20-year delay. Opened after 23-year delay"
    },
    "MUDHALVAR-PADAIPPAGAM": {
        "budget_crore": "2.85",
        "budget_notes": "GCC + CMDA coworking space in Kolathur. 40 coworking + 50 learning seats. ₹50/day. Inaugurated Nov 4, 2024 by CM Stalin"
    },
    # Session 7 - Sponge Parks, Railway Overbridges, Skill Centers
    "PORUR-WETLAND-SPONGE-PARK": {
        "budget_crore": "12.6",
        "budget_notes": "Dr. M.S. Swaminathan Wetland Eco Park. 16 acres. Part of ₹88cr for 7 sponge parks. Inaugurated March 2025 by CM Stalin. 85+ native species"
    },
    "SATCHIYAPURAM-ROB": {
        "budget_crore": "62",
        "budget_notes": "Railway overbridge Sivakasi. Southern Railway. Eases traffic bottlenecks. Inaugurated Nov 2025 by CM Stalin"
    },
    "ITI-AMBATTUR-UPGRADE": {
        "budget_crore": "120",
        "budget_notes": "Tamil Nadu World Innovation and Skill Training Hub (TN-WISH). Skill training for ITI/polytechnic trainers. Part of 71 ITI upgrade with Tata Tech"
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
