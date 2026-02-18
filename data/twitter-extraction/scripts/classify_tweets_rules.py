#!/usr/bin/env python3
"""
Phase 3: Rule-based tweet classification (fallback without LLM).
Fast pattern matching for initial classification, can be refined with LLM later.

Usage:
  python3 classify_tweets_rules.py --test          # Test on 10 tweets
  python3 classify_tweets_rules.py --all           # Process all tweets
  python3 classify_tweets_rules.py --batch N       # Process batch N
"""

import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Tuple
from collections import defaultdict

# Configuration
RAW_DIR = Path("data/twitter-extraction/raw/filtered")
ENRICHED_DIR = Path("data/twitter-extraction/enriched/results")
VERIFIED_DIR = Path("data/twitter-extraction/verified")
LOG_FILE = Path("data/twitter-extraction/logs/classify.log")
BATCH_SIZE = 50

# Category patterns (English + Tamil)
CATEGORY_PATTERNS = {
    "infrastructure": {
        "keywords": [
            r"metro\b", r"rail", r"bridge", r"flyover", r"road", r"highway",
            r"port", r"airport", r"water supply", r"sewage", r"drainage",
            r"power", r"electricity", r"transmission", r"substation",
            r"bus terminal", r"terminus", r"corridor",
            # Tamil
            r"மெட்ரோ", r"பாலம்", r"சாலை", r"துறைமுகம்", r"நீர்",
            r"மின்சாரம்", r"பேருந்து நிலையம்",
        ],
        "weight": 1.0
    },
    "industries": {
        "keywords": [
            r"mou\b", r"investment", r"crore", r"factory", r"plant",
            r"manufacturing", r"industrial", r"sipcot", r"guidance",
            r"production", r"electric vehicle", r"ev\b", r"semiconductor",
            r"data center", r"it park", r"manufacturing hub",
            # Tamil
            r"முதலீடு", r"கோடி", r"தொழிற்சாலை", r"புரிந்துணர்வு",
            r"உற்பத்தி",
        ],
        "weight": 1.2  # Higher weight - key focus
    },
    "education": {
        "keywords": [
            r"school", r"college", r"university", r"student", r"scholarship",
            r"education", r"hostel", r"library", r"iit\b", r"nit\b",
            r"medical college", r"engineering college",
            # Tamil
            r"பள்ளி", r"கல்லூரி", r"மாணவர்", r"கல்வி", r"உதவித்தொகை",
        ],
        "weight": 1.0
    },
    "healthcare": {
        "keywords": [
            r"hospital", r"health", r"medical", r"ambulance", r"108\b",
            r"vaccine", r"vaccination", r"covid", r"medicine", r"doctor",
            r"nurse", r"phc\b", r"aiims",
            # Tamil
            r"மருத்துவமனை", r"சுகாதாரம்", r"தடுப்பூசி", r"ஆம்புலன்ஸ்",
        ],
        "weight": 1.0
    },
    "employment": {
        "keywords": [
            r"job", r"employment", r"skill", r"training", r"placement",
            r"naan mudhalvan", r"job fair", r"recruitment", r"hire",
            # Tamil
            r"வேலை", r"வேலைவாய்ப்பு", r"பயிற்சி", r"திறன்",
        ],
        "weight": 1.0
    },
    "agriculture": {
        "keywords": [
            r"farm", r"agriculture", r"crop", r"irrigation", r"paddy",
            r"msp\b", r"farmer", r"kisan", r"uzhavar", r"harvest",
            # Tamil
            r"விவசாயம்", r"நெல்", r"பயிர்", r"நீர்பாசனம்", r"விவசாயி",
        ],
        "weight": 1.0
    },
    "environment": {
        "keywords": [
            r"green", r"solar", r"renewable", r"wind energy", r"ev\b",
            r"electric bus", r"pollution", r"conservation", r"forest",
            r"tree", r"plantation", r"climate",
            # Tamil
            r"சூரிய", r"மரம்", r"சுற்றுச்சூழல்",
        ],
        "weight": 1.0
    },
    "social-welfare": {
        "keywords": [
            r"pension", r"housing", r"ration", r"free\b", r"scheme",
            r"welfare", r"benefit", r"subsidy", r"distribution",
            r"rice\b", r"pongal", r"diwali", r"festival kit",
            # Tamil
            r"இலவச", r"உதவி", r"ஓய்வூதியம்", r"வீடு", r"அரிசி",
            r"திட்டம்",
        ],
        "weight": 1.0
    },
    "sports-culture": {
        "keywords": [
            r"stadium", r"sports", r"hockey", r"cricket", r"football",
            r"kabaddi", r"chess", r"olympic", r"athlete", r"cultural",
            r"museum", r"library", r"festival", r"concert",
            # Tamil
            r"விளையாட்டு", r"அரங்கம்", r"கலை", r"திருவிழா",
        ],
        "weight": 1.0
    },
    "tamil-history": {
        "keywords": [
            r"archaeological", r"excavation", r"keezhadi", r"sangam",
            r"heritage", r"ancient", r"dravidian", r"indus valley",
            r"adichanallur", r"porunai", r"museum",
            # Tamil
            r"தொல்லியல்", r"அருங்காட்சியகம்", r"பாரம்பரியம்",
            r"சங்ககாலம்", r"கீழடி",
        ],
        "weight": 1.0
    },
}

# Event type patterns
EVENT_PATTERNS = {
    "mou_signed": [r"mou\b", r"signed", r"agreement", r"partner", r"புரிந்துணர்வு"],
    "ground_breaking": [r"foundation", r"ground.?breaking", r"bhoomi", r"laying", r"அடிக்கல்"],
    "inauguration": [r"inaugurat", r"open", r"launch", r"திறப்பு", r"தொடங்கி"],
    "progress_update": [r"progress", r"update", r"status", r"under.?construction"],
    "expansion": [r"expand", r"extension", r"phase.?\d", r"additional"],
    "production_start": [r"production", r"roll.?out", r"manufact", r"உற்பத்தி"],
    "scheme_launch": [r"scheme", r"program", r"initiative", r"திட்டம்"],
    "beneficiary_update": [r"beneficiar", r"distribut", r"receiv", r"பயனாளி"],
    "milestone": [r"milestone", r"achiev", r"record", r"lakh", r"crore.*reach"],
}

# Investment extraction patterns
INVESTMENT_PATTERNS = [
    (r"(?:rs\.?|₹)\s*([\d,]+)\s*(?:crore|cr)", "crore"),
    (r"([\d,]+)\s*(?:crore|cr)(?:\s+(?:rupees|rs))?", "crore"),
    (r"([\d,]+)\s*(?:lakh|lac)\s*(?:crore|cr)", "lakh_crore"),
    (r"\$([\d,]+)\s*(?:million|mn|m)\b", "million_usd"),
    (r"\$([\d,]+)\s*(?:billion|bn|b)\b", "billion_usd"),
]

# Job extraction patterns
JOB_PATTERNS = [
    r"([\d,]+)\s*(?:jobs?|employment)",
    r"employ(?:ment|ing)?\s+(?:of\s+)?([\d,]+)",
    r"([\d,]+)\s*(?:direct|indirect)?\s*jobs?",
    r"create\s+([\d,]+)\s*(?:new\s+)?jobs?",
]

# Location patterns (TN districts)
TN_DISTRICTS = [
    "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem",
    "tirunelveli", "tiruppur", "vellore", "erode", "thoothukkudi", "thoothukudi",
    "dindigul", "thanjavur", "ranipet", "sivaganga", "virudhunagar", "namakkal",
    "cuddalore", "kanchipuram", "tiruvallur", "chengalpattu", "villupuram",
    "tiruvannamalai", "krishnagiri", "dharmapuri", "ariyalur", "perambalur",
    "nagapattinam", "mayiladuthurai", "karur", "pudukkottai", "ramanathapuram",
    "theni", "nilgiris", "kanyakumari", "tenkasi", "tirupattur", "kallakurichi",
]


def log(msg: str):
    """Log message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def classify_category(text: str) -> Tuple[str, float]:
    """Classify tweet into category with confidence."""
    text_lower = text.lower()
    scores = defaultdict(float)

    for category, config in CATEGORY_PATTERNS.items():
        for pattern in config["keywords"]:
            matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
            if matches:
                scores[category] += matches * config["weight"]

    if not scores:
        return "uncategorized", 0.3

    # Get top category
    top_category = max(scores.items(), key=lambda x: x[1])
    total_score = sum(scores.values())

    # Confidence based on dominance and absolute score
    confidence = min(0.95, (top_category[1] / max(total_score, 1)) * 0.7 + min(top_category[1] / 5, 0.3))

    return top_category[0], round(confidence, 2)


def classify_event_type(text: str) -> str:
    """Classify event type."""
    text_lower = text.lower()

    for event_type, patterns in EVENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return event_type

    return "other"


def extract_investment(text: str) -> Optional[dict]:
    """Extract investment amount."""
    for pattern, unit in INVESTMENT_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            try:
                amount = float(amount_str)
                if unit == "lakh_crore":
                    amount *= 100000  # Convert to crore
                    unit = "crore"
                elif unit == "million_usd":
                    return {"amount": amount, "currency": "USD", "unit": "million"}
                elif unit == "billion_usd":
                    return {"amount": amount, "currency": "USD", "unit": "billion"}

                return {"amount": amount, "currency": "INR", "unit": "crore"}
            except ValueError:
                continue
    return None


def extract_jobs(text: str) -> Optional[int]:
    """Extract job creation numbers."""
    for pattern in JOB_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            jobs_str = match.group(1).replace(",", "")
            try:
                jobs = int(jobs_str)
                if 10 <= jobs <= 1000000:
                    return jobs
            except ValueError:
                continue
    return None


def extract_location(text: str) -> Optional[dict]:
    """Extract location from text."""
    text_lower = text.lower()

    for district in TN_DISTRICTS:
        if district in text_lower:
            return {"district": district.title()}

    return None


def extract_entity_name(text: str, category: str) -> Optional[str]:
    """Extract entity/project name from text."""
    # Common patterns for entity extraction
    patterns = [
        r"(?:inaugurat|launch|open)(?:ed|ing|s)?\s+(?:the\s+)?([A-Z][A-Za-z\s]+(?:Plant|Factory|Hospital|College|School|Project|Scheme|Stadium|Terminal|Metro|Road))",
        r"([A-Z][A-Za-z\s]+(?:Phase\s+\d+|Corridor\s+\d+))",
        r"(?:mou|agreement)\s+(?:with|for)\s+([A-Z][A-Za-z\s]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()

    return None


def normalize_name(name: str) -> str:
    """Normalize entity name for matching."""
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', '-', name.strip())
    return name


def parse_date(date_str: str) -> str:
    """Parse Twitter date to ISO format."""
    if not date_str:
        return ""
    try:
        dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
        return dt.strftime("%Y-%m-%d")
    except:
        return date_str[:10] if len(date_str) >= 10 else ""


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
            pass

    return enriched_by_tweet


def classify_tweet(tweet: dict, enriched_data: dict) -> dict:
    """Classify a single tweet."""
    tweet_id = tweet.get("id", "")
    handle = tweet.get("handle", "")
    text = tweet.get("text", "")

    # Combine with enriched data if available
    enriched = enriched_data.get(tweet_id, [])
    full_text = text
    for e in enriched:
        if e.get("pageTitle"):
            full_text += " " + e["pageTitle"]
        if e.get("extractedData", {}).get("summary"):
            full_text += " " + e["extractedData"]["summary"]

    # Classify
    category, confidence = classify_category(full_text)
    event_type = classify_event_type(full_text)

    # Extract data
    investment = extract_investment(full_text)
    jobs = extract_jobs(full_text)
    location = extract_location(full_text)
    entity_name = extract_entity_name(text, category)

    # Build entry
    entry = {
        "entryId": f"{handle}-{tweet_id}",
        "sourceHandle": handle,
        "sourceTweetId": tweet_id,
        "date": parse_date(tweet.get("created_at", "")),
        "tweetText": text,
        "fxUrl": f"https://fxtwitter.com/{handle}/status/{tweet_id}",
        "category": category,
        "eventType": event_type,
        "confidence": confidence,
    }

    # Entity
    if entity_name:
        entry["extractedEntity"] = {
            "name": entity_name,
            "nameNormalized": normalize_name(entity_name),
            "type": "project" if "phase" in entity_name.lower() else "other",
        }
        if location:
            entry["extractedEntity"]["location"] = location

    # Numbers
    numbers = {}
    if investment:
        numbers["investmentCrore"] = investment["amount"] if investment["unit"] == "crore" else None
    if jobs:
        numbers["jobsCreated"] = jobs
    if numbers:
        entry["extractedNumbers"] = {k: v for k, v in numbers.items() if v}

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
    if confidence < 0.5:
        flags.append("low_confidence")
    if category == "uncategorized":
        flags.append("needs_review")
    if flags:
        entry["flags"] = flags

    return entry


def is_relevant(tweet: dict) -> bool:
    """Check if tweet is relevant for classification."""
    text = tweet.get("text", "").lower()
    handle = tweet.get("handle", "").lower()

    # Priority handles
    priority_handles = ["cmotamilnadu", "mkstalin", "trbraja", "tndiprnews",
                       "aboraboraja", "guidance_tn", "tnindmin"]
    if any(h in handle for h in priority_handles):
        return True

    # Keywords
    keywords = ["crore", "inaugurat", "launch", "scheme", "மெட்ரோ", "முதலீடு",
               "கோடி", "திட்டம்", "government", "minister", "cm ", "mou",
               "investment", "factory", "hospital", "school", "metro"]
    return any(kw in text for kw in keywords)


def main():
    parser = argparse.ArgumentParser(description="Rule-based tweet classification")
    parser.add_argument("--test", action="store_true", help="Test on 10 tweets")
    parser.add_argument("--all", action="store_true", help="Process all tweets")
    parser.add_argument("--batch", type=int, help="Process specific batch")
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

    # Filter relevant tweets
    relevant_tweets = [t for t in tweets if is_relevant(t)]
    log(f"Filtered to {len(relevant_tweets)} relevant tweets")

    if args.test:
        # Test mode
        test_tweets = relevant_tweets[:10]
        log(f"Testing on {len(test_tweets)} tweets...")

        results = [classify_tweet(t, enriched_data) for t in test_tweets]

        print("\n" + "=" * 60)
        print("TEST RESULTS")
        print("=" * 60)

        for r in results:
            print(f"\n@{r['sourceHandle']}: {r['tweetText'][:70]}...")
            print(f"  Category: {r['category']} (confidence: {r['confidence']:.0%})")
            print(f"  Event: {r['eventType']}")
            if r.get('extractedEntity'):
                print(f"  Entity: {r['extractedEntity'].get('name', 'N/A')}")
            if r.get('extractedNumbers'):
                print(f"  Numbers: {r['extractedNumbers']}")
            if r.get('flags'):
                print(f"  Flags: {r['flags']}")

        # Category distribution
        print("\n" + "-" * 40)
        print("Category Distribution:")
        cats = defaultdict(int)
        for r in results:
            cats[r['category']] += 1
        for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
            print(f"  {cat}: {count}")

        return 0

    # Full processing
    VERIFIED_DIR.mkdir(parents=True, exist_ok=True)

    if args.batch is not None:
        start = args.batch * BATCH_SIZE
        tweets_to_process = relevant_tweets[start:start + BATCH_SIZE]
    else:
        tweets_to_process = relevant_tweets

    log(f"Classifying {len(tweets_to_process)} tweets...")

    results = []
    stats = defaultdict(int)

    for i, tweet in enumerate(tweets_to_process):
        entry = classify_tweet(tweet, enriched_data)
        results.append(entry)
        stats[entry['category']] += 1

        if (i + 1) % 500 == 0:
            log(f"Processed {i + 1}/{len(tweets_to_process)}...")

    # Save results
    output_file = VERIFIED_DIR / "all_verified.json"
    with open(output_file, "w") as f:
        json.dump({
            "processedAt": datetime.now(timezone.utc).isoformat(),
            "totalTweets": len(results),
            "categoryStats": dict(stats),
            "entries": results
        }, f, indent=2, ensure_ascii=False)

    log(f"\n=== CLASSIFICATION COMPLETE ===")
    log(f"Total classified: {len(results)}")
    log(f"\nCategory distribution:")
    for cat, count in sorted(stats.items(), key=lambda x: -x[1]):
        pct = count / len(results) * 100
        log(f"  {cat}: {count} ({pct:.1f}%)")

    log(f"\nSaved to {output_file}")
    return 0


if __name__ == "__main__":
    exit(main())
