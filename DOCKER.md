# Docker Deployment Guide for POC-1

This guide explains how to build and run the POC-1 application using Docker.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- No need to have Node.js installed locally - everything runs in the container

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000`

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker Directly

1. **Build the image:**
   ```bash
   docker build -t poc-1-app:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:80 --name poc-1-app poc-1-app:latest
   ```

3. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000`

4. **Stop the container:**
   ```bash
   docker stop poc-1-app
   docker rm poc-1-app
   ```

## Development Workflow

### For development with hot reload:

Use the npm dev server directly on your host machine:
```bash
npm install
npm run dev
```

The development server will be available at `http://localhost:3000` (or another available port).

### For production-like testing:

Build and run the Docker container to verify the production build:
```bash
docker-compose up --build
```

This creates an optimized production build running on Nginx.

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build process to optimize image size:

1. **Build Stage** (node:20-alpine)
   - Installs dependencies
   - Builds the application with Vite
   - Outputs to `build/` directory

2. **Runtime Stage** (nginx:alpine)
   - Lightweight Alpine Linux base
   - Nginx web server
   - Serves the built application
   - Much smaller final image size

### Image Sizes

- Build stage (intermediate): ~600MB
- Final image: ~50MB

## Nginx Configuration

The `nginx.conf` file is configured for:

- **SPA Routing**: All non-static requests route to `index.html`
- **Caching**: Static assets (JS, CSS, images) cached for 1 year
- **Compression**: Gzip compression enabled for text content
- **Security**: Hidden files and directories blocked
- **Performance**: Optimized for serving static content

## Docker Compose Services

### poc-1-app

- **Image**: Built from local Dockerfile
- **Port**: Maps `3000:80` (host:container)
- **Restart Policy**: Unless explicitly stopped
- **Health Check**: Verifies container health every 30 seconds
- **Network**: Isolated network for multi-container setups

## Environment Variables

Currently, no environment variables are required for the container.

If you need to add configuration in the future:

```yaml
environment:
  - VITE_API_URL=https://api.example.com
  - VITE_APP_NAME=POC-1
```

## Logs and Debugging

### View logs from Docker Compose:
```bash
docker-compose logs -f poc-1-app
```

### View logs from running container:
```bash
docker logs -f poc-1-app
```

### Access running container shell:
```bash
docker exec -it poc-1-app sh
```

## Building for Different Architectures

### For ARM64 (Apple Silicon Mac):
```bash
docker buildx build --platform linux/arm64 -t poc-1-app:latest .
```

### For AMD64 (Intel/AMD):
```bash
docker buildx build --platform linux/amd64 -t poc-1-app:latest .
```

### For both architectures:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t poc-1-app:latest --push .
```

## Publishing to Container Registry

### Docker Hub Example:

1. **Tag the image:**
   ```bash
   docker tag poc-1-app:latest yourusername/poc-1-app:latest
   docker tag poc-1-app:latest yourusername/poc-1-app:1.0.0
   ```

2. **Push to registry:**
   ```bash
   docker push yourusername/poc-1-app:latest
   docker push yourusername/poc-1-app:1.0.0
   ```

3. **Run from registry:**
   ```bash
   docker run -p 3000:80 yourusername/poc-1-app:latest
   ```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change the port in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Maps host port 8080 to container port 80
```

Then access the app at `http://localhost:8080`

### Container Exits Immediately

Check the logs:
```bash
docker-compose logs poc-1-app
```

Common causes:
- Port already in use
- Insufficient disk space
- Corrupted build output

### Health Check Failing

The container has a health check that pings the root path. If failing:
- Check Nginx is running properly
- Verify the `build/` directory has the correct files
- Check for Nginx configuration errors

## Performance Tips

1. **Use BuildKit for faster builds:**
   ```bash
   DOCKER_BUILDKIT=1 docker build -t poc-1-app:latest .
   ```

2. **Layer caching:**
   - Copy `package*.json` first to cache dependencies
   - Only rebuilds dependencies if they change

3. **Container resource limits:**
   ```yaml
   # docker-compose.yml
   resources:
     limits:
       cpus: '1'
       memory: 512M
     reservations:
       cpus: '0.5'
       memory: 256M
   ```

## Security Considerations

1. **Non-root user** (in production): Nginx runs as unprivileged user
2. **Read-only filesystem** (optional): Can be enabled in docker-compose.yml
3. **No secrets in image**: Use environment variables for sensitive data
4. **Regular updates**: Use `docker build --no-cache` to get latest base images

## CI/CD Integration

### GitHub Actions Example:

```yaml
name: Build and Push Docker Image

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: yourusername/poc-1-app:latest
```

## Additional Commands

### Clean up unused Docker resources:
```bash
docker system prune -a
```

### View image details:
```bash
docker images poc-1-app
docker inspect poc-1-app-app
```

### Monitor container resource usage:
```bash
docker stats poc-1-app-app
```

## Support

For more information:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
