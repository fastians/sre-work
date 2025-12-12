# Production-Level Directory Structure

```
02-ci-cd/
├── backend/                    # Backend application
│   ├── __init__.py
│   ├── app/                    # Core application
│   │   ├── __init__.py
│   │   └── main.py            # FastAPI application
│   └── config/                 # Configuration
│       ├── __init__.py
│       └── settings.py        # Centralized settings
│
├── frontend/                   # Frontend application
│   ├── public/                # Static files
│   │   ├── user.html          # User-facing e-commerce site
│   │   ├── user.css
│   │   ├── user.js
│   │   ├── admin.html         # Admin dashboard (internal)
│   │   ├── admin.css
│   │   ├── admin.js
│   │   ├── sre.html           # SRE monitoring (internal)
│   │   ├── sre.css
│   │   └── sre.js
│   └── assets/                # Images, fonts, etc.
│
├── logs/                       # Application logs
│   └── app.log
│
├── data/                       # Data storage (if needed)
│
├── k8s/                        # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
│
├── tests/                      # Test suite
│   └── test_app.py
│
├── scripts/                    # Utility scripts
│   └── traffic_simulator.py  # Traffic generation tool
│
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── Dockerfile                 # Container image definition
├── docker-compose.yml         # Local development orchestration
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
└── STRUCTURE.md              # This file

```

## Architecture Principles

### Separation of Concerns
- **Backend**: Pure API logic, no HTML templates
- **Frontend**: Static files served by FastAPI
- **Config**: Centralized configuration management
- **Tests**: Isolated test suite

### Production Ready
- Environment-based configuration (.env)
- Structured logging
- Health checks
- Metrics endpoints
- Proper error handling
- Docker multi-stage builds (future)

### Scalability
- Stateless application design
- Horizontal scaling ready
- Database abstraction (future)
- Caching layer support
- CDN-ready static assets

## Access Control

### Public (User-Facing)
- `/` - E-commerce frontend
- `/health` - Health check
- `/api` - API info

### Internal (Admin/SRE - Should be protected in production)
- `/admin` - Admin dashboard
- `/sre` - SRE monitoring
- `/metrics` - Prometheus metrics
- `/docs` - API documentation

## Environment Variables

See `.env.example` for all configuration options.

## Development vs Production

### Development
```bash
# Use docker-compose
docker compose up -d
```

### Production
```bash
# Use Kubernetes
kubectl apply -f k8s/

# Or optimized Docker
docker build -t techstore:latest .
docker run -p 5000:5000 --env-file .env techstore:latest
```

## Future Enhancements

1. **Database Layer**: PostgreSQL/MongoDB integration
2. **Authentication**: JWT-based auth for admin/SRE
3. **API Gateway**: nginx/traefik reverse proxy
4. **Caching**: Redis for sessions and data
5. **Message Queue**: Celery for async tasks
6. **Monitoring**: Full Grafana dashboards
7. **CI/CD**: Automated testing and deployment
8. **Frontend Framework**: Consider React/Vue for admin
