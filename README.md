# SRE Portfolio - Proof of Experience

Complete SRE portfolio demonstrating monitoring, CI/CD, containerization, orchestration, automation, and incident response.

## Structure

### 01-monitoring/
**Prometheus + Grafana monitoring stack**
- Full observability setup with node-exporter
- Auto-provisioned Grafana datasource
- Start: `cd 01-monitoring && docker compose up -d`
- Access: Prometheus (9090), Grafana (3000)

### 02-ci-cd/
**CI/CD pipeline with GitHub Actions, Docker, Kubernetes**
- FastAPI backend with Prometheus metrics
- JavaScript frontend dashboard (real-time monitoring)
- CRUD operations for order management
- Traffic simulator (universal, works with any API)
- Dockerfile with multi-stage build
- Kubernetes manifests (deployment, service, HPA)
- Automated testing on push
- Container orchestration ready

### 03-automation/
**Automation scripts for common SRE tasks**
- Log cleanup with retention policy
- Disk space monitoring with alerts
- Backup automation with rotation
- All scripts create demo data for testing

### 04-runbooks/
**Incident response documentation**
- High CPU usage troubleshooting
- Service downtime resolution
- Deployment checklist with rollback

## Quick Start

```bash
# 1. Monitoring
cd 01-monitoring
docker compose up -d
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:19090

# 2. CI/CD - Docker
cd 02-ci-cd
docker compose up -d
# User Site: http://localhost:5001 (E-commerce Frontend)
# Admin Dashboard: http://localhost:5001/admin (Traffic Simulation)
# SRE Dashboard: http://localhost:5001/sre (Monitoring & Ops)
# API Docs: http://localhost:5001/docs
# Metrics: http://localhost:5001/metrics

# 3. Traffic Simulation
cd 02-ci-cd
python traffic_simulator.py
# Or with custom URL: python traffic_simulator.py --url https://your-api.com

# 4. CI/CD - Kubernetes (requires cluster)
kubectl apply -f 02-ci-cd/k8s/
kubectl get all

# 5. Automation
cd 03-automation
./disk_monitor.sh
./backup_script.sh
./cleanup_logs.sh

# 6. Demo everything
./quick_demo.sh
```

## Technologies

- **Monitoring**: Prometheus, Grafana, Node Exporter
- **Backend**: FastAPI, Python, Uvicorn
- **Frontend**: JavaScript (Vanilla), HTML5, CSS3
- **Containers**: Docker, Docker Compose
- **Orchestration**: Kubernetes, HPA
- **CI/CD**: GitHub Actions, Pytest
- **Languages**: Python, JavaScript, Bash
- **Infrastructure**: YAML manifests, Dockerfiles

## Screenshots

Each section has `assets/screenshots/` folder for proof documentation.
See `SCREENSHOT_GUIDE.md` for detailed instructions on capturing evidence.
