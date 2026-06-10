#!/bin/bash

set -e

echo "🚀 AI OS Setup Script"
echo "===================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo ""
echo "📋 Prerequisites check: ✅"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env and add your API keys"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start infrastructure services
echo ""
echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis qdrant minio

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
pnpm --filter @ai-os/api db:generate

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
pnpm --filter @ai-os/api db:migrate

# Ask about seeding
echo ""
read -p "Do you want to seed the database with demo data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    pnpm --filter @ai-os/api db:seed
fi

echo ""
echo "===================="
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  pnpm dev"
echo ""
echo "To start infrastructure only:"
echo "  docker-compose up -d"
echo ""
echo "Visit http://localhost:3000 for the web app"
echo "Visit http://localhost:3001 for the API docs"