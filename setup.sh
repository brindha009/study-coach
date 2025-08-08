#!/bin/bash

echo "🚀 Setting up Study Coach AI for Panda Hacks 2025"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your API keys and database URL"
fi

# Check if environment variables are set
echo "🔍 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please create it from env.example"
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Set up your PostgreSQL database"
echo "3. Run: npx prisma migrate dev"
echo "4. Run: npm run dev"
echo ""
echo "🌐 Visit http://localhost:3000 to see the application"
echo ""
echo "📚 Demo Flow:"
echo "- Upload study material at /upload"
echo "- Generate quizzes at /quiz"
echo "- Track progress on the dashboard"
echo ""
echo "🏆 Good luck with Panda Hacks 2025!"
