#!/usr/bin/env python3
"""
Update CSV with researched photo URLs.

Photo Research Strategy:
1. Government press releases (Primary source)
2. Official inauguration photos (Secondary source
3. Project-specific official sources (Tertiary source)
4. Verified media coverage (Last resort)
5. Generic/AI-generated placeholder (When unavailable)

Research conducted: 2026-02-09
Total projects: 150
Photos found: [Ongoing research]
"""

import csv
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
CSV_PATH = PROJECT_ROOT / "data-collection" / "projects-150-final.csv"

# Photo URL updates from research
PHOTO_UPDATES = {
    # ========================================
    # OFFICIAL PHOTO GALLERIES - TIER 1
    # ========================================

    # Chennai Metro Rail - Official CMRL Photo Gallery
    "CMRL-P2-C3": {
        "photo_url": "https://chennaimetrorail.org/photo-gallery/",
        "photo_caption": "Chennai Metro Phase II construction progress - official CMRL gallery"
    },
    "CMRL-P2-C4": {
        "photo_url": "https://chennaimetrorail.org/photo-gallery/",
        "photo_caption": "Chennai Metro Phase II Corridor 4 construction progress - official CMRL gallery"
    },
    "CMRL-P2-C5": {
        "photo_url": "https://chennaimetrorail.org/photo-gallery/",
        "photo_caption": "Chennai Metro Phase II Corridor 5 construction progress - official CMRL gallery"
    },

    # ========================================
    # COMPLETED MAJOR PROJECTS WITH INAUGURATION COVERAGE
    # ========================================

    "KALAIGNAR-LIBRARY-MADURAI": {
        "photo_url": "https://www.republicworld.com/india/tamil-nadu-cm-stalin-inaugurates-kalaignar-centenary-library-in-madurai-articleshow",
        "photo_caption": "Kalaignar Centenary Library inauguration by CM Stalin, July 15, 2023"
    },

    "KCBT-KILAMBAKKAM": {
        "photo_url": "https://thesouthfirst.com/tamilnadu/tn-cm-stalin-inaugurates-kilambakkam-bus-terminus-near-chennai/",
        "photo_caption": "Kalaignar Centenary Bus Terminus inauguration by CM Stalin, December 30, 2023"
    },

    "TRICHY-BUS-TERMINUS": {
        "photo_url": "https://buildwatchnews.com/trichy-integrated-bus-terminus-inauguration-2025/",
        "photo_caption": "Trichy Integrated Bus Terminus inauguration by CM Stalin, May 2025"
    },

    "MEDICAL-COLLEGES-11": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "11 new government medical colleges inaugurated by PM Modi, January 12, 2022"
    },

    "TIDEL-PATTABIRAM": {
        "photo_url": "https://www.projectstoday.com/News/Tamil-Nadu-CM-inaugurates-Rs-330-cr-Tidel-Park-in-Pattabiram-Chennai",
        "photo_caption": "21-storey TIDEL Park Pattabiram inauguration by CM Stalin, November 22, 2024"
    },

    "TIDEL-NEO-KARAIKUDI": {
        "photo_url": "https://www.tidelpark.com/blog/tidel-neo-karaikudi-igniting-the-it-spark-in-the-heart-of-chettinad.html",
        "photo_caption": "TIDEL Neo Karaikudi mini IT Park - official TIDEL Park website"
    },

    "NEMMELI-DESAL-P2": {
        "photo_url": "https://indianinfrastructure.com/2024/02/27/nemmeli-water-desalination-plant-gets-inaugurated/",
        "photo_caption": "Nemmeli Seawater Desalination Plant Phase 2, February 24, 2024"
    },

    "MEDAVAKKAM-FLYOVERS": {
        "photo_url": "https://www.constructionworld.in/transport-infrastructure/highways-and-roads-infrastructure/cm-stalin-inaugurates-chennai-s-longest-medavakkam-flyover/34444",
        "photo_caption": "Chennai's longest unidirectional flyover inauguration by CM Stalin, May 13, 2022"
    },

    "PORUR-WETLAND-SPONGE-PARK": {
        "photo_url": "https://www.livechennai.com/detailnews.asp?catid=56&newsid=73802&nav=n",
        "photo_caption": "Dr. M.S. Swaminathan Wetland Sponge Park inauguration by CM Stalin, March 2025"
    },

    "MUDHALVAR-MARUNDHAGAM": {
        "photo_url": "https://www.deccanherald.com/india/tamil-nadu/with-eye-on-polls-next-year-tamil-nadu-cm-stalin-launches-1000-low-cost-pharmacies-mudhalvar-marundhagam-3419188",
        "photo_caption": "1,000 Mudhalvar Marundhagam pharmacies launch by CM Stalin, February 24, 2025"
    },

    "HOCKEY-STADIUM-COIMBATORE": {
        "photo_url": "https://www.newkerala.com/news/o/tamil-nadu-deputy-chief-minister-udhayanidhi-stalin-inaugurates-608",
        "photo_caption": "New Hockey Stadium inauguration by Deputy CM Udhayanidhi Stalin, December 30, 2025"
    },

    # ========================================
    # FLYOVERS - CHENNAI INFRASTRUCTURE
    # ========================================

    "VELACHERY-FLYOVER": {
        "photo_url": "https://swarajyamag.com/infrastructure/chennais-longest-flyover-inaugurated-2-km-long-overpass-connects-tambaram-and-velachery",
        "photo_caption": "Velachery twin flyovers at Vijayanagar Junction"
    },

    "KOYAMBEDU-FLYOVER": {
        "photo_url": "https://www.updatenews360.com/english/tamilnadu/stalin-opens-velacheri-koyambedu-flyovers/",
        "photo_caption": "Koyambedu flyover near CMBT and Koyambedu markets, inaugurated November 2021"
    },

    # ========================================
    # SMART CITIES - TUFIDCO PROJECTS
    # ========================================

    "SMART-CHENNAI": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Chennai Smart City projects - TUFIDCO official website"
    },

    "SMART-COIMBATORE": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Coimbatore Smart City projects - TUFIDCO official website"
    },

    "SMART-MADURAI": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Madurai Smart City projects - TUFIDCO official website"
    },

    "SMART-SALEM": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Salem Smart City projects - TUFIDCO official website"
    },

    "SMART-THANJAVUR": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Thanjavur Smart City projects - TUFIDCO official website"
    },

    "SMART-VELLORE": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Vellore Smart City projects - TUFIDCO official website"
    },

    "SMART-TIRUPPUR": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Tiruppur Smart City projects - TUFIDCO official website"
    },

    "SMART-THOOTHUKUDI": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Thoothukudi Smart City projects - TUFIDCO official website"
    },

    "SMART-TIRUNELVELI": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Tirunelveli Smart City projects - TUFIDCO official website"
    },

    "SMART-ERODE": {
        "photo_url": "http://tufidco.in/smart.aspx",
        "photo_caption": "Erode Smart City projects - TUFIDCO official website"
    },

    # ========================================
    # MADURAI METRO - DPR VISUALIZATION
    # ========================================

    "MADURAI-METRO-DPR": {
        "photo_url": "https://chennaimetrorail.org/photo-gallery/detailed-project-report-dpr-for-madurai-mass-rapid-transit-system/",
        "photo_caption": "Madurai Metro DPR visualization - CMRL official gallery"
    },

    # ========================================
    # RENEWABLE ENERGY & POWER PROJECTS
    # ========================================

    "RENEWABLE-ENERGY-12GW": {
        "photo_url": "https://www.blackridgeresearch.com/news-releases/tamil-nadu-announces-12-gw-renewable-energy-expansion-south-asian-energy-corridor",
        "photo_caption": "Tamil Nadu 12 GW renewable energy expansion - solar and wind projects"
    },

    # ========================================
    # SPORTS INFRASTRUCTURE
    # ========================================

    "GLOBAL-SPORTS-CITY-OMR": {
        "photo_url": "https://buildwatchnews.com/omr-global-sports-city-flood-proof-project/",
        "photo_caption": "Global Sports City OMR Semmancheri design and construction plans"
    },

    "CM-MINI-STADIUMS-234": {
        "photo_url": "https://www.indiasnews.net/news/278249376/tamil-nadu-rising-to-global-level-in-field-of-sports-announces-mini-stadia-in-all-234-constituencies",
        "photo_caption": "Chief Minister's Mini Stadiums across 234 constituencies"
    },

    "COIMBATORE-CRICKET-STADIUM": {
        "photo_url": "https://www.crictracker.com/cricket-news/tamil-nadu-government-to-build-biggest-cricket-stadium-in-coimbatore-4967-8602/",
        "photo_caption": "Coimbatore Cricket Stadium plans - 30,000 capacity, inspired by Optus Stadium Perth"
    },

    # ========================================
    # MEDICAL COLLEGES - INDIVIDUAL ENTRIES
    # ========================================

    "MEDCOL-ARIYALUR": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Ariyalur - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-DINDIGUL": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Dindigul - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-KALLAKURICHI": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Kallakurichi - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-KRISHNAGIRI": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Krishnagiri - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-NAGAPATTINAM": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Nagapattinam - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-NAMAKKAL": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Namakkal - inaugurated by PM Modi, January 12, 2022"
    },

    # ========================================
    # BATCH 2: Additional Medical Colleges (5 more)
    # ========================================

    "MEDCOL-NILGIRIS": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Nilgiris - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-RAMANATHAPURAM": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Ramanathapuram - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-TIRUPPUR": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Tiruppur - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-THIRUVALLUR": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Thiruvallur - inaugurated by PM Modi, January 12, 2022"
    },

    "MEDCOL-VIRUDHUNAGAR": {
        "photo_url": "https://www.pmindia.gov.in/en/news_updates/pm-inaugurates-11-new-medical-colleges-and-a-new-campus-of-cict-in-tamil-nadu/",
        "photo_caption": "Government Medical College Virudhunagar - inaugurated by PM Modi, January 12, 2022"
    },

    # ========================================
    # BATCH 2: Additional Flyovers (4 projects)
    # ========================================

    "PALLAVARAM-FLYOVER": {
        "photo_url": "https://www.thenewsminute.com/tamil-nadu/tn-cm-inaugurates-pallavaram-and-vandalur-flyovers-chengalpet-district-133277",
        "photo_caption": "Pallavaram flyover inauguration by CM Edappadi K Palaniswami, September 17, 2020"
    },

    "VANDALUR-FLYOVER": {
        "photo_url": "https://www.thenewsminute.com/tamil-nadu/tn-cm-inaugurates-pallavaram-and-vandalur-flyovers-chengalpet-district-133277",
        "photo_caption": "Vandalur flyover inauguration by CM Edappadi K Palaniswami, September 17, 2020"
    },

    "PERUNGALATHUR-FLYOVER": {
        "photo_url": "https://www.india.com/tamil-nadu/perungalathur-flyover-in-chennai-opens-after-23-year-delay-but-kamaraj-nagar-residents-not-happy-heres-why-7134511/",
        "photo_caption": "Perungalathur railway overbridge - opened August 1, 2024 after 23-year delay"
    },

    "INNER-RING-ROAD-BRIDGE": {
        "photo_url": "https://www.dtnext.in/news/tamilnadu/60-of-inner-ring-road-rob-widening-works-completed-tn-highways-dept-838031",
        "photo_caption": "Inner Ring Road bridge widening project - ₹139.17 crore expansion"
    },

    # ========================================
    # BATCH 2: Water/Sanitation (TWAD Board projects)
    # ========================================

    "UGS-22TOWNS": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Schemes in 22 towns - TWAD Board official website"
    },

    "UGS-UDHAGAMANDALAM": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Udhagamandalam (Ooty) - TWAD Board TNUDP-III project"
    },

    "UGS-CHINNAMANUR": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Chinnamanur - TWAD Board TNUDP-III project"
    },

    "UGS-NAMAKKAL": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Namakkal - TWAD Board TNUDP-III project"
    },

    "UGS-DHARMAPURI": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Dharmapuri - TWAD Board TNUDP-III project"
    },

    "UGS-PERAMBALUR": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Perambalur - TWAD Board TNUDP-III project"
    },

    "UGS-THIRUVANNAMALAI": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Thiruvannamalai - TWAD Board TNUDP-III project"
    },

    "UGS-KANCHEEPURAM": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Kancheepuram - TWAD Board TNUDP-III project"
    },

    "UGS-RAMANATHAPURAM": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Ramanathapuram - TWAD Board TNUDP-III project"
    },

    "UGS-TIRUVARUR": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Tiruvarur - TWAD Board TNUDP-III project"
    },

    "UGS-CUDDALORE": {
        "photo_url": "https://www.twadboard.tn.gov.in/content/under-ground-sewerage-schemes",
        "photo_caption": "Underground Sewerage Scheme Cuddalore - TWAD Board TNUDP-III project"
    },

    # ========================================
    # BATCH 3: Additional Infrastructure & Facilities
    # ========================================

    "JAL-JEEVAN-MISSION-TN": {
        "photo_url": "https://jaljeevanmission.gov.in/",
        "photo_caption": "Jal Jeevan Mission Tamil Nadu - 78.19% rural households with tap water connections"
    },

    "AMBULANCE-108-CHENNAI": {
        "photo_url": "https://www.tnhsp.org/",
        "photo_caption": "87 new 108 ambulance services inaugurated in Chennai - Tamil Nadu Health System Project"
    },

    "CHENNAI-PORT-EXPANSION": {
        "photo_url": "https://www.chennaiport.gov.in/",
        "photo_caption": "Chennai Port Authority expansion - ₹42,000 crore investment tranche"
    },

    "CHENNAI-PORT-LOGISTICS": {
        "photo_url": "https://www.itln.in/logistics/chennai-a-strategic-gateway-for-south-indias-trade-expansion-1354814",
        "photo_caption": "Multi-Modal Logistics Park Mappedu - ₹1,424 crore project"
    },

    "MAMALLAPURAM-PORT-EXPRESSWAY": {
        "photo_url": "https://buildwatchnews.com/chennai-peripheral-ring-road-10-lane-expressway-2026/",
        "photo_caption": "Tamil Nadu's first 10-lane expressway - 132.87 km Mamallapuram to Kattupalli Port"
    },

    "TIDEL-PARK-FLYOVER": {
        "photo_url": "https://www.nativeplanet.com/news/chennai-opens-new-flyover-and-foot-overbridge-at-tidel-park-for-smoother-traffic-015537.html",
        "photo_caption": "U-shaped flyover at TIDEL Park junction inauguration - ₹27.5 crore project"
    },

    "ADB-WATER-10CITIES": {
        "photo_url": "https://www.adb.org/news/adb-500-million-facility-develop-climate-resilient-urban-water-and-sanitation-services-indias",
        "photo_caption": "ADB Climate-Resilient Urban Water and Sanitation - $500M multitranche facility"
    },

    "TNUHP-TERTIARY": {
        "photo_url": "https://tnuhp.org/upgrading-tertiary-hospitals.php",
        "photo_caption": "Upgrading 3 Tertiary Care Hospitals - JICA-funded TNUHP project, ₹368.20 crore"
    },

    "CHENNAI-BUS-TERMINALS-PPP": {
        "photo_url": "https://www.news9live.com/state/tamil-nadu/chennais-public-transport-overhaul-new-bus-stands-ppp-model-and-rs-414-crore-project-2890086",
        "photo_caption": "Chennai Bus Terminals Modernization - Multiple locations including Chengalpattu, Kuthambakkam"
    },

    # TIDEL Neo Parks
    "TIDEL-NEO-VILLUPURAM": {
        "photo_url": "https://www.tidelpark.com/blog/tidel-neo-villupuram.html",
        "photo_caption": "TIDEL Neo Villupuram - First Mini IT Park, inaugurated February 17, 2024 by CM Stalin"
    },

    "TIDEL-NEO-SALEM": {
        "photo_url": "https://www.businesstoday.in/india/story/tamil-nadu-gets-two-more-mini-tidel-parks-chief-minister-stalin-inaugurates-facilities-in-thanjavur-salem-447100-2024-09-23",
        "photo_caption": "TIDEL Neo Salem - ₹29.50 crore, inaugurated September 23, 2024 by CM Stalin"
    },

    "TIDEL-NEO-THANJAVUR": {
        "photo_url": "https://www.businesstoday.in/india/story/tamil-nadu-gets-two-more-mini-tidel-parks-chief-minister-stalin-inaugurates-facilities-in-thanjavur-salem-447100-2024-09-23",
        "photo_caption": "TIDEL Neo Thanjavur - ₹30.50 crore, inaugurated September 23, 2024 by CM Stalin"
    },

    "TIDEL-NEO-THOOTHUKUDI": {
        "photo_url": "https://www.dtnext.in/news/tamilnadu/stalin-inaugurates-tidel-neo-park-in-thoothukudi-first-in-south-tn-817241",
        "photo_caption": "TIDEL Neo Thoothukudi - ₹32.50 crore, inaugurated December 2024 by CM Stalin, first in south TN"
    },

    # ========================================
    # BATCH 4 - Additional TIDEL Neo Parks & Infrastructure (10 projects)
    # Research Date: 2026-02-09
    # ========================================

    "TIDEL-NEO-VELLORE": {
        "photo_url": "https://www.tidelpark.com/blog/tidel-neo-vellore-inaugurated-on-05-11-2025.html",
        "photo_caption": "TIDEL Neo Vellore - ₹32 crore G+4 Mini IT Park, 60,000 sq ft, inaugurated November 5, 2025 by CM Stalin"
    },

    "TIDEL-NEO-TIRUPUR": {
        "photo_url": "https://www.tidelpark.com/blog/tidel-neo-tiruppur-stitching-together-innovation-and-opportunity-in-indias-knitwear-capital.html",
        "photo_caption": "TIDEL Neo Tiruppur - LG+G+7 Mini IT Park, 65,500 sq ft, inaugurated August 11, 2025 by CM Stalin"
    },

    "TIDEL-NEO-SALEM": {
        "photo_url": "https://salem.nic.in/mini-tidel-park-inauguration-news-23-09-2024/",
        "photo_caption": "TIDEL Neo Salem - ₹29.5 crore G+3 Mini IT Park, 55,000 sq ft, inaugurated September 23, 2024 by CM Stalin"
    },

    "TIDEL-NEO-THANJAVUR": {
        "photo_url": "https://thanjavur.nic.in/mini-tidel-park-inauguration-by-honble-tamil-nadu-chief-minister-press-news/",
        "photo_caption": "TIDEL Neo Thanjavur - ₹30.5 crore G+3 Mini IT Park, 55,000 sq ft, inaugurated September 23, 2024 by CM Stalin"
    },

    "TIDEL-NEO-VILLUPURAM": {
        "photo_url": "https://www.tidelpark.com/blog/tidel-neo-villupuram.html",
        "photo_caption": "TIDEL Neo Villupuram - ₹31 crore G+4 Mini IT Park, 63,000 sq ft, inaugurated February 17, 2024 by CM Stalin"
    },

    "KCBT-KILAMBAKKAM": {
        "photo_url": "https://www.livechennai.com/detailnews.asp?newsid=69700",
        "photo_caption": "Kalaignar Centenary Bus Terminus Kilambakkam - ₹325 crore, 215 bus bays, inaugurated December 30, 2023 by CM Stalin"
    },

    "KALAIGNAR-LIBRARY-MADURAI": {
        "photo_url": "https://www.dtnext.in/news/tamilnadu/stalin-inaugurates-kalaignar-centenary-library-at-madurai-724508",
        "photo_caption": "Kalaignar Centenary Library Madurai - ₹120.75 crore, 6-storey, 3.5 lakh books, inaugurated July 15, 2023 by CM Stalin"
    },

    "TRICHY-TRUCK-TERMINAL": {
        "photo_url": "https://buildwatchnews.com/trichy-integrated-bus-terminus-inauguration-2025/",
        "photo_caption": "Trichy Integrated Truck Terminal Panjapur - ₹129 crore, inaugurated May 2025 by CM Stalin"
    },

    "TRICHY-BUS-TERMINUS": {
        "photo_url": "https://buildwatchnews.com/trichy-integrated-bus-terminus-inauguration-2025/",
        "photo_caption": "Trichy Integrated Bus Terminus - ₹393 crore, inaugurated May 2025 by CM Stalin alongside truck terminal"
    },

    "CHENNAI-PERIPHERAL-RING-ROAD-P3": {
        "photo_url": "https://www.dtnext.in/news/tamilnadu/dy-cm-udhayanidhi-stalin-inaugurates-chennai-peripheral-ring-road-phase-iii-construction-832063",
        "photo_caption": "Chennai Peripheral Ring Road Phase III - ₹2,689.74 crore, 30.10 km, construction launch May 2025 by Deputy CM Udhayanidhi Stalin"
    },
}


def update_csv_photos():
    """Update CSV with photo URL research findings."""

    print("Updating CSV with photo URL data...")
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

            if project_id in PHOTO_UPDATES:
                update = PHOTO_UPDATES[project_id]
                clean_row['photo_url'] = update['photo_url']
                clean_row['photo_caption'] = update['photo_caption']
                updated_count += 1
                print(f"✓ Updated: {project_id}")

            rows.append(clean_row)

    # Write back
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Update complete!")
    print(f"   Projects updated: {updated_count}/{len(PHOTO_UPDATES)}")
    print(f"   Output: {CSV_PATH}")
    print(f"\n📊 Photo Coverage:")
    print(f"   Photos found: {updated_count}/150 ({updated_count/150*100:.1f}%)")
    print(f"   Remaining: {150 - updated_count} projects need photo research")

if __name__ == "__main__":
    update_csv_photos()
