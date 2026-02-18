#!/bin/bash
#
# Twitter Extraction Pipeline - Live Monitoring Dashboard
# Displays real-time worker status, progress, and statistics
#
# Usage:
#   ./monitor-dashboard.sh              # Refresh every 10 seconds
#   ./monitor-dashboard.sh --once       # Single snapshot
#   ./monitor-dashboard.sh --interval 5 # Custom refresh interval
#

set -euo pipefail

# Auto-detect paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTRACTION_DIR="$(dirname "$SCRIPT_DIR")"
NALAN_AGENTS="$HOME/.nalan/agents/active"
NALAN_RETIRED="$HOME/.nalan/agents/retired"
REFRESH_INTERVAL=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

# Parse arguments
ONCE=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --once) ONCE=true; shift ;;
        --interval) REFRESH_INTERVAL="$2"; shift 2 ;;
        *) shift ;;
    esac
done

get_worker_status() {
    local worker_id="$1"
    local status_file="$NALAN_AGENTS/$worker_id/status.json"
    if [[ -f "$status_file" ]]; then
        jq -r '.state // "UNKNOWN"' "$status_file" 2>/dev/null || echo "UNKNOWN"
    else
        echo "NOT_FOUND"
    fi
}

get_worker_role() {
    local worker_id="$1"
    local identity_file="$NALAN_AGENTS/$worker_id/identity.json"
    if [[ -f "$identity_file" ]]; then
        jq -r '.role // "unknown"' "$identity_file" 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

get_worker_model() {
    local worker_id="$1"
    local identity_file="$NALAN_AGENTS/$worker_id/identity.json"
    if [[ -f "$identity_file" ]]; then
        local provider=$(jq -r '.provider // ""' "$identity_file" 2>/dev/null)
        local model=$(jq -r '.model // ""' "$identity_file" 2>/dev/null)
        if [[ -n "$provider" && -n "$model" ]]; then
            echo "$provider:$model"
        else
            echo "default"
        fi
    else
        echo "unknown"
    fi
}

count_files() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        ls -1 "$dir" 2>/dev/null | wc -l | tr -d ' '
    else
        echo "0"
    fi
}

render_dashboard() {
    clear

    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Header
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}Twitter Extraction Pipeline - Live Dashboard${NC}              ${DIM}$timestamp${NC}  ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Worker Statistics
    local active_count=0
    local running_count=0
    local completed_count=0
    local failed_count=0
    local retired_count=0

    if [[ -d "$NALAN_AGENTS" ]]; then
        shopt -s nullglob
        for worker_dir in "$NALAN_AGENTS"/nalan-*; do
            if [[ -d "$worker_dir" ]]; then
                ((active_count++))
                local status=$(get_worker_status "$(basename "$worker_dir")")
                case "$status" in
                    "RUNNING"|"HANDOFF"|"SPAWNED") ((running_count++)) ;;
                    "COMPLETED"|"CLOSE") ((completed_count++)) ;;
                    "FAILED"|"ERROR") ((failed_count++)) ;;
                esac
            fi
        done
        shopt -u nullglob
    fi

    if [[ -d "$NALAN_RETIRED" ]]; then
        retired_count=$(ls -1d "$NALAN_RETIRED"/nalan-* 2>/dev/null | wc -l | tr -d ' ')
    fi

    echo -e "${WHITE}┌─ Worker Status ─────────────────────────────────────────────────────────────┐${NC}"
    printf "│  ${GREEN}● Running:${NC} %-4s  ${BLUE}● Completed:${NC} %-4s  ${RED}● Failed:${NC} %-4s  ${DIM}○ Retired:${NC} %-4s     │\n" \
        "$running_count" "$completed_count" "$failed_count" "$retired_count"
    echo -e "${WHITE}└──────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Active Workers Table
    echo -e "${WHITE}┌─ Active Workers ────────────────────────────────────────────────────────────┐${NC}"
    printf "│  %-20s %-14s %-18s %-10s         │\n" "WORKER ID" "ROLE" "MODEL" "STATUS"
    echo -e "│  ──────────────────── ────────────── ────────────────── ──────────         │"

    if [[ -d "$NALAN_AGENTS" ]]; then
        shopt -s nullglob
        local found_workers=false
        for worker_dir in "$NALAN_AGENTS"/nalan-*; do
            if [[ -d "$worker_dir" ]]; then
                found_workers=true
                local worker_id=$(basename "$worker_dir")
                local role=$(get_worker_role "$worker_id")
                local model=$(get_worker_model "$worker_id")
                local status=$(get_worker_status "$worker_id")

                # Truncate for display
                local short_id="${worker_id:0:20}"
                local short_role="${role:0:14}"
                local short_model="${model:0:18}"

                local status_color=""
                case "$status" in
                    "RUNNING") status_color="${GREEN}" ;;
                    "HANDOFF"|"SPAWNED") status_color="${YELLOW}" ;;
                    "COMPLETED"|"CLOSE") status_color="${BLUE}" ;;
                    "FAILED"|"ERROR") status_color="${RED}" ;;
                    *) status_color="${DIM}" ;;
                esac

                printf "│  %-20s %-14s %-18s ${status_color}%-10s${NC}         │\n" \
                    "$short_id" "$short_role" "$short_model" "$status"
            fi
        done
        shopt -u nullglob
        if [[ "$found_workers" == "false" ]]; then
            echo -e "│  ${DIM}No active workers${NC}                                                          │"
        fi
    else
        echo -e "│  ${DIM}No active workers${NC}                                                          │"
    fi
    echo -e "${WHITE}└──────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Pipeline Progress
    echo -e "${WHITE}┌─ Pipeline Progress ─────────────────────────────────────────────────────────┐${NC}"

    local tweet_ids=$(count_files "$EXTRACTION_DIR/tweet_ids")
    local raw_files=$(count_files "$EXTRACTION_DIR/raw")
    local enriched_files=$(count_files "$EXTRACTION_DIR/enriched")
    local verified_files=$(count_files "$EXTRACTION_DIR/verified")
    local aggregated_files=$(count_files "$EXTRACTION_DIR/aggregated")
    local duplicate_files=$(count_files "$EXTRACTION_DIR/duplicates")

    printf "│  Phase 0 (ID Discovery):    %-5s files in tweet_ids/                      │\n" "$tweet_ids"
    printf "│  Phase 1 (Tweet Fetch):     %-5s files in raw/                            │\n" "$raw_files"
    printf "│  Phase 2 (Link Enrich):     %-5s files in enriched/                       │\n" "$enriched_files"
    printf "│  Phase 3 (Classification):  %-5s files in verified/                       │\n" "$verified_files"
    printf "│  Phase 4 (Aggregation):     %-5s files in aggregated/                     │\n" "$aggregated_files"
    printf "│  Phase 5 (Deduplication):   %-5s files in duplicates/                     │\n" "$duplicate_files"

    echo -e "${WHITE}└──────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Cost Estimate (rough)
    local haiku_workers=$((completed_count + running_count))
    local gemini_workers=0
    if [[ -d "$NALAN_AGENTS" ]]; then
        gemini_workers=$(for d in "$NALAN_AGENTS"/nalan-*/identity.json; do
            jq -r '.provider // ""' "$d" 2>/dev/null
        done | grep -c "google" || echo 0)
    fi

    # Rough cost: Haiku ~$0.02/worker, Gemini ~$0.10/worker
    local haiku_cost=$(echo "scale=2; ($haiku_workers - $gemini_workers) * 0.02" | bc 2>/dev/null || echo "0")
    local gemini_cost=$(echo "scale=2; $gemini_workers * 0.10" | bc 2>/dev/null || echo "0")
    local total_cost=$(echo "scale=2; $haiku_cost + $gemini_cost" | bc 2>/dev/null || echo "0")

    echo -e "${DIM}Estimated cost: ~\$$total_cost (Haiku: \$$haiku_cost, Gemini: \$$gemini_cost)${NC}"
    echo ""

    if [[ "$ONCE" != "true" ]]; then
        echo -e "${DIM}Refreshing every ${REFRESH_INTERVAL}s. Press Ctrl+C to exit.${NC}"
    fi
}

# Main loop
if [[ "$ONCE" == "true" ]]; then
    render_dashboard
else
    while true; do
        render_dashboard
        sleep "$REFRESH_INTERVAL"
    done
fi
