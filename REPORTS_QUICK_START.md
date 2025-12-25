# Reports Module Quick Start Guide

## What's New? 🎉

Your SUPREME BLUE ERP now has a **comprehensive reporting system** with 5 different report types, date filtering, and PDF export capabilities!

## Accessing Reports

1. **Login** to your ERP system
2. Click **"Reports"** in the main navigation menu
3. You'll see 5 report tabs:
   - Sales Report
   - Purchase Report
   - Inventory Stock
   - Attendance & OT
   - Profit & Loss

## How to Use Each Report

### 📊 Sales Report

**What it shows:**
- All sales invoices within selected date range
- Total sales amount
- Total paid amount
- Outstanding balances
- Payment status for each invoice

**How to use:**
1. Click **"Sales Report"** tab
2. Select date range:
   - Use date pickers, OR
   - Click **"Today"** / **"This Week"** / **"This Month"**
3. Click **"Run Report"**
4. View results in table
5. Click **"Export PDF"** to save or print

**Best for:**
- Daily sales tracking
- Customer payment follow-up
- Monthly revenue analysis
- Sales performance review

---

### 🛒 Purchase Report

**What it shows:**
- All purchase invoices within date range
- Total purchase amount
- Number of invoices
- Supplier-wise breakdown

**How to use:**
1. Click **"Purchase Report"** tab
2. Select date range
3. Click **"Run Report"**
4. Export to PDF if needed

**Best for:**
- Tracking supplier payments
- Monthly expense analysis
- Purchase order verification
- Supplier performance review

---

### 📦 Inventory Stock Report

**What it shows:**
- Current stock levels for ALL items
- Item codes and names
- Item types (Raw Material, Finished Goods, etc.)
- Categories
- Quantity on hand
- **Low stock warnings** (items with less than 10 units)

**How to use:**
1. Click **"Inventory Stock"** tab
2. Click **"Refresh"** to load latest data
3. Items with low stock will be **highlighted in red**
4. Export to PDF for inventory review

**Best for:**
- Stock take verification
- Reorder planning
- Inventory audits
- Identifying slow-moving items

**Note:** No date filter (shows real-time stock)

---

### 👥 Attendance & OT Report

**What it shows:**
- Employee attendance records
- Total working days per employee
- Total regular hours
- Total overtime (OT) hours
- Summary totals for entire workforce

**How to use:**
1. Click **"Attendance & OT"** tab
2. Select date range (e.g., payroll period)
3. Click **"Run Report"**
4. Review employee-wise breakdown
5. Export for payroll processing

**Best for:**
- Monthly payroll calculation
- OT cost analysis
- Employee productivity tracking
- Attendance verification

---

### 💰 Profit & Loss Report

**What it shows:**
- Total income from sales
- Total expenses
- Net profit/loss
- Profit margin percentage

**How to use:**
1. Click **"Profit & Loss"** tab
2. Select date range
3. Click **"Run Report"**
4. View financial summary
5. Export for accounting

**Best for:**
- Monthly financial reviews
- Business performance analysis
- Budgeting and forecasting
- Stakeholder reporting

**Visual indicators:**
- **Green:** Profit (positive)
- **Red:** Loss (negative)
- **Orange:** Expenses

---

## Quick Filter Buttons

All date-based reports have 3 quick filter options:

### 📅 Today
- Shows data for current date only
- From: Today 00:00
- To: Today 23:59

### 📅 This Week
- Shows data from Sunday to today
- From: Last Sunday
- To: Today

### 📅 This Month
- Shows data from 1st of month to today
- From: 1st of current month
- To: Today

**Tip:** These buttons automatically set both From and To dates!

---

## Exporting to PDF

### Method 1: Export Button
1. Run any report
2. Click **"Export PDF"** button (appears when data loaded)
3. Browser print dialog opens
4. Select **"Save as PDF"** or **"Microsoft Print to PDF"**
5. Choose file location
6. Click **"Save"**

### Method 2: Browser Print (Ctrl+P)
1. Run any report
2. Press **Ctrl+P** (Windows) or **Cmd+P** (Mac)
3. Follow same steps as Method 1

**PDF Features:**
- Clean layout (no filters/buttons in PDF)
- Company branding
- Proper page breaks
- Color-coded status indicators
- Professional formatting

---

## Tips & Tricks

### ✅ Best Practices

1. **Set Defaults:** Reports default to "This Month" - perfect for monthly reviews!

2. **Regular Exports:** Export reports at month-end for records

3. **Low Stock Monitoring:** Check Inventory Stock report weekly to avoid stockouts

4. **Payroll Workflow:**
   - Set Attendance report to 1st-31st of month
   - Export PDF
   - Use for payroll calculation

5. **Financial Review:**
   - Run Profit & Loss monthly
   - Compare month-over-month trends
   - Share with management

### ⚡ Shortcuts

- **Ctrl+P:** Quick print/PDF export
- **Tab:** Navigate between date fields
- **Enter:** Submit date selection
- **Escape:** Close date picker

### 🎨 Color Codes

Learn the visual language:

- **Green:** Good (Paid, Profit, Success)
- **Orange:** Attention (Unpaid, Expenses)
- **Blue:** Information (Partial payments)
- **Red:** Warning (Low stock, Loss)

---

## Common Workflows

### Daily Sales Review
1. Open Sales Report
2. Click **"Today"**
3. Click **"Run Report"**
4. Review invoice list and totals

### Weekly Stock Check
1. Open Inventory Stock
2. Click **"Refresh"**
3. Look for red-highlighted items (low stock)
4. Create purchase orders for low items

### Monthly Financial Close
1. Run all 5 reports for the month
2. Export each to PDF
3. Save in organized folder structure
4. Share with accounting/management

### Supplier Payment Planning
1. Open Purchase Report
2. Set date to payment period
3. Review outstanding invoices
4. Plan payments based on due dates

---

## Troubleshooting

### Report not loading?
- Check internet connection
- Verify date range is valid (From < To)
- Refresh page and try again
- Check if backend server is running

### No data showing?
- Confirm date range has transactions
- Try wider date range
- Check if you have permissions for this report
- Contact system administrator

### PDF export not working?
- Ensure popup blocker is disabled
- Try different browser (Chrome recommended)
- Check printer settings in print dialog
- Save locally before printing

### Date picker not opening?
- Click the calendar icon (📅)
- Check browser compatibility
- Try clicking the input field directly

---

## Who Can Access?

### 👨‍💼 Admin
- ✅ All reports
- ✅ All date ranges
- ✅ Export capabilities

### 👨‍💻 Manager
- ✅ All operational reports
- ✅ Financial reports
- ✅ Export capabilities

### 👤 User/Labour
- ⚠️ Limited access (configured by admin)
- May see only their own attendance

**Note:** Contact your administrator to change permissions

---

## Support

Need help?
1. Check this guide first
2. Review tooltips in the system
3. Contact your system administrator
4. Check backend logs for errors

---

## Sample Use Cases

### Scenario 1: Month-End Sales Review
**Goal:** Review December sales performance

**Steps:**
1. Go to Reports → Sales Report
2. Set From Date: December 1
3. Set To Date: December 31
4. Click "Run Report"
5. Review total sales: **LKR 5,250,000**
6. Check outstanding: **LKR 450,000**
7. Export PDF for management meeting

### Scenario 2: Urgent Low Stock Alert
**Goal:** Identify items to reorder immediately

**Steps:**
1. Go to Reports → Inventory Stock
2. Click "Refresh"
3. Look for **red-highlighted items** (qty < 10)
4. Note: Wire Gauge 2mm shows **8 units**
5. Create Purchase Order for 100 units
6. Export stock report for procurement approval

### Scenario 3: OT Calculation for Payroll
**Goal:** Calculate December OT payments

**Steps:**
1. Go to Reports → Attendance & OT
2. Set From: December 1
3. Set To: December 31
4. Click "Run Report"
5. Review total OT hours: **342.5 hrs**
6. Export PDF
7. Send to HR for salary processing

---

## Video Tutorial (Coming Soon)

We're preparing video tutorials for:
- Basic navigation
- Running each report type
- Advanced filtering techniques
- PDF export and printing
- Monthly reporting workflow

Stay tuned!

---

**Last Updated:** December 2024  
**Version:** 1.0  
**System:** SUPREME BLUE ERP

For technical support, contact your system administrator.
