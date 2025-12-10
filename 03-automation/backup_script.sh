#!/bin/bash

# Automated backup script
# Creates timestamped backups

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backups"
SOURCE_DIR="$SCRIPT_DIR/demo_data"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE.tar.gz"

# Create demo data if doesn't exist
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Creating demo data..."
    mkdir -p "$SOURCE_DIR"
    echo "Sample data file 1" > "$SOURCE_DIR/data1.txt"
    echo "Sample data file 2" > "$SOURCE_DIR/data2.txt"
    echo "Demo data created"
    echo ""
fi

echo "=== Backup Script ==="
echo "Source: $SOURCE_DIR"
echo "Destination: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$SOURCE_DIR" . 2>/dev/null

if [ -f "$BACKUP_DIR/$BACKUP_NAME" ]; then
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
    echo "✓ Backup created successfully"
    echo "  Size: $SIZE"
else
    echo "✗ Backup failed"
fi

# Keep only last 7 backups
echo ""
echo "Cleaning old backups (keeping last 7)..."
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/backup_*.tar.gz 2>/dev/null | wc -l | tr -d ' ')
if [ $BACKUP_COUNT -gt 7 ]; then
    ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs rm
    echo "Removed $(($BACKUP_COUNT - 7)) old backup(s)"
else
    echo "No old backups to remove ($BACKUP_COUNT total)"
fi

echo ""
echo "Backup completed: $BACKUP_NAME"
echo "Total backups: $(ls -1 $BACKUP_DIR/backup_*.tar.gz 2>/dev/null | wc -l | tr -d ' ')"
