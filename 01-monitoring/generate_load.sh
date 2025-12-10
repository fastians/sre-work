#!/bin/bash

# Generate CPU load for testing monitoring
# This creates realistic metrics for screenshots

echo "=== Load Generator ==="
echo "Generating CPU load for 30 seconds..."
echo "Watch metrics at:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3000"
echo ""

# Generate CPU load (runs 4 parallel processes)
for i in {1..4}; do
  (while true; do echo "load" > /dev/null; done) &
  PIDS[$i]=$!
done

echo "CPU load running (PIDs: ${PIDS[@]})"
echo "Monitoring for 30 seconds..."
sleep 30

# Stop load
echo "Stopping load generators..."
for pid in ${PIDS[@]}; do
  kill $pid 2>/dev/null
done

echo "Done! Check your monitoring dashboards now."
