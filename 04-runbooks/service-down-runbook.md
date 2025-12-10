# Service Down Runbook

## Alert Criteria
Service health check failing or HTTP 5xx errors

## Investigation Steps

1. **Check service status**
   ```bash
   systemctl status <service-name>
   docker ps -a
   kubectl get pods
   ```

2. **Check logs**
   ```bash
   journalctl -u <service-name> -n 100
   docker logs <container-name>
   kubectl logs <pod-name>
   ```

3. **Check connectivity**
   ```bash
   curl -v http://localhost:<port>/health
   telnet localhost <port>
   ```

4. **Check resources**
   ```bash
   df -h
   free -m
   top
   ```

## Resolution Steps

1. **Restart service**
   ```bash
   systemctl restart <service-name>
   docker restart <container-name>
   kubectl rollout restart deployment/<name>
   ```

2. **Rollback deployment** (if recent change)
   ```bash
   kubectl rollout undo deployment/<name>
   git revert <commit-hash>
   ```

3. **Scale up replicas**
   ```bash
   kubectl scale deployment/<name> --replicas=3
   ```

## Prevention
- Implement health checks
- Set up monitoring alerts
- Enable auto-restart policies
- Maintain deployment rollback capability
