# Heroku Deployment Guide - Supreme Blue ERP Backend

## Prerequisites
- Heroku CLI installed ([Download here](https://devcenter.heroku.com/articles/heroku-cli))
- Git installed
- Heroku account created

## Step 1: Login to Heroku
```bash
heroku login
```

## Step 2: Create a New Heroku App
```bash
cd backend
heroku create your-app-name
# Or let Heroku generate a name:
# heroku create
```

## Step 3: Add PostgreSQL Database
```bash
# Option 1: Use your existing Neon DB (recommended - already configured)
# Your database already has the schema, so just skip this step
# You'll set DATABASE_URL in Step 4

# Option 2: Use Heroku Postgres (fresh database)
heroku addons:create heroku-postgresql:essential-0
# Note: If using this, you'll need to run migrations (they'll auto-run on deploy)
```

**Important:** If your existing Neon DB already has data and schema (like yours does), use Option 1. The deployment will work fine with your existing database.

## Step 4: Set Environment Variables
```bash
# If using Heroku Postgres, DATABASE_URL is automatically set
# Otherwise, set your Neon DB URL:
heroku config:set DATABASE_URL="your-neon-database-url"
heroku config:set DIRECT_URL="your-neon-direct-url"

# Set JWT secrets (IMPORTANT: Change these!)
heroku config:set JWT_SECRET="your-secure-jwt-secret-here-$(openssl rand -hex 32)"
heroku config:set JWT_REFRESH_SECRET="your-secure-refresh-secret-here-$(openssl rand -hex 32)"
heroku config:set JWT_EXPIRES_IN="15m"
heroku config:set JWT_REFRESH_EXPIRES_IN="7d"

# Set Node environment
heroku config:set NODE_ENV="production"

# Set timezone
heroku config:set TZ="Asia/Colombo"

# Set frontend URL (update with your actual frontend URL)
heroku config:set FRONTEND_URL="https://your-frontend-app.herokuapp.com"
```

## Step 5: Deploy to Heroku
```bash
# Make sure you're in the backend directory
git init  # If not already a git repository
git add .
git commit -m "Prepare for Heroku deployment"

# Add Heroku remote (if not already added)
heroku git:remote -a your-app-name

# Deploy
git push heroku main
# Or if youDatabase Migrations

### If using existing Neon DB (with existing schema):
Your database already has the schema, so migrations will be skipped automatically. The Procfile uses `prisma migrate deploy` which only applies new migrations.

**No action needed!** ✅

### If using fresh Heroku Postgres:
Migrations will run automatically on deployment via the Procfile's release command.

To manually check migration status:
```bash
heroku run npx prisma migrate deploy
heroku run npx prisma migrate status
```

### If you get P3005 error locally:
This is normal! It means your database already has tables. For deployment:
- The error won't occur because `prisma migrate deploy` handles existing schemas
- You can ignore this error locally
- Or baseline your database:
```bash
npx prisma migrate resolve --applied "20241226_production_restructure"
The migrations will run automatically on deployment via the Procfile's release command.
To manually run migrations:
```bash
heroku run npx prisma migrate deploy
```

## Step 7: Seed Database (Optional)
```bash
heroku run npm run prisma:seed
```

## Step 8: View Logs
```bash
heroku logs --tail
```

## Step 9: Open Your App
```bash
heroku open
# Your API will be available at: https://your-app-name.herokuapp.com/api
```

## Environment Variables Checklist
Verify all environment variables are set:
```bash
heroku config
```

You should see:
- `DATABASE_URL`
- `DIRECT_URL` (if using Neon)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `NODE_ENV`
- `TZ`
- `FRONTEND_URL`

## Useful Commands

### View app info
```bash
heroku info
```

### Scale dynos
```bash
heroku ps:scale web=1
```

### Restart app
```bash
heroku restart
```

### Access Heroku bash
```bash
heroku run bash
```

### View database info
```bash
heroku pg:info
```

### Database backup
```bash
heroku pg:backups:capture
heroku pg:backups:download
```

## Troubleshooting

### Check build logs
```bash
heroku logs --tail --source app
5. **P3005 error locally**: This is expected if your DB has existing schema. It won't affect Heroku deployment
6. **Migration errors on deploy**: Check `heroku logs --tail` - if DB already has schema, migrations are auto-skipped
```

### Check Prisma generation
```bash
heroku run npx prisma generate
```

### Verify Node version
```bash
heroku run node --version
```

### Common Issues

1. **Build fails**: Check that all dependencies are in `dependencies`, not `devDependencies`
2. **Database connection errors**: Verify DATABASE_URL is set correctly
3. **Port issues**: Heroku sets PORT automatically, the app already uses `process.env.PORT`
4. **Prisma issues**: Run `heroku run npx prisma generate` manually

## Production Checklist
- [ ] All environment variables set
- [ ] JWT secrets are strong and unique
- [ ] DATABASE_URL configured
- [ ] FRONTEND_URL set to actual frontend domain
- [ ] CORS settings updated in code to include frontend URL
- [ ] Migrations deployed successfully
- [ ] App starts without errors
- [ ] Test API endpoints work
- [ ] Logs show no critical errors

## Update Deployment
To deploy updates:
```bash
git add .
git commit -m "Your commit message"
git push heroku main
```

## Monitor Your App
- Dashboard: https://dashboard.heroku.com/apps/your-app-name
- Metrics: https://dashboard.heroku.com/apps/your-app-name/metrics
- Logs: `heroku logs --tail`

## Cost Considerations
- Heroku Eco/Basic dynos: ~$5-7/month
- Heroku Postgres Essential-0: ~$5/month
- Or use your existing Neon DB (free tier available)

## Security Notes
1. Never commit .env file
2. Use strong, unique JWT secrets
3. Enable 2FA on Heroku account
4. Regularly update dependencies
5. Monitor logs for suspicious activity
