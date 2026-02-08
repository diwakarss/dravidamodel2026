#!/usr/bin/env python3
"""
Convert projects CSV to JSON format with validation.
Generates individual project JSON files and a master projects.json.
"""

import csv
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import hashlib

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
PROJECTS_DIR = DATA_DIR / "projects"
CSV_PATH = PROJECT_ROOT / "data-collection" / "projects-150-final.csv"

def clean_value(value: str) -> Optional[str]:
    """Clean CSV value - return None for empty strings."""
    return value.strip() if value and value.strip() else None

def parse_budget(budget_str: Optional[str]) -> Optional[float]:
    """Parse budget string to float, handling various formats."""
    if not budget_str:
        return None

    # Clean the string
    budget_str = budget_str.strip().replace(",", "")

    # Handle "Part of X" format
    if budget_str.startswith("Part of"):
        try:
            return float(budget_str.split()[-1])
        except (ValueError, IndexError):
            return None

    try:
        return float(budget_str)
    except ValueError:
        return None

def parse_year(year_str: Optional[str]) -> Optional[int]:
    """Parse year string to int."""
    if not year_str:
        return None
    try:
        return int(year_str.strip())
    except ValueError:
        return None

def parse_coordinates(lat_str: Optional[str], lon_str: Optional[str]) -> Optional[Dict[str, float]]:
    """Parse latitude and longitude strings."""
    if not lat_str or not lon_str:
        return None

    try:
        lat = float(lat_str.strip())
        lon = float(lon_str.strip())

        # Validate Tamil Nadu bounds
        if not (8.0 <= lat <= 13.5 and 76.0 <= lon <= 80.5):
            print(f"Warning: Coordinates ({lat}, {lon}) outside Tamil Nadu bounds", file=sys.stderr)

        return {"latitude": lat, "longitude": lon}
    except ValueError:
        return None

def convert_row_to_project(row: Dict[str, str]) -> Dict[str, Any]:
    """Convert CSV row to project dictionary."""

    # Build sources array
    sources = []
    for i in range(1, 4):
        title_key = f"source_{i}_title"
        url_key = f"source_{i}_url"
        title = clean_value(row.get(title_key))
        url = clean_value(row.get(url_key))

        if title and url:
            sources.append({
                "title": title,
                "url": url
            })

    # Build project object
    project = {
        "id": clean_value(row["id"]) or "",
        "name": {
            "en": clean_value(row["name_en"]) or "",
            "ta": clean_value(row["name_ta"]) or ""
        },
        "location": {
            "district": clean_value(row["district"]) or "",
            "city": clean_value(row["city"]) or "",
            "coordinates": parse_coordinates(
                clean_value(row["latitude"]),
                clean_value(row["longitude"])
            )
        },
        "type": clean_value(row["type"]) or "",
        "status": clean_value(row["status"]) or "",
        "budget": {
            "crore": parse_budget(clean_value(row["budget_crore"])),
            "notes": clean_value(row["budget_notes"])
        },
        "timeline": {
            "startYear": parse_year(clean_value(row["start_year"])),
            "completionYear": parse_year(clean_value(row["completion_year"])),
            "completionNotes": clean_value(row["completion_notes"])
        },
        "media": {
            "photoUrl": clean_value(row["photo_url"]),
            "photoCaption": clean_value(row["photo_caption"]),
            "cmPhotoInitiation": clean_value(row["cm_photo_initiation"]),
            "cmPhotoCompletion": clean_value(row["cm_photo_completion"])
        },
        "sources": sources,
        "notes": clean_value(row["notes"])
    }

    return project

def generate_checksum(data: Any) -> str:
    """Generate SHA-256 checksum for data."""
    json_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(json_str.encode('utf-8')).hexdigest()

def main():
    """Main conversion function."""
    print(f"Converting CSV to JSON...")
    print(f"Input: {CSV_PATH}")
    print(f"Output directory: {PROJECTS_DIR}")

    # Create output directories
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

    # Read CSV and convert
    projects = []
    errors = []

    with open(CSV_PATH, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row_num, row in enumerate(reader, start=2):  # Start at 2 (1 is header)
            try:
                project = convert_row_to_project(row)
                projects.append(project)

                # Write individual project file
                project_id = project["id"]
                project_file = PROJECTS_DIR / f"{project_id}.json"
                with open(project_file, 'w', encoding='utf-8') as f:
                    json.dump(project, f, ensure_ascii=False, indent=2)

            except Exception as e:
                error_msg = f"Row {row_num} (ID: {row.get('id', 'UNKNOWN')}): {str(e)}"
                errors.append(error_msg)
                print(f"ERROR: {error_msg}", file=sys.stderr)

    # Generate master projects.json
    master_data = {
        "version": "1.0.0",
        "generated": "2026-02-08",
        "totalProjects": len(projects),
        "checksum": generate_checksum(projects),
        "projects": projects
    }

    master_file = DATA_DIR / "projects.json"
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, ensure_ascii=False, indent=2)

    # Generate checksums file
    checksums = {
        "projects.json": generate_checksum(master_data),
        "individual": {
            project["id"]: generate_checksum(project)
            for project in projects
        }
    }

    checksums_file = DATA_DIR / "checksums.json"
    with open(checksums_file, 'w', encoding='utf-8') as f:
        json.dump(checksums, f, ensure_ascii=False, indent=2)

    # Print summary
    print(f"\n✅ Conversion complete!")
    print(f"   Projects converted: {len(projects)}")
    print(f"   Individual files: {len(list(PROJECTS_DIR.glob('*.json')))}")
    print(f"   Master file: {master_file}")
    print(f"   Checksums file: {checksums_file}")

    if errors:
        print(f"\n⚠️  Errors encountered: {len(errors)}")
        for error in errors[:10]:  # Show first 10 errors
            print(f"   - {error}")
        if len(errors) > 10:
            print(f"   ... and {len(errors) - 10} more errors")
        sys.exit(1)

    print(f"\n📊 Data Quality Summary:")
    # Calculate statistics
    total = len(projects)
    with_budget = sum(1 for p in projects if p["budget"]["crore"] is not None)
    with_coords = sum(1 for p in projects if p["location"]["coordinates"] is not None)
    with_timeline = sum(1 for p in projects if p["timeline"]["startYear"] is not None)
    completed = sum(1 for p in projects if p["status"] == "Completed")

    print(f"   Budget data: {with_budget}/{total} ({with_budget/total*100:.1f}%)")
    print(f"   Coordinates: {with_coords}/{total} ({with_coords/total*100:.1f}%)")
    print(f"   Timeline data: {with_timeline}/{total} ({with_timeline/total*100:.1f}%)")
    print(f"   Completed: {completed}/{total} ({completed/total*100:.1f}%)")

if __name__ == "__main__":
    main()
