# Supreme Blue ERP - Heroku Deployment Guide

## Prerequisites
1. Heroku Account
2. Heroku CLI installed
3. Git repository initialized

## Environment Variables to Set on Heroku

Set these environment variables in your Heroku dashboard or using Heroku CLI:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=production

# Optional: Frontend URL (if different)
# FRONTEND_URL=https://your-app.herokuapp.com
```

## Deployment Steps

### 1. Create Heroku App
```bash
heroku login
heroku create your-app-name
```

### 2. Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:mini
```

### 3. Set Environment Variables
```bash
heroku config:set JWT_SECRET="your-secret-key-here"
heroku config:set NODE_ENV=production
```

### 4. Deploy to Heroku
```bash
# From the root directory (Supriem blue/)
git init
git add .
git commit -m "Initial commit for Heroku deployment"
git push heroku main
```

### 5. Run Database Migrations
```bash
heroku run npx prisma migrate deploy
```

### 6. (Optional) Seed Database
```bash
heroku run npm run prisma:seed
```

### 7. Open Your App
```bash
heroku open
```

## Project Structure for Heroku

```
Supriem blue/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── Procfile          # New: Heroku process file
│   └── public/           # Will be created: Frontend build output
├── frontend/
│   ├── src/
│   └── package.json
└── Procfile              # New: Root Procfile
```

## How It Works

1. **Heroku Postbuild**: Automatically runs after dependencies install
   - Builds the NestJS backend
   - Installs frontend dependencies
   - Builds Angular frontend for production
   - Copies frontend build to backend/public folder
   - Generates Prisma client
   - Runs database migrations

2. **Static File Serving**: Backend serves the Angular app from `/public` folder

3. **API Routes**: All API calls go to `/api/*`

4. **Frontend Routing**: Catch-all route serves `index.html` for Angular routing

## Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Open Heroku dashboard
heroku open

# Access Heroku Postgres
heroku pg:psql

# View environment variables
heroku config

# Restart app
heroku restart

# Run commands on Heroku
heroku run <command>
```

## Troubleshooting

### Build Fails
- Check Heroku logs: `heroku logs --tail`
- Verify Node version matches in package.json engines
- Ensure all dependencies are in `dependencies`, not `devDependencies`

### Database Connection Issues
- Verify DATABASE_URL is set: `heroku config:get DATABASE_URL`
- Check Prisma schema matches database

### App Crashes
- Check logs: `heroku logs --tail`
- Verify PORT environment variable is used
- Check that all required env variables are set

## Notes

- Heroku uses ephemeral filesystem - uploads won't persist
- Free tier apps sleep after 30 minutes of inactivity
- Database migrations run automatically on each deployment
- Frontend is built and served by the backend in production
