# Twitter Data Extraction Plan (v4 - Wayback + Workers)

## Overview

Multi-phase extraction pipeline using Wayback Machine for tweet ID discovery, then NalaN workers for parallel data extraction.

**Constraints:**
- Models available: Gemini CLI (gemini-3-pro-preview), Anthropic (Claude Haiku)
- Codex and OpenRouter exhausted
- Use NalaN workers for parallelization
- fxTwitter API requires tweet IDs (no timeline endpoint)

**Key Improvements (v4):**
- **Phase 0: Wayback Machine tweet ID discovery** (addresses critical gap)
- NalaN worker orchestration with inline tasks (CRITICAL)
- Mixed model strategy (Gemini for reasoning, Haiku for extraction)
- Batch processing (50-100 tweets per worker, not 1:1)
- Error handling with retry logic
- Data persistence via one-file-per-tweet structure

---

## Phase 0: Tweet ID Discovery (NEW - CRITICAL)

### Problem Solved
fxTwitter API has no timeline endpoint. Web search returns <10% of historical tweets.
**Solution:** Use Wayback Machine's archived snapshots of Twitter profiles.

### Tool: waybacktweets
```bash
# Install
pipx install waybacktweets

# Extract tweet IDs for a handle (2021-2026)
waybacktweets --from 20210101 --to 20260201 CMOTamilnadu -o json > tweet_ids/CMOTamilnadu.json
waybacktweets --from 20210101 --to 20260201 TRBRajaa -o json > tweet_ids/TRBRajaa.json
```

### Expected Coverage
- Wayback Machine captures ~30-50% of government account tweets
- Government accounts are frequently archived due to public interest
- Supplemented by web search for recent tweets (2025-2026)

### Output Structure
```
data/twitter-extraction/
├── tweet_ids/
│   ├── CMOTamilnadu.json      # Wayback extracted IDs
│   ├── TRBRajaa.json
│   ├── TNDIPRNEWS.json
│   └── ...
```

### Phase 0 Execution (12 parallel workers)
```bash
# Worker per handle - Gemini for web interaction
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" \
  --provider google --model gemini-3-pro-preview \
  --role IDDiscovery \
  --task 'INLINE: Tweet ID Discovery for @CMOTamilnadu

Run: waybacktweets --from 20210101 --to 20260201 CMOTamilnadu

Parse the output and extract all tweet IDs.
Output format: One tweet ID per line.
Expected: 500-2000 tweet IDs over 5 years.

If waybacktweets not installed, use curl to query Wayback CDX API directly:
curl "https://web.archive.org/cdx/search/cdx?url=twitter.com/CMOTamilnadu/status/*&output=json&fl=original"

Extract tweet IDs from URLs matching pattern: twitter.com/CMOTamilnadu/status/{ID}'
```

---

## NalaN Worker Orchestration (CRITICAL)

### Worker Spawn Command
```bash
python3 ~/.nalan/scripts/worker-spawn.py \
  --project "$PWD" \
  --role <role> \
  --task '<INLINE TASK - ALL CONTEXT MUST BE IN THIS STRING>'
```

### CRITICAL: Inline Task Requirement
**Workers run in isolated git worktrees and CANNOT access project files.**

❌ WRONG (will fail):
```bash
--task "Read workers/wave1-fetch/WORKER-PROMPT.md and execute it"
```

✅ CORRECT (inline everything):
```bash
--task 'INLINE TASK - NO FILE ACCESS NEEDED

Use curl to fetch tweets from fxTwitter API.
API: curl -s "https://api.fxtwitter.com/{HANDLE}/status/{ID}"

Tweet IDs to fetch:
- 1977615850397106201
- 1978453632665420261

Extract: tweet.text, tweet.created_at, tweet.author.screen_name
Output summary of findings.'
```

### Model Selection Strategy

| Wave | Task Type | Model | Reason |
|------|-----------|-------|--------|
| Wave 1 | API fetching (curl) | **Haiku** | Fast, cheap, curl-capable |
| Wave 2 | Link enrichment | **Haiku** | Simple fetch + parse |
| Wave 3 | Classification | **Gemini 2.5 Pro** | Better reasoning for Tamil |
| Wave 4 | Aggregation | **Gemini 2.5 Pro** | Entity matching needs reasoning |
| Wave 5 | Deduplication | **Haiku** | Pattern matching, fast |

### Spawn with Specific Model
```bash
# Use Haiku (default, fast, cheap)
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" --task '...'

# Use Gemini (for complex reasoning)
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" \
  --provider google --model gemini-2.5-pro-preview \
  --task '...'
```

### Parallel Spawning (with conflict override)
```bash
# First worker
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" --role Fetcher \
  --task 'Fetch @TRBRajaa tweets...'

# Subsequent workers need --allow-conflicts
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" --role Fetcher \
  --allow-conflicts \
  --task 'Fetch @TNDIPRNEWS tweets...'
```

### Check Worker Status
```bash
# List all active workers
ls ~/.nalan/agents/active/

# Check specific worker status
cat ~/.nalan/agents/active/{worker-id}/status.json

# View worker results
cat ~/.nalan/agents/active/{worker-id}/results.md

# Check if worker process is running
ps aux | grep {worker-id}

# View launcher log
cat ~/.nalan/agents/active/{worker-id}/launcher.log
```

### Worker Lifecycle
```
SPAWNED → HANDOFF → RUNNING → COMPLETED/FAILED
   │          │         │
   │          │         └── Results in results.md
   │          └── Claude picks up task
   └── Worker directory created
```

### Collect Worker Outputs
```bash
# After all workers complete, merge results
for dir in ~/.nalan/agents/active/nalan-*; do
  if [ -f "$dir/results.md" ]; then
    echo "=== $(basename $dir) ==="
    cat "$dir/results.md"
  fi
done > data/twitter-extraction/raw/merged-worker-output.md
```

---

## Target Accounts (12 total)

| Handle | Focus | Priority | Expected Volume |
|--------|-------|----------|-----------------|
| @CMOTamilnadu | All categories | CRITICAL | 100-200/quarter |
| @mkstalin | All categories | CRITICAL | 100-200/quarter |
| @TNDIPRNEWS | ALL categories | CRITICAL | 50-100/quarter |
| @TRBRajaa | Industries | CRITICAL | 30-50/quarter |
| @Guidance_TN | Industries | CRITICAL | 30-50/quarter |
| @TNIndMin | Industries | HIGH | 20-40/quarter |
| @TN_SIPCOT | Industries, Infrastructure | HIGH | 20-40/quarter |
| @SIPCOTTN | Industries, Infrastructure | MEDIUM | 10-20/quarter |
| @Udhaystalin | Sports, Youth, Welfare | HIGH | 30-50/quarter |
| @ptrmadurai | IT, Industries | HIGH | 20-40/quarter |
| @TNeGA_Official | IT, Digital | MEDIUM | 10-20/quarter |
| @ELCOT_TN | IT, Industries | MEDIUM | 10-20/quarter |

---

## Wave Architecture

```
WAVE 1: TWEET FETCHING (12 workers, sequential per handle)
    │
    │  CRITICAL: Date-partitioned searches (20 quarters)
    │  CRITICAL: Tamil + English keywords
    │  Rate limit: 3-5s between searches, max 20/min
    │
    ├── Worker 1: @CMOTamilnadu (Q2-2021 → Q1-2026)
    ├── Worker 2: @mkstalin (Q2-2021 → Q1-2026)
    ├── ... (10 more)
    ↓
    Output: raw/{handle}.json (with quarter tracking)

WAVE 2: LINK ENRICHMENT (N workers, grouped by domain)
    │
    │  Rate limit: 2s between fetches per domain
    │
    ├── Worker pool processes external links from Wave 1
    └── Groups by domain for efficiency
    ↓
    Output: enriched/{domain}/{url-hash}.json

WAVE 3: CLASSIFICATION & VERIFICATION (12 workers)
    │
    │  CRITICAL: OCR/multimodal for image tweets
    │  CRITICAL: Quote verification for all numbers
    │  Bilingual classification (Tamil + English)
    │
    ├── Worker per account processes its tweets
    ├── Extracts text from images (press releases, posters)
    ├── Classifies into 10 categories
    └── Every number must have source quote
    ↓
    Output: verified/{handle}-verified.json

WAVE 4: AGGREGATION (10 workers, one per category)
    │
    │  Merges multiple tweets into single entities
    │  Example: VinFast MoU (2024) + ground breaking (2025) = 1 entity
    │
    ├── Worker 1: infrastructure
    ├── Worker 2: industries
    ├── Worker 3: education
    ├── Worker 4: healthcare
    ├── Worker 5: employment
    ├── Worker 6: agriculture
    ├── Worker 7: environment
    ├── Worker 8: social-welfare
    ├── Worker 9: sports-culture
    └── Worker 10: tamil-history
    ↓
    Output: aggregated/{category}-aggregated.json

WAVE 5: DUPLICATE DETECTION (10 workers, one per category)
    │
    │  CRITICAL: Category-specific dedup keys
    │  - Industries: Company + District + Sector
    │  - Infrastructure: Project Type + Location + Phase
    │  - Schemes: Scheme Name + Beneficiary Group
    │
    ├── Compare against existing database
    ├── Generate: exact matches, partial matches, new candidates
    └── Provide source additions for matched entries
    ↓
    Output: duplicates/{category}-duplicates.json
```

---

## Critical Features (v2)

### 1. Date-Partitioned Search (Wave 1)
Search by quarter to avoid search engine caps:
```
site:x.com {HANDLE} after:2024-01-01 before:2024-04-01 inaugurat
site:x.com {HANDLE} after:2024-01-01 before:2024-04-01 திட்டம்
```

### 2. Tamil Keyword Support
Required Tamil keywords in all searches:
- திட்டம் (scheme), தொடங்கினார் (started), முதலீடு (investment)
- அடிக்கல் (foundation stone), புரிந்துணர்வு (MoU), திறப்பு (opening)
- கோடி (crore), வேலை (job), தொழிற்சாலை (factory)

### 3. Image Processing (Wave 3)
For tweets with media:
- Use multimodal/OCR to extract text from images
- TN Gov posts press releases as images
- Budget/investment often in poster graphics

### 4. Quote Verification (Wave 3)
Every extracted number must have:
```json
{
  "investmentCrore": 16600,
  "investmentQuote": "₹16,600 crore investment",
  "investmentSource": "tweet|image|enriched_link"
}
```

### 5. Category-Specific Dedup (Wave 5)

| Category | Primary Key | Secondary |
|----------|-------------|-----------|
| Industries | Company + District + Sector | Investment ±20% |
| Infrastructure | Project Type + Location + Phase | Budget ±30% |
| Education | Scheme Name | Beneficiary Group |
| Healthcare | Scheme Name OR Hospital + District | Coverage |
| Social Welfare | Scheme Name + Beneficiary Category | Benefit amount |

---

## Directory Structure

```
data/twitter-extraction/
├── EXTRACTION-PLAN.md          # This file (you are here)
├── TEST-VALIDATION-REPORT.md   # Test run results
│
├── scripts/                    # Orchestration & utilities
│   ├── orchestrate-extraction.sh   # Main pipeline orchestrator
│   ├── monitor-dashboard.sh        # Live worker monitoring
│   ├── merge-results.py            # Merge worker outputs
│   └── validate-data.py            # Schema & business rule validation
│
├── schemas/                    # JSON schemas for validation
│   ├── raw-tweet.schema.json
│   ├── enriched-link.schema.json
│   ├── verified-entry.schema.json
│   ├── aggregated-entity.schema.json
│   └── duplicate-report.schema.json
│
├── tweet_ids/                  # Phase 0 output (ID discovery)
│   ├── all_ids.txt             # Merged unique IDs
│   ├── all_ids_merged.txt      # After merge-results.py
│   └── batch_*                 # Split batches for Phase 1
│
├── raw/                        # Phase 1 output (tweet fetch)
│   ├── API-TEST.json           # Test run data
│   └── all_tweets_merged.json  # After merge-results.py
│
├── enriched/                   # Phase 2 output (link enrichment)
├── verified/                   # Phase 3 output (classification)
├── aggregated/                 # Phase 4 output (entity aggregation)
│   ├── industries-test-aggregated.json
│   ├── education-test-aggregated.json
│   └── ...
│
├── duplicates/                 # Phase 5 output (dedup reports)
│
├── logs/                       # Pipeline logs
│   ├── phase0-results.md       # Merged Phase 0 worker outputs
│   ├── phase1-results.md       # Merged Phase 1 worker outputs
│   └── phase0-merge-summary.json
│
└── monitoring/                 # Dashboard state (optional)
```

---

## Risk Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Search returns <50% tweets | Medium→Low | High | Date-partitioned quarterly searches |
| IP ban/rate limit | Medium | High | 3-5s delays, sequential within handles |
| Image-only announcements | High | Medium | OCR/multimodal in Wave 3 |
| Tamil content loss | Medium→Low | Medium | Tamil keywords, bilingual prompts |
| Number hallucination | Medium→Low | High | Quote verification required |
| False duplicate matches | Medium→Low | Medium | Category-specific dedup keys |

---

## Success Criteria

- [ ] Wave 1: All 12 accounts × 20 quarters searched
- [ ] Wave 1: Expected tweet counts achieved (validation)
- [ ] Wave 2: 80%+ external links enriched
- [ ] Wave 3: All tweets classified with confidence scores
- [ ] Wave 3: Images processed for media tweets
- [ ] Wave 3: All numbers have quote verification
- [ ] Wave 4: Aggregation complete for all 10 categories
- [ ] Wave 5: Category-appropriate dedup keys used
- [ ] Wave 5: Duplicate report generated with action items
- [ ] Final: Verification queue ready for human review

---

## Execution

See `ORCHESTRATOR.md` for spawn commands and wave execution instructions.

---

## Wave 1 Execution Example

### Step 1: Gather Tweet IDs
Tweet IDs must be discovered first (fxTwitter API requires IDs, no timeline access).

**Option A: Web Search (main context only)**
```bash
# In main L0 context (has WebSearch access)
WebSearch: "site:x.com TRBRajaa investment crore 2024"
```

**Option B: Pre-curated ID list**
Build tweet ID database from:
- News articles referencing tweets
- Web archive snapshots
- Previous extractions

### Step 2: Spawn Fetch Workers
```bash
# Worker 1: TRBRajaa (3 tweet IDs)
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" --role Fetcher \
  --task 'INLINE TASK - Tweet Fetcher for @TRBRajaa

Use curl to fetch tweets from fxTwitter API:

curl -s "https://api.fxtwitter.com/TRBRajaa/status/1977615850397106201"
curl -s "https://api.fxtwitter.com/TRBRajaa/status/1978453632665420261"
curl -s "https://api.fxtwitter.com/TRBRajaa/status/1944692310614347851"

For each response, extract:
- tweet.text (full text)
- tweet.created_at (date)
- tweet.author.screen_name
- Any investment amounts (Rs X crore)
- Any job numbers

Output as structured summary.'

# Worker 2: TNDIPRNEWS (need --allow-conflicts)
python3 ~/.nalan/scripts/worker-spawn.py --project "$PWD" --role Fetcher \
  --allow-conflicts \
  --task 'INLINE TASK - Tweet Fetcher for @TNDIPRNEWS
...same pattern...'
```

### Step 3: Monitor Progress
```bash
# Check all worker statuses
for id in $(ls ~/.nalan/agents/active/ | grep nalan-); do
  echo "=== $id ==="
  cat ~/.nalan/agents/active/$id/status.json | jq '.state'
done

# Wait for completion (poll every 30s)
while true; do
  running=$(cat ~/.nalan/agents/active/*/status.json 2>/dev/null | grep -c '"RUNNING"')
  echo "Workers running: $running"
  [ "$running" -eq 0 ] && break
  sleep 30
done
```

### Step 4: Collect Results
```bash
# Merge all results
mkdir -p data/twitter-extraction/raw
for dir in ~/.nalan/agents/active/nalan-*; do
  handle=$(cat "$dir/identity.json" | jq -r '.task' | grep -oP '@\w+' | head -1)
  if [ -f "$dir/results.md" ]; then
    cp "$dir/results.md" "data/twitter-extraction/raw/worker-${handle}.md"
  fi
done
```

---

## Troubleshooting

### Worker Spawns But Doesn't Run
**Symptom:** `status.json` shows HANDOFF but never progresses
**Cause:** Launcher script failed silently
**Fix:** Check `launcher.log` and verify Claude CLI is accessible

### Worker Can't Access Files
**Symptom:** "File not found" errors
**Cause:** Workers run in isolated worktrees
**Fix:** Pass ALL required context inline in the `--task` string

### Permission Denied for WebSearch/WebFetch
**Symptom:** "Permission auto-denied (prompts unavailable)"
**Cause:** Sidechain agents don't have interactive permissions
**Fix:** Use `curl` via Bash instead of WebFetch

### Scope Conflict Error
**Symptom:** "scope conflict detected with active worksets"
**Cause:** Multiple workers on same project root
**Fix:** Add `--allow-conflicts` flag (safe for non-overlapping file access)

---

## Lessons Learned

1. **Inline tasks are mandatory** - Workers can't read project files
2. **curl works, WebFetch doesn't** - Use Bash for API calls in workers
3. **Tweet IDs required** - fxTwitter API has no timeline/search endpoint
4. **Haiku is fast and cheap** - Good for fetch/parse tasks
5. **Gemini for reasoning** - Better for Tamil classification and entity matching
6. **--allow-conflicts is safe** - When workers touch different files

---

## Quick Start

### Run Full Pipeline
```bash
cd /Users/b2sell/claude-projects/projects/dravidamodel2026
./data/twitter-extraction/scripts/orchestrate-extraction.sh
```

### Run Specific Phase
```bash
./data/twitter-extraction/scripts/orchestrate-extraction.sh --phase 0  # ID discovery
./data/twitter-extraction/scripts/orchestrate-extraction.sh --phase 1  # Tweet fetch
```

### Dry Run (Preview Only)
```bash
./data/twitter-extraction/scripts/orchestrate-extraction.sh --dry-run
```

### Monitor Workers
```bash
./data/twitter-extraction/scripts/monitor-dashboard.sh          # Live dashboard
./data/twitter-extraction/scripts/monitor-dashboard.sh --once   # Single snapshot
```

### Merge Results After Workers Complete
```bash
python3 data/twitter-extraction/scripts/merge-results.py --all
```

### Validate Extracted Data
```bash
python3 data/twitter-extraction/scripts/validate-data.py
python3 data/twitter-extraction/scripts/validate-data.py --phase 4  # Validate specific phase
```

---

## Cost Estimates

| Phase | Workers | Model | Est. Cost |
|-------|---------|-------|-----------|
| Phase 0 (ID Discovery) | 12 | Gemini 3 Pro | ~$1.20 |
| Phase 1 (Tweet Fetch) | ~200 (50 tweets/worker) | Haiku | ~$4.00 |
| Phase 2 (Link Enrich) | ~50 | Haiku | ~$1.00 |
| Phase 3 (Classification) | 12 | Gemini 3 Pro | ~$1.20 |
| Phase 4 (Aggregation) | 10 | Gemini 3 Pro | ~$1.00 |
| Phase 5 (Deduplication) | 10 | Haiku | ~$0.20 |
| **TOTAL** | ~294 | Mixed | **~$8.60** |

*Assumes ~10K tweets discovered, processed in batches of 50.*

---

## Test Results (2026-02-16)

Pipeline validated end-to-end with 10 tweets:

| Metric | Value |
|--------|-------|
| Tweets fetched | 10 |
| Categories identified | 5 |
| Entities extracted | 10+ |
| Total investment | Rs. 134,348 crore |
| Total jobs | 117,800 |
| Pipeline confidence | 8.5/10 |

See `TEST-VALIDATION-REPORT.md` for full details.
