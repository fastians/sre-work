# Deployment Checklist

## Pre-Deployment

- [ ] Code review completed and approved
- [ ] All tests passing (unit, integration, e2e)
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

## Deployment Steps

- [ ] Create deployment branch
- [ ] Tag release version
- [ ] Backup current production state
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Monitor staging metrics
- [ ] Deploy to production (blue-green/canary)
- [ ] Verify health checks passing
- [ ] Check application logs
- [ ] Monitor key metrics

## Post-Deployment

- [ ] Verify core functionality working
- [ ] Check database connections
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Review user feedback/reports
- [ ] Update incident log (if applicable)
- [ ] Send deployment notification
- [ ] Update status page

## Rollback Criteria

- Error rate > 5%
- Response time > 2x baseline
- Critical functionality broken
- Database migration failure

## Rollback Steps

```bash
# Kubernetes
kubectl rollout undo deployment/<name>

# Docker
docker-compose down
docker-compose -f docker-compose.backup.yml up -d

# Git
git revert <commit>
git push origin main
```
