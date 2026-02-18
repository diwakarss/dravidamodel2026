#!/usr/bin/env python3
"""
Merge worker results into consolidated output files.

Collects results from all completed workers (active and retired),
parses the markdown/JSON outputs, and merges into unified files
per phase.

Usage:
    python3 merge-results.py --phase 0    # Merge Phase 0 ID discovery
    python3 merge-results.py --phase 1    # Merge Phase 1 tweet data
    python3 merge-results.py --all        # Merge all phases
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


NALAN_ACTIVE = Path.home() / ".nalan" / "agents" / "active"
NALAN_RETIRED = Path.home() / ".nalan" / "agents" / "retired"
# Auto-detect extraction dir relative to script location
SCRIPT_DIR = Path(__file__).parent.resolve()
EXTRACTION_DIR = SCRIPT_DIR.parent


def find_worker_dirs() -> list[Path]:
    """Find all worker directories (active and retired)."""
    dirs = []

    if NALAN_ACTIVE.exists():
        dirs.extend([d for d in NALAN_ACTIVE.iterdir() if d.is_dir() and d.name.startswith("nalan-")])

    if NALAN_RETIRED.exists():
        dirs.extend([d for d in NALAN_RETIRED.iterdir() if d.is_dir() and d.name.startswith("nalan-")])

    return dirs


def get_worker_role(worker_dir: Path) -> Optional[str]:
    """Get worker role from identity.json."""
    identity_file = worker_dir / "identity.json"
    if identity_file.exists():
        try:
            with open(identity_file) as f:
                data = json.load(f)
                return data.get("role")
        except (json.JSONDecodeError, IOError):
            pass
    return None


def extract_tweet_ids(content: str) -> list[str]:
    """Extract tweet IDs from worker output."""
    ids = set()

    # Pattern 0 (PREFERRED): Look for ```tweet_ids code block first
    tweet_ids_block = re.search(r'```tweet_ids\s*\n([\s\S]*?)\n```', content)
    if tweet_ids_block:
        block_content = tweet_ids_block.group(1)
        for line in block_content.strip().split('\n'):
            line = line.strip()
            if line.isdigit() and len(line) >= 15:
                ids.add(line)
        if ids:
            return sorted(ids)

    # Pattern 1: Standalone numeric IDs (18-20 digits, tweet ID format)
    for match in re.finditer(r'\b(\d{18,20})\b', content):
        ids.add(match.group(1))

    # Pattern 2: twitter.com/*/status/{ID}
    for match in re.finditer(r'twitter\.com/\w+/status/(\d+)', content):
        ids.add(match.group(1))

    # Pattern 3: x.com/*/status/{ID}
    for match in re.finditer(r'x\.com/\w+/status/(\d+)', content):
        ids.add(match.group(1))

    return sorted(ids)


def extract_json_blocks(content: str) -> list[dict]:
    """Extract JSON objects/arrays from markdown content."""
    results = []

    # Find JSON code blocks
    for match in re.finditer(r'```(?:json)?\s*\n([\s\S]*?)\n```', content):
        try:
            data = json.loads(match.group(1))
            if isinstance(data, list):
                results.extend(data)
            elif isinstance(data, dict):
                results.append(data)
        except json.JSONDecodeError:
            continue

    # Try to find inline JSON arrays
    for match in re.finditer(r'\[\s*\{[\s\S]*?\}\s*\]', content):
        try:
            data = json.loads(match.group(0))
            results.extend(data)
        except json.JSONDecodeError:
            continue

    return results


def merge_phase_0():
    """Merge Phase 0 (ID Discovery) results."""
    print("Merging Phase 0 (ID Discovery) results...")

    all_ids = set()
    handle_counts = {}

    for worker_dir in find_worker_dirs():
        role = get_worker_role(worker_dir)
        if role != "IDDiscovery":
            continue

        results_file = worker_dir / "results.md"
        if not results_file.exists():
            continue

        content = results_file.read_text()
        ids = extract_tweet_ids(content)

        print(f"  {worker_dir.name}: {len(ids)} IDs")
        all_ids.update(ids)

        # Try to extract handle from task
        identity_file = worker_dir / "identity.json"
        if identity_file.exists():
            try:
                with open(identity_file) as f:
                    data = json.load(f)
                    task = data.get("task", "")
                    match = re.search(r'@(\w+)', task)
                    if match:
                        handle = match.group(1)
                        handle_counts[handle] = handle_counts.get(handle, 0) + len(ids)
            except (json.JSONDecodeError, IOError):
                pass

    # Write merged IDs
    output_file = EXTRACTION_DIR / "tweet_ids" / "all_ids_merged.txt"
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w") as f:
        for tweet_id in sorted(all_ids):
            f.write(f"{tweet_id}\n")

    # Write summary
    summary = {
        "phase": 0,
        "mergedAt": datetime.utcnow().isoformat() + "Z",
        "totalUniqueIds": len(all_ids),
        "handleCounts": handle_counts
    }

    summary_file = EXTRACTION_DIR / "logs" / "phase0-merge-summary.json"
    summary_file.parent.mkdir(parents=True, exist_ok=True)

    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  Total unique IDs: {len(all_ids)}")
    print(f"  Output: {output_file}")
    print(f"  Summary: {summary_file}")


def merge_phase_1():
    """Merge Phase 1 (Tweet Fetch) results."""
    print("Merging Phase 1 (Tweet Fetch) results...")

    all_tweets = []
    seen_ids = set()

    for worker_dir in find_worker_dirs():
        role = get_worker_role(worker_dir)
        if role != "Fetcher":
            continue

        results_file = worker_dir / "results.md"
        if not results_file.exists():
            continue

        content = results_file.read_text()
        tweets = extract_json_blocks(content)

        new_tweets = 0
        for tweet in tweets:
            tweet_id = tweet.get("tweet_id") or tweet.get("id")
            if tweet_id and tweet_id not in seen_ids:
                seen_ids.add(tweet_id)
                all_tweets.append(tweet)
                new_tweets += 1

        print(f"  {worker_dir.name}: {new_tweets} new tweets")

    # Write merged tweets
    output_file = EXTRACTION_DIR / "raw" / "all_tweets_merged.json"
    output_file.parent.mkdir(parents=True, exist_ok=True)

    output_data = {
        "mergedAt": datetime.utcnow().isoformat() + "Z",
        "totalTweets": len(all_tweets),
        "tweets": all_tweets
    }

    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"\n  Total tweets: {len(all_tweets)}")
    print(f"  Output: {output_file}")


def merge_all():
    """Merge all phases."""
    merge_phase_0()
    print()
    merge_phase_1()
    # Future: merge_phase_2(), merge_phase_3(), etc.


def main():
    parser = argparse.ArgumentParser(description="Merge worker results")
    parser.add_argument("--phase", type=int, choices=[0, 1, 2, 3, 4, 5],
                        help="Merge specific phase")
    parser.add_argument("--all", action="store_true", help="Merge all phases")
    parser.add_argument("--extraction-dir", type=Path,
                        help="Override extraction directory")

    args = parser.parse_args()

    global EXTRACTION_DIR
    if args.extraction_dir:
        EXTRACTION_DIR = args.extraction_dir

    if args.all:
        merge_all()
    elif args.phase == 0:
        merge_phase_0()
    elif args.phase == 1:
        merge_phase_1()
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
