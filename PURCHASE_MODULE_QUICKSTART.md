# 🚀 PURCHASE MODULE - QUICK START GUIDE

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed

## Setup (5 minutes)

### Step 1: Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE supremeblue;
\q

# Or using pgAdmin, create database: supremeblue
```

### Step 2: Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy this content to backend/.env:
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/supremeblue"
DIRECT_URL="postgresql://postgres:yourpassword@localhost:5432/supremeblue"
JWT_SECRET="supreme-blue-secret-key-2025"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"
TZ="Asia/Colombo"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name purchase_module

# Seed database (creates admin user, suppliers, items, prices)
npx prisma db seed

# Start backend
npm run start:dev
```

Backend will start at: http://localhost:3000
Swagger API docs at: http://localhost:3000/api

### Step 3: Frontend Setup
```bash
# Open new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Update environment file
# Edit frontend/src/environments/environment.ts:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

# Start frontend
ng serve
```

Frontend will start at: http://localhost:4200

## First Login

1. Open http://localhost:4200
2. Login with:
   - **Username**: `admin`
   - **Password**: `Admin@123`
3. Navigate to: **Purchasing** > **Purchase Orders**

## Test the Module (5 minutes)

### 1. Create Purchase Order
1. Click **"New Purchase Order"**
2. Select **Supplier**: "Lanka Plastics (Pvt) Ltd"
3. Click **"Add Item"**
4. Select **Item**: "PET Bottle 500ml (Clear)"
5. Enter **Qty**: 1000
6. **Unit Price** auto-fills from supplier price (12.50)
7. Click **"Add Item"** again
8. Select **Item**: "Bottle Cap (Blue)"
9. Enter **Qty**: 1000
10. **Unit Price** auto-fills (2.50)
11. View calculated **Total**: 15,000.00
12. Click **"Create"**

✅ PO created with status: **DRAFT**

### 2. Confirm Purchase Order
1. In the list, click **Actions** (⋮) > **"Confirm"**
2. Status changes to: **CONFIRMED**

✅ PO confirmed and ready to receive

### 3. Receive Purchase Order (The Magic!)
1. Click **Actions** (⋮) > **"Receive"**
2. Confirm the action
3. System automatically:
   - ✅ Creates invoice: **PINV-2025-0001**
   - ✅ Updates stock for RAW items (+1000 bottles, +1000 caps)
   - ✅ Changes PO status to: **RECEIVED**

✅ Purchase order received! Stock updated!

### 4. Match Supplier Invoice (API Test)
```bash
# Get the invoice ID from the response, then:
curl -X PATCH http://localhost:3000/purchase-invoices/1/match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "vendorInvoiceNo": "VINV-001",
    "vendorInvoiceTotal": 15000.00,
    "vendorInvoiceDate": "2025-12-24"
  }'
```

✅ Invoice matched! Status: **MATCHED** (amounts equal)

### 5. Record Payment (API Test)
```bash
curl -X POST http://localhost:3000/purchase-invoices/1/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 10000.00,
    "paymentDate": "2025-12-24",
    "method": "BANK",
    "referenceNo": "TXN-123456",
    "notes": "Partial payment"
  }'
```

✅ Payment recorded! Balance: 5,000.00

### 6. Download Invoice PDF (API Test)
```bash
# DOT_MATRIX template (text file)
curl -X GET http://localhost:3000/purchase-invoices/1/pdf?template=DOT_MATRIX \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o invoice.txt

# A4 template (HTML file)
curl -X GET http://localhost:3000/purchase-invoices/1/pdf?template=A4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o invoice.html
```

✅ Invoice PDF downloaded!

## Sample Data Included

### Suppliers
1. Lanka Plastics (Pvt) Ltd
2. Ceylon Cap Manufacturing
3. Pure Water Chemicals Ltd

### RAW Items
1. PET Bottle 500ml (Clear) - Rs. 12.50
2. Bottle Cap (Blue) - Rs. 2.50
3. Label Sticker (Supreme Blue) - Rs. 5.00
4. Shrink Film Roll - Rs. 450.00
5. Water Treatment Chemical - Rs. 850.00

### Pre-configured Prices
- Supplier 1 → Item 1: Rs. 12.50 (from 2025-01-01)
- Supplier 1 → Item 1: Rs. 11.75 (from 2025-12-01) - newer price
- Supplier 2 → Item 2: Rs. 2.50
- Supplier 2 → Item 3: Rs. 5.00
- Supplier 3 → Item 5: Rs. 850.00

## API Testing with Swagger

1. Open http://localhost:3000/api
2. Click **"Authorize"** button
3. Login first using `/auth/login` endpoint:
   ```json
   {
     "username": "admin",
     "password": "Admin@123"
   }
   ```
4. Copy the `access_token` from response
5. Paste in Authorize dialog: `Bearer <access_token>`
6. Now you can test all endpoints!

### Key Endpoints to Try:
- `GET /purchases` - List all purchase orders
- `POST /purchases` - Create new PO
- `PATCH /purchases/{id}/receive` - Receive PO (creates invoice + stock)
- `GET /purchase-invoices` - List all invoices
- `PATCH /purchase-invoices/{id}/match` - Match vendor invoice
- `POST /purchase-invoices/{id}/payments` - Add payment
- `GET /purchase-invoices/{id}/pdf` - Download PDF

## Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
pg_isready

# Check if port 3000 is available
netstat -an | findstr :3000

# Regenerate Prisma client
npx prisma generate
```

### Frontend won't start
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check if port 4200 is available
netstat -an | findstr :4200
```

### Database errors
```bash
# Reset database (DEVELOPMENT ONLY!)
npx prisma migrate reset

# Or manually
npx prisma db push
npx prisma db seed
```

### CORS errors
Update `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

## Next Steps

### Build Frontend Components (Optional)
You can build the remaining UI components:
1. Invoice Matching Component
2. Payment Management Component
3. Purchase Order Detail View

All backend APIs are ready - just create Angular components following the same pattern as `purchase-order-list` and `purchase-order-form`.

### Production Deployment
1. Build frontend: `ng build --configuration production`
2. Build backend: `npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Set environment variables
5. Start with PM2 or Docker

## Success Indicators ✅

You know it's working when:
- ✅ Backend starts without errors
- ✅ Swagger docs load at /api
- ✅ Frontend loads at localhost:4200
- ✅ You can login as admin
- ✅ Purchase orders list is empty (ready for data)
- ✅ You can create a new PO
- ✅ Supplier prices auto-fill
- ✅ Receive creates invoice + updates stock
- ✅ Swagger shows all purchase endpoints

## Support Files

- **Setup Guide**: This file
- **Full Documentation**: `PURCHASE_MODULE_README.md`
- **Delivery Summary**: `PURCHASE_MODULE_DELIVERY.md`
- **Business Rules**: See README Section "Business Rules"

---

**Estimated Setup Time**: 5-10 minutes
**Estimated Test Time**: 5 minutes
**Total**: ~15 minutes to fully operational system

🎉 **Happy Purchasing!**
