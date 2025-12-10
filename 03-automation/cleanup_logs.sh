#!/bin/bash

# Log cleanup automation script
# Cleans logs older than 7 days

LOG_DIR="/var/log"
DAYS_OLD=7
DATE=$(date +%Y-%m-%d)

echo "=== Log Cleanup Script ==="
echo "Date: $DATE"
echo "Searching for logs older than $DAYS_OLD days in $LOG_DIR"
echo ""

# Find and display logs older than specified days
echo "Files to be cleaned:"
find $LOG_DIR -name "*.log" -type f -mtime +$DAYS_OLD 2>/dev/null | head -10

# Count files
COUNT=$(find $LOG_DIR -name "*.log" -type f -mtime +$DAYS_OLD 2>/dev/null | wc -l)
echo ""
echo "Total files found: $COUNT"

# Uncomment below to actually delete files
# find $LOG_DIR -name "*.log" -type f -mtime +$DAYS_OLD -exec rm -f {} \;

echo ""
echo "Cleanup completed (dry-run mode)"
echo "Remove comment to enable actual deletion"
