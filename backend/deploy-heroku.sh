#!/bin/bash

# Heroku Deployment Script for Supreme Blue ERP Backend
# Run this script to deploy your app to Heroku

set -e  # Exit on error

echo "🚀 Supreme Blue ERP - Heroku Deployment"
echo "========================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Error: Heroku CLI is not installed"
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI found"

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku..."
    heroku login
fi

echo "✅ Logged in to Heroku"

# Ask for app name
read -p "Enter your Heroku app name (or press Enter to create new): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "📦 Creating new Heroku app..."
    APP_NAME=$(heroku create --json | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    echo "✅ Created app: $APP_NAME"
else
    # Check if app exists
    if heroku apps:info -a $APP_NAME &> /dev/null; then
        echo "✅ Using existing app: $APP_NAME"
    else
        echo "📦 Creating app: $APP_NAME..."
        heroku create $APP_NAME
        echo "✅ Created app: $APP_NAME"
    fi
fi

# Add PostgreSQL addon
read -p "Add Heroku Postgres? (y/n, default: n): " ADD_PG
if [ "$ADD_PG" = "y" ]; then
    echo "📊 Adding Heroku Postgres..."
    heroku addons:create heroku-postgresql:essential-0 -a $APP_NAME
    echo "✅ PostgreSQL added"
else
    echo "⏭️  Skipping Postgres addon (make sure to set DATABASE_URL manually)"
fi

# Set environment variables
echo ""
echo "🔧 Setting environment variables..."

# Generate strong JWT secrets
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

heroku config:set \
    NODE_ENV="production" \
    JWT_SECRET="$JWT_SECRET" \
    JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
    JWT_EXPIRES_IN="15m" \
    JWT_REFRESH_EXPIRES_IN="7d" \
    TZ="Asia/Colombo" \
    -a $APP_NAME

echo "✅ Environment variables set"

# Ask for frontend URL
read -p "Enter your frontend URL (optional): " FRONTEND_URL
if [ ! -z "$FRONTEND_URL" ]; then
    heroku config:set FRONTEND_URL="$FRONTEND_URL" -a $APP_NAME
    echo "✅ Frontend URL set"
fi

# Ask for custom database URL
if [ "$ADD_PG" != "y" ]; then
    read -p "Enter your DATABASE_URL (Neon DB): " DATABASE_URL
    read -p "Enter your DIRECT_URL: " DIRECT_URL
    
    if [ ! -z "$DATABASE_URL" ]; then
        heroku config:set DATABASE_URL="$DATABASE_URL" -a $APP_NAME
        echo "✅ DATABASE_URL set"
    fi
    
    if [ ! -z "$DIRECT_URL" ]; then
        heroku config:set DIRECT_URL="$DIRECT_URL" -a $APP_NAME
        echo "✅ DIRECT_URL set"
    fi
fi

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📝 Initializing git repository..."
    git init
    echo "✅ Git initialized"
fi

# Add Heroku remote
echo "🔗 Adding Heroku remote..."
heroku git:remote -a $APP_NAME || echo "Remote already exists"

# Deploy
echo ""
echo "📦 Preparing deployment..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"

echo "🚀 Deploying to Heroku..."
git push heroku main || git push heroku master

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 App URL: https://$APP_NAME.herokuapp.com"
echo "📚 API URL: https://$APP_NAME.herokuapp.com/api"
echo "📋 Dashboard: https://dashboard.heroku.com/apps/$APP_NAME"
echo ""
echo "🔍 View logs with: heroku logs --tail -a $APP_NAME"
echo "🌐 Open app with: heroku open -a $APP_NAME"
echo ""
echo "🎉 Happy coding!"
