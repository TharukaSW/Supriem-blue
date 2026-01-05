# Supreme Blue ERP - Backend API

NestJS backend API for Supreme Blue Water Bottling Factory ERP System.

## Quick Heroku Deployment

### Option 1: Using Deployment Script (Recommended)

**Windows:**
```bash
cd backend
.\deploy-heroku.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x deploy-heroku.sh
./deploy-heroku.sh
```

### Option 2: Manual Deployment

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Add Database** (Choose one)
   ```bash
   # Option A: Heroku Postgres
   heroku addons:create heroku-postgresql:essential-0
   
   # Option B: Use existing Neon DB
   heroku config:set DATABASE_URL="your-neon-url"
   heroku config:set DIRECT_URL="your-neon-direct-url"
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV="production"
   heroku config:set JWT_SECRET="your-secret-here"
   heroku config:set JWT_REFRESH_SECRET="your-refresh-secret-here"
   heroku config:set FRONTEND_URL="https://your-frontend.herokuapp.com"
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Open Your App**
   ```bash
   heroku open
   ```

For detailed instructions, see [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)

## Local Development

### Prerequisites
- Node.js 20.x
- PostgreSQL database (Neon DB recommended)

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

4. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed Database** (Optional)
   ```bash
   npm run prisma:seed
   ```

6. **Start Development Server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api`

## Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Lint code
- `npm run test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL (Neon DB)
- **ORM:** Prisma
- **Authentication:** JWT with Passport
- **Validation:** class-validator
- **Documentation:** Swagger (commented out)

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
TZ=Asia/Colombo
FRONTEND_URL=http://localhost:4200
```

## API Documentation

The API is structured with the following modules:

- `/api/auth` - Authentication and authorization
- `/api/users` - User management
- `/api/masters` - Master data (items, suppliers, customers)
- `/api/purchasing` - Purchase orders and vendor management
- `/api/sales` - Sales orders and dispatch
- `/api/production` - Production management
- `/api/finance` - Financial transactions and expenses
- `/api/attendance` - Attendance and HR
- `/api/invoices` - Invoice generation
- `/api/reports` - Business analytics and reports

## Production Deployment

This app is ready for Heroku deployment with:
- ✅ Procfile configured
- ✅ Database migration on release
- ✅ Environment variables setup
- ✅ Build optimization
- ✅ Prisma client auto-generation

## Support

For deployment issues, check:
- [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md) - Detailed deployment guide
- Heroku logs: `heroku logs --tail`
- Database status: `heroku pg:info`

## License

UNLICENSED - Private project
