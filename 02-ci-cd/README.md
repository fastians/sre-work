# TechStore - Production-Ready SRE Demo

Professional e-commerce platform demonstrating **production-level architecture**, **SRE best practices**, and **comprehensive monitoring**.

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

## 📁 Production-Level Structure

```
02-ci-cd/
├── backend/                      # Backend application
│   ├── app/
│   │   └── main.py              # FastAPI app (production-ready)
│   └── config/
│       └── settings.py          # Centralized configuration
│
├── frontend/                     # Frontend application
│   ├── public/                  # Static files
│   │   ├── user.html/css/js    # Customer-facing site (no admin links!)
│   │   ├── admin.html/css/js   # Internal admin dashboard
│   │   └── sre.html/css/js     # Internal SRE monitoring
│   └── assets/                  # Images, fonts
│
├── logs/                         # Application logs
├── data/                         # Persistent data
├── k8s/                          # Kubernetes manifests
├── scripts/                      # Utility scripts
│
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── Dockerfile                    # Production container
├── docker-compose.yml            # Local development
├── requirements.txt              # Python dependencies
├── README.md                     # This file
└── STRUCTURE.md                  # Architecture details
```

See [STRUCTURE.md](STRUCTURE.md) for detailed architecture documentation.

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
