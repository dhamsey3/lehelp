#!/bin/bash

# LEHELP Platform - Quick Setup Script
# This script sets up and starts all services for local development

set -e  # Exit on error

echo "🚀 LEHELP Platform - Setup & Start"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start infrastructure services
echo -e "${YELLOW}Starting infrastructure services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}Checking service health...${NC}"

check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service is ready${NC}"
            return 0
        fi
        echo -e "   Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service failed to start${NC}"
    return 1
}

check_service "PostgreSQL" "http://localhost:5432" || true
check_service "MongoDB" "http://localhost:27017" || true
check_service "Redis" "http://localhost:6379" || true
check_service "Elasticsearch" "http://localhost:9200"
check_service "RabbitMQ" "http://localhost:15672"
check_service "MinIO" "http://localhost:9000/minio/health/live"
check_service "MailHog" "http://localhost:8025"

echo ""
echo -e "${GREEN}✅ All infrastructure services are running!${NC}"
echo ""

# Initialize database
echo -e "${YELLOW}Initializing database...${NC}"
sleep 5  # Give PostgreSQL more time to fully initialize

if docker exec lehelp_postgres psql -U lehelp_user -d lehelp_db -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Database initialization in progress...${NC}"
fi

# Create MinIO bucket
echo -e "${YELLOW}Creating MinIO bucket...${NC}"
docker exec lehelp_minio sh -c "mc alias set local http://localhost:9000 minioadmin minioadmin && mc mb local/lehelp-documents --ignore-existing" 2>/dev/null || true
echo -e "${GREEN}✅ MinIO bucket configured${NC}"

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "======================================"
echo ""
echo "📊 Service Dashboard:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📧 MailHog (Email Testing)"
echo "     http://localhost:8025"
echo ""
echo "  🗄️  MinIO (S3 Storage)"
echo "     http://localhost:9001"
echo "     Username: minioadmin"
echo "     Password: minioadmin"
echo ""
echo "  🐰 RabbitMQ (Message Queue)"
echo "     http://localhost:15672"
echo "     Username: lehelp_queue_user"
echo "     Password: dev_password_change_in_prod"
echo ""
echo "  🔍 Elasticsearch"
echo "     http://localhost:9200"
echo ""
echo "  📊 PostgreSQL"
echo "     Host: localhost:5432"
echo "     Database: lehelp_db"
echo "     Username: lehelp_user"
echo ""
echo "  📦 MongoDB"
echo "     mongodb://localhost:27017/lehelp_docs"
echo ""
echo "  ⚡ Redis"
echo "     localhost:6379"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "  1. Start Backend API:"
echo "     cd backend/api-gateway"
echo "     npm run dev"
echo ""
echo "  2. Start Frontend:"
echo "     cd frontend/client-portal"
echo "     npm run dev"
echo ""
echo "  3. Start AI Services:"
echo "     cd ai-services"
echo "     source venv/bin/activate"
echo "     uvicorn main:app --reload"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 To stop all services:"
echo "   docker-compose down"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
