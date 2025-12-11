# Full-Stack SRE Demo Application

Modern application demonstrating SRE practices with **FastAPI backend**, **JavaScript frontends**, and **comprehensive monitoring**.

## 🚀 Quick Start

```bash
docker compose up -d
```

Then access:
- **User Site**: http://localhost:5001
- **Admin Dashboard**: http://localhost:5001/admin
- **SRE Dashboard**: http://localhost:5001/sre
- **API Docs**: http://localhost:5001/docs

## 📱 Three Realistic Interfaces

### 1. User Frontend (http://localhost:5001)
**E-commerce marketplace** for end users
- Product catalog with 12 realistic products
- Filter by category (Laptops, Smartphones, Accessories)
- Price range filtering
- Shopping cart with quantity management
- Order placement and tracking
- Responsive design

### 2. Admin Dashboard (http://localhost:5001/admin)
**Traffic simulation and management**
- Traffic simulation modes:
  - Light (10 req/min)
  - Moderate (30 req/min)
  - Heavy (60 req/min)
  - Stress (100 req/min)
  - Traffic spike
- Error injection (500, 404, timeouts)
- Real-time activity logs
- Session statistics
- Quick actions (bulk orders, load generation)

### 3. SRE Dashboard (http://localhost:5001/sre)
**Monitoring and operations**
- Real-time metrics (request rate, error rate, P95 latency)
- Service health monitoring
- Live request timeline chart
- SLI/SLO compliance tracking
- Alert management
- Operations log
- System uptime tracking

## 🛠️ Technologies

- **Backend**: FastAPI 0.109, Python 3.11, Uvicorn
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Monitoring**: Prometheus, prometheus-client
- **Container**: Docker, Docker Compose
- **Orchestration**: Kubernetes manifests included

## 📊 Monitoring Integration

### Prometheus Metrics
Exposed at `/metrics`:
```
app_requests_total          # Counter: total requests
app_request_duration_seconds # Histogram: request latency
app_active_orders           # Gauge: current orders
app_errors_total            # Counter: errors by type
```

### View in Prometheus
http://localhost:19090

Example queries:
```promql
rate(app_requests_total[5m])
histogram_quantile(0.95, rate(app_request_duration_seconds_bucket[5m]))
```

### Grafana Dashboards
http://localhost:3000 (admin/admin)

## 🧪 Testing & Simulation

### Manual Testing
1. Open user site → Add products to cart → Checkout
2. Open admin → Start traffic simulation
3. Open SRE dashboard → Monitor metrics

### Automated Traffic
```bash
python traffic_simulator.py --mode stress --url http://localhost:5001
```

## 📁 Project Structure

```
02-ci-cd/
├── app.py                    # FastAPI application
├── requirements.txt          # Dependencies
├── Dockerfile               # Container image
├── docker-compose.yml       # Local orchestration
├── traffic_simulator.py     # Universal traffic generator
├── static/
│   ├── user.html/css/js    # E-commerce frontend
│   ├── admin.html/css/js   # Admin dashboard
│   └── sre.html/css/js     # SRE dashboard
└── k8s/                     # Kubernetes manifests
```

## 🔧 Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app:app --reload --host 0.0.0.0 --port 5000

# Run tests
pytest test_app.py
```

## 🐳 Docker

```bash
# Build
docker build -t sre-demo-app .

# Run
docker run -p 5001:5000 sre-demo-app

# Or use compose
docker compose up -d
docker compose logs -f
```

## ☸️ Kubernetes

```bash
kubectl apply -f k8s/
kubectl get all
kubectl port-forward svc/sre-demo-app 5001:5000
```

## 📸 Screenshots

Save to `assets/screenshots/` for portfolio documentation.

## 🎯 Use Cases

- **SRE Portfolio**: Demonstrate monitoring and observability skills
- **Learning**: Understand full-stack application with metrics
- **Load Testing**: Simulate realistic traffic patterns
- **Presentations**: Show end-to-end SRE workflow
