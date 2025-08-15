#!/bin/bash

# 🌙 Goodnight Final Backup - Quick Restore Script
# A Bedder World v2.1.0 - Production Ready

echo "🌙 Starting Goodnight Final Backup Restore..."
echo "✨ A Bedder World v2.1.0 - Production Ready"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies."
    echo "💡 Try running: rm -rf node_modules package-lock.json && npm install"
    exit 1
fi

echo ""
echo "🚀 Ready to start!"
echo ""
echo "To start the development server:"
echo "   npm run dev"
echo ""
echo "To build for production:"
echo "   npm run build"
echo ""
echo "📍 Site will be available at: http://localhost:8081"
echo ""
echo "🎯 Complete site with:"
echo "   ✅ New pricing tables (1st Piece, 2 Pieces, 3 Pieces)"
echo "   ✅ MOST POPULAR badge on 2 Pieces option"
echo "   ✅ All 13+ city pages updated"
echo "   ✅ Perfect styling and branding"
echo "   ✅ Legal pages included"
echo "   ✅ Mobile responsive"
echo "   ✅ Production ready"
echo ""
echo "🌟 Goodnight Final Backup restored successfully!"