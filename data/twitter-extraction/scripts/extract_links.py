#!/usr/bin/env python3
"""
Extract unique URLs from fetched tweets for Phase 2 enrichment.
Usage: python3 extract_links.py [--input FILE] [--output FILE]
"""

import json
import re
import hashlib
import argparse
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime, timezone
from collections import defaultdict

# Configuration
INPUT_FILE = Path("data/twitter-extraction/raw/filtered/tweets_full.json")
OUTPUT_DIR = Path("data/twitter-extraction/enriched")
LINKS_INDEX = OUTPUT_DIR / "links_index.json"

# Domains to skip (social media, URL shorteners we can't expand, etc.)
SKIP_DOMAINS = {
    "x.com", "twitter.com", "t.co",  # Twitter itself
    "facebook.com", "fb.com", "instagram.com",  # Other social
    "youtube.com", "youtu.be",  # Video (can't extract text)
    "soundcloud.com", "spotify.com",  # Audio
    "bit.ly", "goo.gl", "ow.ly", "tinyurl.com",  # URL shorteners (often dead)
}

# High-value domains for priority
PRIORITY_DOMAINS = {
    # Government
    "tn.gov.in", "tamilnadu.gov.in", "cms.tn.gov.in",
    "chennaimetrorail.org", "guidance.tn.gov.in",
    # News
    "thehindu.com", "newindianexpress.com", "deccanherald.com",
    "economictimes.com", "businessline.com", "livemint.com",
    "thehindubusinessline.com", "moneycontrol.com",
    # Tamil news
    "tamil.oneindia.com", "dailythanthi.com", "dinamalar.com",
    "dinakaran.com", "vikatan.com",
}

URL_PATTERN = re.compile(r'https?://[^\s<>"\']+')


def extract_domain(url: str) -> str:
    """Extract domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove www prefix
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except:
        return ""


def url_hash(url: str) -> str:
    """Generate MD5 hash for URL (for filenames)."""
    return hashlib.md5(url.encode()).hexdigest()[:12]


def clean_url(url: str) -> str:
    """Clean URL by removing trailing punctuation."""
    # Remove trailing punctuation that might have been captured
    url = url.rstrip(".,;:!?)")
    # Remove tracking parameters (optional)
    return url


def extract_urls_from_tweet(tweet: dict) -> list:
    """Extract all URLs from a tweet (text + urls field)."""
    urls = set()

    # From text
    text = tweet.get("text", "")
    found = URL_PATTERN.findall(text)
    for url in found:
        urls.add(clean_url(url))

    # From urls field (if populated)
    for url in tweet.get("urls", []):
        if isinstance(url, str):
            urls.add(clean_url(url))
        elif isinstance(url, dict):
            urls.add(clean_url(url.get("url", "")))

    return list(urls)


def main():
    parser = argparse.ArgumentParser(description="Extract URLs from tweets")
    parser.add_argument("--input", type=str, default=str(INPUT_FILE))
    parser.add_argument("--output", type=str, default=str(LINKS_INDEX))
    parser.add_argument("--min-priority", action="store_true",
                        help="Only extract from priority domains")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}")
        return 1

    # Load tweets
    print(f"Loading tweets from {input_path}...")
    with open(input_path) as f:
        data = json.load(f)

    tweets = data.get("tweets", [])
    print(f"Loaded {len(tweets)} tweets")

    # Extract URLs with source tracking
    url_sources = defaultdict(list)  # url -> list of source tweets

    for tweet in tweets:
        tweet_id = tweet.get("id", "")
        handle = tweet.get("handle", "")
        created_at = tweet.get("created_at", "")

        urls = extract_urls_from_tweet(tweet)
        for url in urls:
            domain = extract_domain(url)

            # Skip excluded domains
            if domain in SKIP_DOMAINS:
                continue

            # Filter to priority only if requested
            if args.min_priority and domain not in PRIORITY_DOMAINS:
                continue

            url_sources[url].append({
                "tweetId": tweet_id,
                "handle": handle,
                "date": created_at[:10] if created_at else ""
            })

    # Build index
    links_index = {
        "extractedAt": datetime.now(timezone.utc).isoformat(),
        "sourceFile": str(input_path),
        "totalTweets": len(tweets),
        "totalUrls": len(url_sources),
        "byDomain": defaultdict(list),
        "links": []
    }

    # Group by domain and build link records
    for url, sources in url_sources.items():
        domain = extract_domain(url)
        is_priority = domain in PRIORITY_DOMAINS

        link_record = {
            "url": url,
            "urlHash": url_hash(url),
            "domain": domain,
            "priority": "high" if is_priority else "normal",
            "sourceTweets": sources,
            "status": "pending"
        }

        links_index["links"].append(link_record)
        links_index["byDomain"][domain].append(url)

    # Convert defaultdict to dict for JSON
    links_index["byDomain"] = dict(links_index["byDomain"])

    # Sort by priority (high first) then by source count
    links_index["links"].sort(
        key=lambda x: (0 if x["priority"] == "high" else 1, -len(x["sourceTweets"]))
    )

    # Stats
    priority_count = sum(1 for l in links_index["links"] if l["priority"] == "high")
    domain_counts = {d: len(urls) for d, urls in links_index["byDomain"].items()}
    top_domains = sorted(domain_counts.items(), key=lambda x: -x[1])[:15]

    print(f"\n=== URL Extraction Summary ===")
    print(f"Total unique URLs: {len(url_sources)}")
    print(f"Priority URLs: {priority_count}")
    print(f"Unique domains: {len(links_index['byDomain'])}")
    print(f"\nTop 15 domains:")
    for domain, count in top_domains:
        marker = " [PRIORITY]" if domain in PRIORITY_DOMAINS else ""
        print(f"  {domain}: {count}{marker}")

    # Save index
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(links_index, f, indent=2)

    print(f"\nSaved links index to {output_path}")

    # Generate batch files for workers
    batch_dir = OUTPUT_DIR / "batches"
    batch_dir.mkdir(parents=True, exist_ok=True)

    batch_size = 20  # URLs per batch
    links = links_index["links"]

    for i in range(0, len(links), batch_size):
        batch = links[i:i + batch_size]
        batch_file = batch_dir / f"batch_{i // batch_size:04d}.json"
        with open(batch_file, "w") as f:
            json.dump(batch, f, indent=2)

    num_batches = (len(links) + batch_size - 1) // batch_size
    print(f"Created {num_batches} batch files in {batch_dir}")

    return 0


if __name__ == "__main__":
    exit(main())
