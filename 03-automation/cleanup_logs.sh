#!/bin/bash

# Log cleanup automation script
# Cleans logs older than 7 days

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/demo_logs"
DAYS_OLD=7
DATE=$(date +%Y-%m-%d)

# Create demo logs if they don't exist
if [ ! -d "$LOG_DIR" ]; then
    echo "Creating demo log files..."
    mkdir -p "$LOG_DIR"
    # Create some old log files
    touch -t 202401010000 "$LOG_DIR/old_app.log"
    touch -t 202401050000 "$LOG_DIR/old_error.log"
    touch -t 202401100000 "$LOG_DIR/old_access.log"
    # Create some recent log files
    touch "$LOG_DIR/current_app.log"
    touch "$LOG_DIR/current_error.log"
    echo "Demo logs created"
    echo ""
fi

echo "=== Log Cleanup Script ==="
echo "Date: $DATE"
echo "Searching for logs older than $DAYS_OLD days in $LOG_DIR"
echo ""

# Find and display logs older than specified days
echo "Files to be cleaned:"
find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS_OLD 2>/dev/null

# Count files
COUNT=$(find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS_OLD 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "Total files found: $COUNT"

# Actually delete old files
if [ $COUNT -gt 0 ]; then
    find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS_OLD -exec rm -f {} \;
    echo "Old log files deleted"
else
    echo "No old files to delete"
fi

echo ""
echo "Cleanup completed"
