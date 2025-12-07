#!/bin/bash

# Deployment Pre-flight Checklist Script
# Run this before deploying to production

echo "🚀 Synapse AI - Deployment Checklist"
echo "======================================"
echo ""

# Check if on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  WARNING: Not on main branch (current: $BRANCH)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Git branch: $BRANCH"

# Check if requirements.txt exists
if [ -f "backend/requirements.txt" ]; then
    echo "✅ backend/requirements.txt exists"
else
    echo "❌ backend/requirements.txt missing!"
    exit 1
fi

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing!"
    exit 1
fi

# Check if .gitignore includes sensitive files
if grep -q ".env" .gitignore; then
    echo "✅ .env is in .gitignore"
else
    echo "⚠️  WARNING: .env not in .gitignore"
fi

# Check if any .env files are tracked
if git ls-files | grep -q "\.env$"; then
    echo "❌ ERROR: .env file is tracked by git! Remove it immediately!"
    echo "   Run: git rm --cached backend/.env"
    exit 1
else
    echo "✅ No .env files tracked by git"
fi

echo ""
echo "📋 Deployment Steps:"
echo ""
echo "1. Backend (Render):"
echo "   - Go to render.com and create a new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set Root Directory: backend"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "2. Frontend (Vercel):"
echo "   - Go to vercel.com and import project"
echo "   - Set NEXT_PUBLIC_API_URL to your Render backend URL"
echo ""
echo "3. Update CORS:"
echo "   - Add your Vercel URL to backend CORS settings"
echo "   - Push changes and redeploy"
echo ""
echo "✅ Checklist complete! Ready to deploy."
