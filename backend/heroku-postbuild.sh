#!/bin/bash
# Build frontend
cd ../frontend
npm install
npm run build:prod

# Move frontend build to backend public folder
cd ../backend
mkdir -p public
cp -r ../frontend/dist/supreme-blue-frontend/browser/* public/

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy