# Kubernetes Manifests

## Files
- `deployment.yaml` - App deployment with 3 replicas, health checks, resource limits
- `service.yaml` - LoadBalancer service
- `hpa.yaml` - Horizontal Pod Autoscaler (CPU/memory based)

## Deploy to Kubernetes
```bash
# Build image
docker build -t sre-demo-app:latest .

# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get svc
kubectl get hpa

# Test
kubectl port-forward svc/sre-demo-service 8080:80
curl http://localhost:8080/health
```

## Features
- 3 replicas for high availability
- Health checks (liveness + readiness)
- Resource requests/limits
- Auto-scaling (2-10 pods)
- LoadBalancer service
