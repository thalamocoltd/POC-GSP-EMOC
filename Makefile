.PHONY: help build up down restart logs status clean deploy deploy-prod backup health shell test

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Show this help message
	@echo "$(BLUE)POC-1 GSP EMOC - Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  make [target]"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker image
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker-compose build

up: ## Start containers in background
	@echo "$(BLUE)Starting containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Containers started. Access at http://localhost:3001$(NC)"

down: ## Stop and remove containers
	@echo "$(BLUE)Stopping containers...$(NC)"
	docker-compose down

restart: ## Restart containers
	@echo "$(BLUE)Restarting containers...$(NC)"
	docker-compose restart

logs: ## View container logs
	docker-compose logs -f

status: ## Show container status
	@echo "$(BLUE)Container Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)Resource Usage:$(NC)"
	@docker stats --no-stream GSP-EMOC-POC1 2>/dev/null || echo "Container not running"

clean: ## Remove containers, images, and volumes
	@echo "$(YELLOW)Warning: This will remove all containers, images, and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker image prune -f; \
		echo "$(GREEN)Cleanup complete.$(NC)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled.$(NC)"; \
	fi

deploy: ## Deploy application (standard)
	@echo "$(BLUE)Deploying application...$(NC)"
	@if [ -x "./deploy.sh" ]; then \
		./deploy.sh -y; \
	else \
		chmod +x deploy.sh && ./deploy.sh -y; \
	fi

deploy-prod: ## Deploy application (production)
	@echo "$(BLUE)Deploying production application...$(NC)"
	@if [ ! -f ".env" ]; then \
		echo "$(YELLOW)Warning: .env file not found. Copy .env.example first.$(NC)"; \
		exit 1; \
	fi
	@if [ -x "./deploy.sh" ]; then \
		COMPOSE_FILE=docker-compose.prod.yml ./deploy.sh -y; \
	else \
		chmod +x deploy.sh && COMPOSE_FILE=docker-compose.prod.yml ./deploy.sh -y; \
	fi

backup: ## Backup logs and data
	@echo "$(BLUE)Creating backup...$(NC)"
	@mkdir -p backups
	@tar -czf backups/backup_$$(date +%Y%m%d_%H%M%S).tar.gz logs/ .env 2>/dev/null || tar -czf backups/backup_$$(date +%Y%m%d_%H%M%S).tar.gz logs/
	@echo "$(GREEN)Backup created in backups/ directory$(NC)"

health: ## Check container health
	@echo "$(BLUE)Container Health:$(NC)"
	@docker inspect GSP-EMOC-POC1 --format='{{.State.Health.Status}}' 2>/dev/null || echo "Health check not available"
	@echo ""
	@echo "$(BLUE)Testing endpoint:$(NC)"
	@curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3001 || echo "Container not accessible"

shell: ## Access container shell
	@echo "$(BLUE)Accessing container shell...$(NC)"
	docker exec -it GSP-EMOC-POC1 sh

test: ## Test production build locally
	@echo "$(BLUE)Testing production build...$(NC)"
	docker-compose -f docker-compose.prod.yml up --build

# Development targets
dev: ## Start development server (npm)
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install

# Utility targets
logs-nginx: ## View Nginx logs
	@if [ -d "logs/nginx" ]; then \
		echo "$(BLUE)Nginx Access Log:$(NC)"; \
		tail -n 50 logs/nginx/access.log 2>/dev/null || echo "No access log found"; \
		echo ""; \
		echo "$(BLUE)Nginx Error Log:$(NC)"; \
		tail -n 50 logs/nginx/error.log 2>/dev/null || echo "No error log found"; \
	else \
		echo "$(YELLOW)Logs directory not found$(NC)"; \
	fi

create-env: ## Create .env from .env.example
	@if [ -f ".env" ]; then \
		echo "$(YELLOW).env file already exists$(NC)"; \
	else \
		cp .env.example .env; \
		echo "$(GREEN).env file created. Please edit it with your configuration.$(NC)"; \
	fi

update: ## Pull latest changes and redeploy
	@echo "$(BLUE)Updating application...$(NC)"
	git pull
	$(MAKE) deploy

prune: ## Remove unused Docker resources
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)Cleanup complete.$(NC)"

# Information targets
info: ## Show deployment information
	@echo "$(BLUE)Deployment Information:$(NC)"
	@echo ""
	@echo "$(GREEN)Container:$(NC) GSP-EMOC-POC1"
	@echo "$(GREEN)Host Port:$(NC) 3001"
	@echo "$(GREEN)Container Port:$(NC) 80"
	@echo "$(GREEN)Health Check:$(NC) Enabled (30s interval)"
	@echo ""
	@echo "$(GREEN)Files:$(NC)"
	@echo "  - docker-compose.yml (standard)"
	@echo "  - docker-compose.prod.yml (production)"
	@echo "  - .env.example (template)"
	@echo ""
	@echo "$(GREEN)Documentation:$(NC)"
	@echo "  - DOCKER.md"
	@echo "  - HOSTINGER_DEPLOYMENT.md"
	@echo "  - DEPLOYMENT_README.md"
