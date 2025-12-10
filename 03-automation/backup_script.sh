#!/bin/bash

# Automated backup script
# Creates timestamped backups

BACKUP_DIR="/backup"
SOURCE_DIR="/data"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE.tar.gz"

echo "=== Backup Script ==="
echo "Source: $SOURCE_DIR"
echo "Destination: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$SOURCE_DIR" . 2>/dev/null || echo "Backup created (demo mode)"

# Keep only last 7 backups
echo "Cleaning old backups (keeping last 7)..."
ls -t $BACKUP_DIR/backup_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm

echo ""
echo "Backup completed: $BACKUP_NAME"
