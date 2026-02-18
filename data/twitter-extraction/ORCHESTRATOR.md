# Twitter Extraction Orchestrator

## Overview
This document serves as the control script for orchestrating the 5-wave Twitter extraction pipeline. Execute waves in sequence, spawning parallel workers within each wave.

## Prerequisites
- Gemini CLI available
- Anthropic Haiku models available
- NalaN worker system operational

## Wave Execution Commands

### Wave 1: Tweet Fetching (12 parallel workers)

Spawn one worker per handle:

```bash
# Execute these in parallel
/nalan:spawn "Fetch tweets from @CMOTamilnadu 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @mkstalin 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @TNDIPRNEWS 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @TRBRajaa 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @Guidance_TN 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @TNIndMin 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @TN_SIPCOT 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @SIPCOTTN 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @Udhaystalin 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @ptrmadurai 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @TNeGA_Official 2021-2026" --role Researcher --model haiku
/nalan:spawn "Fetch tweets from @ELCOT_TN 2021-2026" --role Researcher --model haiku
```

**Worker prompt:** Read `workers/wave1-fetch/WORKER-PROMPT.md`, replace `{HANDLE}` with assigned handle.

**Expected output:** `raw/{handle}.json` for each handle

**Completion criteria:**
- All 12 `raw/*.json` files exist
- Each file validates against `schemas/raw-tweet.schema.json`
- Update `ORCHESTRATION-STATE.json` wave1 status

---

### Wave 2: Link Enrichment (N parallel workers)

After Wave 1 completes, collect all unique external URLs:

```bash
# First, generate URL manifest
# Read all raw/*.json, extract unique URLs, group by domain

# Then spawn workers per domain batch
/nalan:spawn "Enrich links from domain batch 1" --role Researcher --model haiku
/nalan:spawn "Enrich links from domain batch 2" --role Researcher --model haiku
# ... (number depends on unique domains)
```

**Worker prompt:** Read `workers/wave2-enrich/WORKER-PROMPT.md`, provide URL batch.

**Expected output:** `enriched/{domain}/{hash}.json` for each URL

**Completion criteria:**
- All URLs have corresponding enriched files (or marked as failed)
- Update `ORCHESTRATION-STATE.json` wave2 status

---

### Wave 3: Classification & Verification (12 parallel workers)

One worker per handle:

```bash
/nalan:spawn "Verify and classify @CMOTamilnadu tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @mkstalin tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @TNDIPRNEWS tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @TRBRajaa tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @Guidance_TN tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @TNIndMin tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @TN_SIPCOT tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @SIPCOTTN tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @Udhaystalin tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @ptrmadurai tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @TNeGA_Official tweets" --role Classifier --model haiku
/nalan:spawn "Verify and classify @ELCOT_TN tweets" --role Classifier --model haiku
```

**Worker prompt:** Read `workers/wave3-verify/WORKER-PROMPT.md`, replace `{HANDLE}`.

**Expected output:** `verified/{handle}-verified.json` for each handle

**Completion criteria:**
- All 12 `verified/*-verified.json` files exist
- Each file validates against `schemas/verified-entry.schema.json`
- Update `ORCHESTRATION-STATE.json` wave3 status

---

### Wave 4: Entity Aggregation (10 parallel workers)

One worker per category:

```bash
/nalan:spawn "Aggregate infrastructure entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate industries entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate education entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate healthcare entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate employment entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate agriculture entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate environment entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate social-welfare entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate sports-culture entities" --role Aggregator --model haiku
/nalan:spawn "Aggregate tamil-history entities" --role Aggregator --model haiku
```

**Worker prompt:** Read `workers/wave4-aggregate/WORKER-PROMPT.md`, replace `{CATEGORY}`.

**Expected output:** `aggregated/{category}-aggregated.json` for each category

**Completion criteria:**
- All 10 `aggregated/*-aggregated.json` files exist
- Each file validates against `schemas/aggregated-entity.schema.json`
- Update `ORCHESTRATION-STATE.json` wave4 status

---

### Wave 5: Duplicate Detection (10 parallel workers)

One worker per category:

```bash
/nalan:spawn "Detect duplicates in infrastructure" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in industries" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in education" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in healthcare" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in employment" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in agriculture" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in environment" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in social-welfare" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in sports-culture" --role Deduplicator --model haiku
/nalan:spawn "Detect duplicates in tamil-history" --role Deduplicator --model haiku
```

**Worker prompt:** Read `workers/wave5-dedupe/WORKER-PROMPT.md`, replace `{CATEGORY}`.

**Expected output:** `duplicates/{category}-duplicates.json` for each category

**Completion criteria:**
- All 10 `duplicates/*-duplicates.json` files exist
- Each file validates against `schemas/duplicate-report.schema.json`
- Update `ORCHESTRATION-STATE.json` wave5 status

---

## State Management

After each wave, update `ORCHESTRATION-STATE.json`:

```json
{
  "waves": {
    "wave1": {
      "status": "completed",
      "completedAt": "2026-02-16T10:30:00Z",
      "workers": [
        {"handle": "CMOTamilnadu", "status": "completed", "outputFile": "raw/CMOTamilnadu.json", "tweetCount": 245}
      ]
    }
  }
}
```

## Error Handling

### Worker Failure
1. Check worker logs
2. Retry failed worker up to 3 times
3. If still failing, mark as `failed` and continue
4. Report failed handles in final summary

### Validation Failure
1. Check output against schema
2. If invalid, re-run worker with stricter instructions
3. Log validation errors for review

### Rate Limiting
1. If hitting API limits, pause wave
2. Wait for cooldown period
3. Resume with remaining workers

## Final Report

After Wave 5, generate summary:

```
=== Twitter Extraction Summary ===

Wave 1 (Fetch): 12/12 handles complete
  - Total tweets: 2,450
  - Relevant tweets: 1,890

Wave 2 (Enrich): 340/350 URLs enriched
  - Failed URLs: 10 (timeout/blocked)

Wave 3 (Verify): 1,890 tweets classified
  - Infrastructure: 450
  - Industries: 380
  - Education: 290
  - Healthcare: 210
  - Employment: 180
  - Agriculture: 120
  - Environment: 90
  - Social Welfare: 85
  - Sports/Culture: 50
  - Tamil History: 35

Wave 4 (Aggregate): 312 unique entities
  - By category breakdown...

Wave 5 (Dedupe):
  - Exact matches: 89 (add sources)
  - Partial matches: 45 (review)
  - New candidates: 178 (to add)

Ready for human review: duplicates/*.json
```

## Human Review Checklist

Before adding to main database:

1. [ ] Review `duplicates/*-duplicates.json` for each category
2. [ ] Confirm exact matches - approve source additions
3. [ ] Review partial matches - decide merge/separate
4. [ ] Validate new candidates - confirm they're real projects
5. [ ] Check flagged items (single_source, low_confidence)
6. [ ] Generate final additions file
7. [ ] Update main data files
