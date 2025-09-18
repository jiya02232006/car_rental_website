#!/bin/bash

# Car Rental System Deployment Script
# This script builds and deploys the application in production mode

set -e  # Exit on any error

echo "🚀 Starting Car Rental System Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    echo "📝 Loading production environment variables..."
    set -a  # automatically export all variables
    source .env.production
    set +a
else
    echo "⚠️  Production environment file (.env.production) not found!"
    echo "   Please create .env.production with your production settings."
    exit 1
fi

# Build and start services
echo "🏗️  Building application containers..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

echo "🗄️  Starting database..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d database

echo "⏳ Waiting for database to be ready..."
sleep 30

echo "🔧 Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T backend npm run migrate

echo "🚀 Starting all services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "🧹 Cleaning up unused images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost (or your domain)"
echo "   Backend API: http://localhost/api"
echo ""
echo "📊 Check status:"
echo "   docker-compose ps"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"