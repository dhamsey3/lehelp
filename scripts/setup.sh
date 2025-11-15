#!/bin/bash

# LEHELP Platform - Quick Start Script

set -e

echo "🚀 LEHELP Platform - Quick Start"
echo "================================"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites checked"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres mongodb redis elasticsearch rabbitmq minio

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend/api-gateway && npm install && cd ../..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend/client-portal && npm install && cd ../..

# Set up Python virtual environment for AI services
echo "🐍 Setting up Python environment for AI services..."
cd ai-services
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Access the application at http://localhost:3000"
echo ""
echo "📖 For more information, see README.md and docs/"
echo ""
echo "🔒 Security reminder: Never commit your .env file!"
