# Reports Module Implementation Guide

## Overview
A comprehensive reporting system has been implemented for SUPREME BLUE ERP with multiple report types, date filtering, and PDF export capabilities.

## Features Implemented

### 1. **Sales Report**
- **Metrics Displayed:**
  - Total Sales Amount
  - Total Paid Amount
  - Outstanding Amount
  - Invoice Count
- **Details Table:**
  - Invoice Number
  - Date
  - Customer Name
  - Total Amount
  - Payment Status (Paid/Unpaid/Partial)
- **Filters:** Date range with quick buttons (Today, This Week, This Month)

### 2. **Purchase Report**
- **Metrics Displayed:**
  - Total Purchases Amount
  - Invoice Count
- **Details Table:**
  - Invoice Number
  - Date
  - Supplier Name
  - Total Amount
- **Filters:** Date range with quick buttons

### 3. **Inventory Stock Report**
- **Real-time Stock Display:**
  - Item Code
  - Item Name
  - Item Type
  - Category
  - Quantity on Hand (with unit)
  - Low Stock Warning (items < 10 qty highlighted in red)
- **No date filter** (current stock snapshot)

### 4. **Attendance & OT Report**
- **Summary Metrics:**
  - Total Attendance Records
  - Total Regular Hours
  - Total OT Hours
- **Employee Breakdown:**
  - Employee Code
  - Full Name
  - Days Worked
  - Total Hours
  - OT Hours
- **Filters:** Date range with quick buttons

### 5. **Profit & Loss Report**
- **Financial Summary:**
  - Total Income (green)
  - Total Expenses (orange)
  - Net Profit (green if positive, red if negative)
  - Profit Margin Percentage
- **Filters:** Date range with quick buttons

## UI Components

### Date Filters
Each report (except Stock) includes:
- **From Date** picker
- **To Date** picker
- **Quick Filter Buttons:**
  - Today
  - This Week (from Sunday to today)
  - This Month (from 1st to today)
- **Run Report** button to load data
- **Export PDF** button to print/save

### Visual Design
- **Material Design** tabs for report navigation
- **Summary Cards** with color-coded metrics:
  - Green for positive/success values
  - Orange for warnings/expenses
  - Blue for informational values
- **Responsive Tables** with proper styling
- **Status Badges** with color coding
- **Loading Spinners** during data fetch

## Technical Implementation

### Frontend Architecture
- **File:** `frontend/src/app/reports/reports.component.ts`
- **Framework:** Angular Standalone Components
- **State Management:** Signals for reactive data
- **HTTP Client:** Direct API calls to backend

### Backend Integration
Reports connect to existing backend endpoints:
- `GET /reports/sales?fromDate={date}&toDate={date}`
- `GET /reports/purchases?fromDate={date}&toDate={date}`
- `GET /reports/stock`
- `GET /reports/attendance?fromDate={date}&toDate={date}`
- `GET /reports/profit?fromDate={date}&toDate={date}`

### Security
- All reports require authentication (JWT token)
- RBAC enforced on backend:
  - **Admin:** All reports
  - **Manager:** All reports
  - **User/Labour:** Limited access (configured on backend)

## PDF Export Functionality

### Current Implementation
- Uses browser's native **Print Dialog** (`window.print()`)
- **Print CSS** optimized for clean output:
  - Hides filter sections and buttons
  - Shows only report content
  - Page break management for tables
  - Maintains color coding for status indicators

### How to Export
1. Run the desired report
2. Click **"Export PDF"** button
3. Browser print dialog opens
4. Select **"Save as PDF"** as destination
5. Configure settings (margins, orientation)
6. Save the file

### Print Optimizations
- Removes interactive elements
- Ensures tables don't break mid-row
- Preserves summary cards on same page
- A4 size with 1cm margins

## Usage Instructions

### For Admin/Manager Users

1. **Navigate to Reports:**
   - Click "Reports" in main navigation menu

2. **Select Report Type:**
   - Click on desired tab (Sales, Purchase, Stock, Attendance, Profit)

3. **Set Date Range:**
   - Use date pickers OR
   - Click quick filter button (Today/This Week/This Month)

4. **Run Report:**
   - Click "Run Report" button
   - Wait for data to load

5. **Export:**
   - Click "Export PDF" button
   - In print dialog, select "Save as PDF"
   - Choose location and save

### Default Behavior
- All date-filtered reports default to **This Month** on page load
- Stock report loads automatically (no date filter needed)

## Data Format

### Date Parameters
- Format: `YYYY-MM-DD` (ISO 8601)
- Timezone: Asia/Colombo (handled by backend)
- Example: `2024-01-15`

### Currency Display
- Format: `LKR XXX,XXX.XX`
- Currency symbol: Sri Lankan Rupee (LKR)
- Decimal places: 2

### Number Formatting
- Hours: 1 decimal place (e.g., `8.5 hrs`)
- Percentages: 1 decimal place (e.g., `15.5%`)
- Quantities: Whole numbers with unit

## Responsive Design

### Desktop View
- Grid layout for summary cards
- Full-width tables
- Side-by-side date pickers

### Tablet/Mobile
- Stacked summary cards
- Horizontal scrolling for tables
- Vertical date picker layout

## Known Limitations

1. **PDF Export:** Uses browser print (no advanced PDF library integrated)
2. **Charts:** No visual charts/graphs yet (only tables and summary cards)
3. **Email:** No direct email functionality
4. **Scheduling:** No automated report scheduling
5. **Excel Export:** Not implemented (only PDF via print)

## Future Enhancements

### Potential Additions
- [ ] Chart.js/D3 visualizations
- [ ] Excel/CSV export
- [ ] Email report directly
- [ ] Scheduled reports (daily/weekly/monthly email)
- [ ] Custom date ranges (financial year, etc.)
- [ ] Report templates/saved filters
- [ ] Drill-down capabilities
- [ ] Comparison views (YoY, MoM)

## Testing Checklist

- [x] Sales report loads with date filter
- [x] Purchase report loads with date filter
- [x] Stock report loads without filter
- [x] Attendance report calculates totals correctly
- [x] Profit report shows correct calculations
- [x] Date quick buttons set correct ranges
- [x] Export PDF opens print dialog
- [x] Print styles hide filters/buttons
- [x] Status badges display correct colors
- [x] Low stock items highlighted
- [x] Loading spinners show during fetch
- [x] Error handling for failed requests
- [x] Empty state when no data
- [x] Responsive on mobile devices

## Backend Reference

### Reports Service Methods
All implemented in `backend/src/reports/reports.service.ts`:
- `getSalesReport(fromDate, toDate)` - Sales invoices with payment status
- `getPurchasesReport(fromDate, toDate)` - Purchase invoices by supplier
- `getStockReport()` - Current inventory balances
- `getAttendanceReport(fromDate, toDate)` - Employee hours and OT
- `getProfitReport(fromDate, toDate)` - Income vs expenses calculation

### Reports Controller
All endpoints in `backend/src/reports/reports.controller.ts`:
- Protected with `@UseGuards(JwtAuthGuard, RolesGuard)`
- Decorated with `@Roles('Admin', 'Manager')`
- Query parameters: `fromDate`, `toDate`

## Color Scheme

### Status Indicators
- **Green (#4caf50):** Paid, Profit, Success
- **Orange (#ff9800):** Unpaid, Warning, Expenses
- **Blue (#2196f3):** Partial, Information
- **Red (#f44336):** Low Stock, Loss

### Summary Cards
- Background: White with subtle shadow
- Label: Gray (#666) uppercase
- Value: Large bold number with status color

## Accessibility

- **Keyboard Navigation:** Tab through all controls
- **Screen Readers:** Proper semantic HTML
- **Color Contrast:** WCAG AA compliant
- **Focus Indicators:** Visible focus states

## Maintenance Notes

### Adding New Reports
1. Add new tab in template
2. Create filter signal
3. Create data signal
4. Add loading signal
5. Implement load method
6. Add to exportToPDF switch
7. Style in component styles

### Updating Data Structure
- Update type interfaces if backend changes
- Adjust table columns array
- Modify template bindings
- Test with real data

## Support

For issues or questions:
- Check browser console for errors
- Verify backend API is running
- Ensure user has proper role permissions
- Test with different date ranges
- Clear browser cache if stale data

---

**Implementation Date:** December 2024  
**Framework:** Angular 17+ (Standalone)  
**Backend:** NestJS with Prisma  
**Database:** PostgreSQL
