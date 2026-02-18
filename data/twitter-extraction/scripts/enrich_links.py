#!/usr/bin/env python3
"""
Enrich URLs by fetching page content and extracting metadata.
Usage: python3 enrich_links.py [--batch N] [--all]
"""

import json
import os
import sys
import time
import hashlib
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse
import re

# Configuration
ENRICHED_DIR = Path("data/twitter-extraction/enriched")
BATCH_DIR = ENRICHED_DIR / "batches"
RESULTS_DIR = ENRICHED_DIR / "results"
LOG_FILE = Path("data/twitter-extraction/logs/enrich.log")

RATE_LIMIT_DELAY = 2.0  # seconds between requests
TIMEOUT = 15  # curl timeout
MAX_CONTENT_LENGTH = 50000  # chars to fetch


def log(msg: str):
    """Log message to file and stdout."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def url_hash(url: str) -> str:
    """Generate MD5 hash for URL."""
    return hashlib.md5(url.encode()).hexdigest()[:12]


def fetch_url(url: str) -> tuple[str, int, str]:
    """Fetch URL content. Returns (content, status_code, error)."""
    try:
        # Use curl with redirect following and timeout
        result = subprocess.run(
            [
                "curl", "-s", "-L",
                "--max-time", str(TIMEOUT),
                "--max-redirs", "5",
                "-H", "User-Agent: Mozilla/5.0 (compatible; DataBot/1.0)",
                "-H", "Accept: text/html,application/xhtml+xml",
                "-w", "\n%{http_code}",
                url
            ],
            capture_output=True, text=True, timeout=TIMEOUT + 5
        )

        # Split response into content and status code
        lines = result.stdout.rsplit("\n", 1)
        if len(lines) == 2:
            content, status_str = lines
            status_code = int(status_str) if status_str.isdigit() else 0
        else:
            content = result.stdout
            status_code = 0

        if status_code == 200:
            return content[:MAX_CONTENT_LENGTH], status_code, ""
        elif status_code == 404:
            return "", status_code, "not_found"
        elif status_code == 403:
            return "", status_code, "blocked"
        else:
            return "", status_code, f"http_{status_code}"

    except subprocess.TimeoutExpired:
        return "", 0, "timeout"
    except Exception as e:
        return "", 0, str(e)


def extract_title(html: str) -> str:
    """Extract page title from HTML."""
    match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""


def extract_meta(html: str, name: str) -> str:
    """Extract meta tag content."""
    patterns = [
        rf'<meta[^>]+name=["\']?{name}["\']?[^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\']?[^>]+name=["\']?{name}["\']?',
        rf'<meta[^>]+property=["\']og:{name}["\']?[^>]+content=["\']([^"\']+)["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""


def extract_article_text(html: str) -> str:
    """Extract main article text (simplified)."""
    # Remove scripts and styles
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)

    # Extract paragraph text
    paragraphs = re.findall(r'<p[^>]*>(.+?)</p>', html, flags=re.DOTALL | re.IGNORECASE)
    text = " ".join(paragraphs)

    # Clean HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    return text[:2000]  # First 2000 chars


def extract_investment(text: str) -> dict | None:
    """Extract investment amounts from text."""
    patterns = [
        r'(?:Rs\.?|₹)\s*([\d,]+)\s*(?:crore|cr)',
        r'([\d,]+)\s*(?:crore|cr)(?:\s+(?:rupees|Rs))?',
        r'\$\s*([\d,]+)\s*(?:million|mn|m)',
        r'\$\s*([\d,]+)\s*(?:billion|bn|b)',
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            try:
                amount = float(amount_str)
                if "million" in pattern or "mn" in pattern:
                    return {"amount": amount, "currency": "USD", "unit": "million"}
                elif "billion" in pattern or "bn" in pattern:
                    return {"amount": amount, "currency": "USD", "unit": "billion"}
                else:
                    return {"amount": amount, "currency": "INR", "unit": "crore"}
            except ValueError:
                continue
    return None


def extract_jobs(text: str) -> int | None:
    """Extract job creation numbers from text."""
    patterns = [
        r'([\d,]+)\s*(?:jobs?|employment)',
        r'employ(?:ment|ing)?\s+(?:of\s+)?([\d,]+)',
        r'([\d,]+)\s*(?:direct|indirect)?\s*jobs?',
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            jobs_str = match.group(1).replace(",", "")
            try:
                jobs = int(jobs_str)
                if 10 <= jobs <= 1000000:  # Sanity check
                    return jobs
            except ValueError:
                continue
    return None


def classify_content_type(domain: str, text: str) -> str:
    """Classify content type based on domain and text."""
    if ".gov.in" in domain or "government" in domain:
        return "government"
    if any(d in domain for d in ["thehindu", "express", "herald", "times", "mint"]):
        return "news_article"
    if "press release" in text.lower() or "statement" in text.lower():
        return "press_release"
    return "other"


def enrich_link(link: dict) -> dict:
    """Fetch and enrich a single link."""
    url = link["url"]
    domain = link.get("domain", urlparse(url).netloc)

    result = {
        "url": url,
        "urlHash": url_hash(url),
        "domain": domain,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "sourceTweets": link.get("sourceTweets", []),
    }

    content, status_code, error = fetch_url(url)

    if error:
        result["status"] = "failed" if error not in ["not_found", "blocked", "timeout"] else error
        result["errorMessage"] = error
        return result

    # Success - extract metadata
    result["status"] = "success"
    result["pageTitle"] = extract_title(content)
    result["contentType"] = classify_content_type(domain, content)

    # Meta tags
    result["publishDate"] = extract_meta(content, "date") or extract_meta(content, "published_time")
    result["author"] = extract_meta(content, "author")

    # Article text
    article_text = extract_article_text(content)
    result["rawText"] = article_text

    # Structured extraction
    extracted = {}
    extracted["headline"] = result["pageTitle"]
    extracted["summary"] = extract_meta(content, "description")[:500]

    investment = extract_investment(article_text)
    if investment:
        extracted["investment"] = investment

    jobs = extract_jobs(article_text)
    if jobs:
        extracted["jobs"] = jobs

    if extracted:
        result["extractedData"] = extracted

    return result


def process_batch(batch_num: int) -> dict:
    """Process a single batch of links."""
    batch_file = BATCH_DIR / f"batch_{batch_num:04d}.json"

    if not batch_file.exists():
        return {"error": f"Batch file not found: {batch_file}"}

    with open(batch_file) as f:
        links = json.load(f)

    log(f"Processing batch {batch_num} ({len(links)} links)...")

    results = []
    stats = {"success": 0, "failed": 0, "not_found": 0, "blocked": 0, "timeout": 0}

    for i, link in enumerate(links):
        result = enrich_link(link)
        results.append(result)

        status = result.get("status", "failed")
        if status in stats:
            stats[status] += 1
        else:
            stats["failed"] += 1

        # Rate limiting
        if i < len(links) - 1:
            time.sleep(RATE_LIMIT_DELAY)

    # Save results
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_file = RESULTS_DIR / f"batch_{batch_num:04d}_enriched.json"
    with open(output_file, "w") as f:
        json.dump({
            "batch": batch_num,
            "processedAt": datetime.now(timezone.utc).isoformat(),
            "stats": stats,
            "results": results
        }, f, indent=2)

    log(f"Batch {batch_num}: {stats}")
    return {"batch": batch_num, "stats": stats, "output": str(output_file)}


def main():
    parser = argparse.ArgumentParser(description="Enrich URLs with page content")
    parser.add_argument("--batch", type=int, help="Process specific batch number")
    parser.add_argument("--start", type=int, default=0, help="Start batch number")
    parser.add_argument("--end", type=int, help="End batch number (exclusive)")
    parser.add_argument("--all", action="store_true", help="Process all batches")
    args = parser.parse_args()

    if args.batch is not None:
        # Single batch
        result = process_batch(args.batch)
        print(json.dumps(result, indent=2))
        return 0

    if args.all or args.start is not None:
        # Multiple batches
        batch_files = sorted(BATCH_DIR.glob("batch_*.json"))
        if not batch_files:
            log("ERROR: No batch files found. Run extract_links.py first.")
            return 1

        total_batches = len(batch_files)
        end = args.end or total_batches
        start = args.start

        log(f"Processing batches {start} to {end - 1} ({end - start} batches)")

        all_stats = {"success": 0, "failed": 0, "not_found": 0, "blocked": 0, "timeout": 0}

        for batch_num in range(start, end):
            result = process_batch(batch_num)
            if "stats" in result:
                for k, v in result["stats"].items():
                    all_stats[k] = all_stats.get(k, 0) + v

            # Delay between batches
            if batch_num < end - 1:
                time.sleep(1)

        log(f"\n=== Final Stats ===")
        log(f"Total: {all_stats}")
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    exit(main())
