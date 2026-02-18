# Twitter Data Extraction Pipeline

Automated extraction of Tamil Nadu government achievements from official Twitter accounts using NalaN workers.

## Quick Start

```bash
# Preview what will happen (no workers spawned)
./scripts/orchestrate-extraction.sh --dry-run

# Run Phase 0 only (ID discovery via Wayback Machine)
./scripts/orchestrate-extraction.sh --phase 0

# Run full pipeline
./scripts/orchestrate-extraction.sh

# Monitor progress
./scripts/monitor-dashboard.sh
```

## Architecture

```
Phase 0: ID Discovery     ──→ Wayback Machine CDX API (12 Gemini workers)
                              ↓
Phase 1: Tweet Fetch      ──→ fxTwitter API (batched Haiku workers)
                              ↓
Phase 2: Link Enrichment  ──→ Fetch external URLs (Haiku workers)
                              ↓
Phase 3: Classification   ──→ Categorize tweets (Gemini workers)
                              ↓
Phase 4: Aggregation      ──→ Merge into entities (Gemini workers)
                              ↓
Phase 5: Deduplication    ──→ Match against database (Haiku workers)
```

## Directory Structure

```
twitter-extraction/
├── scripts/                 # Orchestration tools
│   ├── orchestrate-extraction.sh   # Main pipeline
│   ├── monitor-dashboard.sh        # Live status
│   ├── merge-results.py            # Merge worker outputs
│   └── validate-data.py            # Data validation
├── schemas/                 # JSON schemas
├── tweet_ids/               # Phase 0 output
├── raw/                     # Phase 1 output
├── enriched/                # Phase 2 output
├── verified/                # Phase 3 output
├── aggregated/              # Phase 4 output
├── duplicates/              # Phase 5 output
└── logs/                    # Pipeline logs
```

## Key Constraints

1. **Workers need inline tasks** - Cannot read project files
2. **Use curl, not WebFetch** - Workers lack interactive permissions
3. **fxTwitter needs IDs** - No timeline/search endpoint
4. **Use --allow-conflicts** - For parallel workers on same project

## Target Accounts

| Handle | Focus |
|--------|-------|
| @CMOTamilnadu | All categories |
| @mkstalin | All categories |
| @TNDIPRNEWS | All categories |
| @TRBRajaa | Industries |
| @Guidance_TN | Industries |
| @TNIndMin | Industries |
| @TN_SIPCOT | Industries, Infrastructure |
| @SIPCOTTN | Industries, Infrastructure |
| @Udhaystalin | Sports, Youth, Welfare |
| @ptrmadurai | IT, Industries |
| @TNeGA_Official | IT, Digital |
| @ELCOT_TN | IT, Industries |

## Documentation

- `EXTRACTION-PLAN.md` - Full technical plan
- `TEST-VALIDATION-REPORT.md` - Test run results
