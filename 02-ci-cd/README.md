# CI/CD Pipeline

## Local Testing
```bash
pip install -r requirements.txt
python app.py
pytest test_app.py
```

## Docker
```bash
# Build and run
docker build -t sre-demo-app .
docker run -p 5000:5000 sre-demo-app

# Or use docker-compose
docker compose up -d
```

## Kubernetes
```bash
# Deploy to cluster
kubectl apply -f k8s/

# Check status
kubectl get all
```

## GitHub Actions
Workflow triggers on push to main/master branch.

## Screenshots
Screenshots saved in: `assets/screenshots/`
