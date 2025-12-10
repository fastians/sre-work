# High CPU Usage Runbook

## Alert Criteria
CPU usage > 80% for 5+ minutes

## Investigation Steps

1. **Check current CPU usage**
   ```bash
   top -bn1 | head -20
   htop
   ```

2. **Identify top processes**
   ```bash
   ps aux --sort=-%cpu | head -10
   ```

3. **Check system load**
   ```bash
   uptime
   cat /proc/loadavg
   ```

## Resolution Steps

1. **Kill problematic process** (if safe)
   ```bash
   kill -15 <PID>
   kill -9 <PID>  # Force kill if needed
   ```

2. **Restart service**
   ```bash
   systemctl restart <service-name>
   ```

3. **Scale horizontally** (if applicable)
   - Add more instances
   - Enable auto-scaling

## Prevention
- Set CPU limits in containers
- Optimize code for performance
- Implement rate limiting
- Monitor trends and scale proactively
