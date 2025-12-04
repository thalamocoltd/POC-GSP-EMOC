# Deployment Files Overview

This document explains all the deployment-related files in this project and how to use them for deploying to Hostinger VPS or any production server.

## Files Structure

```
POC-GSP-EMOC/
├── .github/
│   └── workflows/
│       ├── deploy-vps.yml          # GitHub Actions auto-deployment
│       └── README.md               # GitHub Actions setup guide
├── Dockerfile                      # Multi-stage Docker build configuration
├── docker-compose.yml              # Standard Docker Compose with VPS optimizations
├── docker-compose.prod.yml         # Production Docker Compose with enhanced security
├── nginx.conf                      # Nginx web server configuration
├── .env.example                    # Environment variables template
├── deploy.sh                       # Automated deployment script
├── Makefile                        # Command shortcuts
├── DOCKER.md                       # Docker usage guide
├── HOSTINGER_DEPLOYMENT.md         # Complete VPS deployment guide
├── GITHUB_DEPLOY.md                # GitHub-based deployment guide
├── QUICK_START.md                  # Quick reference guide
└── DEPLOYMENT_README.md            # This file
```

## Quick Reference

### Local Development
```bash
# Start development server (with hot reload)
npm install
npm run dev
```

### Local Docker Testing
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at: http://localhost:3001
```

### VPS Deployment from GitHub (Quick)
```bash
# On your VPS - Deploy from GitHub
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc && \
cd /var/www/poc-gsp-emoc && \
mkdir -p logs/nginx && \
docker-compose up -d --build
```

### VPS Deployment with Script
```bash
# On your VPS
git clone <your-repo> /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc
chmod +x deploy.sh
./deploy.sh -y
```

### Automated Deployment (GitHub Actions)
Push to your `main` branch and GitHub Actions automatically deploys to VPS.
See [.github/workflows/README.md](.github/workflows/README.md) for setup.

### VPS Deployment (Production)
```bash
# On your VPS
git clone <your-repo> /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc

# Configure environment
cp .env.example .env
nano .env  # Edit as needed

# Deploy
chmod +x deploy.sh
COMPOSE_FILE=docker-compose.prod.yml ./deploy.sh -y
```

## File Descriptions

### Dockerfile
Multi-stage build configuration:
- **Stage 1 (Builder)**: Compiles the React app using Node.js
- **Stage 2 (Runtime)**: Serves the app using Nginx Alpine (lightweight)
- Final image size: ~50MB

### docker-compose.yml
Standard configuration with VPS optimizations:
- Port mapping: `3001:80` (host:container)
- Resource limits: 1 CPU, 512MB RAM max
- Log rotation: 10MB per file, 3 files max
- Health checks enabled
- Volume mounts for logs
- Security hardening

**When to use:**
- Development testing with Docker
- Quick VPS deployment
- Testing production builds locally

### docker-compose.prod.yml
Production-optimized configuration:
- Environment variable support via `.env` file
- Enhanced security (capability controls)
- Configurable resource limits
- Production logging
- Always restart policy

**When to use:**
- Production VPS deployment
- When you need environment-based configuration
- Maximum security requirements

### nginx.conf
Nginx web server configuration:
- SPA routing (all routes go to index.html)
- Static asset caching (1 year)
- Gzip compression
- Security headers
- Optimized for performance

### .env.example
Template for environment variables:
- Application configuration
- Resource limits
- API endpoints
- Timezone settings

**Usage:**
```bash
cp .env.example .env
# Edit .env with your values
```

### deploy.sh
Automated deployment script with:
- Prerequisites checking
- Automatic log backup
- Health checking
- Status reporting
- Old image cleanup

**Options:**
```bash
./deploy.sh              # Deploy with confirmation
./deploy.sh -y           # Deploy without confirmation
./deploy.sh -p           # Use production config
./deploy.sh --help       # Show help
```

## Deployment Scenarios

### Scenario 1: First Time VPS Deployment

1. **Read the complete guide:**
   ```bash
   cat HOSTINGER_DEPLOYMENT.md
   ```

2. **Install Docker on VPS:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

3. **Deploy application:**
   ```bash
   git clone <repo> /var/www/poc-gsp-emoc
   cd /var/www/poc-gsp-emoc
   chmod +x deploy.sh
   ./deploy.sh -y
   ```

4. **Setup reverse proxy and SSL:**
   Follow steps in HOSTINGER_DEPLOYMENT.md

### Scenario 2: Update Existing Deployment

```bash
cd /var/www/poc-gsp-emoc
git pull
./deploy.sh -y
```

### Scenario 3: Production with Custom Domain

1. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env
   ```

2. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Setup Nginx reverse proxy:**
   Follow HOSTINGER_DEPLOYMENT.md Step 4

4. **Setup SSL:**
   Follow HOSTINGER_DEPLOYMENT.md Step 5

### Scenario 4: Testing Production Build Locally

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Run locally
docker-compose -f docker-compose.prod.yml up

# Access at: http://localhost:3001
```

## Port Configuration

The application uses the following ports:

| Configuration | Host Port | Container Port | Description |
|--------------|-----------|----------------|-------------|
| docker-compose.yml | 3001 | 80 | Standard deployment |
| docker-compose.prod.yml | 3001 (configurable) | 80 | Production with .env |
| With reverse proxy | 80/443 | 3001 | Public access via Nginx |

To change the host port:
- **docker-compose.yml**: Edit line 14 (e.g., `"8080:80"`)
- **docker-compose.prod.yml**: Set `HOST_PORT=8080` in .env

## Environment Variables

Available environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | production | Node environment |
| TZ | Asia/Bangkok | Timezone |
| HOST_PORT | 3001 | Host port mapping |
| CPU_LIMIT | 1.0 | Maximum CPU cores |
| MEMORY_LIMIT | 512M | Maximum memory |
| LOG_MAX_SIZE | 10m | Max log file size |

## Resource Management

### Default Resource Limits

**docker-compose.yml:**
- CPU: 1.0 cores max, 0.25 cores reserved
- Memory: 512MB max, 128MB reserved

**docker-compose.prod.yml:**
- Configurable via .env variables

### Adjusting Resources

Edit docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Increase to 2 cores
      memory: 1G        # Increase to 1GB
```

Or for production (.env):
```env
CPU_LIMIT=2.0
MEMORY_LIMIT=1G
```

## Monitoring and Logs

### View Application Logs
```bash
# All logs
docker-compose logs -f

# Nginx access logs
tail -f logs/nginx/access.log

# Nginx error logs
tail -f logs/nginx/error.log
```

### Monitor Resources
```bash
# Container stats
docker stats GSP-EMOC-POC1

# System resources
htop
```

### Health Status
```bash
# Container health
docker inspect GSP-EMOC-POC1 | grep -A 10 Health

# Quick status
docker-compose ps
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
netstat -tulpn | grep 3001

# Change port in docker-compose.yml
ports:
  - "8080:80"
```

**Container keeps restarting:**
```bash
# Check logs
docker-compose logs GSP-EMOC-POC1

# Common causes:
# - Build errors
# - Port conflicts
# - Insufficient resources
```

**Can't access application:**
```bash
# Check container is running
docker-compose ps

# Check firewall
ufw status

# Test locally on VPS
curl http://localhost:3001
```

## Security Checklist

- [ ] Use docker-compose.prod.yml for production
- [ ] Configure .env with appropriate values
- [ ] Setup reverse proxy (Nginx)
- [ ] Enable SSL with Let's Encrypt
- [ ] Configure firewall (UFW)
- [ ] Enable Docker log rotation
- [ ] Regular security updates
- [ ] Backup logs and data
- [ ] Monitor resource usage
- [ ] Use strong passwords
- [ ] Disable root SSH login

## Best Practices

1. **Always use docker-compose.prod.yml in production**
2. **Keep .env file secure** (never commit to git)
3. **Setup SSL certificate** for HTTPS
4. **Monitor logs regularly**
5. **Backup before updates**
6. **Use reverse proxy** (Nginx) for production
7. **Enable firewall** (UFW)
8. **Keep Docker updated**
9. **Test locally** before VPS deployment
10. **Document custom changes**

## Backup and Restore

### Backup
```bash
# Backup application and logs
cd /var/www
tar -czf poc-backup-$(date +%Y%m%d).tar.gz poc-gsp-emoc/

# Backup only logs
cd /var/www/poc-gsp-emoc
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Restore
```bash
# Restore from backup
cd /var/www
tar -xzf poc-backup-20250101.tar.gz

# Redeploy
cd poc-gsp-emoc
./deploy.sh -y
```

## Update Process

### Regular Updates
```bash
cd /var/www/poc-gsp-emoc

# Pull latest code
git pull

# Backup current logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# Deploy updates
./deploy.sh -y

# Verify health
docker-compose ps
curl http://localhost:3001
```

### Rollback
```bash
# Stop current version
docker-compose down

# Checkout previous version
git log --oneline  # Find previous commit
git checkout <previous-commit-hash>

# Redeploy
./deploy.sh -y
```

## GitHub Actions CI/CD

### Automated Deployment Workflow

The project includes a GitHub Actions workflow that automatically deploys to your VPS when you push to the main branch.

**Location:** [.github/workflows/deploy-vps.yml](.github/workflows/deploy-vps.yml)

**Setup Steps:**
1. Generate SSH key pair for GitHub Actions
2. Add public key to VPS `~/.ssh/authorized_keys`
3. Add secrets to GitHub repository settings:
   - `VPS_HOST` - Your VPS IP or domain
   - `VPS_USERNAME` - SSH username
   - `VPS_SSH_KEY` - Private key content
   - `VPS_PORT` - SSH port (optional)
4. Push to main branch to trigger deployment

**Complete setup guide:** [.github/workflows/README.md](.github/workflows/README.md)

### Workflow Features

✅ Automatic deployment on push to main
✅ Manual trigger option
✅ Health check verification
✅ Deployment status notifications
✅ Automatic cleanup of old images

### Manual Trigger

You can also trigger deployment manually:
1. Go to GitHub repository → **Actions** tab
2. Select **Deploy to VPS** workflow
3. Click **Run workflow**

## Additional Resources

- **[DOCKER.md](DOCKER.md)** - Complete Docker usage guide
- **[HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)** - VPS deployment guide
- **[GITHUB_DEPLOY.md](GITHUB_DEPLOY.md)** - GitHub-based deployment options
- **[.github/workflows/README.md](.github/workflows/README.md)** - GitHub Actions setup
- **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
- **[CLAUDE.md](CLAUDE.md)** - Project development guide

## Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Check system resources: `docker stats`
4. Review HOSTINGER_DEPLOYMENT.md troubleshooting section

For Docker-specific issues:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

For VPS-specific issues:
- [Hostinger Support](https://www.hostinger.com/tutorials/vps)
