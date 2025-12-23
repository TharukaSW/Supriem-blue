# Supreme Blue ERP System

A production-ready web-based ERP system for a Sri Lankan water bottling and selling factory.

## Tech Stack

- **Frontend**: Angular 18 + Angular Material
- **Backend**: NestJS + REST API + Swagger
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Containerization**: Docker + docker-compose

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)
- Git

### Option 1: Docker (Recommended)

```bash
# 1. Clone and navigate
cd "d:\Supriem blue"

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:3000/api
# Swagger Docs: http://localhost:3000/api
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Start development server
npm run start:dev
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

## Default Admin Login

| Field    | Value       |
|----------|-------------|
| Username | `SBA001` or `admin` |
| Password | `Admin@123` |

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/supreme_blue?schema=public"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
TZ=Asia/Colombo
```

## API Routes

### Auth (`/api/auth`)
- `POST /login` - Login with user code/username
- `POST /refresh` - Refresh access token
- `GET /profile` - Get current user profile

### Users (`/api/users`)
- `GET /` - List users (paginated)
- `POST /` - Create user
- `GET /:id` - Get user details
- `PUT /:id` - Update user
- `PUT /:id/change-password` - Change password
- `PUT /:id/deactivate` - Deactivate user
- `PUT /:id/activate` - Activate user
- `GET /roles` - Get all roles

### Masters (`/api/masters`)
- **Units**: `GET|POST /units`, `GET|PUT|DELETE /units/:id`
- **Categories**: `GET|POST /categories`, `GET|PUT|DELETE /categories/:id`
- **Items**: `GET|POST /items`, `GET|PUT|DELETE /items/:id`
- **Suppliers**: `GET|POST /suppliers`, `GET|PUT|DELETE /suppliers/:id`
- **Customers**: `GET|POST /customers`, `GET|PUT|DELETE /customers/:id`
- **Supplier Prices**: `GET|POST /supplier-prices`, `PUT /supplier-prices/:id`
- **Customer Prices**: `GET|POST /customer-prices`, `PUT /customer-prices/:id`

### Purchasing (`/api/purchasing`)
- `GET /orders` - List purchase orders
- `POST /orders` - Create purchase order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order
- `POST /orders/:id/confirm` - Confirm order (generates invoice + stock)
- `POST /orders/:id/cancel` - Cancel order

### Sales (`/api/sales`)
- `GET /orders` - List sales orders
- `POST /orders` - Create sales order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order
- `POST /orders/:id/confirm` - Confirm order (generates invoice)
- `POST /orders/:id/cancel` - Cancel order
- `GET /dispatches` - List dispatches
- `POST /dispatches` - Create dispatch (decreases stock)
- `GET /dispatches/:id` - Get dispatch details
- `POST /dispatches/:id/deliver` - Mark as delivered

### Production (`/api/production`)
- `GET /` - List production days
- `POST /` - Create production day (increases product stock)
- `GET /:id` - Get production details
- `PUT /:id` - Update notes

### Finance (`/api/finance`)
- `GET /expenses` - List expenses
- `POST /expenses` - Create expense
- `GET /expenses/:id` - Get expense details
- `PUT /expenses/:id` - Update expense
- `GET /payments` - List payments
- `POST /payments` - Create payment (updates invoice status)
- `GET /transactions` - List cash transactions
- `GET /profit` - Get profit report

### Attendance (`/api/attendance`)
- `POST /clock-in` - Clock in for employee
- `POST /clock-out` - Clock out (calculates hours)
- `PUT /:id/manual-ot` - Update manual OT hours
- `GET /` - List attendance records
- `GET /search?q=` - Search employees
- `GET|POST /salary-ranges` - Salary ranges CRUD
- `PUT /salary-ranges/:id` - Update salary range
- `GET /employees/:id/profile` - Get employee profile
- `PUT /employees/:id/profile` - Update employee profile
- `POST /salary-payments` - Create salary payment

### Invoices (`/api/invoices`)
- `GET /` - List invoices (filter by type, status, date)
- `GET /:id` - Get invoice details
- `PUT /:id/match` - Update vendor invoice matching
- `GET /:id/pdf?template=DOT_MATRIX|A4` - Download PDF

### Reports (`/api/reports`)
- `GET /dashboard` - Dashboard summary
- `GET /sales?fromDate&toDate` - Sales report
- `GET /purchases?fromDate&toDate` - Purchases report
- `GET /production?fromDate&toDate` - Production report
- `GET /stock` - Stock on hand report
- `GET /expenses?fromDate&toDate` - Expenses report
- `GET /profit?fromDate&toDate` - Profit report
- `GET /attendance?fromDate&toDate` - Attendance & OT report

## User Roles

| Role    | Prefix | Access Level |
|---------|--------|--------------|
| ADMIN   | SBA    | Full access  |
| MANAGER | SBM    | Most features except system settings |
| USER    | SBL    | Limited (attendance, basic operations) |

## User Code Generation

- Admin users: `SBA001`, `SBA002`, ...
- Manager users: `SBM001`, `SBM002`, ...
- Labour users: `SBL001`, `SBL002`, ...

## Invoice Templates

1. **DOT_MATRIX** - Monospace font, fixed columns, minimal graphics (continuous paper friendly)
2. **A4** - Professional layout with company branding

## Business Rules

1. **Pricing**: Same item can have different prices for different suppliers/customers
2. **Invoicing**: All purchases and sales generate invoices automatically on confirmation
3. **Stock**: 
   - Purchase receipt increases raw material stock
   - Production output increases product stock
   - Dispatch decreases product stock
4. **Attendance**: 
   - System calculates hours (> 8 hours = system OT)
   - Manager can override with manual OT hours
5. **Cash Ledger**: All payments and expenses auto-create cash transaction records

## Development

```bash
# Run tests
cd backend && npm run test

# Run specific tests
npm run test -- --testPathPattern=auth

# Build for production
npm run build
```

## License

Proprietary - Supreme Blue Water Bottling Factory
