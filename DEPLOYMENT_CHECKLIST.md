# Heroku Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Files Created/Updated
- [x] `Procfile` in root directory
- [x] `package.json` in root directory with heroku-postbuild script
- [x] `backend/package.json` updated with engines and heroku-postbuild
- [x] `backend/src/main.ts` updated for production CORS and static serving
- [x] `backend/src/app.controller.ts` added catch-all route for Angular
- [x] `frontend/package.json` updated with build:prod script
- [x] `.gitignore` files updated
- [x] `HEROKU_DEPLOYMENT.md` guide created

### 2. Environment Variables Required
```bash
DATABASE_URL=postgresql://... (Automatically set by Heroku Postgres addon)
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### 3. Git Repository Setup
```bash
cd "d:\Supriem blue"
git init
git add .
git commit -m "Prepare for Heroku deployment"
```

## 📋 Deployment Commands

### Initial Setup
```bash
# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET="$(openssl rand -base64 32)"
heroku config:set NODE_ENV=production

# Verify config
heroku config
```

### Deploy
```bash
# From project root (d:\Supriem blue)
git push heroku main

# Or if using different branch
git push heroku your-branch:main
```

### Post-Deployment
```bash
# Run database migrations
heroku run npx prisma migrate deploy --app your-app-name

# (Optional) Seed database with initial data
heroku run cd backend && npm run prisma:seed --app your-app-name

# View logs
heroku logs --tail --app your-app-name

# Open application
heroku open --app your-app-name
```

## 🔍 Verification Steps

1. **Check Build Logs**
   ```bash
   heroku logs --tail
   ```
   Look for:
   - ✓ Dependencies installed
   - ✓ Backend built successfully
   - ✓ Frontend built successfully
   - ✓ Prisma client generated
   - ✓ App started on port

2. **Test API Endpoint**
   ```bash
   curl https://your-app-name.herokuapp.com/api
   ```

3. **Test Frontend**
   - Open browser to https://your-app-name.herokuapp.com
   - Login page should load
   - Check browser console for errors

4. **Test Database Connection**
   ```bash
   heroku pg:info
   heroku pg:psql
   ```

## 🐛 Troubleshooting

### Build Fails
```bash
# Check full build logs
heroku logs --tail

# Verify Node version
heroku run node --version

# Check installed packages
heroku run npm list --depth=0
```

### App Crashes on Startup
```bash
# Check runtime logs
heroku logs --tail

# Verify environment variables
heroku config

# Check Procfile
cat Procfile

# Restart app
heroku restart
```

### Database Issues
```bash
# Check database connection
heroku pg:info

# Run migrations manually
heroku run npx prisma migrate deploy

# Access database console
heroku pg:psql

# Reset database (CAUTION: Deletes all data!)
heroku pg:reset DATABASE
heroku run npx prisma migrate deploy
```

### Static Files Not Loading
- Verify frontend build completed: Check logs for "build:prod" success
- Check public folder exists: `heroku run ls -la public`
- Verify file count: `heroku run ls -la public | wc -l`

## 🔄 Update Deployment

After making changes:
```bash
git add .
git commit -m "Your update message"
git push heroku main
```

The heroku-postbuild script will automatically:
1. Rebuild backend
2. Rebuild frontend
3. Copy frontend to public folder
4. Regenerate Prisma client
5. Restart the app

## 📊 Monitoring

```bash
# View app metrics
heroku ps

# View memory usage
heroku ps -a your-app-name

# View logs in real-time
heroku logs --tail

# View specific log lines
heroku logs -n 200

# View only app logs (no system logs)
heroku logs --source app
```

## 💰 Cost Considerations

### Free Tier
- App sleeps after 30 min of inactivity
- 550-1000 free dyno hours/month
- PostgreSQL: 10,000 rows max

### Upgrade for Production
```bash
# Upgrade to Hobby dyno ($7/month)
heroku ps:scale web=1:hobby

# Upgrade database to Hobby Basic ($9/month)
heroku addons:create heroku-postgresql:hobby-basic
```

## 📝 Important Notes

1. **Ephemeral Filesystem**: File uploads won't persist. Use cloud storage (AWS S3, Cloudinary) for uploads.

2. **Database Backups**: 
   ```bash
   heroku pg:backups:capture
   heroku pg:backups:download
   ```

3. **Custom Domain**:
   ```bash
   heroku domains:add www.yourdomain.com
   ```

4. **SSL Certificate**: Automatically provided by Heroku

5. **Environment-Specific Code**: Use `process.env.NODE_ENV === 'production'` checks

## ✨ Success Indicators

- ✅ App builds without errors
- ✅ Database migrations run successfully
- ✅ API responds at `/api` endpoint
- ✅ Frontend loads at root URL
- ✅ Login/Authentication works
- ✅ All pages accessible
- ✅ API calls work (check Network tab)

## 🆘 Support Resources

- Heroku DevCenter: https://devcenter.heroku.com/
- Heroku Status: https://status.heroku.com/
- Support: https://help.heroku.com/
