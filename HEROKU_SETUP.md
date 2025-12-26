# Heroku Setup - Required Steps

## 1. Set Environment Variables

Run these commands to configure your Heroku app:

```bash
# Set the Neon database URLs (use your actual values from .env)
heroku config:set DATABASE_URL="postgresql://neondb_owner:npg_2XMtIzbBr8pY@ep-red-glitter-a4grikbp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

heroku config:set DIRECT_URL="postgresql://neondb_owner:npg_2XMtIzbBr8pY@ep-red-glitter-a4grikbp.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Set JWT secrets
heroku config:set JWT_SECRET="supreme-blue-jwt-secret-change-in-production-2024"
heroku config:set JWT_REFRESH_SECRET="supreme-blue-refresh-secret-change-in-production-2024"

# Set Node environment
heroku config:set NODE_ENV=production

# Set timezone
heroku config:set TZ=Asia/Colombo
```

## 2. Deploy

```bash
git add .
git commit -m "Fix Heroku deployment configuration"
git push heroku main
```

## 3. Verify Deployment

```bash
# Check logs
heroku logs --tail

# Open app
heroku open
```

## Current Issue Resolution

The app crashed because:
1. ✅ DIRECT_URL was not set on Heroku
2. ✅ Migrations need to run via release phase
3. ✅ Build order was incorrect (Prisma generate before build)

## Verification Commands

```bash
# Check environment variables
heroku config

# Check dyno status
heroku ps

# Check database
heroku run cd backend && npx prisma db pull

# Restart app
heroku restart
```
