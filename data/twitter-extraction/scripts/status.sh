#!/bin/bash
# Quick status check for the pipeline
# Usage: ./status.sh [--watch]

cd "$(dirname "$0")/.."

if [ "$1" == "--watch" ]; then
    watch -n 5 "python3 scripts/orchestrator.py --status"
else
    python3 scripts/orchestrator.py --status
fi
