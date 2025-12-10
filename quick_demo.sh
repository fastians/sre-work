#!/bin/bash

echo "========================================"
echo "SRE Portfolio Demo Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Starting Monitoring Stack${NC}"
echo "Command: cd 01-monitoring && docker compose up -d"
cd 01-monitoring
docker compose up -d
cd ..
echo -e "${GREEN}✓ Prometheus running on http://localhost:9090${NC}"
echo -e "${GREEN}✓ Grafana running on http://localhost:3000 (admin/admin)${NC}"
echo -e "${GREEN}✓ Node Exporter running on http://localhost:9100${NC}"
echo ""
sleep 2

echo -e "${YELLOW}Step 2: Testing Automation Scripts${NC}"
cd 03-automation
echo "Running: ./disk_monitor.sh"
./disk_monitor.sh
echo ""
sleep 1

echo "Running: ./cleanup_logs.sh"
./cleanup_logs.sh
echo ""
sleep 1

echo "Running: ./backup_script.sh"
./backup_script.sh
echo ""
cd ..

echo -e "${YELLOW}Step 3: CI/CD App Info${NC}"
echo "To test the Flask app:"
echo "  cd 02-ci-cd"
echo "  python3 -m venv venv"
echo "  source venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "  python app.py"
echo ""
echo "To run tests:"
echo "  pytest test_app.py -v"
echo ""

echo "========================================"
echo -e "${GREEN}Demo Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps for screenshots:"
echo "1. Visit http://localhost:9090 (Prometheus)"
echo "2. Visit http://localhost:3000 (Grafana - import dashboard 1860)"
echo "3. Run Flask app in 02-ci-cd/"
echo "4. Push to GitHub and capture Actions tab"
echo ""
echo "See SCREENSHOT_GUIDE.md for detailed instructions"
