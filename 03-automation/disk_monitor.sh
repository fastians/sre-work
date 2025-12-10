#!/bin/bash

# Disk space monitoring script
# Alerts when disk usage exceeds threshold

THRESHOLD=80

echo "=== Disk Space Monitor ==="
echo "Threshold: ${THRESHOLD}%"
echo ""

df -h | grep -vE '^Filesystem|tmpfs|cdrom' | awk '{ print $5 " " $1 " " $6 }' | while read output;
do
  usage=$(echo $output | awk '{ print $1}' | sed 's/%//g')
  partition=$(echo $output | awk '{ print $2 }')
  mount=$(echo $output | awk '{ print $3 }')

  if [ $usage -ge $THRESHOLD ]; then
    echo "ALERT: Partition $partition ($mount) at ${usage}% - CRITICAL"
  else
    echo "OK: Partition $partition ($mount) at ${usage}%"
  fi
done
