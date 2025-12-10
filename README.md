# SRE Portfolio - Proof of Experience

## Structure

### 01-monitoring/
Prometheus + Grafana monitoring stack
- Start: `cd 01-monitoring && docker compose up -d`
- Access: Prometheus (9090), Grafana (3000)

### 02-ci-cd/
CI/CD pipeline with GitHub Actions
- Test locally: `cd 02-ci-cd && pip install -r requirements.txt && pytest`
- Automated tests run on push to main

### 03-automation/
Automation scripts for common SRE tasks
- Log cleanup
- Disk monitoring
- Backup automation

### 04-runbooks/
Incident response documentation
- High CPU usage
- Service downtime
- Deployment procedures

## Quick Start
```bash
# Monitoring
cd 01-monitoring && docker compose up -d

# CI/CD local test
cd 02-ci-cd && pip install -r requirements.txt && python app.py

# Automation
cd 03-automation && ./disk_monitor.sh
```

## Screenshots
Each section has `assets/screenshots/` folder for proof documentation.
