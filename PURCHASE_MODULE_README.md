# SUPREME BLUE ERP - Purchase / Raw Material Buying Module

## Overview
Complete Purchase module for SUPREME BLUE water bottling factory ERP system. This module handles:
- Purchase Order (PO) creation and management
- Goods Receipt Note (GRN) / Receiving
- Auto-invoice generation
- Supplier invoice matching
- Stock updates for RAW materials
- Payment tracking (full/partial)
- PDF invoice generation (DOT_MATRIX & A4)

## Tech Stack
- **Backend**: NestJS 10+ with TypeScript
- **Frontend**: Angular 17+ with Angular Material
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (access/refresh tokens) + bcrypt
- **RBAC**: ADMIN, MANAGER, USER (Labour)
- **Timezone**: Asia/Colombo (UTC+5:30)

## Features Implemented

### 1. Purchase Order Management
- ✅ Create PO with multiple line items (RAW materials only)
- ✅ Supplier-wise pricing with auto-price lookup
- ✅ Manual price override (ADMIN/MANAGER only) with reason tracking
- ✅ PO statuses: DRAFT → CONFIRMED → RECEIVED → CANCELLED
- ✅ Edit DRAFT POs
- ✅ Soft delete (cancel) with reason
- ✅ Full audit trail (created_by, updated_by, received_by, cancelled_by)

### 2. Receiving (GRN)
- ✅ Receive CONFIRMED purchase orders
- ✅ Auto-generate PURCHASE invoice
- ✅ Auto-create stock movements (qty_in for RAW items)
- ✅ Update stock balances
- ✅ All operations in single transaction (rollback on failure)

### 3. Invoice Generation & Matching
- ✅ Auto-generate unique invoice numbers (PINV-YYYY-####)
- ✅ Supplier invoice matching with mismatch detection
- ✅ Match status: PENDING / MATCHED / MISMATCHED
- ✅ Store vendor invoice number, total, and date
- ✅ Calculate and store mismatch amount
- ✅ Track who checked matching and when

### 4. PDF Invoice Templates
- ✅ **DOT_MATRIX**: Monospace font, fixed columns, continuous paper friendly
- ✅ **A4**: HTML-based template for standard printing
- ✅ Download endpoints for both templates

### 5. Payment Tracking
- ✅ Record full or partial payments
- ✅ Payment methods: CASH, BANK, CHEQUE, OTHER
- ✅ Auto-update invoice status to PAID when fully paid
- ✅ Payment validation (cannot exceed invoice total)
- ✅ Unique payment numbers (PAY-YYYY-####)

### 6. Permissions (RBAC)
- **ADMIN**: All operations
- **MANAGER**: Create/update/receive PO, match invoices, record payments
- **USER/Labour**: View only (read-only access)

## Database Schema

### Key Models
```prisma
model PurchaseOrder {
  purchaseId    BigInt
  purchaseNo    String    @unique  // PO-2025-0001
  supplierId    BigInt
  purchaseDate  DateTime
  status        DocStatus // DRAFT, CONFIRMED, RECEIVED, CANCELLED
  subtotal      Decimal
  discount      Decimal
  tax           Decimal
  total         Decimal
  notes         String?
  createdBy     BigInt?
  updatedBy     BigInt?
  receivedBy    BigInt?
  receivedAt    DateTime?
  cancelledBy   BigInt?
  cancelledAt   DateTime?
  cancelReason  String?
  lines         PurchaseOrderLine[]
  invoices      Invoice[]
}

model PurchaseOrderLine {
  purchaseLineId BigInt
  purchaseId     BigInt
  itemId         BigInt    // RAW items only
  qty            Decimal
  unitPrice      Decimal
  lineTotal      Decimal
  priceSource    String    // SUPPLIER_PRICE | MANUAL_OVERRIDE
  overrideReason String?
  overriddenBy   BigInt?
}

model Invoice {
  invoiceId          BigInt
  invoiceNo          String    @unique  // PINV-2025-0001
  invoiceType        InvoiceType  // PURCHASE
  supplierId         BigInt
  purchaseId         BigInt
  vendorInvoiceNo    String?
  vendorInvoiceTotal Decimal?
  matchStatus        MatchStatus  // PENDING, MATCHED, MISMATCHED
  mismatchAmount     Decimal
  printTemplate      String  // DOT_MATRIX | A4
  status             DocStatus  // ISSUED, PAID
  lines              InvoiceLine[]
  payments           Payment[]
}

model StockMovement {
  movementType    MovementType  // PURCHASE_RECEIPT
  itemId          BigInt
  qtyIn           Decimal
  unitCost        Decimal
  refTable        String  // 'purchase_orders'
  refId           BigInt  // purchase_id
  purchaseId      BigInt?
}

model Payment {
  paymentNo   String    @unique  // PAY-2025-0001
  invoiceId   BigInt
  paymentDate DateTime
  amount      Decimal
  method      PayMethod  // CASH, BANK, CHEQUE, OTHER
  referenceNo String?
}
```

## API Endpoints

### Purchase Orders
```
GET    /purchases
POST   /purchases
GET    /purchases/:id
PATCH  /purchases/:id
PATCH  /purchases/:id/confirm
PATCH  /purchases/:id/receive     # Creates invoice + stock movements
PATCH  /purchases/:id/cancel

GET    /purchases/suppliers/:supplierId/items/:itemId/active-price
```

### Purchase Invoices
```
GET    /purchase-invoices
GET    /purchase-invoices/:id
GET    /purchase-invoices/:id/pdf?template=DOT_MATRIX|A4
PATCH  /purchase-invoices/:id/match
```

### Payments
```
POST   /purchase-invoices/:id/payments
GET    /purchase-invoices/:id/payments
GET    /payments
```

## Setup Instructions

### 1. Database Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/supremeblue"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"
TZ="Asia/Colombo"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# OR create migration from schema
npx prisma migrate dev --name purchase_module

# Seed database (creates admin user, suppliers, raw items, prices)
npx prisma db seed
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies (if not done)
npm install

# Start development server
npm run start:dev

# API will be available at http://localhost:3000
# Swagger docs at http://localhost:3000/api
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Update environment files
# src/environments/environment.ts:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

# Start development server
ng serve

# App will be available at http://localhost:4200
```

### 4. Docker Setup (Optional)
```bash
# From project root
docker-compose up -d

# Services:
# - postgres: localhost:5432
# - backend: localhost:3000
# - frontend: localhost:4200
```

## Default Credentials
```
Username: admin
Password: Admin@123
Role: ADMIN
```

## Business Rules

### Supplier Pricing
1. Same RAW item can have different prices for different suppliers
2. System auto-picks latest active price by `effective_from` date
3. Manual price override allowed only for ADMIN/MANAGER
4. Override requires reason and stores who overrode

### Receiving Process
When PO is marked RECEIVED:
1. Validates PO status is CONFIRMED
2. Creates PURCHASE invoice with unique number
3. Creates invoice lines from PO lines
4. Creates stock movements (PURCHASE_RECEIPT) for each RAW item
5. Updates stock balances (qty_in)
6. Updates PO status to RECEIVED
7. **All in ONE transaction** - rolls back if any step fails

### Invoice Matching
1. User enters supplier's invoice number + total
2. System compares vendor total vs system total
3. Sets match_status: MATCHED (if difference < 0.01) or MISMATCHED
4. Stores mismatch_amount
5. Records who checked and when

### Payment Rules
1. Can record multiple partial payments
2. Total payments cannot exceed invoice total
3. When total_paid >= invoice.total, status → PAID
4. Each payment gets unique payment_no

### Soft Delete
- POs can be CANCELLED (not hard deleted)
- Cannot cancel RECEIVED purchase orders
- Cancel reason must be provided

## File Structure

### Backend
```
backend/src/purchasing/
├── dto/
│   ├── create-purchase-order.dto.ts
│   ├── create-purchase-order-line.dto.ts
│   ├── update-purchase-order.dto.ts
│   ├── cancel-purchase-order.dto.ts
│   ├── match-invoice.dto.ts
│   ├── create-payment.dto.ts
│   └── index.ts
├── purchasing.controller.ts      # PO endpoints
├── purchasing.service.ts          # Business logic
├── purchasing.module.ts
├── pdf.service.ts                 # PDF generation
└── index.ts

backend/prisma/
├── schema.prisma                  # Database schema
├── migrations/
│   └── 20241224_purchase_module/
│       └── migration.sql
└── seed.ts                        # Seed data
```

### Frontend
```
frontend/src/app/purchasing/
├── components/
│   ├── purchase-order-list/
│   │   ├── purchase-order-list.component.ts
│   │   ├── purchase-order-list.component.html
│   │   └── purchase-order-list.component.scss
│   ├── purchase-order-form/
│   │   ├── purchase-order-form.component.ts
│   │   ├── purchase-order-form.component.html
│   │   └── purchase-order-form.component.scss
│   ├── invoice-matching/          # To be completed
│   └── payments/                  # To be completed
├── services/
│   └── purchasing.service.ts
└── purchasing.routes.ts
```

## Testing

### Sample Workflow
1. **Login** as admin (admin / Admin@123)
2. **Create PO**:
   - Select Supplier: "Lanka Plastics (Pvt) Ltd"
   - Add items:
     - PET Bottle 500ml: Qty 1000
     - Bottle Cap (Blue): Qty 1000
   - System auto-fills prices from supplier_item_prices
   - Save as DRAFT
3. **Confirm PO**: Changes status to CONFIRMED
4. **Receive PO**:
   - Creates invoice PINV-2025-0001
   - Updates stock (RAW001: +1000, RAW002: +1000)
   - PO status → RECEIVED
5. **Match Invoice**:
   - Enter vendor invoice: VINV-001, Total: 15000.00
   - System compares and sets match status
6. **Record Payment**:
   - Partial payment: 10000.00 (BANK)
   - Remaining balance: 5000.00
7. **Download PDF**: DOT_MATRIX or A4 template

## Key Features Demonstrated

### Transaction Safety
```typescript
// In purchasing.service.ts - receive()
const result = await this.prisma.$transaction(async (tx) => {
  // 1. Create invoice
  const invoice = await tx.invoice.create({...});
  
  // 2. Create stock movements
  for (const line of purchase.lines) {
    await tx.stockMovement.create({...});
    await tx.stockBalance.update({...});
  }
  
  // 3. Update PO
  await tx.purchaseOrder.update({...});
  
  return { invoice, ... };
});
```

### Auto Number Generation
```typescript
private async generatePurchaseNo(): Promise<string> {
  const year = new Date().getFullYear();
  const lastPO = await this.prisma.purchaseOrder.findFirst({
    where: { purchaseNo: { startsWith: `PO-${year}-` }},
    orderBy: { purchaseNo: 'desc' },
  });
  
  let seq = 1;
  if (lastPO) {
    const parts = lastPO.purchaseNo.split('-');
    seq = parseInt(parts[2]) + 1;
  }
  
  return `PO-${year}-${seq.toString().padStart(4, '0')}`;
}
```

### Supplier Price Lookup
```typescript
async getLatestSupplierPrice(supplierId, itemId, asOfDate?) {
  return await this.prisma.supplierItemPrice.findFirst({
    where: {
      supplierId,
      itemId,
      isActive: true,
      effectiveFrom: { lte: asOfDate || new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: asOfDate || new Date() }}
      ],
    },
    orderBy: { effectiveFrom: 'desc' },
  });
}
```

## DOT_MATRIX Invoice Template

```
================================================================================
                              SUPREME BLUE
                        Water Bottling Factory
                           Purchase Invoice
================================================================================

Invoice No: PINV-2025-0001                      Date: 2025-12-24

Supplier:
  Lanka Plastics (Pvt) Ltd
  No. 123, Galle Road, Colombo 03
  Tel: 0112345678

--------------------------------------------------------------------------------
Item                                          Qty         Rate        Amount
--------------------------------------------------------------------------------
PET Bottle 500ml (Clear)                  1000.00        12.50     12500.00
Bottle Cap (Blue)                         1000.00         2.50      2500.00
--------------------------------------------------------------------------------

                                                   Subtotal:     15000.00
================================================================================
                                                      TOTAL:     15000.00
================================================================================

Vendor Invoice No: VINV-001
Vendor Total: 15000.00 | Match Status: MATCHED

                       Thank you for your business!
================================================================================
```

## Notes & Best Practices

1. **Always use BigInt** for IDs in backend (Prisma uses BigInt for autoincrement)
2. **Timezone**: All dates stored in UTC, display in Asia/Colombo
3. **Decimal precision**: Use Decimal(12,2) for currency, Decimal(12,3) for quantities
4. **Validation**: Class-validator on DTOs, database constraints on Prisma
5. **Error handling**: Try-catch with proper HTTP status codes
6. **Soft delete**: Use status flags instead of hard deletes
7. **Audit trail**: Always track created_by, updated_by with timestamps

## Troubleshooting

### Issue: Prisma Client not generated
```bash
npx prisma generate
```

### Issue: Migration failed
```bash
# Reset database (development only!)
npx prisma migrate reset

# Or manually apply
npx prisma db push
```

### Issue: CORS errors in frontend
Update backend `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});
```

### Issue: BigInt serialization error
Backend returns BigInt as strings. Frontend should handle:
```typescript
// In Angular service
map(response => ({
  ...response,
  purchaseId: response.purchaseId.toString()
}))
```

## Future Enhancements

- [ ] Purchase invoice detail view component
- [ ] Invoice matching component (UI)
- [ ] Payment management component (UI)
- [ ] Advanced PDF generation with pdfmake or puppeteer
- [ ] Email notifications for PO approval
- [ ] Multi-currency support
- [ ] Purchase analytics dashboard
- [ ] Automated reorder points
- [ ] Supplier performance tracking
- [ ] Purchase approval workflow

## License
Proprietary - SUPREME BLUE ERP System

## Contact
For support: admin@supremeblue.lk
