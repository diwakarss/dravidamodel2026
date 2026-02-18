#!/usr/bin/env python3
"""
Twitter Extraction Pipeline Orchestrator

Manages all 4 phases in parallel:
- Phase 1: Tweet Fetching (fxTwitter API)
- Phase 2: Link Enrichment (article fetching)
- Phase 3: Classification (rule-based + optional LLM)
- Phase 4: Aggregation (entity merging)

Each phase watches for new input data and processes incrementally.

Usage:
  python3 orchestrator.py                    # Run all phases
  python3 orchestrator.py --status           # Show status only
  python3 orchestrator.py --phase 1,2        # Run specific phases
  python3 orchestrator.py --monitor          # Live monitoring mode
"""

import json
import os
import sys
import time
import signal
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict
from threading import Thread, Event
from queue import Queue
import hashlib

# Configuration
BASE_DIR = Path("data/twitter-extraction")
STATE_FILE = BASE_DIR / "orchestrator_state.json"
LOG_DIR = BASE_DIR / "logs"
POLL_INTERVAL = 10  # seconds between checks

# Phase configurations
PHASES = {
    1: {
        "name": "Tweet Fetch",
        "input_dir": BASE_DIR / "tweet_ids" / "filtered" / "batches",
        "output_dir": BASE_DIR / "raw" / "filtered",
        "output_file": "tweets_full.json",
        "batch_pattern": "batch_*.txt",
        "script": "fetch_tweets.py",
    },
    2: {
        "name": "Link Enrich",
        "input_dir": BASE_DIR / "enriched" / "batches",
        "output_dir": BASE_DIR / "enriched" / "results",
        "batch_pattern": "batch_*.json",
        "script": "enrich_links.py",
        "depends_on": 1,
    },
    3: {
        "name": "Classify",
        "input_dir": BASE_DIR / "raw" / "filtered",
        "output_dir": BASE_DIR / "verified",
        "script": "classify_tweets_rules.py",
        "depends_on": 1,
    },
    4: {
        "name": "Aggregate",
        "input_dir": BASE_DIR / "verified",
        "output_dir": BASE_DIR / "aggregated",
        "script": "aggregate_entities.py",
        "depends_on": 3,
    },
}


@dataclass
class PhaseState:
    """State for a single phase."""
    phase: int
    name: str
    status: str  # idle, running, complete, error
    pid: Optional[int] = None
    last_batch: int = 0
    total_batches: int = 0
    processed: int = 0
    errors: int = 0
    last_run: Optional[str] = None
    last_error: Optional[str] = None


@dataclass
class OrchestratorState:
    """Global orchestrator state."""
    started_at: str
    last_update: str
    phases: Dict[int, PhaseState]

    def to_dict(self):
        return {
            "started_at": self.started_at,
            "last_update": self.last_update,
            "phases": {k: asdict(v) for k, v in self.phases.items()}
        }


class PipelineOrchestrator:
    """Main orchestrator class."""

    def __init__(self, phases_to_run: List[int] = None):
        self.phases_to_run = phases_to_run or [1, 2, 3, 4]
        self.state = self._load_state()
        self.stop_event = Event()
        self.log_queue = Queue()
        self.processes: Dict[int, subprocess.Popen] = {}  # Track Popen objects by phase

        # Setup signal handlers
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _handle_signal(self, signum, frame):
        """Handle shutdown signals."""
        self.log("Received shutdown signal, stopping...")
        self.stop_event.set()

    def _load_state(self) -> OrchestratorState:
        """Load or initialize state."""
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE) as f:
                    data = json.load(f)
                phases = {
                    int(k): PhaseState(**v)
                    for k, v in data.get("phases", {}).items()
                }
                return OrchestratorState(
                    started_at=data.get("started_at", datetime.now(timezone.utc).isoformat()),
                    last_update=data.get("last_update", datetime.now(timezone.utc).isoformat()),
                    phases=phases
                )
            except Exception as e:
                self.log(f"Error loading state: {e}")

        # Initialize fresh state
        now = datetime.now(timezone.utc).isoformat()
        phases = {}
        for phase_num, config in PHASES.items():
            phases[phase_num] = PhaseState(
                phase=phase_num,
                name=config["name"],
                status="idle"
            )
        return OrchestratorState(started_at=now, last_update=now, phases=phases)

    def _save_state(self):
        """Save state to disk."""
        self.state.last_update = datetime.now(timezone.utc).isoformat()
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(self.state.to_dict(), f, indent=2)

    def log(self, msg: str, phase: int = None):
        """Log message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        prefix = f"[P{phase}]" if phase else "[ORCH]"
        line = f"{timestamp} {prefix} {msg}"
        print(line)

        LOG_DIR.mkdir(parents=True, exist_ok=True)
        with open(LOG_DIR / "orchestrator.log", "a") as f:
            f.write(line + "\n")

    def get_phase_1_progress(self) -> tuple:
        """Get Phase 1 tweet fetch progress."""
        config = PHASES[1]
        batch_dir = config["input_dir"]
        output_file = config["output_dir"] / config["output_file"]

        # Count batches
        batches = list(batch_dir.glob(config["batch_pattern"]))
        total_batches = len(batches)

        # Check processed tweets
        processed = 0
        if output_file.exists():
            try:
                with open(output_file) as f:
                    data = json.load(f)
                processed = len(data.get("tweets", []))
            except:
                pass

        # Estimate current batch from log
        log_file = LOG_DIR / "fetch_full.log"
        current_batch = 0
        if log_file.exists():
            try:
                with open(log_file, "rb") as f:
                    f.seek(0, 2)
                    size = f.tell()
                    f.seek(max(0, size - 2000))
                    content = f.read().decode('utf-8', errors='ignore')
                    import re
                    matches = re.findall(r'Batch (\d+)', content)
                    if matches:
                        current_batch = int(matches[-1])
            except:
                pass

        return current_batch, total_batches, processed

    def get_phase_2_progress(self) -> tuple:
        """Get Phase 2 link enrichment progress."""
        config = PHASES[2]
        batch_dir = config["input_dir"]
        result_dir = config["output_dir"]

        # Count batches
        batches = list(batch_dir.glob(config["batch_pattern"]))
        total_batches = len(batches)

        # Count completed
        results = list(result_dir.glob("batch_*_enriched.json"))
        completed = len(results)

        # Count total enriched
        enriched = 0
        success = 0
        for rf in results:
            try:
                with open(rf) as f:
                    data = json.load(f)
                enriched += len(data.get("results", []))
                success += data.get("stats", {}).get("success", 0)
            except:
                pass

        return completed, total_batches, enriched, success

    def get_phase_3_progress(self) -> tuple:
        """Get Phase 3 classification progress."""
        output_file = PHASES[3]["output_dir"] / "all_verified.json"

        if not output_file.exists():
            return 0, 0, {}

        try:
            with open(output_file) as f:
                data = json.load(f)
            total = len(data.get("entries", []))
            stats = data.get("categoryStats", {})
            return total, sum(v for k, v in stats.items() if k != "uncategorized"), stats
        except:
            return 0, 0, {}

    def get_phase_4_progress(self) -> tuple:
        """Get Phase 4 aggregation progress."""
        output_dir = PHASES[4]["output_dir"]

        if not output_dir.exists():
            return 0, 0

        # Count aggregated files
        agg_files = list(output_dir.glob("*_aggregated.json"))
        entities = 0
        for af in agg_files:
            try:
                with open(af) as f:
                    data = json.load(f)
                entities += len(data.get("entities", []))
            except:
                pass

        return len(agg_files), entities

    def check_process_running(self, phase: int) -> bool:
        """Check if a phase's process is running (not zombie)."""
        proc = self.processes.get(phase)
        if not proc:
            # No tracked process, check by PID from state
            pid = self.state.phases[phase].pid
            if not pid:
                return False
            # Try to reap zombie if it's our child
            try:
                result = os.waitpid(pid, os.WNOHANG)
                if result[0] != 0:
                    # Process was reaped (was zombie or exited)
                    return False
                # Check if still exists
                os.kill(pid, 0)
                return True
            except (OSError, ChildProcessError):
                return False

        # Have Popen object - use poll() which properly reaps
        return proc.poll() is None

    def _kill_stale_processes(self, phase: int, script_name: str):
        """Kill any stale processes for this phase before starting new one."""
        import subprocess
        try:
            # Find all processes matching the script
            result = subprocess.run(
                ["pgrep", "-f", script_name],
                capture_output=True, text=True
            )
            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid_str in pids:
                    pid = int(pid_str)
                    # Don't kill if it's our tracked process
                    if phase in self.processes and self.processes[phase].pid == pid:
                        continue
                    try:
                        os.kill(pid, signal.SIGTERM)
                        self.log(f"Killed stale process {pid} for {script_name}", phase)
                    except OSError:
                        pass
        except Exception:
            pass

    def start_phase_1(self):
        """Start or resume Phase 1."""
        state = self.state.phases[1]
        config = PHASES[1]

        # Check if already running
        if self.check_process_running(1):
            return

        # Find next batch to process
        current, total, _ = self.get_phase_1_progress()
        if current >= total - 1:
            state.status = "complete"
            return

        # Kill any stale processes before starting
        self._kill_stale_processes(1, config["script"])

        # Start process
        self.log(f"Starting Phase 1 from batch {current}", 1)

        cmd = [
            "python3", str(BASE_DIR / "scripts" / config["script"]),
            "--start-batch", str(current),
            "--end-batch", str(total),
            "--output", str(config["output_dir"] / config["output_file"])
        ]

        log_file = open(LOG_DIR / "fetch_full.log", "a")
        proc = subprocess.Popen(cmd, stdout=log_file, stderr=log_file)

        self.processes[1] = proc  # Track Popen object
        state.pid = proc.pid
        state.status = "running"
        state.total_batches = total
        self._save_state()

        # Save PID file
        with open(LOG_DIR / "fetch_full.pid", "w") as f:
            f.write(str(proc.pid))

    def start_phase_2(self):
        """Start or resume Phase 2."""
        state = self.state.phases[2]
        config = PHASES[2]

        # Check dependency
        p1_state = self.state.phases[1]
        if p1_state.status not in ["running", "complete"]:
            return

        # Check if already running
        if self.check_process_running(2):
            return

        # Re-extract links if Phase 1 has new data
        self._refresh_links()

        # Find next batch
        completed, total, _, _ = self.get_phase_2_progress()
        if total == 0:
            return  # No links yet

        if completed >= total:
            state.status = "complete"
            return

        # Kill any stale processes before starting
        self._kill_stale_processes(2, config["script"])

        # Start process
        self.log(f"Starting Phase 2 from batch {completed}", 2)

        cmd = [
            "python3", str(BASE_DIR / "scripts" / config["script"]),
            "--start", str(completed),
            "--end", str(total)
        ]

        log_file = open(LOG_DIR / "enrich.log", "a")
        proc = subprocess.Popen(cmd, stdout=log_file, stderr=log_file)

        self.processes[2] = proc  # Track Popen object
        state.pid = proc.pid
        state.status = "running"
        state.total_batches = total
        self._save_state()

        with open(LOG_DIR / "enrich_full.pid", "w") as f:
            f.write(str(proc.pid))

    def _refresh_links(self):
        """Re-run link extraction if Phase 1 has new data."""
        tweets_file = PHASES[1]["output_dir"] / PHASES[1]["output_file"]
        index_file = PHASES[2]["input_dir"].parent / "links_index.json"

        if not tweets_file.exists():
            return

        # Check if tweets file is newer
        tweets_mtime = tweets_file.stat().st_mtime
        if index_file.exists():
            index_mtime = index_file.stat().st_mtime
            if tweets_mtime <= index_mtime:
                return  # Already up to date

        # Re-extract links
        self.log("Refreshing links from new tweets...", 2)
        subprocess.run([
            "python3", str(BASE_DIR / "scripts" / "extract_links.py"),
            "--input", str(tweets_file)
        ], capture_output=True)

    def start_phase_3(self):
        """Start or resume Phase 3."""
        state = self.state.phases[3]
        config = PHASES[3]

        # Check dependency
        p1_state = self.state.phases[1]
        if p1_state.status not in ["running", "complete"]:
            return

        # Check if tweets file exists
        tweets_file = PHASES[1]["output_dir"] / PHASES[1]["output_file"]
        if not tweets_file.exists():
            return

        # Check if already running
        if self.check_process_running(3):
            return

        # Check if we need to re-run (new tweets since last run)
        output_file = config["output_dir"] / "all_verified.json"
        if output_file.exists():
            tweets_mtime = tweets_file.stat().st_mtime
            output_mtime = output_file.stat().st_mtime
            if tweets_mtime <= output_mtime:
                state.status = "complete"
                return

        self.log("Starting Phase 3 classification", 3)

        cmd = [
            "python3", str(BASE_DIR / "scripts" / config["script"]),
            "--all",
            "--input", str(tweets_file)
        ]

        log_file = open(LOG_DIR / "classify.log", "a")
        proc = subprocess.Popen(cmd, stdout=log_file, stderr=log_file)

        self.processes[3] = proc  # Track Popen object
        state.pid = proc.pid
        state.status = "running"
        self._save_state()

    def start_phase_4(self):
        """Start or resume Phase 4."""
        state = self.state.phases[4]
        config = PHASES[4]

        # Check dependency
        p3_state = self.state.phases[3]
        if p3_state.status not in ["running", "complete"]:
            return

        # Check if verified file exists
        verified_file = PHASES[3]["output_dir"] / "all_verified.json"
        if not verified_file.exists():
            return

        # Check if already running
        if self.check_process_running(4):
            return

        # Check if script exists
        script_path = BASE_DIR / "scripts" / config["script"]
        if not script_path.exists():
            return

        # Check if we need to re-run (verified file newer than aggregated output)
        aggregated_file = config["output_dir"] / "all_aggregated.json"
        if aggregated_file.exists():
            verified_mtime = verified_file.stat().st_mtime
            aggregated_mtime = aggregated_file.stat().st_mtime
            if verified_mtime <= aggregated_mtime:
                state.status = "complete"
                state.pid = None
                return

        self.log("Starting Phase 4 aggregation", 4)

        cmd = [
            "python3", str(script_path),
            "--all"
        ]

        log_file = open(LOG_DIR / "aggregate.log", "a")
        proc = subprocess.Popen(cmd, stdout=log_file, stderr=log_file)

        self.processes[4] = proc  # Track Popen object
        state.pid = proc.pid
        state.status = "running"
        self._save_state()

    def update_phase_states(self):
        """Update all phase states."""
        for phase_num in self.phases_to_run:
            state = self.state.phases[phase_num]

            # Check if process still running (this also reaps zombies)
            if state.pid and not self.check_process_running(phase_num):
                # Clean up tracked process
                if phase_num in self.processes:
                    del self.processes[phase_num]
                state.pid = None
                if state.status == "running":
                    state.status = "idle"  # Will restart if needed
                    self.log(f"Phase {phase_num} finished, marking idle for restart", phase_num)

        # Update progress
        p1_batch, p1_total, p1_tweets = self.get_phase_1_progress()
        self.state.phases[1].last_batch = p1_batch
        self.state.phases[1].total_batches = p1_total
        self.state.phases[1].processed = p1_tweets

        p2_done, p2_total, p2_enriched, p2_success = self.get_phase_2_progress()
        self.state.phases[2].last_batch = p2_done
        self.state.phases[2].total_batches = p2_total
        self.state.phases[2].processed = p2_enriched

        p3_total, p3_categorized, _ = self.get_phase_3_progress()
        self.state.phases[3].processed = p3_total

        p4_files, p4_entities = self.get_phase_4_progress()
        self.state.phases[4].processed = p4_entities

        self._save_state()

    def print_status(self):
        """Print current status."""
        self.update_phase_states()

        print("\n" + "=" * 70)
        print("DRAVIDAMODEL2026 - TWITTER EXTRACTION PIPELINE")
        print("=" * 70)
        print(f"Started: {self.state.started_at[:19]}")
        print(f"Updated: {self.state.last_update[:19]}")
        print()

        for phase_num in [1, 2, 3, 4]:
            state = self.state.phases[phase_num]
            config = PHASES[phase_num]

            # Status indicator
            if state.status == "running":
                indicator = "🟢"
            elif state.status == "complete":
                indicator = "✅"
            elif state.status == "error":
                indicator = "🔴"
            else:
                indicator = "⚪"

            # Progress bar
            if state.total_batches > 0:
                pct = state.last_batch / state.total_batches * 100
                bar_len = 20
                filled = int(bar_len * pct / 100)
                bar = "█" * filled + "░" * (bar_len - filled)
                progress = f"[{bar}] {pct:.0f}%"
            else:
                progress = f"[{'░' * 20}] --"

            print(f"{indicator} Phase {phase_num}: {config['name']:<12} {progress}")
            print(f"   Status: {state.status:<10} Processed: {state.processed:,}")
            if state.pid:
                print(f"   PID: {state.pid}")
            print()

        # Summary stats
        p1_tweets = self.state.phases[1].processed
        p2_links = self.state.phases[2].processed
        p3_classified = self.state.phases[3].processed

        print("-" * 70)
        print(f"Tweets fetched: {p1_tweets:,}")
        print(f"Links enriched: {p2_links:,}")
        print(f"Tweets classified: {p3_classified:,}")
        print("=" * 70 + "\n")

    def run_once(self):
        """Run one iteration of the orchestrator."""
        self.update_phase_states()

        # Start phases that need to run
        if 1 in self.phases_to_run:
            self.start_phase_1()
        if 2 in self.phases_to_run:
            self.start_phase_2()
        if 3 in self.phases_to_run:
            self.start_phase_3()
        if 4 in self.phases_to_run:
            self.start_phase_4()

        self._save_state()

    def run(self):
        """Main orchestrator loop."""
        self.log("Starting orchestrator")

        while not self.stop_event.is_set():
            try:
                self.run_once()

                # Check if all phases complete
                all_complete = all(
                    self.state.phases[p].status == "complete"
                    for p in self.phases_to_run
                )
                if all_complete:
                    self.log("All phases complete!")
                    break

                # Wait for next iteration
                self.stop_event.wait(POLL_INTERVAL)

            except Exception as e:
                self.log(f"Error in orchestrator loop: {e}")
                self.stop_event.wait(30)

        self.log("Orchestrator stopped")
        self._save_state()

    def monitor(self):
        """Live monitoring mode."""
        try:
            while not self.stop_event.is_set():
                # Clear screen
                print("\033[2J\033[H", end="")

                self.print_status()

                print("Press Ctrl+C to exit\n")

                self.stop_event.wait(5)
        except KeyboardInterrupt:
            print("\nExiting monitor...")


def main():
    parser = argparse.ArgumentParser(description="Pipeline Orchestrator")
    parser.add_argument("--status", action="store_true", help="Show status only")
    parser.add_argument("--monitor", action="store_true", help="Live monitoring")
    parser.add_argument("--phase", type=str, help="Phases to run (e.g., 1,2,3)")
    parser.add_argument("--once", action="store_true", help="Run once then exit")
    args = parser.parse_args()

    # Parse phases
    phases = None
    if args.phase:
        phases = [int(p.strip()) for p in args.phase.split(",")]

    orchestrator = PipelineOrchestrator(phases)

    if args.status:
        orchestrator.print_status()
    elif args.monitor:
        orchestrator.monitor()
    elif args.once:
        orchestrator.run_once()
        orchestrator.print_status()
    else:
        orchestrator.run()

    return 0


if __name__ == "__main__":
    exit(main())
