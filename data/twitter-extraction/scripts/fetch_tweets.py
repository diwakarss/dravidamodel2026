#!/usr/bin/env python3
"""
Fetch tweets from fxTwitter API for filtered handles.
Usage: python3 fetch_tweets.py [--start-batch N] [--end-batch M] [--output FILE]
"""

import json
import os
import sys
import time
import argparse
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Configuration
BATCH_DIR = Path("data/twitter-extraction/tweet_ids/filtered/batches")
OUTPUT_DIR = Path("data/twitter-extraction/raw/filtered")
RATE_LIMIT_DELAY = 0.5  # seconds between requests
BATCH_DELAY = 2  # seconds between batches

def id_to_handle(tweet_id: int, handle_files: dict) -> str:
    """Look up which handle a tweet ID belongs to."""
    for handle, ids in handle_files.items():
        if tweet_id in ids:
            return handle
    return "unknown"

def fetch_tweet(tweet_id: int, handle: str) -> dict:
    """Fetch a single tweet from fxTwitter API."""
    url = f"https://api.fxtwitter.com/{handle}/status/{tweet_id}"
    try:
        result = subprocess.run(
            ["curl", "-s", "--max-time", "10", url],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            return {"error": "curl_failed", "id": tweet_id}

        data = json.loads(result.stdout)
        if data.get("code") == 404:
            return {"error": "not_found", "id": tweet_id}

        if data.get("tweet"):
            tweet = data["tweet"]
            return {
                "id": str(tweet_id),
                "text": tweet.get("text", ""),
                "created_at": tweet.get("created_at", ""),
                "handle": tweet.get("author", {}).get("screen_name", handle),
                "likes": tweet.get("likes", 0),
                "retweets": tweet.get("retweets", 0),
                "replies": tweet.get("replies", 0),
                "media": tweet.get("media", {}),
                "urls": tweet.get("urls", []),
            }
        return {"error": "no_tweet_data", "id": tweet_id}
    except Exception as e:
        return {"error": str(e), "id": tweet_id}

def load_handle_ids():
    """Load tweet IDs per handle for lookup."""
    handle_files = {}
    filter_dir = Path("data/twitter-extraction/tweet_ids/filtered")
    for handle in ["CMOTamilnadu", "mkstalin", "TRBRajaa"]:
        filepath = filter_dir / f"{handle}.txt"
        if filepath.exists():
            with open(filepath) as f:
                handle_files[handle] = set(int(line.strip()) for line in f if line.strip())
    return handle_files

def main():
    parser = argparse.ArgumentParser(description="Fetch tweets from fxTwitter API")
    parser.add_argument("--start-batch", type=int, default=0, help="Start batch number")
    parser.add_argument("--end-batch", type=int, default=None, help="End batch number (exclusive)")
    parser.add_argument("--output", type=str, default=None, help="Output file path")
    args = parser.parse_args()

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load handle mappings
    print("Loading handle mappings...")
    handle_files = load_handle_ids()
    print(f"  CMOTamilnadu: {len(handle_files.get('CMOTamilnadu', set()))} IDs")
    print(f"  mkstalin: {len(handle_files.get('mkstalin', set()))} IDs")
    print(f"  TRBRajaa: {len(handle_files.get('TRBRajaa', set()))} IDs")

    # Get batch files
    batch_files = sorted(BATCH_DIR.glob("batch_*.txt"))
    if not batch_files:
        print("ERROR: No batch files found")
        sys.exit(1)

    end_batch = args.end_batch or len(batch_files)
    batch_files = batch_files[args.start_batch:end_batch]
    print(f"\nProcessing batches {args.start_batch} to {end_batch - 1} ({len(batch_files)} batches)")

    # Output file
    output_file = args.output or OUTPUT_DIR / f"tweets_{args.start_batch:04d}_to_{end_batch-1:04d}.json"

    all_tweets = []
    stats = {"fetched": 0, "not_found": 0, "errors": 0}

    start_time = time.time()

    for batch_idx, batch_file in enumerate(batch_files):
        batch_num = args.start_batch + batch_idx
        with open(batch_file) as f:
            tweet_ids = [int(line.strip()) for line in f if line.strip()]

        print(f"\nBatch {batch_num} ({len(tweet_ids)} tweets)...", end="", flush=True)

        batch_tweets = []
        for tid in tweet_ids:
            handle = id_to_handle(tid, handle_files)
            result = fetch_tweet(tid, handle)

            if "error" in result:
                if result["error"] == "not_found":
                    stats["not_found"] += 1
                else:
                    stats["errors"] += 1
            else:
                batch_tweets.append(result)
                stats["fetched"] += 1

            time.sleep(RATE_LIMIT_DELAY)

        all_tweets.extend(batch_tweets)
        print(f" {len(batch_tweets)} fetched, {stats['not_found']} 404s, {stats['errors']} errors")

        # Save progress every 10 batches
        if (batch_idx + 1) % 10 == 0:
            with open(output_file, "w") as f:
                json.dump({
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                    "batches": f"{args.start_batch}-{batch_num}",
                    "stats": stats,
                    "tweets": all_tweets
                }, f, indent=2, ensure_ascii=False)
            print(f"  [Saved progress: {len(all_tweets)} tweets]")

        time.sleep(BATCH_DELAY)

    # Final save
    elapsed = time.time() - start_time
    with open(output_file, "w") as f:
        json.dump({
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "batches": f"{args.start_batch}-{end_batch-1}",
            "elapsed_seconds": elapsed,
            "stats": stats,
            "tweets": all_tweets
        }, f, indent=2, ensure_ascii=False)

    print(f"\n=== COMPLETE ===")
    print(f"Fetched: {stats['fetched']}")
    print(f"Not found (404): {stats['not_found']}")
    print(f"Errors: {stats['errors']}")
    print(f"Time: {elapsed/60:.1f} minutes")
    print(f"Output: {output_file}")

if __name__ == "__main__":
    main()
