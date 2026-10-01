#!/usr/bin/env python3
import time
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
RUNTIME_DIR = WORKSPACE_DIR / ".cline-runtime"
STATE_FILE = RUNTIME_DIR / "state.json"
NOTIFY_SCRIPT = WORKSPACE_DIR / "scripts" / "cline_notify.py"

STALE_THRESHOLD_SECONDS = 2 * 60   # ~2 minutes
CHECK_INTERVAL_SECONDS = 30        # 30 seconds

def check_heartbeat():
    if not STATE_FILE.exists():
        return

    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            state = json.load(f)
    except Exception as e:
        print(f"Error reading state.json: {e}")
        return

    status = state.get("status")
    last_heartbeat = state.get("last_heartbeat")
    stalled_email_sent = state.get("stalled_email_sent", False)
    error_email_sent = state.get("error_email_sent", False)

    if status != "RUNNING" or not last_heartbeat:
        return

    try:
        hb_time = datetime.fromisoformat(last_heartbeat.replace("Z", "+00:00"))
    except Exception as e:
        print(f"Error parsing last_heartbeat '{last_heartbeat}': {e}")
        return

    now = datetime.now(timezone.utc)
    diff_seconds = (now - hb_time).total_seconds()

    print(f"[{now.isoformat()}] Status: {status}, Last heartbeat: {last_heartbeat}, Age: {diff_seconds:.1f}s, Stalled sent: {stalled_email_sent}, Error sent: {error_email_sent}")

    # If error notification already sent, don't send stalled notification for same failure
    if error_email_sent:
        return

    if diff_seconds > STALE_THRESHOLD_SECONDS and not stalled_email_sent:
        print("Task appears stalled! Sending stalled notification...")
        try:
            subprocess.run(
                ["python3", str(NOTIFY_SCRIPT), "stalled", "Cline stopped responding while working on the current Aursuq task. This may be caused by a timeout or connection failure. Open Cline and resume the task."],
                check=True
            )
            state["stalled_email_sent"] = True
            with open(STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2)
            print("Stalled notification sent and state updated.")
        except Exception as e:
            print(f"Failed to send stalled notification: {e}")

def main():
    print("Starting Aursuq Cline Watchdog...")
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    while True:
        try:
            check_heartbeat()
        except Exception as e:
            print(f"Watchdog error: {e}")
        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
