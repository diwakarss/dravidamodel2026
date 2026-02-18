# Wave 1: Tweet Fetcher Worker

## Role
You are a research worker extracting tweets from a Tamil Nadu Government Twitter account.

## Your Task
Fetch all relevant tweets from **{HANDLE}** between **May 7, 2021** and **February 16, 2026**.

## CRITICAL: Use fxTwitter API

**Use the fxTwitter API endpoint - it works without authentication:**

```
https://api.fxtwitter.com/{HANDLE}/status/{TWEET_ID}
```

This returns JSON with: tweet text, date, author, media URLs, engagement stats.

**DO NOT use:**
- `site:x.com` searches (don't work)
- `fxtwitter.com` web URLs (redirect to x.com)
- Nitter mirrors (frequently down)

## Instructions

### 1. Finding Tweet IDs

Search for news/articles that mention tweet URLs:

```
"{HANDLE}" twitter inauguration 2024
"CMOTamilnadu" twitter MoU investment crore
site:thehindu.com "x.com/mkstalin" OR "twitter.com/mkstalin"
Tamil Nadu CM Stalin tweet announcement
```

Extract tweet IDs from URLs like:
- `https://x.com/TNDIPRNEWS/status/1825962201745694968`
- `https://twitter.com/mkstalin/status/1234567890123456789`

Tweet ID is the number after `/status/`

### 2. Fetching via fxTwitter API

For each tweet ID found:

```
https://api.fxtwitter.com/{HANDLE}/status/{TWEET_ID}
```

Example:
```
https://api.fxtwitter.com/TNDIPRNEWS/status/1825962201745694968
```

The API returns:
- Tweet text
- Date/time posted
- Author info
- Media URLs (images/videos)
- Engagement (likes, retweets)
- Mentioned accounts

### 3. Date-Partitioned Searches

Search by quarter to maximize coverage:

| Period | Search Pattern |
|--------|----------------|
| 2024-Q3 | `"{HANDLE}" twitter July 2024 OR August 2024 inauguration` |
| 2024-Q4 | `"{HANDLE}" twitter October 2024 MoU investment` |

**Required Time Windows (20 total):**
- 2021-Q2 through 2026-Q1

### 4. Keywords to Match (English + Tamil)

```
English:
  inaugurat, foundation, MoU, investment, crore, billion, million,
  jobs, employment, scheme, launch, complet, opens, starts,
  metro, flyover, bridge, road, highway, hospital, college,
  factory, plant, manufacturing, park, housing, bus, port,
  agreement, signed, ground breaking, bhoomi puja

Tamil:
  திட்டம் (scheme)
  தொடங்கினார் (started/launched)
  தொடங்கி (inaugurated)
  முதலமைச்சர் (Chief Minister)
  முதலீடு (investment)
  வேலை (job)
  கோடி (crore)
  அடிக்கல் (foundation stone)
  புரிந்துணர்வு (MoU)
  ஒப்பந்தம் (agreement)
  திறப்பு (opening)
  திறந்து வைத்தார் (declared open)
```

### 5. Rate Limiting

- Wait 2-3 seconds between API calls
- If rate limited, wait 60 seconds
- Maximum 30 API calls per minute
- Process one quarter at a time

### 6. For Each Tweet, Extract:

```json
{
  "id": "1825962201745694968",
  "date": "2024-08-20",
  "text": "full tweet text from API",
  "fxUrl": "https://fxtwitter.com/TNDIPRNEWS/status/1825962201745694968",
  "apiUrl": "https://api.fxtwitter.com/TNDIPRNEWS/status/1825962201745694968",
  "originalUrl": "https://x.com/TNDIPRNEWS/status/1825962201745694968",
  "externalLinks": ["URLs mentioned in tweet"],
  "mentions": ["@CMOTamilnadu", "@mkstalin"],
  "hashtags": ["#TamilNadu", "#Investment"],
  "hasMedia": true,
  "mediaType": "image",
  "mediaUrls": ["https://pbs.twimg.com/media/..."],
  "engagement": {
    "likes": 70,
    "retweets": 49,
    "views": 1615
  },
  "matchedKeywords": ["investment", "conclave"],
  "language": "en",
  "quarter": "2024-Q3"
}
```

### 7. Output Format

Write results to: `raw/{HANDLE}.json`

```json
{
  "account": "{HANDLE}",
  "extractedAt": "2026-02-16T...",
  "dateRange": {
    "from": "2021-05-07",
    "to": "2026-02-16"
  },
  "apiEndpoint": "https://api.fxtwitter.com",
  "quartersSearched": [
    {"quarter": "2024-Q3", "searchCount": 15, "tweetsFound": 23, "apiCalls": 23},
    {"quarter": "2024-Q4", "searchCount": 15, "tweetsFound": 31, "apiCalls": 31}
  ],
  "totalSearches": 300,
  "totalApiCalls": 450,
  "totalTweets": 450,
  "tweetsByLanguage": {
    "en": 280,
    "ta": 120,
    "mixed": 50
  },
  "tweetsWithMedia": 180,
  "tweets": [
    // array of tweet objects
  ]
}
```

### 8. Quality Checks

- No duplicate tweet IDs
- All dates within range
- Extract ALL external links from tweet text
- Note all media URLs (images processed in Wave 3)
- Track language (based on text content)
- **Expected: 50-150 tweets per quarter for high-volume accounts**

### 9. Progress Tracking

Save checkpoint after each quarter:
```json
{
  "checkpoint": "2024-Q2",
  "tweetsCollected": 234,
  "apiCallsMade": 234,
  "lastUpdated": "2026-02-16T10:30:00Z"
}
```

## Handle-Specific Notes

### @CMOTamilnadu / @mkstalin (HIGH VOLUME)
- Expect 100-200 tweets per quarter
- Many photo/video posts
- Heavy Tamil content

### @TNDIPRNEWS (OFFICIAL)
- Official press releases
- Covers ALL categories
- Often has image-based announcements

### @TRBRajaa / @Guidance_TN / @TNIndMin
- Focus on MoUs, investments, industrial parks
- GIM (Global Investors Meet) announcements
- More English content

### @Udhaystalin
- Sports, youth initiatives
- Welfare schemes
- Mix of Tamil/English

### @TN_SIPCOT / @SIPCOTTN
- Industrial parks, land allocation
- Company-specific announcements

### @ptrmadurai / @ELCOT_TN / @TNeGA_Official
- IT parks, digital initiatives
- Tech sector investments

---

## Output File Location
`/Users/b2sell/claude-projects/projects/dravidamodel2026/data/twitter-extraction/raw/{HANDLE}.json`
