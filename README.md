# Supreme Blue ERP

Enterprise Resource Planning system for Supreme Blue Water Bottling Factory.

## Features
- User Management & Authentication
- Inventory Management
- Purchase Order Management
- Sales Order Management
- Production Management
- Expense Tracking
- Attendance & HR
- Financial Reports
- Dashboard Analytics

## Tech Stack
- **Frontend**: Angular 18 + Angular Material
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT

## Development Setup

### Prerequisites
- Node.js >= 20.0.0
- PostgreSQL database
- npm >= 10.0.0

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your DATABASE_URL and JWT_SECRET in .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:4200
The backend API will run on http://localhost:3000

## Production Deployment

See [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md) for detailed Heroku deployment instructions.

## License
UNLICENSED - Private Project
