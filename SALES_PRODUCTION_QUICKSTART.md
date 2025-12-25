# Sales & Production Module - Quick Start Guide

## 🚀 Getting Started

### 1. Database Migration

The production module has been restructured. Apply the changes:

**Option A: Using Prisma (Recommended)**
```bash
cd backend
npx prisma db push
npx prisma generate
```

**Option B: Direct SQL (if Prisma fails)**
```bash
cd backend
# Connect to your PostgreSQL database and run:
psql -U your_username -d your_database < prisma/migrations/20241226_production_restructure/migration.sql
```

### 2. Start Backend
```bash
cd backend
npm run start:dev
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

---

## 📋 Module Features

### Sales Orders
1. **Create Order**: `/sales/new`
   - Select customer
   - Add products (prices auto-pulled from customer price list)
   - Save as DRAFT

2. **Confirm Order**: Click "Confirm" in order detail
   - Locks order for editing
   - Auto-generates SALES invoice
   - Ready for dispatch

3. **Dispatch**: Click "Create Dispatch" in order detail
   - Enter vehicle number and driver name
   - Stock automatically reduced
   - Order status → DISPATCHED

4. **Track Dispatches**: `/dispatches`
   - View all dispatches
   - Mark as delivered
   - Filter by date range

### Production Management
1. **Daily Production Entry**: `/production`
   - Click "New Production Entry"
   - Select date and finished product
   - Enter quantity produced (stock increases automatically)
   - Optionally track scrap quantity

2. **Close Production Day**: 
   - Click menu on production row
   - Select "Close Day" (Manager/Admin only)
   - Day locked from further edits

3. **Reopen Day** (if needed):
   - Select "Reopen Day" (Manager/Admin only)
   - Enter reason for reopening
   - Audit trail maintained

---

## 🔑 User Roles & Permissions

### Admin
- Full access to all modules
- Can void invoices
- Can close/reopen production days
- Can edit and delete all records

### Manager
- Create and confirm sales orders
- Create dispatches and mark delivered
- Create and close production days
- Can reopen production days with reason

### User
- Create DRAFT sales orders
- View sales and production data
- Create production entries
- Limited editing rights

---

## 📊 Stock Flow

### Sales (Stock Reduction)
```
Sales Order → Confirm → Dispatch
                         ↓
                  Stock Movement (qtyOut)
                         ↓
                  Stock Balance ↓
```

### Production (Stock Increase)
```
Production Entry → Save
                    ↓
            Stock Movement (qtyIn)
                    ↓
            Stock Balance ↑
```

---

## 🎯 Testing Workflow

### Test Sales Flow
1. Navigate to `/sales`
2. Click "New Sales Order"
3. Select a customer (e.g., "ABC Company")
4. Add products:
   - Search for product
   - Enter quantity
   - Price auto-fills from customer price list
5. Save as DRAFT
6. Open the order and click "Confirm"
   - Check that invoice was created (check `/invoices`)
7. Click "Create Dispatch"
   - Enter vehicle: "TN-01-AB-1234"
   - Enter driver: "John Doe"
   - Submit
8. Verify stock reduced (check stock balance)
9. Navigate to `/dispatches`
10. Mark dispatch as delivered

### Test Production Flow
1. Navigate to `/production`
2. Click "New Production Entry"
3. Select today's date
4. Choose a finished product (e.g., "Widget A")
5. Enter quantity: 100
6. Enter scrap (optional): 5
7. Add notes: "Test production run"
8. Submit
9. Verify stock increased (check stock balance)
10. Close the production day (Manager/Admin)
11. Try to edit → Should show error
12. Reopen with reason → Should allow editing again

---

## 🐛 Troubleshooting

### Database Errors
**Issue**: Migration fails with table errors
**Solution**: 
```bash
cd backend
npx prisma db push --force-reset  # ⚠️ This will reset the database!
npx prisma db seed
```

### Stock Not Updating
**Issue**: Stock balance not changing after dispatch/production
**Solution**: Check StockMovement table:
```sql
SELECT * FROM stock_movements ORDER BY movement_date DESC LIMIT 10;
SELECT * FROM stock_balances;
```

### Invoice Not Created
**Issue**: Invoice not auto-generated on order confirm
**Solution**: 
- Check backend logs for errors
- Verify InvoiceType enum includes 'SALES'
- Check that order status is CONFIRMED

### Production Day Close Not Working
**Issue**: Cannot close production day
**Solution**:
- Ensure you're logged in as Manager or Admin
- Check that production entry exists for the day
- Check backend logs for permission errors

---

## 📝 API Endpoints Reference

### Sales
- `GET /sales/orders` - List orders
- `POST /sales/orders` - Create order
- `GET /sales/orders/:id` - Get order
- `PUT /sales/orders/:id` - Update order
- `POST /sales/orders/:id/confirm` - Confirm order
- `POST /sales/orders/:id/cancel` - Cancel order

### Dispatches
- `GET /sales/dispatches` - List dispatches
- `POST /sales/dispatches` - Create dispatch
- `GET /sales/dispatches/:id` - Get dispatch
- `POST /sales/dispatches/:id/deliver` - Mark delivered

### Production
- `GET /production` - List production days
- `POST /production` - Create production entry
- `GET /production/:id` - Get production day
- `PUT /production/:id` - Update production
- `POST /production/:id/close` - Close day
- `POST /production/:id/reopen` - Reopen day

---

## 💡 Pro Tips

1. **Customer Prices**: Set up customer-specific prices in Masters → Customer Prices for automatic pricing in sales orders

2. **Stock Monitoring**: Regularly check stock balances before creating dispatches to avoid negative stock

3. **Production Planning**: Close production days daily to maintain data integrity

4. **Dispatch Tracking**: Use the dispatch list view to track all pending deliveries

5. **Invoice Matching**: Match sales invoices with purchase invoices for better accounting

6. **Audit Trail**: All actions are tracked with user ID and timestamp for compliance

---

## 📞 Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check browser console for frontend errors
3. Verify database connection in backend `.env` file
4. Review [SALES_PRODUCTION_COMPLETE.md](SALES_PRODUCTION_COMPLETE.md) for implementation details

---

## ✅ Next Steps

After testing:
1. Set up production environment variables
2. Configure PDF templates for invoices
3. Set up email notifications (optional)
4. Train users on new features
5. Import existing data (if any)

Happy selling and producing! 🎉
