#!/bin/bash
#
# Twitter Extraction Pipeline Orchestrator
# Version: 4.0
#
# Orchestrates 5-wave extraction using NalaN workers with mixed models.
# Wayback Machine for ID discovery + fxTwitter API for content.
#
# Usage:
#   ./orchestrate-extraction.sh                    # Run full pipeline
#   ./orchestrate-extraction.sh --phase 0         # Run only Phase 0 (ID discovery)
#   ./orchestrate-extraction.sh --phase 1         # Run only Phase 1 (tweet fetch)
#   ./orchestrate-extraction.sh --dry-run         # Preview commands without executing
#   ./orchestrate-extraction.sh --status          # Check current worker status
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

# Auto-detect paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTRACTION_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$(dirname "$EXTRACTION_DIR")")"
NALAN_SCRIPTS="$HOME/.nalan/scripts"
NALAN_AGENTS="$HOME/.nalan/agents/active"

# Target accounts (12 total)
HANDLES=(
    "CMOTamilnadu"
    "mkstalin"
    "TNDIPRNEWS"
    "TRBRajaa"
    "Guidance_TN"
    "TNIndMin"
    "TN_SIPCOT"
    "SIPCOTTN"
    "Udhaystalin"
    "ptrmadurai"
    "TNeGA_Official"
    "ELCOT_TN"
)

# Date range for Wayback queries
DATE_FROM="20210101"
DATE_TO="20260201"

# Batch sizes
TWEETS_PER_WORKER=50
MAX_PARALLEL_WORKERS=12

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check NalaN scripts exist
    if [[ ! -f "$NALAN_SCRIPTS/worker-spawn.py" ]]; then
        log_error "NalaN worker-spawn.py not found at $NALAN_SCRIPTS"
        exit 1
    fi

    # Check project directory
    if [[ ! -d "$EXTRACTION_DIR" ]]; then
        log_error "Extraction directory not found: $EXTRACTION_DIR"
        exit 1
    fi

    # Create output directories
    mkdir -p "$EXTRACTION_DIR/tweet_ids"
    mkdir -p "$EXTRACTION_DIR/raw"
    mkdir -p "$EXTRACTION_DIR/enriched"
    mkdir -p "$EXTRACTION_DIR/verified"
    mkdir -p "$EXTRACTION_DIR/aggregated"
    mkdir -p "$EXTRACTION_DIR/duplicates"
    mkdir -p "$EXTRACTION_DIR/logs"

    log_success "Prerequisites OK"
}

get_worker_status() {
    local worker_id="$1"
    local status_file="$NALAN_AGENTS/$worker_id/status.json"

    if [[ -f "$status_file" ]]; then
        jq -r '.state // "UNKNOWN"' "$status_file" 2>/dev/null || echo "UNKNOWN"
    else
        echo "NOT_FOUND"
    fi
}

wait_for_workers() {
    local worker_ids=("$@")
    local all_complete=false
    local check_interval=30
    local max_wait=3600  # 1 hour max
    local waited=0

    log_info "Waiting for ${#worker_ids[@]} workers to complete..."

    while [[ "$all_complete" == "false" ]] && [[ $waited -lt $max_wait ]]; do
        all_complete=true
        local running=0
        local completed=0
        local failed=0

        for worker_id in "${worker_ids[@]}"; do
            local status=$(get_worker_status "$worker_id")
            case "$status" in
                "RUNNING"|"HANDOFF"|"SPAWNED")
                    all_complete=false
                    ((running++))
                    ;;
                "COMPLETED"|"CLOSE")
                    ((completed++))
                    ;;
                "FAILED"|"ERROR")
                    ((failed++))
                    ;;
            esac
        done

        if [[ "$all_complete" == "false" ]]; then
            echo -ne "\r  Running: $running | Completed: $completed | Failed: $failed | Waited: ${waited}s"
            sleep $check_interval
            ((waited+=check_interval))
        fi
    done

    echo ""

    if [[ $waited -ge $max_wait ]]; then
        log_warn "Timeout waiting for workers after ${max_wait}s"
        return 1
    fi

    log_success "All workers completed"
}

collect_worker_results() {
    local output_file="$1"
    shift
    local worker_ids=("$@")

    log_info "Collecting results from ${#worker_ids[@]} workers..."

    echo "# Worker Results - $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$output_file"
    echo "" >> "$output_file"

    for worker_id in "${worker_ids[@]}"; do
        local results_file="$NALAN_AGENTS/$worker_id/results.md"
        local retired_results="$HOME/.nalan/agents/retired/$worker_id/results.md"

        echo "## $worker_id" >> "$output_file"
        echo "" >> "$output_file"

        if [[ -f "$results_file" ]]; then
            cat "$results_file" >> "$output_file"
        elif [[ -f "$retired_results" ]]; then
            cat "$retired_results" >> "$output_file"
        else
            echo "_No results file found_" >> "$output_file"
        fi

        echo "" >> "$output_file"
        echo "---" >> "$output_file"
        echo "" >> "$output_file"
    done

    log_success "Results collected to $output_file"
}

# =============================================================================
# Phase 0: Tweet ID Discovery (Wayback Machine)
# =============================================================================

run_phase_0() {
    log_info "=== PHASE 0: Tweet ID Discovery via Wayback Machine ==="

    local worker_ids=()
    local first_worker=true

    for handle in "${HANDLES[@]}"; do
        log_info "Spawning Gemini worker for @$handle..."

        local allow_conflicts=""
        if [[ "$first_worker" == "false" ]]; then
            allow_conflicts="--allow-conflicts"
        fi
        first_worker=false

        # Inline task for Wayback CDX query
        # CRITICAL: Worker must output IDs in results.md because worktree files are cleaned up
        local task="INLINE TASK - Wayback Tweet ID Discovery for @$handle

CRITICAL: Your worktree files will be deleted after you finish. You MUST include the actual tweet IDs in your final output, not just save them to a file.

Step 1: Query Wayback Machine CDX API:
curl -s 'https://web.archive.org/cdx/search/cdx?url=twitter.com/$handle/status/*&output=json&fl=original'

Step 2: Parse the JSON response:
- First row is headers
- Extract tweet IDs from URLs: twitter.com/$handle/status/{ID}
- Remove duplicates

Step 3: OUTPUT FORMAT (MANDATORY)
Your results.md MUST contain ALL tweet IDs in this exact format:

\`\`\`tweet_ids
1234567890123456789
1234567890123456790
...
\`\`\`

Also include a summary with total count and date range.

The tweet IDs MUST be in a code block labeled 'tweet_ids' - this is how they will be extracted.
If you find more than 50000 IDs, output only the first 50000."

        if [[ "${DRY_RUN:-false}" == "true" ]]; then
            echo "  [DRY-RUN] Would spawn: python3 $NALAN_SCRIPTS/worker-spawn.py \\"
            echo "    --project \"$PROJECT_DIR\" \\"
            echo "    --provider google --model gemini-3-pro-preview \\"
            echo "    --role IDDiscovery $allow_conflicts \\"
            echo "    --task '...$handle wayback query...'"
        else
            local output=$(python3 "$NALAN_SCRIPTS/worker-spawn.py" \
                --project "$PROJECT_DIR" \
                --provider google --model gemini-3-pro-preview \
                --role IDDiscovery $allow_conflicts \
                --task "$task" 2>&1)

            # Extract worker ID from output (macOS compatible - no -P flag)
            local worker_id=$(echo "$output" | grep -oE 'nalan-[a-f0-9]+' | head -1)
            if [[ -n "$worker_id" ]]; then
                worker_ids+=("$worker_id")
                log_success "Spawned $worker_id for @$handle"
            else
                log_error "Failed to spawn worker for @$handle: $output"
            fi
        fi

        # Small delay between spawns
        sleep 2
    done

    if [[ "${DRY_RUN:-false}" != "true" ]]; then
        # Wait for all Phase 0 workers
        wait_for_workers "${worker_ids[@]}"

        # Collect results
        collect_worker_results "$EXTRACTION_DIR/logs/phase0-results.md" "${worker_ids[@]}"

        # Merge tweet IDs using Python merger (workers write to results.md, not files)
        # CRITICAL: Workers run in isolated worktrees, so we parse results.md instead
        log_info "Merging tweet IDs from worker results..."
        python3 "$EXTRACTION_DIR/scripts/merge-results.py" --phase 0

        # Check if merge succeeded
        if [[ -f "$EXTRACTION_DIR/tweet_ids/all_ids_merged.txt" ]]; then
            cp "$EXTRACTION_DIR/tweet_ids/all_ids_merged.txt" "$EXTRACTION_DIR/tweet_ids/all_ids.txt"
        fi

        local total_ids=$(wc -l < "$EXTRACTION_DIR/tweet_ids/all_ids.txt" 2>/dev/null || echo 0)
        log_success "Phase 0 complete. Total unique tweet IDs: $total_ids"
    fi
}

# =============================================================================
# Phase 1: Tweet Fetching (fxTwitter API)
# =============================================================================

run_phase_1() {
    log_info "=== PHASE 1: Tweet Fetching via fxTwitter API ==="

    # Read tweet IDs and split into batches
    local all_ids_file="$EXTRACTION_DIR/tweet_ids/all_ids.txt"

    if [[ ! -f "$all_ids_file" ]]; then
        log_error "No tweet IDs found. Run Phase 0 first."
        exit 1
    fi

    local total_ids=$(wc -l < "$all_ids_file")
    local num_batches=$(( (total_ids + TWEETS_PER_WORKER - 1) / TWEETS_PER_WORKER ))

    log_info "Total IDs: $total_ids, Batch size: $TWEETS_PER_WORKER, Batches: $num_batches"

    local worker_ids=()
    local batch_num=0
    local first_worker=true

    # Split into batches and spawn workers
    split -l $TWEETS_PER_WORKER "$all_ids_file" "$EXTRACTION_DIR/tweet_ids/batch_"

    for batch_file in "$EXTRACTION_DIR/tweet_ids/batch_"*; do
        ((batch_num++))

        # Read IDs from batch file
        local ids=$(cat "$batch_file" | tr '\n' ',' | sed 's/,$//')
        local id_count=$(wc -l < "$batch_file")

        log_info "Spawning Haiku worker for batch $batch_num ($id_count IDs)..."

        local allow_conflicts=""
        if [[ "$first_worker" == "false" ]]; then
            allow_conflicts="--allow-conflicts"
        fi
        first_worker=false

        # Inline task for fxTwitter fetch
        local task="INLINE TASK - Tweet Fetch Batch $batch_num

Fetch tweets from fxTwitter API using curl.

Tweet IDs to fetch:
$ids

For each ID, run:
curl -s 'https://api.fxtwitter.com/i/status/{ID}'

Parse each response and extract:
- tweet.text (full text)
- tweet.created_at (date)
- tweet.author.screen_name (handle)
- tweet.media (if present)
- Any investment amounts (Rs/₹ X crore/Cr)
- Any job numbers

Output as JSON array:
[
  {
    \"tweet_id\": \"...\",
    \"handle\": \"...\",
    \"date\": \"...\",
    \"text\": \"...\",
    \"investment_crore\": null or number,
    \"jobs_created\": null or number,
    \"has_media\": true/false
  }
]

Handle errors gracefully - if a tweet fails, log the ID and continue."

        if [[ "${DRY_RUN:-false}" == "true" ]]; then
            echo "  [DRY-RUN] Would spawn Haiku worker for batch $batch_num"
        else
            local output=$(python3 "$NALAN_SCRIPTS/worker-spawn.py" \
                --project "$PROJECT_DIR" \
                --role Fetcher $allow_conflicts \
                --task "$task" 2>&1)

            local worker_id=$(echo "$output" | grep -oP 'nalan-[a-f0-9]+' | head -1)
            if [[ -n "$worker_id" ]]; then
                worker_ids+=("$worker_id")
                log_success "Spawned $worker_id for batch $batch_num"
            else
                log_error "Failed to spawn worker for batch $batch_num: $output"
            fi
        fi

        # Rate limiting - don't spawn too many at once
        if (( batch_num % MAX_PARALLEL_WORKERS == 0 )); then
            log_info "Waiting for current batch of workers before spawning more..."
            sleep 60
        fi

        sleep 2
    done

    if [[ "${DRY_RUN:-false}" != "true" ]]; then
        # Wait for all Phase 1 workers
        wait_for_workers "${worker_ids[@]}"

        # Collect results
        collect_worker_results "$EXTRACTION_DIR/logs/phase1-results.md" "${worker_ids[@]}"

        log_success "Phase 1 complete."
    fi
}

# =============================================================================
# Status Check
# =============================================================================

show_status() {
    log_info "=== Worker Status ==="

    echo ""
    echo "Active Workers:"
    echo "---------------"

    if [[ -d "$NALAN_AGENTS" ]]; then
        for worker_dir in "$NALAN_AGENTS"/nalan-*; do
            if [[ -d "$worker_dir" ]]; then
                local worker_id=$(basename "$worker_dir")
                local status=$(get_worker_status "$worker_id")
                local role=$(jq -r '.role // "unknown"' "$worker_dir/identity.json" 2>/dev/null || echo "unknown")

                case "$status" in
                    "RUNNING")
                        echo -e "  ${GREEN}●${NC} $worker_id ($role) - $status"
                        ;;
                    "COMPLETED"|"CLOSE")
                        echo -e "  ${BLUE}●${NC} $worker_id ($role) - $status"
                        ;;
                    "FAILED"|"ERROR")
                        echo -e "  ${RED}●${NC} $worker_id ($role) - $status"
                        ;;
                    *)
                        echo -e "  ${YELLOW}●${NC} $worker_id ($role) - $status"
                        ;;
                esac
            fi
        done
    else
        echo "  No active workers"
    fi

    echo ""
    echo "Output Files:"
    echo "-------------"

    for subdir in tweet_ids raw enriched verified aggregated duplicates; do
        local count=$(ls -1 "$EXTRACTION_DIR/$subdir" 2>/dev/null | wc -l)
        echo "  $subdir/: $count files"
    done

    echo ""
}

# =============================================================================
# Main
# =============================================================================

main() {
    local phase=""
    local dry_run=false
    local status_only=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --phase)
                phase="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --status)
                status_only=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --phase N     Run only phase N (0-5)"
                echo "  --dry-run     Preview commands without executing"
                echo "  --status      Show current worker status"
                echo "  --help        Show this help"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    export DRY_RUN="$dry_run"

    if [[ "$status_only" == "true" ]]; then
        show_status
        exit 0
    fi

    check_prerequisites

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║     Twitter Extraction Pipeline - NalaN Worker Orchestrator    ║"
    echo "╠════════════════════════════════════════════════════════════════╣"
    echo "║  Target: ${#HANDLES[@]} TN Government Twitter accounts                   ║"
    echo "║  Date Range: $DATE_FROM - $DATE_TO                         ║"
    echo "║  Batch Size: $TWEETS_PER_WORKER tweets per worker                          ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    if [[ "$dry_run" == "true" ]]; then
        log_warn "DRY-RUN MODE - No workers will be spawned"
        echo ""
    fi

    case "$phase" in
        "0")
            run_phase_0
            ;;
        "1")
            run_phase_1
            ;;
        "")
            # Run all phases
            run_phase_0
            echo ""
            run_phase_1
            # Future: run_phase_2, run_phase_3, etc.
            ;;
        *)
            log_error "Unknown phase: $phase"
            exit 1
            ;;
    esac

    echo ""
    log_success "Pipeline execution complete!"
    echo ""
    show_status
}

main "$@"
