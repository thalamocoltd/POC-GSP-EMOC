# Quick Start Guide

## 🚀 5-Minute VPS Deployment

### Prerequisites
- Hostinger VPS (or any Linux VPS)
- GitHub repository (public or private)
- SSH access to VPS

### Option 1: Deploy from GitHub (Recommended)
```bash
# Install Docker + Deploy from GitHub (Public Repo)
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc && \
cd /var/www/poc-gsp-emoc && \
mkdir -p logs/nginx && \
docker-compose up -d --build
```

**For Private Repo:** Add your GitHub token before the URL:
```bash
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc
```

### Option 2: Deploy with Script
```bash
curl -fsSL https://get.docker.com | sh && \
git clone <your-repo> /var/www/poc-gsp-emoc && \
cd /var/www/poc-gsp-emoc && \
chmod +x deploy.sh && \
./deploy.sh -y
```

Access at: `http://your-vps-ip:3001`

📖 **See [GITHUB_DEPLOY.md](GITHUB_DEPLOY.md) for detailed GitHub deployment options**

---

## 📋 Common Commands

### Using Make (Recommended)
```bash
make help          # Show all available commands
make deploy        # Deploy application
make deploy-prod   # Deploy with production config
make logs          # View logs
make status        # Check status
make restart       # Restart application
make health        # Check health
```

### Using Docker Compose
```bash
# Standard deployment
docker-compose up -d --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

### Using Deploy Script
```bash
./deploy.sh              # Deploy with confirmation
./deploy.sh -y           # Deploy without confirmation
./deploy.sh -p           # Production deployment
```

---

## 🔧 Quick Configurations

### Change Port
Edit [docker-compose.yml](docker-compose.yml):
```yaml
ports:
  - "8080:80"  # Change 3001 to 8080
```

### Add Environment Variables
```bash
cp .env.example .env
nano .env
```

Then use production config:
```bash
make deploy-prod
# or
docker-compose -f docker-compose.prod.yml up -d --build
```

### Setup Custom Domain with SSL
```bash
# Install Nginx and Certbot
apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/poc-gsp-emoc

# Get SSL certificate
certbot --nginx -d yourdomain.com
```

Full guide: [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)

---

## 🔍 Troubleshooting

### Container not starting
```bash
# Check logs
docker-compose logs GSP-EMOC-POC1

# Check if port is in use
netstat -tulpn | grep 3001
```

### Port already in use
```bash
# Find what's using the port
lsof -i :3001

# Or change the port in docker-compose.yml
```

### Health check failing
```bash
# Check container status
docker ps -a

# Test endpoint
curl http://localhost:3001

# Inspect health
docker inspect GSP-EMOC-POC1 | grep -A 10 Health
```

### Cannot access from browser
```bash
# Check firewall
ufw status

# Allow port
ufw allow 3001/tcp
```

---

## 📊 Monitoring

### View Logs
```bash
# All logs
make logs

# Nginx logs only
make logs-nginx

# Or directly
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

### Check Resources
```bash
make status

# Or directly
docker stats GSP-EMOC-POC1
```

### Health Check
```bash
make health

# Or directly
curl http://localhost:3001
```

---

## 🔄 Update & Maintain

### Update Application
```bash
cd /var/www/poc-gsp-emoc
git pull
make deploy
```

### Backup Before Update
```bash
make backup
# Backup saved to backups/ directory
```

### Cleanup Old Resources
```bash
make prune
```

---

## 📁 File Structure

```
POC-GSP-EMOC/
├── Dockerfile                    # Docker build config
├── docker-compose.yml            # Standard config
├── docker-compose.prod.yml       # Production config
├── nginx.conf                    # Web server config
├── .env.example                  # Environment template
├── deploy.sh                     # Deployment script
├── Makefile                      # Command shortcuts
│
├── DOCKER.md                     # Docker guide
├── HOSTINGER_DEPLOYMENT.md       # Complete VPS guide
├── DEPLOYMENT_README.md          # Deployment files overview
└── QUICK_START.md               # This file
```

---

## 🎯 Deployment Scenarios

### Scenario 1: First Time Local Testing
```bash
# Clone repo
git clone <repo> poc-gsp-emoc
cd poc-gsp-emoc

# Test with Docker
make up

# Access at http://localhost:3001
```

### Scenario 2: First Time VPS Deployment
```bash
# On VPS
git clone <repo> /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc

# Deploy
make deploy

# Access at http://your-vps-ip:3001
```

### Scenario 3: Production with Domain
```bash
# Setup environment
make create-env
nano .env

# Deploy production
make deploy-prod

# Setup Nginx + SSL
# Follow HOSTINGER_DEPLOYMENT.md Step 4 & 5

# Access at https://yourdomain.com
```

### Scenario 4: Update Existing Deployment
```bash
cd /var/www/poc-gsp-emoc
make backup
make update
```

---

## ⚙️ Configuration Examples

### Increase Resources
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
```

### Change Timezone
Edit `docker-compose.yml`:
```yaml
environment:
  - TZ=America/New_York
```

### Add Custom Environment Variables
Create `.env`:
```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My Custom App
```

Use production config:
```bash
make deploy-prod
```

---

## 🔒 Security Checklist

Quick security setup:

```bash
# 1. Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 2. Setup SSL
certbot --nginx -d yourdomain.com

# 3. Use production config
make deploy-prod

# 4. Regular updates
apt update && apt upgrade -y
docker system prune -f
```

---

## 📚 Documentation Links

- **[DOCKER.md](DOCKER.md)** - Complete Docker usage guide
- **[HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)** - Step-by-step VPS deployment
- **[DEPLOYMENT_README.md](DEPLOYMENT_README.md)** - Detailed deployment file documentation

---

## 🆘 Need Help?

### Quick Diagnostics
```bash
# Check everything
make info
make status
make health

# View all logs
make logs
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Change port in docker-compose.yml |
| Container exits | Check logs: `make logs` |
| Can't access | Check firewall: `ufw status` |
| High memory | Adjust limits in docker-compose.yml |
| Build errors | Clean build: `make clean && make build` |

### Still Stuck?

1. Check full documentation in HOSTINGER_DEPLOYMENT.md
2. Review logs: `make logs`
3. Check container status: `make status`
4. Test health: `make health`

---

## 🎓 Learn More

- Docker basics: https://docs.docker.com/get-started/
- Docker Compose: https://docs.docker.com/compose/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/

---

**Happy Deploying! 🚀**
