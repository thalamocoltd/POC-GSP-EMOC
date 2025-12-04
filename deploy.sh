#!/bin/bash

# POC-1 GSP EMOC Deployment Script for Hostinger VPS
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="GSP-EMOC-POC1"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
LOGS_DIR="./logs/nginx"

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_info "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_info "Prerequisites check passed."
}

create_directories() {
    print_info "Creating necessary directories..."
    mkdir -p "$LOGS_DIR"
    chmod -R 755 logs
    print_info "Directories created."
}

backup_logs() {
    if [ -d "$LOGS_DIR" ] && [ "$(ls -A $LOGS_DIR)" ]; then
        print_info "Backing up existing logs..."
        BACKUP_NAME="logs_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf "$BACKUP_NAME" logs/
        print_info "Logs backed up to $BACKUP_NAME"
    fi
}

stop_existing() {
    print_info "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down || true
    print_info "Containers stopped."
}

build_and_deploy() {
    print_info "Building and deploying application..."
    docker-compose -f "$COMPOSE_FILE" up -d --build

    if [ $? -eq 0 ]; then
        print_info "Application deployed successfully!"
    else
        print_error "Deployment failed!"
        exit 1
    fi
}

check_health() {
    print_info "Checking application health..."
    sleep 5

    CONTAINER_STATUS=$(docker inspect -f '{{.State.Status}}' "$APP_NAME" 2>/dev/null || echo "not found")

    if [ "$CONTAINER_STATUS" == "running" ]; then
        print_info "Container is running."

        # Wait for health check
        print_info "Waiting for health check..."
        for i in {1..30}; do
            HEALTH_STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$APP_NAME" 2>/dev/null || echo "none")

            if [ "$HEALTH_STATUS" == "healthy" ]; then
                print_info "Application is healthy!"
                return 0
            elif [ "$HEALTH_STATUS" == "none" ]; then
                print_warning "Health check not configured."
                return 0
            fi

            echo -n "."
            sleep 2
        done

        print_warning "Health check timeout. Check logs for details."
    else
        print_error "Container is not running! Status: $CONTAINER_STATUS"
        print_error "Check logs with: docker-compose -f $COMPOSE_FILE logs"
        exit 1
    fi
}

show_status() {
    print_info "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    print_info "View logs with: docker-compose -f $COMPOSE_FILE logs -f"
}

cleanup_old_images() {
    print_info "Cleaning up old Docker images..."
    docker image prune -f
    print_info "Cleanup complete."
}

# Main deployment flow
main() {
    echo "================================================"
    echo "  POC-1 GSP EMOC Deployment Script"
    echo "================================================"
    echo ""

    check_prerequisites
    create_directories

    # Ask for confirmation in production
    if [ "$1" != "-y" ] && [ "$1" != "--yes" ]; then
        read -p "Deploy using $COMPOSE_FILE? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Deployment cancelled."
            exit 0
        fi
    fi

    backup_logs
    stop_existing
    build_and_deploy
    check_health
    show_status
    cleanup_old_images

    echo ""
    echo "================================================"
    print_info "Deployment completed successfully!"
    echo "================================================"
}

# Parse command line arguments
case "$1" in
    -h|--help)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  -y, --yes         Skip confirmation prompt"
        echo "  -p, --prod        Use production docker-compose file"
        echo "  -h, --help        Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  COMPOSE_FILE      Docker compose file to use (default: docker-compose.yml)"
        echo ""
        echo "Examples:"
        echo "  $0                Deploy with confirmation"
        echo "  $0 -y             Deploy without confirmation"
        echo "  $0 -p             Deploy using production config"
        exit 0
        ;;
    -p|--prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        shift
        ;;
esac

main "$@"
