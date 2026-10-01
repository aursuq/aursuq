#!/bin/bash
#
# start_cline_watchdog.sh
# Prevents duplicate watchdogs, uses nohup, logs to .cline-runtime/watchdog.log, prints PID.

set -euo pipefail

WORKSPACE_DIR="$(dirname "$(realpath "$0")")/.."
RUNTIME_DIR="$WORKSPACE_DIR/.cline-runtime"
LOG_FILE="$RUNTIME_DIR/watchdog.log"
PID_FILE="$RUNTIME_DIR/watchdog.pid"
WATCHDOG_SCRIPT="$WORKSPACE_DIR/scripts/cline_watchdog.py"

mkdir -p "$RUNTIME_DIR"

# Check if watchdog is already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Watchdog is already running with PID $OLD_PID."
        exit 0
    else
        echo "Stale PID file found. Removing..."
        rm -f "$PID_FILE"
    fi
fi

# Also check via pgrep as fallback
if pgrep -f "cline_watchdog.py" > /dev/null 2>&1; then
    RUNNING_PID=$(pgrep -f "cline_watchdog.py" | head -n 1)
    echo "Watchdog is already running (detected via pgrep) with PID $RUNNING_PID."
    echo "$RUNNING_PID" > "$PID_FILE"
    exit 0
fi

echo "Starting Aursuq Cline Watchdog..."
nohup python3 "$WATCHDOG_SCRIPT" > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

echo "Watchdog started successfully with PID $NEW_PID."
echo "Logs: $LOG_FILE"
