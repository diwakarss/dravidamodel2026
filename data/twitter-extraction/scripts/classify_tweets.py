#!/usr/bin/env python3
"""
Phase 3: Classify tweets into categories and extract structured entities.
Uses Haiku for fast classification with Tamil/English support.

Usage:
  python3 classify_tweets.py --batch N          # Process specific batch
  python3 classify_tweets.py --all              # Process all batches
  python3 classify_tweets.py --test             # Test on 5 sample tweets
"""

import json
import os
import re
import hashlib
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# Configuration
RAW_DIR = Path("data/twitter-extraction/raw/filtered")
ENRICHED_DIR = Path("data/twitter-extraction/enriched/results")
VERIFIED_DIR = Path("data/twitter-extraction/verified")
LOG_FILE = Path("data/twitter-extraction/logs/classify.log")
BATCH_SIZE = 10  # Tweets per classification batch

# Categories from schema
CATEGORIES = [
    "infrastructure",   # Metro, roads, bridges, water, power
    "industries",       # MoUs, factories, investments, manufacturing
    "education",        # Schools, colleges, scholarships
    "healthcare",       # Hospitals, medical colleges, health schemes
    "employment",       # Job fairs, skill training, employment schemes
    "agriculture",      # Farm schemes, irrigation, MSP
    "environment",      # Green energy, conservation, pollution
    "social-welfare",   # Pensions, housing, food security
    "sports-culture",   # Stadiums, cultural events, sports schemes
    "tamil-history",    # Archaeological, museums, heritage
]

# Event types
EVENT_TYPES = [
    "mou_signed",
    "ground_breaking",
    "inauguration",
    "progress_update",
    "expansion",
    "production_start",
    "scheme_launch",
    "beneficiary_update",
    "policy_announcement",
    "milestone",
]

# Tamil keywords for category detection (supplementary)
TAMIL_KEYWORDS = {
    "infrastructure": ["பாலம்", "சாலை", "மெட்ரோ", "நீர்", "மின்சாரம்", "துறைமுகம்"],
    "industries": ["முதலீடு", "தொழிற்சாலை", "கோடி", "வேலை", "புரிந்துணர்வு"],
    "education": ["பள்ளி", "கல்லூரி", "மாணவர்", "கல்வி", "உதவித்தொகை"],
    "healthcare": ["மருத்துவமனை", "சுகாதாரம்", "ஆம்புலன்ஸ்", "தடுப்பூசி"],
    "employment": ["வேலை", "பயிற்சி", "திறன்", "வேலைவாய்ப்பு"],
    "agriculture": ["விவசாயம்", "நெல்", "பயிர்", "நீர்பாசனம்"],
    "social-welfare": ["இலவச", "உதவி", "ஓய்வூதியம்", "வீடு", "அரிசி"],
    "sports-culture": ["விளையாட்டு", "அரங்கம்", "கலை", "திருவிழா"],
    "tamil-history": ["தொல்லியல்", "அருங்காட்சியகம்", "பாரம்பரியம்", "சங்ககாலம்"],
}


def log(msg: str):
    """Log message to file and stdout."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def build_classification_prompt(tweets: list, enriched_data: dict) -> str:
    """Build prompt for LLM classification."""

    prompt = """You are classifying Tamil Nadu government-related tweets for the Dravidian Model 2026 project.

CATEGORIES (choose one):
- infrastructure: Metro, roads, bridges, water supply, power, ports
- industries: MoUs, factories, investments, manufacturing plants
- education: Schools, colleges, scholarships, student programs
- healthcare: Hospitals, medical colleges, health schemes, ambulances
- employment: Job creation, skill training, employment schemes
- agriculture: Farm schemes, irrigation, MSP, rural development
- environment: Green energy, conservation, tree planting
- social-welfare: Pensions, housing, food security, welfare schemes
- sports-culture: Stadiums, cultural events, sports facilities
- tamil-history: Archaeological sites, museums, heritage preservation
- uncategorized: Not related to any above category

EVENT TYPES:
- mou_signed: MoU or agreement signed
- ground_breaking: Foundation stone laid, construction started
- inauguration: Official opening/launch
- progress_update: Status update on ongoing project
- expansion: Expansion of existing facility
- production_start: Factory/plant begins production
- scheme_launch: New government scheme announced
- beneficiary_update: Beneficiary numbers/distribution
- policy_announcement: Policy change announced
- milestone: Achievement milestone reached

For each tweet, extract:
1. category (from list above)
2. eventType (from list above, or "other")
3. entityName: The project/scheme/company name
4. entityType: "project" | "scheme" | "company" | "investment"
5. location: {district, city} if mentioned
6. numbers: {investmentCrore, jobsCreated, beneficiaries} if mentioned
7. confidence: 0.0-1.0 (how confident in classification)

TWEETS TO CLASSIFY:
"""

    for i, tweet in enumerate(tweets, 1):
        tweet_id = tweet.get("id", "unknown")
        handle = tweet.get("handle", "unknown")
        text = tweet.get("text", "")
        date = tweet.get("created_at", "")[:16]

        prompt += f"\n--- Tweet {i} (ID: {tweet_id}, @{handle}, {date}) ---\n"
        prompt += f"{text}\n"

        # Add enriched link data if available
        enriched = enriched_data.get(tweet_id, [])
        if enriched:
            prompt += "\nLinked article info:\n"
            for link in enriched[:2]:  # Max 2 links
                title = link.get("pageTitle", "")
                summary = link.get("extractedData", {}).get("summary", "")
                if title:
                    prompt += f"  - {title}\n"
                if summary:
                    prompt += f"    {summary[:200]}\n"

    prompt += """

OUTPUT FORMAT (JSON array, one object per tweet):
```json
[
  {
    "tweetId": "...",
    "category": "industries",
    "eventType": "mou_signed",
    "entityName": "VinFast Electric Vehicle Plant",
    "entityType": "investment",
    "location": {"district": "Tiruvallur", "city": "Sriperumbudur"},
    "numbers": {"investmentCrore": 16600, "jobsCreated": 3500},
    "confidence": 0.9
  }
]
```

Classify these tweets now:"""

    return prompt


def call_haiku(prompt: str) -> Optional[str]:
    """Call Claude Haiku via Anthropic API."""
    import os

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log("ERROR: ANTHROPIC_API_KEY not set")
        return None

    try:
        result = subprocess.run(
            [
                "curl", "-s", "-X", "POST",
                "https://api.anthropic.com/v1/messages",
                "-H", f"x-api-key: {api_key}",
                "-H", "anthropic-version: 2023-06-01",
                "-H", "content-type: application/json",
                "-d", json.dumps({
                    "model": "claude-3-5-haiku-20241022",
                    "max_tokens": 4096,
                    "messages": [{"role": "user", "content": prompt}]
                })
            ],
            capture_output=True, text=True, timeout=60
        )

        if result.returncode != 0:
            log(f"ERROR: curl failed: {result.stderr}")
            return None

        response = json.loads(result.stdout)
        if "content" in response and response["content"]:
            return response["content"][0].get("text", "")

        if "error" in response:
            log(f"ERROR: API error: {response['error']}")
        return None

    except Exception as e:
        log(f"ERROR: {e}")
        return None


def parse_classification_response(response: str) -> list:
    """Parse JSON from LLM response."""
    # Find JSON block
    json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try to find raw JSON array
        json_match = re.search(r'\[\s*\{.*\}\s*\]', response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            return []

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        log(f"JSON parse error: {e}")
        return []


def load_enriched_data() -> dict:
    """Load enriched link data indexed by tweet ID."""
    enriched_by_tweet = {}

    for result_file in ENRICHED_DIR.glob("batch_*_enriched.json"):
        try:
            with open(result_file) as f:
                data = json.load(f)

            for result in data.get("results", []):
                if result.get("status") == "success":
                    for source in result.get("sourceTweets", []):
                        tweet_id = source.get("tweetId")
                        if tweet_id:
                            if tweet_id not in enriched_by_tweet:
                                enriched_by_tweet[tweet_id] = []
                            enriched_by_tweet[tweet_id].append(result)
        except Exception as e:
            log(f"Error loading {result_file}: {e}")

    return enriched_by_tweet


def build_verified_entry(tweet: dict, classification: dict, enriched: list) -> dict:
    """Build verified entry from tweet and classification."""
    tweet_id = tweet.get("id", "")
    handle = tweet.get("handle", "")

    entry = {
        "entryId": f"{handle}-{tweet_id}",
        "sourceHandle": handle,
        "sourceTweetId": tweet_id,
        "date": parse_date(tweet.get("created_at", "")),
        "tweetText": tweet.get("text", ""),
        "fxUrl": f"https://fxtwitter.com/{handle}/status/{tweet_id}",
        "category": classification.get("category", "uncategorized"),
        "eventType": classification.get("eventType", "other"),
        "confidence": classification.get("confidence", 0.5),
    }

    # Sub-category from entity type
    if classification.get("entityType"):
        entry["subCategory"] = classification["entityType"]

    # Extracted entity
    if classification.get("entityName"):
        entry["extractedEntity"] = {
            "name": classification["entityName"],
            "nameNormalized": normalize_name(classification["entityName"]),
            "type": classification.get("entityType", "other"),
        }
        if classification.get("location"):
            entry["extractedEntity"]["location"] = classification["location"]

    # Extracted numbers
    numbers = classification.get("numbers", {})
    if numbers:
        entry["extractedNumbers"] = {
            k: v for k, v in numbers.items() if v is not None
        }

    # Enriched links
    if enriched:
        entry["enrichedLinks"] = [
            {
                "url": e.get("url"),
                "urlHash": e.get("urlHash"),
                "title": e.get("pageTitle"),
                "domain": e.get("domain")
            }
            for e in enriched[:3]
        ]

    # Flags
    flags = []
    if entry["confidence"] < 0.7:
        flags.append("low_confidence")
    if entry["category"] == "uncategorized":
        flags.append("needs_review")
    if flags:
        entry["flags"] = flags

    return entry


def parse_date(date_str: str) -> str:
    """Parse Twitter date to ISO format."""
    if not date_str:
        return ""
    try:
        # Twitter format: "Sat May 01 04:13:03 +0000 2021"
        from datetime import datetime
        dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
        return dt.strftime("%Y-%m-%d")
    except:
        return date_str[:10] if len(date_str) >= 10 else ""


def normalize_name(name: str) -> str:
    """Normalize entity name for matching."""
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', '-', name.strip())
    return name


def classify_batch(tweets: list, enriched_data: dict) -> list:
    """Classify a batch of tweets."""
    prompt = build_classification_prompt(tweets, enriched_data)

    response = call_haiku(prompt)
    if not response:
        return []

    classifications = parse_classification_response(response)

    # Build verified entries
    results = []
    classification_map = {c.get("tweetId"): c for c in classifications}

    for tweet in tweets:
        tweet_id = tweet.get("id", "")
        classification = classification_map.get(tweet_id, {})
        enriched = enriched_data.get(tweet_id, [])

        entry = build_verified_entry(tweet, classification, enriched)
        results.append(entry)

    return results


def main():
    parser = argparse.ArgumentParser(description="Classify tweets into categories")
    parser.add_argument("--batch", type=int, help="Process specific batch")
    parser.add_argument("--start", type=int, default=0, help="Start batch")
    parser.add_argument("--end", type=int, help="End batch")
    parser.add_argument("--all", action="store_true", help="Process all")
    parser.add_argument("--test", action="store_true", help="Test on 5 tweets")
    parser.add_argument("--input", type=str, default=str(RAW_DIR / "tweets_full.json"))
    args = parser.parse_args()

    # Load tweets
    log(f"Loading tweets from {args.input}...")
    with open(args.input) as f:
        data = json.load(f)
    tweets = data.get("tweets", [])
    log(f"Loaded {len(tweets)} tweets")

    # Load enriched data
    log("Loading enriched link data...")
    enriched_data = load_enriched_data()
    log(f"Loaded enriched data for {len(enriched_data)} tweets")

    # Filter to relevant tweets (has potential government content)
    def is_relevant(tweet):
        text = tweet.get("text", "").lower()
        handle = tweet.get("handle", "").lower()

        # Priority handles
        priority_handles = ["cmotamilnadu", "mkstalin", "trbraja", "tndiprnews"]
        if handle in priority_handles:
            return True

        # Keywords
        keywords = ["crore", "inaugurat", "launch", "scheme", "மெட்ரோ", "முதலீடு",
                   "கோடி", "திட்டம்", "government", "minister", "cm "]
        return any(kw in text for kw in keywords)

    relevant_tweets = [t for t in tweets if is_relevant(t)]
    log(f"Filtered to {len(relevant_tweets)} relevant tweets")

    if args.test:
        # Test mode - classify 5 tweets
        test_tweets = relevant_tweets[:5]
        log(f"Testing on {len(test_tweets)} tweets...")

        results = classify_batch(test_tweets, enriched_data)

        print("\n=== TEST RESULTS ===")
        for r in results:
            print(f"\n{r['sourceHandle']}: {r['tweetText'][:80]}...")
            print(f"  Category: {r['category']} ({r['confidence']:.1%})")
            print(f"  Event: {r.get('eventType', 'N/A')}")
            if r.get('extractedEntity'):
                print(f"  Entity: {r['extractedEntity'].get('name', 'N/A')}")
            if r.get('extractedNumbers'):
                print(f"  Numbers: {r['extractedNumbers']}")

        return 0

    # Create batches
    num_batches = (len(relevant_tweets) + BATCH_SIZE - 1) // BATCH_SIZE

    if args.batch is not None:
        batches = [(args.batch, relevant_tweets[args.batch * BATCH_SIZE:(args.batch + 1) * BATCH_SIZE])]
    elif args.all:
        batches = [(i, relevant_tweets[i * BATCH_SIZE:(i + 1) * BATCH_SIZE]) for i in range(num_batches)]
    else:
        start = args.start
        end = args.end or num_batches
        batches = [(i, relevant_tweets[i * BATCH_SIZE:(i + 1) * BATCH_SIZE]) for i in range(start, end)]

    log(f"Processing {len(batches)} batches...")

    VERIFIED_DIR.mkdir(parents=True, exist_ok=True)
    all_results = []
    stats = {"total": 0, "classified": 0, "high_confidence": 0}

    for batch_num, batch_tweets in batches:
        if not batch_tweets:
            continue

        log(f"Batch {batch_num} ({len(batch_tweets)} tweets)...")

        results = classify_batch(batch_tweets, enriched_data)
        all_results.extend(results)

        stats["total"] += len(batch_tweets)
        stats["classified"] += len([r for r in results if r["category"] != "uncategorized"])
        stats["high_confidence"] += len([r for r in results if r["confidence"] >= 0.7])

        # Save batch results
        batch_file = VERIFIED_DIR / f"batch_{batch_num:04d}_verified.json"
        with open(batch_file, "w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

    # Save merged results
    merged_file = VERIFIED_DIR / "all_verified.json"
    with open(merged_file, "w") as f:
        json.dump({
            "processedAt": datetime.now(timezone.utc).isoformat(),
            "stats": stats,
            "entries": all_results
        }, f, indent=2, ensure_ascii=False)

    log(f"\n=== CLASSIFICATION COMPLETE ===")
    log(f"Total: {stats['total']}")
    log(f"Classified: {stats['classified']} ({stats['classified']/max(stats['total'],1)*100:.1f}%)")
    log(f"High confidence: {stats['high_confidence']} ({stats['high_confidence']/max(stats['total'],1)*100:.1f}%)")
    log(f"Saved to {merged_file}")

    return 0


if __name__ == "__main__":
    exit(main())
