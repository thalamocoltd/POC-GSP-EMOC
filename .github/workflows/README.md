# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated deployment.

## Available Workflows

### deploy-vps.yml

Automatically deploys the application to your Hostinger VPS when code is pushed to the `main` branch.

#### What it does:
1. Connects to your VPS via SSH
2. Pulls the latest code from GitHub
3. Stops existing containers
4. Builds and starts new containers
5. Verifies the deployment
6. Cleans up old Docker images

#### Setup Instructions

##### 1. Generate SSH Key Pair

On your **local machine** or VPS:
```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# This creates two files:
# - github_actions (private key) - for GitHub Secrets
# - github_actions.pub (public key) - for VPS
```

##### 2. Add Public Key to VPS

On your **VPS**:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key to authorized_keys
cat github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Or manually copy and paste:
nano ~/.ssh/authorized_keys
# Paste the content of github_actions.pub
```

##### 3. Configure GitHub Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `VPS_HOST` | `your-vps-ip-or-domain` | Your VPS IP address or domain |
| `VPS_USERNAME` | `root` or your username | SSH username (usually `root`) |
| `VPS_SSH_KEY` | Content of private key | Entire content of `github_actions` file |
| `VPS_PORT` | `22` | SSH port (optional, defaults to 22) |

**To get the private key content:**
```bash
cat ~/.ssh/github_actions
# Copy the entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----
```

##### 4. Initial VPS Setup

Make sure your VPS is ready:
```bash
# On your VPS, clone the repo first
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git poc-gsp-emoc
cd poc-gsp-emoc

# Create logs directory
mkdir -p logs/nginx

# Do initial deployment
docker-compose up -d --build
```

##### 5. Test the Workflow

**Option A: Push to main branch**
```bash
git add .
git commit -m "Test deployment workflow"
git push origin main
```

**Option B: Manual trigger**
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Deploy to VPS** workflow
4. Click **Run workflow** button

##### 6. Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. Watch the deployment progress in real-time

## Workflow Triggers

The workflow is triggered by:
- ✅ Push to `main` branch
- ✅ Manual trigger via GitHub UI

To change the trigger branch, edit `.github/workflows/deploy-vps.yml`:
```yaml
on:
  push:
    branches:
      - main        # Change this to your branch
      - production  # Or add multiple branches
```

## Customization

### Change Deployment Directory

Edit the workflow file and update the path:
```yaml
script: |
  cd /var/www/poc-gsp-emoc  # Change this path
```

### Use Production Compose File

To use `docker-compose.prod.yml` instead:
```yaml
script: |
  docker-compose -f docker-compose.prod.yml down
  docker-compose -f docker-compose.prod.yml up -d --build
```

### Add Slack/Discord Notifications

Add a notification step:
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Add Environment Variables

If you need to set environment variables during deployment:
```yaml
script: |
  cd /var/www/poc-gsp-emoc

  # Create or update .env file
  echo "VITE_API_URL=${{ secrets.API_URL }}" > .env
  echo "NODE_ENV=production" >> .env

  docker-compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Issue: SSH Connection Failed

**Check:**
1. VPS_HOST is correct (IP or domain)
2. VPS_USERNAME is correct
3. VPS_SSH_KEY contains the entire private key
4. Public key is in VPS `~/.ssh/authorized_keys`
5. VPS SSH service is running: `systemctl status sshd`

**Test SSH connection manually:**
```bash
ssh -i ~/.ssh/github_actions your-username@your-vps-ip
```

### Issue: Permission Denied

**Fix permissions on VPS:**
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Issue: Git Pull Fails

**Make sure repo is cloned on VPS:**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git poc-gsp-emoc
```

**Set git credentials if private repo:**
```bash
cd /var/www/poc-gsp-emoc
git config credential.helper store
git pull  # Enter credentials once
```

### Issue: Docker Compose Not Found

**Install Docker Compose on VPS:**
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Issue: Container Not Starting

**Check logs on VPS:**
```bash
cd /var/www/poc-gsp-emoc
docker-compose logs
```

## Security Best Practices

1. ✅ Use SSH keys instead of passwords
2. ✅ Use dedicated deployment SSH key (not your personal key)
3. ✅ Limit SSH key permissions on VPS
4. ✅ Use GitHub Secrets for sensitive data
5. ✅ Don't commit secrets to repository
6. ✅ Regularly rotate SSH keys
7. ✅ Monitor workflow execution logs

## Manual Deployment

If you need to deploy manually instead of using GitHub Actions:

```bash
# On your VPS
cd /var/www/poc-gsp-emoc
git pull
docker-compose up -d --build
```

Or use the deployment script:
```bash
cd /var/www/poc-gsp-emoc
./deploy.sh -y
```

## Alternative: Using GitHub Container Registry

For larger deployments, consider building the image in GitHub Actions and pushing to a registry:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: ghcr.io/${{ github.repository }}:latest

- name: Deploy to VPS
  # Pull and run the pre-built image on VPS
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

For deployment issues:
- Check workflow logs in GitHub Actions tab
- Review VPS logs: `docker-compose logs`
- See [GITHUB_DEPLOY.md](../../GITHUB_DEPLOY.md) for more deployment options
