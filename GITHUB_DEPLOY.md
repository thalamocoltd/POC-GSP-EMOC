# Deploy from GitHub Repository URL

This guide shows how to deploy directly from your GitHub repository to Hostinger VPS without cloning the repo first.

## Method 1: Deploy Using Docker Compose URL (Recommended)

### Prerequisites
- Docker and Docker Compose installed on VPS
- Public GitHub repository (or private with access token)

### One-Command Deployment

For **public repositories**:
```bash
docker-compose -f https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml up -d
```

For **private repositories** (with access token):
```bash
docker-compose -f https://YOUR_TOKEN@raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml up -d
```

### Complete Deployment Steps

#### 1. Install Docker on Hostinger VPS
```bash
# Connect to VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 2. Setup Deployment Directory
```bash
mkdir -p /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc

# Create logs directory
mkdir -p logs/nginx
chmod -R 755 logs
```

#### 3. Deploy from GitHub

**Option A: Using raw GitHub URL**
```bash
# For public repo
docker-compose -f https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml up -d --build

# For private repo (replace YOUR_TOKEN with your GitHub Personal Access Token)
docker-compose -f https://YOUR_TOKEN@raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml up -d --build
```

**Option B: Download compose file first**
```bash
# Download docker-compose.yml
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml

# Or for private repo
wget --header="Authorization: token YOUR_TOKEN" https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml

# Deploy
docker-compose up -d --build
```

#### 4. Verify Deployment
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test locally
curl http://localhost:3001
```

## Method 2: Deploy with Custom Script

I've created a deployment script that pulls everything from GitHub automatically.

### Create the deployment script on your VPS:

```bash
cd /var/www/poc-gsp-emoc
nano github-deploy.sh
```

Paste the following script:

```bash
#!/bin/bash
# GitHub-based deployment script for Hostinger VPS

set -e

# Configuration
GITHUB_USER="YOUR_USERNAME"
GITHUB_REPO="YOUR_REPO"
GITHUB_BRANCH="main"
GITHUB_TOKEN=""  # Optional: for private repos

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Deploying from GitHub...${NC}"

# Create directory structure
mkdir -p logs/nginx
chmod -R 755 logs

# Download docker-compose.yml
echo -e "${BLUE}Downloading docker-compose.yml...${NC}"
if [ -z "$GITHUB_TOKEN" ]; then
    # Public repo
    wget -O docker-compose.yml "https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/docker-compose.yml"
    wget -O nginx.conf "https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/nginx.conf"
    wget -O Dockerfile "https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/Dockerfile"
else
    # Private repo
    wget --header="Authorization: token ${GITHUB_TOKEN}" -O docker-compose.yml "https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/docker-compose.yml"
    wget --header="Authorization: token ${GITHUB_TOKEN}" -O nginx.conf "https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/nginx.conf"
    wget --header="Authorization: token ${GITHUB_TOKEN}" -O Dockerfile "https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/Dockerfile"
fi

# Build and deploy
echo -e "${BLUE}Building and deploying...${NC}"
docker-compose up -d --build

# Check status
echo -e "${GREEN}Deployment complete!${NC}"
docker-compose ps

echo -e "${BLUE}Access your application at: http://$(curl -s ifconfig.me):3001${NC}"
```

Make it executable and run:
```bash
chmod +x github-deploy.sh
./github-deploy.sh
```

## Method 3: Using Git Clone (Traditional)

If you need the full repository:

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git poc-gsp-emoc
cd poc-gsp-emoc
docker-compose up -d --build
```

For private repos:
```bash
# Using Personal Access Token
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git poc-gsp-emoc

# Or using SSH (setup SSH key first)
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git poc-gsp-emoc
```

## Method 4: Complete One-Line Deployment

Here's a complete one-liner that installs Docker, downloads your config, and deploys:

```bash
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
mkdir -p /var/www/poc-gsp-emoc && \
cd /var/www/poc-gsp-emoc && \
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml && \
docker-compose up -d --build
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO` with your repository name
- `main` with your branch name (if different)

## GitHub Personal Access Token Setup

For private repositories, you need a Personal Access Token:

### 1. Create Token on GitHub:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "VPS Deployment"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 2. Use Token in Commands:
```bash
# In URLs
https://YOUR_TOKEN@raw.githubusercontent.com/...

# With wget
wget --header="Authorization: token YOUR_TOKEN" https://raw.githubusercontent.com/...

# With git
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git
```

## Docker Compose Context

Docker Compose supports building from git repositories directly:

```bash
# Build from git context
docker-compose -f - <<EOF
version: '3.9'
services:
  GSP-EMOC-POC1:
    build:
      context: https://github.com/YOUR_USERNAME/YOUR_REPO.git#main
      dockerfile: Dockerfile
    ports:
      - "3001:80"
    restart: unless-stopped
EOF
```

## Important Considerations

### ⚠️ Limitations of URL-based Deployment

1. **Build Context:** Docker needs the full repository to build the image, not just the compose file
2. **Volume Mounts:** Local volumes (like logs) need to be created on the VPS
3. **Environment Files:** `.env` files need to be created manually on the VPS

### ✅ Recommended Approach

**Best practice:** Clone the repository to get build context, then deploy:

```bash
# One-time setup
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc
docker-compose up -d --build

# For updates
cd /var/www/poc-gsp-emoc
git pull
docker-compose up -d --build
```

## Auto-Update Script

Create a webhook or cron job to auto-deploy on GitHub pushes:

### Using Cron (checks every hour)
```bash
crontab -e
```

Add:
```cron
0 * * * * cd /var/www/poc-gsp-emoc && git pull && docker-compose up -d --build
```

### Using GitHub Webhooks

Install webhook receiver:
```bash
# Install webhook
go install github.com/adnanh/webhook@latest

# Create webhook config
nano /var/www/hooks.json
```

```json
[
  {
    "id": "deploy-poc",
    "execute-command": "/var/www/poc-gsp-emoc/deploy.sh",
    "command-working-directory": "/var/www/poc-gsp-emoc",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "your-secret-key",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
```

Run webhook server:
```bash
webhook -hooks /var/www/hooks.json -verbose
```

## Troubleshooting

### Issue: Build context not found
```bash
# Solution: Clone repo first
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc
docker-compose up -d --build
```

### Issue: Authentication failed (private repo)
```bash
# Solution: Use Personal Access Token
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Issue: Cannot access repository
```bash
# Check if repo is public
curl -I https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/docker-compose.yml

# Should return 200 OK for public repos
```

## Example: Complete Deployment

Replace these values:
- `YOUR_USERNAME`: Your GitHub username
- `YOUR_REPO`: Your repository name (e.g., POC-GSP-EMOC)
- `YOUR_TOKEN`: Your GitHub Personal Access Token (for private repos)

### For Public Repository:
```bash
# On your Hostinger VPS
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc && \
cd /var/www/poc-gsp-emoc && \
mkdir -p logs/nginx && \
docker-compose up -d --build
```

### For Private Repository:
```bash
# On your Hostinger VPS
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/poc-gsp-emoc && \
cd /var/www/poc-gsp-emoc && \
mkdir -p logs/nginx && \
docker-compose up -d --build
```

## Summary

**Recommended approach for GitHub-based deployment:**

1. ✅ Use `git clone` to get the full repository (provides build context)
2. ✅ Run `docker-compose up -d --build` from the cloned directory
3. ✅ Use `git pull` for updates

**Quick alternative for testing:**

1. Download compose file: `wget https://raw.githubusercontent.com/.../docker-compose.yml`
2. Deploy: `docker-compose up -d --build`

**For automation:**

1. Setup webhook or cron job for auto-deployment on pushes
2. Use GitHub Actions for CI/CD pipeline

---

**Next Steps:**
- See [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) for complete VPS setup
- See [QUICK_START.md](QUICK_START.md) for common commands
