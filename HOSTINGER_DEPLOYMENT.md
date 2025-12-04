# Hostinger VPS Deployment Guide

This guide provides step-by-step instructions for deploying the POC-1 application to a Hostinger VPS.

## Prerequisites

- Hostinger VPS with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access to the VPS
- Domain name (optional, but recommended)
- SSH access to your VPS

## Step 1: Initial VPS Setup

### 1.1 Connect to your VPS
```bash
ssh root@your-vps-ip
```

### 1.2 Update system packages
```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker service
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
```

### 1.4 Install Docker Compose
```bash
# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 1.5 Create deployment directory
```bash
mkdir -p /var/www/poc-gsp-emoc
cd /var/www/poc-gsp-emoc
```

## Step 2: Deploy Application

### 2.1 Clone or upload your repository
```bash
# Option A: Using Git
git clone https://your-repository-url.git .

# Option B: Using SCP from local machine
# From your local machine:
scp -r /path/to/POC-GSP-EMOC/* root@your-vps-ip:/var/www/poc-gsp-emoc/
```

### 2.2 Create logs directory
```bash
mkdir -p logs/nginx
chmod -R 755 logs
```

### 2.3 Build and run the application
```bash
docker-compose up -d --build
```

### 2.4 Verify the application is running
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f GSP-EMOC-POC1
```

### 2.5 Test the application
```bash
# Test locally on VPS
curl http://localhost:3001

# Test from your browser
# Open: http://your-vps-ip:3001
```

## Step 3: Configure Firewall

### 3.1 Install UFW (if not installed)
```bash
apt install ufw -y
```

### 3.2 Configure firewall rules
```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow application port
ufw allow 3001/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 4: Setup Reverse Proxy with Nginx (Recommended)

For production, it's recommended to use Nginx as a reverse proxy on the host.

### 4.1 Install Nginx on host
```bash
apt install nginx -y
```

### 4.2 Create Nginx configuration
```bash
nano /etc/nginx/sites-available/poc-gsp-emoc
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Increase buffer sizes for large headers
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Enable the site
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/poc-gsp-emoc /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 5: Setup SSL with Let's Encrypt (Recommended)

### 5.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL certificate
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 5.3 Test auto-renewal
```bash
certbot renew --dry-run
```

The SSL certificate will auto-renew before expiration.

## Step 6: Setup Auto-restart on Reboot

The `restart: unless-stopped` policy in docker-compose.yml ensures the container automatically restarts, but verify Docker starts on boot:

```bash
systemctl enable docker
```

## Step 7: Monitoring and Maintenance

### 7.1 View application logs
```bash
cd /var/www/poc-gsp-emoc

# View Docker logs
docker-compose logs -f

# View Nginx logs from container
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

### 7.2 Monitor container resources
```bash
docker stats GSP-EMOC-POC1
```

### 7.3 Update application
```bash
cd /var/www/poc-gsp-emoc

# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

### 7.4 Backup data
```bash
# Backup logs
tar -czf poc-backup-$(date +%Y%m%d).tar.gz logs/

# Backup entire directory
cd /var/www
tar -czf poc-gsp-emoc-backup-$(date +%Y%m%d).tar.gz poc-gsp-emoc/
```

## Step 8: Environment Variables (Optional)

### 8.1 Create .env file
```bash
nano /var/www/poc-gsp-emoc/.env
```

Add your environment variables:
```env
API_URL=https://api.example.com
APP_NAME=POC-1
# Add other variables as needed
```

### 8.2 Update docker-compose.yml to use .env
The docker-compose.yml already supports environment variables via `${VARIABLE_NAME}` syntax.

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs GSP-EMOC-POC1

# Check if port is in use
netstat -tulpn | grep 3001

# Restart container
docker-compose restart
```

### Application not accessible
```bash
# Check if container is running
docker-compose ps

# Check firewall
ufw status

# Check Nginx (if using reverse proxy)
systemctl status nginx
nginx -t
```

### High memory usage
```bash
# Check container stats
docker stats

# Adjust resource limits in docker-compose.yml
# Edit the deploy.resources section
```

### SSL certificate issues
```bash
# Check certificate status
certbot certificates

# Force renewal
certbot renew --force-renewal
```

## Security Best Practices

1. **Change default SSH port**
   ```bash
   nano /etc/ssh/sshd_config
   # Change Port 22 to something else
   systemctl restart sshd
   ```

2. **Disable root login**
   ```bash
   nano /etc/ssh/sshd_config
   # Set PermitRootLogin no
   systemctl restart sshd
   ```

3. **Use SSH keys instead of passwords**
   ```bash
   # On your local machine, generate key
   ssh-keygen -t rsa -b 4096

   # Copy to VPS
   ssh-copy-id username@your-vps-ip
   ```

4. **Keep system updated**
   ```bash
   # Set up automatic security updates
   apt install unattended-upgrades -y
   dpkg-reconfigure unattended-upgrades
   ```

5. **Regular backups**
   Set up a cron job for automated backups:
   ```bash
   crontab -e
   # Add: 0 2 * * * cd /var/www && tar -czf /backup/poc-gsp-emoc-$(date +\%Y\%m\%d).tar.gz poc-gsp-emoc/
   ```

## Performance Optimization

### 1. Enable gzip compression (already configured in nginx.conf)

### 2. Setup CDN (optional)
Consider using Cloudflare for:
- DDoS protection
- CDN caching
- SSL/TLS management
- Performance optimization

### 3. Monitor performance
```bash
# Install monitoring tools
apt install htop iotop -y

# Monitor in real-time
htop
```

## Useful Commands

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# Check disk usage
docker system df

# Clean up
docker system prune -a
```

## Support Resources

- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Contact

For issues specific to this application, please refer to the project repository.
