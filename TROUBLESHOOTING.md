# Troubleshooting Guide

Common issues and solutions for deploying POC-1 GSP EMOC to Hostinger VPS.

## Docker Network Issues

### Error: "Pool overlaps with other one on this address space"

**Problem:** Docker network subnet conflicts with existing networks.

**Solution:**
```bash
# Option 1: Remove custom subnet (recommended - already fixed)
# The docker-compose files now use automatic network allocation

# Option 2: Clean up existing Docker networks
docker network prune

# Option 3: Remove specific conflicting network
docker network ls
docker network rm <network-name>

# Option 4: Use a different subnet (if needed)
# Edit docker-compose.yml and change subnet to unused range:
networks:
  poc-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16  # Different subnet
```

**Prevention:**
- Let Docker automatically assign network ranges (current setup)
- Check existing networks before deploying: `docker network ls`

### Error: "network not found"

**Solution:**
```bash
# Recreate the network
docker-compose down
docker-compose up -d
```

## Port Conflicts

### Error: "port is already allocated"

**Problem:** Port 3001 is already in use.

**Solution:**
```bash
# Find what's using the port
netstat -tulpn | grep 3001
# or
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

## Container Issues

### Container keeps restarting

**Diagnosis:**
```bash
# Check container logs
docker-compose logs GSP-EMOC-POC1

# Check container status
docker ps -a

# Inspect container
docker inspect GSP-EMOC-POC1
```

**Common Causes & Solutions:**

1. **Build failed:**
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Missing files:**
   ```bash
   # Ensure all files are present
   ls -la Dockerfile nginx.conf
   ```

3. **Permission issues:**
   ```bash
   # Fix log directory permissions
   mkdir -p logs/nginx
   chmod -R 755 logs
   ```

### Container exits immediately

**Check:**
```bash
# View full logs
docker-compose logs --tail=100 GSP-EMOC-POC1

# Common issues:
# - Port already in use
# - Missing nginx.conf
# - Build errors
# - Invalid configuration
```

**Solution:**
```bash
# Verify configuration
docker-compose config

# Start with verbose output
docker-compose up --build
```

## Build Issues

### Error: "COPY failed: no source files were specified"

**Problem:** Missing files in build context.

**Solution:**
```bash
# Ensure you're in the correct directory
cd /var/www/poc-gsp-emoc

# Check required files exist
ls -la Dockerfile nginx.conf package.json

# If files are missing, pull from GitHub
git pull
```

### Error: "npm ci" failed

**Problem:** Package installation issues.

**Solution:**
```bash
# Clean build
docker-compose down
docker image rm gsp-emoc-poc1:latest
docker-compose build --no-cache
docker-compose up -d
```

### Build is very slow

**Solution:**
```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build

# Clean up build cache if too large
docker builder prune
```

## Nginx Issues

### Error: "nginx: [emerg] open() "/etc/nginx/nginx.conf" failed"

**Problem:** Nginx configuration file is missing.

**Solution:**
```bash
# Ensure nginx.conf exists
ls -la nginx.conf

# If missing, download from GitHub
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/nginx.conf

# Rebuild
docker-compose up -d --build
```

### Error: 502 Bad Gateway

**Problem:** Nginx can't connect to application.

**Solution:**
```bash
# Check container is running
docker ps

# Check logs
docker-compose logs

# Restart container
docker-compose restart
```

## Permission Issues

### Error: "Permission denied" when creating logs

**Solution:**
```bash
# Create and fix log directory
mkdir -p logs/nginx
sudo chmod -R 755 logs
sudo chown -R $(whoami):$(whoami) logs
```

### Error: "Cannot write to /var/log/nginx"

**Solution:**
```bash
# Check volume mount
docker-compose config | grep volumes

# Ensure logs directory exists
mkdir -p logs/nginx
chmod 755 logs/nginx

# Restart
docker-compose restart
```

## Git Issues

### Error: "Repository not found"

**For private repositories:**
```bash
# Use Personal Access Token
git clone https://YOUR_TOKEN@github.com/USERNAME/REPO.git

# Or setup SSH key
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub  # Add to GitHub
git clone git@github.com:USERNAME/REPO.git
```

### Error: "Authentication failed"

**Solution:**
```bash
# Update remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/REPO.git

# Or use SSH
git remote set-url origin git@github.com:USERNAME/REPO.git
```

## Health Check Issues

### Health check always failing

**Diagnosis:**
```bash
# Check health status
docker inspect GSP-EMOC-POC1 | grep -A 10 Health

# Test endpoint manually
docker exec GSP-EMOC-POC1 wget -O- http://localhost/
```

**Solution:**
```bash
# Increase start period in docker-compose.yml
healthcheck:
  start_period: 30s  # Increase from 10s
```

## Resource Issues

### Error: "Out of memory"

**Solution:**
```bash
# Check memory usage
docker stats

# Increase limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G  # Increase from 512M

# Or free up system memory
docker system prune -a
```

### High CPU usage

**Solution:**
```bash
# Check what's using CPU
docker stats

# Limit CPU in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '0.5'  # Reduce if needed
```

## GitHub Actions Issues

### Error: "Permission denied (publickey)"

**Problem:** SSH authentication failed.

**Solution:**
```bash
# On VPS: Verify public key is added
cat ~/.ssh/authorized_keys

# On GitHub: Verify VPS_SSH_KEY secret contains private key
# Settings → Secrets → Actions → VPS_SSH_KEY

# Test SSH manually
ssh -i ~/.ssh/github_actions username@vps-ip
```

### Error: "git pull failed"

**Solution:**
```bash
# On VPS: Ensure repo is cloned
cd /var/www/poc-gsp-emoc
git status

# If not a git repo
cd /var/www
git clone https://github.com/USERNAME/REPO.git poc-gsp-emoc
```

### Workflow stuck or not triggering

**Check:**
1. Go to GitHub → Actions tab
2. Check workflow runs
3. Look for errors in logs

**Solution:**
```bash
# Verify secrets are set
# GitHub → Settings → Secrets → Actions

# Required secrets:
# - VPS_HOST
# - VPS_USERNAME
# - VPS_SSH_KEY
```

## Firewall Issues

### Cannot access application from browser

**Solution:**
```bash
# Check if firewall is blocking
ufw status

# Allow port
ufw allow 3001/tcp

# Or disable firewall temporarily (not recommended)
ufw disable
```

### Can access locally but not externally

**Check:**
1. VPS firewall settings
2. Hostinger control panel firewall
3. Port forwarding rules

**Solution:**
```bash
# Test locally first
curl http://localhost:3001

# Check what's listening
netstat -tulpn | grep 3001

# Ensure binding to all interfaces (0.0.0.0)
# Docker does this by default
```

## SSL/HTTPS Issues

### Certificate renewal failed

**Solution:**
```bash
# Check certificate status
certbot certificates

# Renew manually
certbot renew

# If still failing
certbot renew --force-renewal
```

### Mixed content warnings

**Problem:** HTTP resources loaded on HTTPS page.

**Solution:**
```bash
# Update nginx config to redirect HTTP to HTTPS
# See HOSTINGER_DEPLOYMENT.md for SSL setup
```

## Deployment Script Issues

### deploy.sh: Permission denied

**Solution:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Script fails at health check

**Solution:**
```bash
# Increase timeout in deploy.sh
# Or skip health check
docker-compose up -d --build
docker-compose ps  # Check manually
```

## Data Persistence Issues

### Logs disappear after restart

**Problem:** Volume not properly mounted.

**Check:**
```bash
# Verify volume mount
docker inspect GSP-EMOC-POC1 | grep -A 10 Mounts

# Should show:
# "Source": "/var/www/poc-gsp-emoc/logs/nginx"
# "Destination": "/var/log/nginx"
```

**Solution:**
```bash
# Ensure logs directory exists
mkdir -p logs/nginx

# Recreate container
docker-compose down
docker-compose up -d
```

## Environment Variables Not Working

**Problem:** .env file not loaded.

**Solution:**
```bash
# Ensure .env is in same directory as docker-compose.yml
ls -la .env

# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check loaded environment
docker exec GSP-EMOC-POC1 env
```

## Debugging Commands

### Essential debugging commands:

```bash
# View all logs
docker-compose logs -f

# Check container status
docker-compose ps

# Inspect container
docker inspect GSP-EMOC-POC1

# Execute command in container
docker exec -it GSP-EMOC-POC1 sh

# Check resource usage
docker stats GSP-EMOC-POC1

# View network info
docker network inspect poc-network

# Check configuration
docker-compose config

# View images
docker images

# Check disk usage
docker system df
```

### Full diagnostic script:

```bash
#!/bin/bash
echo "=== Container Status ==="
docker-compose ps

echo -e "\n=== Recent Logs ==="
docker-compose logs --tail=50

echo -e "\n=== Resource Usage ==="
docker stats --no-stream GSP-EMOC-POC1

echo -e "\n=== Health Check ==="
docker inspect GSP-EMOC-POC1 | grep -A 5 Health

echo -e "\n=== Network ==="
docker network ls | grep poc

echo -e "\n=== Port Bindings ==="
netstat -tulpn | grep 3001

echo -e "\n=== Disk Usage ==="
docker system df

echo -e "\n=== Configuration ==="
docker-compose config
```

Save as `diagnose.sh` and run: `bash diagnose.sh`

## Getting Help

If you're still stuck:

1. **Check logs:**
   ```bash
   docker-compose logs --tail=200 > deployment-logs.txt
   ```

2. **Run diagnostics:**
   ```bash
   docker-compose config
   docker inspect GSP-EMOC-POC1
   ```

3. **Review documentation:**
   - [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
   - [GITHUB_DEPLOY.md](GITHUB_DEPLOY.md)
   - [DEPLOYMENT_README.md](DEPLOYMENT_README.md)

4. **Check system resources:**
   ```bash
   df -h          # Disk space
   free -h        # Memory
   top            # CPU usage
   ```

## Clean Slate Reset

If everything is broken, start fresh:

```bash
# Stop everything
docker-compose down -v

# Remove all containers and images
docker system prune -a

# Remove repository
rm -rf /var/www/poc-gsp-emoc

# Start over
git clone https://github.com/USERNAME/REPO.git /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc
mkdir -p logs/nginx
docker-compose up -d --build
```

## Prevention Tips

1. ✅ Always check logs: `docker-compose logs -f`
2. ✅ Verify configuration: `docker-compose config`
3. ✅ Test locally first: `docker-compose up` (without -d)
4. ✅ Keep backups: `make backup`
5. ✅ Monitor resources: `docker stats`
6. ✅ Update regularly: `git pull && docker-compose up -d --build`
7. ✅ Clean up: `docker system prune` periodically
8. ✅ Document changes: Keep notes of configuration changes

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Network conflict | `docker network prune` |
| Port in use | Change port or `kill -9 <PID>` |
| Container restarting | `docker-compose logs` |
| Build failed | `docker-compose build --no-cache` |
| Permission denied | `chmod -R 755 logs` |
| Health check failing | Increase `start_period` |
| Out of memory | Increase memory limit or `docker system prune` |
| Git issues | Use token: `https://TOKEN@github.com/...` |
| Can't access app | `ufw allow 3001/tcp` |

---

**Need more help?** Check the full deployment guides:
- [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
- [GITHUB_DEPLOY.md](GITHUB_DEPLOY.md)
