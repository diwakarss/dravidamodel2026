#!/usr/bin/env python3
"""
Validate extracted data against JSON schemas and business rules.

Checks:
- Schema compliance for all output files
- Required fields present
- Data type correctness
- Business rule validation (investment ranges, date formats, etc.)

Usage:
    python3 validate-data.py                    # Validate all
    python3 validate-data.py --phase 1          # Validate Phase 1 only
    python3 validate-data.py --file path.json   # Validate specific file
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


# Auto-detect extraction dir relative to script location
SCRIPT_DIR = Path(__file__).parent.resolve()
EXTRACTION_DIR = SCRIPT_DIR.parent
SCHEMAS_DIR = EXTRACTION_DIR / "schemas"


class ValidationError:
    def __init__(self, file: str, path: str, message: str, severity: str = "error"):
        self.file = file
        self.path = path
        self.message = message
        self.severity = severity  # error, warning, info

    def __str__(self):
        return f"[{self.severity.upper()}] {self.file}:{self.path} - {self.message}"


class Validator:
    def __init__(self):
        self.errors: list[ValidationError] = []
        self.warnings: list[ValidationError] = []
        self.stats = {
            "files_checked": 0,
            "files_valid": 0,
            "total_errors": 0,
            "total_warnings": 0
        }

    def add_error(self, file: str, path: str, message: str):
        err = ValidationError(file, path, message, "error")
        self.errors.append(err)
        self.stats["total_errors"] += 1

    def add_warning(self, file: str, path: str, message: str):
        warn = ValidationError(file, path, message, "warning")
        self.warnings.append(warn)
        self.stats["total_warnings"] += 1

    def validate_tweet_id(self, tweet_id: Any, file: str, path: str) -> bool:
        """Validate tweet ID format."""
        if not isinstance(tweet_id, str):
            self.add_error(file, path, f"tweet_id must be string, got {type(tweet_id).__name__}")
            return False
        if not tweet_id.isdigit():
            self.add_error(file, path, f"tweet_id must be numeric, got '{tweet_id}'")
            return False
        if len(tweet_id) < 15 or len(tweet_id) > 20:
            self.add_warning(file, path, f"Unusual tweet_id length: {len(tweet_id)}")
        return True

    def validate_date(self, date_str: Any, file: str, path: str) -> bool:
        """Validate date format (YYYY-MM-DD)."""
        if not isinstance(date_str, str):
            self.add_error(file, path, f"date must be string, got {type(date_str).__name__}")
            return False
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            self.add_error(file, path, f"Invalid date format: '{date_str}' (expected YYYY-MM-DD)")
            return False

    def validate_investment(self, amount: Any, file: str, path: str) -> bool:
        """Validate investment amount."""
        if amount is None:
            return True  # Optional field
        if not isinstance(amount, (int, float)):
            self.add_error(file, path, f"investment must be number, got {type(amount).__name__}")
            return False
        if amount < 0:
            self.add_error(file, path, f"Investment cannot be negative: {amount}")
            return False
        if amount > 100000:  # 1 lakh crore (~$120B) is reasonable max for mega-projects
            self.add_warning(file, path, f"Unusually large investment: {amount} crore")
        return True

    def validate_jobs(self, jobs: Any, file: str, path: str) -> bool:
        """Validate jobs count."""
        if jobs is None:
            return True  # Optional field
        if not isinstance(jobs, int):
            self.add_error(file, path, f"jobs must be integer, got {type(jobs).__name__}")
            return False
        if jobs < 0:
            self.add_error(file, path, f"Jobs cannot be negative: {jobs}")
            return False
        if jobs > 500000:  # 5 lakh jobs is reasonable max for single project
            self.add_warning(file, path, f"Unusually large jobs count: {jobs}")
        return True

    def validate_handle(self, handle: Any, file: str, path: str) -> bool:
        """Validate Twitter handle."""
        if not isinstance(handle, str):
            self.add_error(file, path, f"handle must be string, got {type(handle).__name__}")
            return False
        if handle.startswith("@"):
            self.add_warning(file, path, "Handle should not include @ symbol")
        if not handle.replace("_", "").isalnum():
            self.add_error(file, path, f"Invalid handle format: '{handle}'")
            return False
        return True

    def validate_category(self, category: Any, file: str, path: str) -> bool:
        """Validate category enum."""
        # Load categories from config if available, otherwise use defaults
        valid_categories = self._load_categories()
        if not isinstance(category, str):
            self.add_error(file, path, f"category must be string, got {type(category).__name__}")
            return False
        if category not in valid_categories:
            self.add_warning(file, path, f"Unknown category: '{category}'")
        return True

    def _load_categories(self) -> list[str]:
        """Load valid categories from config.json or use defaults."""
        config_file = EXTRACTION_DIR / "config.json"
        if config_file.exists():
            try:
                with open(config_file) as f:
                    config = json.load(f)
                    return config.get("categories", [])
            except (json.JSONDecodeError, IOError):
                pass
        # Default categories if config not available
        return [
            "infrastructure", "industries", "education", "healthcare",
            "employment", "agriculture", "environment", "social-welfare",
            "sports-culture", "tamil-history", "uncategorized", "general"
        ]

    def validate_raw_tweet(self, tweet: dict, file: str, idx: int) -> bool:
        """Validate a raw tweet object."""
        valid = True
        base_path = f"tweets[{idx}]"

        # Required fields
        if "id" not in tweet and "tweet_id" not in tweet:
            self.add_error(file, base_path, "Missing required field: id or tweet_id")
            valid = False
        else:
            tweet_id = tweet.get("id") or tweet.get("tweet_id")
            valid &= self.validate_tweet_id(tweet_id, file, f"{base_path}.id")

        if "text" not in tweet:
            self.add_error(file, base_path, "Missing required field: text")
            valid = False

        if "date" in tweet:
            valid &= self.validate_date(tweet["date"], file, f"{base_path}.date")

        if "handle" in tweet:
            valid &= self.validate_handle(tweet["handle"], file, f"{base_path}.handle")

        # Optional numeric fields
        if "investment_crore" in tweet:
            valid &= self.validate_investment(tweet["investment_crore"], file, f"{base_path}.investment_crore")

        if "jobs_created" in tweet:
            valid &= self.validate_jobs(tweet["jobs_created"], file, f"{base_path}.jobs_created")

        return valid

    def validate_verified_entry(self, entry: dict, file: str, idx: int) -> bool:
        """Validate a verified entry object."""
        valid = True
        base_path = f"entries[{idx}]"

        # Required fields
        for field in ["entryId", "sourceHandle", "sourceTweetId", "date", "category"]:
            if field not in entry:
                self.add_error(file, base_path, f"Missing required field: {field}")
                valid = False

        if "category" in entry:
            valid &= self.validate_category(entry["category"], file, f"{base_path}.category")

        if "date" in entry:
            valid &= self.validate_date(entry["date"], file, f"{base_path}.date")

        if "extractedNumbers" in entry:
            nums = entry["extractedNumbers"]
            if "investmentCrore" in nums:
                valid &= self.validate_investment(nums["investmentCrore"], file, f"{base_path}.extractedNumbers.investmentCrore")
            if "jobsCreated" in nums:
                valid &= self.validate_jobs(nums["jobsCreated"], file, f"{base_path}.extractedNumbers.jobsCreated")

        return valid

    def validate_aggregated_entity(self, entity: dict, file: str, idx: int) -> bool:
        """Validate an aggregated entity object."""
        valid = True
        base_path = f"entities[{idx}]"

        # Required fields
        for field in ["entityId", "name", "category"]:
            if field not in entity:
                self.add_error(file, base_path, f"Missing required field: {field}")
                valid = False

        if "category" in entity:
            valid &= self.validate_category(entity["category"], file, f"{base_path}.category")

        # Sources validation
        if "sources" in entity:
            for i, source in enumerate(entity["sources"]):
                if "tweetId" in source:
                    valid &= self.validate_tweet_id(source["tweetId"], file, f"{base_path}.sources[{i}].tweetId")
                if "date" in source:
                    valid &= self.validate_date(source["date"], file, f"{base_path}.sources[{i}].date")

        # Numbers validation
        if "extractedData" in entity:
            data = entity["extractedData"]
            if "investmentCrore" in data:
                valid &= self.validate_investment(data["investmentCrore"], file, f"{base_path}.extractedData.investmentCrore")
            if "jobsCreated" in data:
                valid &= self.validate_jobs(data["jobsCreated"], file, f"{base_path}.extractedData.jobsCreated")

        return valid

    def validate_file(self, file_path: Path) -> bool:
        """Validate a single JSON file."""
        self.stats["files_checked"] += 1
        file_name = str(file_path.relative_to(EXTRACTION_DIR))

        try:
            with open(file_path) as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.add_error(file_name, "", f"Invalid JSON: {e}")
            return False
        except IOError as e:
            self.add_error(file_name, "", f"Cannot read file: {e}")
            return False

        valid = True

        # Detect file type and validate accordingly
        if "tweets" in data:
            # Raw tweet file
            for i, tweet in enumerate(data["tweets"]):
                valid &= self.validate_raw_tweet(tweet, file_name, i)
        elif "entities" in data:
            # Aggregated entity file
            for i, entity in enumerate(data["entities"]):
                valid &= self.validate_aggregated_entity(entity, file_name, i)
            # Also check newFromApiTest if present
            if "newFromApiTest" in data:
                for i, entity in enumerate(data["newFromApiTest"]):
                    valid &= self.validate_aggregated_entity(entity, file_name, i)
        elif "entries" in data:
            # Verified entries file
            for i, entry in enumerate(data["entries"]):
                valid &= self.validate_verified_entry(entry, file_name, i)

        if valid:
            self.stats["files_valid"] += 1

        return valid

    def validate_phase(self, phase: int):
        """Validate all files for a specific phase."""
        phase_dirs = {
            0: "tweet_ids",
            1: "raw",
            2: "enriched",
            3: "verified",
            4: "aggregated",
            5: "duplicates"
        }

        if phase not in phase_dirs:
            print(f"Unknown phase: {phase}")
            return

        dir_path = EXTRACTION_DIR / phase_dirs[phase]
        if not dir_path.exists():
            print(f"Directory not found: {dir_path}")
            return

        print(f"Validating Phase {phase} ({phase_dirs[phase]}/)...")

        for file_path in dir_path.glob("*.json"):
            self.validate_file(file_path)

    def validate_all(self):
        """Validate all phases."""
        for phase in range(6):
            self.validate_phase(phase)

    def print_report(self):
        """Print validation report."""
        print("\n" + "=" * 60)
        print("VALIDATION REPORT")
        print("=" * 60)

        print(f"\nFiles checked: {self.stats['files_checked']}")
        print(f"Files valid: {self.stats['files_valid']}")
        print(f"Total errors: {self.stats['total_errors']}")
        print(f"Total warnings: {self.stats['total_warnings']}")

        if self.errors:
            print("\n--- ERRORS ---")
            for err in self.errors[:20]:  # Limit to first 20
                print(f"  {err}")
            if len(self.errors) > 20:
                print(f"  ... and {len(self.errors) - 20} more errors")

        if self.warnings:
            print("\n--- WARNINGS ---")
            for warn in self.warnings[:10]:  # Limit to first 10
                print(f"  {warn}")
            if len(self.warnings) > 10:
                print(f"  ... and {len(self.warnings) - 10} more warnings")

        print("\n" + "=" * 60)

        if self.stats["total_errors"] == 0:
            print("RESULT: PASS")
            return 0
        else:
            print("RESULT: FAIL")
            return 1


def main():
    parser = argparse.ArgumentParser(description="Validate extraction data")
    parser.add_argument("--phase", type=int, choices=[0, 1, 2, 3, 4, 5],
                        help="Validate specific phase")
    parser.add_argument("--file", type=Path, help="Validate specific file")
    parser.add_argument("--extraction-dir", type=Path,
                        help="Override extraction directory")

    args = parser.parse_args()

    global EXTRACTION_DIR, SCHEMAS_DIR
    if args.extraction_dir:
        EXTRACTION_DIR = args.extraction_dir
        SCHEMAS_DIR = EXTRACTION_DIR / "schemas"

    validator = Validator()

    if args.file:
        validator.validate_file(args.file)
    elif args.phase is not None:
        validator.validate_phase(args.phase)
    else:
        validator.validate_all()

    return validator.print_report()


if __name__ == "__main__":
    sys.exit(main())
