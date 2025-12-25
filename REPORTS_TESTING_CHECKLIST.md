# REPORTS MODULE - TESTING CHECKLIST

## Pre-Testing Setup

### Backend Setup
- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies (if needed): `npm install`
- [ ] Start backend server: `npm run start:dev`
- [ ] Verify backend is running: `http://localhost:3000/api`
- [ ] Check database connection is active
- [ ] Ensure PostgreSQL is running

### Frontend Setup
- [ ] Navigate to frontend directory: `cd frontend`
- [ ] Install dependencies (if needed): `npm install`
- [ ] Start frontend server: `npm start`
- [ ] Verify frontend loads: `http://localhost:4200`
- [ ] Open browser DevTools Console

### User Authentication
- [ ] Login as Admin user
- [ ] Verify JWT token is stored
- [ ] Check user role permissions

---

## Functional Testing

### Navigation
- [ ] Click "Reports" in main navigation menu
- [ ] Reports page loads successfully
- [ ] All 5 tabs visible: Sales, Purchase, Stock, Attendance, Profit
- [ ] Default tab (Sales) is active
- [ ] No console errors on page load

---

## Sales Report Testing

### Initial State
- [ ] Sales Report tab is accessible
- [ ] Date pickers show "This Month" by default
- [ ] From Date = 1st of current month
- [ ] To Date = Today's date
- [ ] "Run Report" button is visible and enabled
- [ ] "Export PDF" button is disabled (no data yet)
- [ ] No data table visible (no report run yet)

### Date Filter - Manual Entry
- [ ] Click From Date picker
- [ ] Calendar opens
- [ ] Select a date (e.g., Dec 1, 2024)
- [ ] Date updates in field
- [ ] Click To Date picker
- [ ] Select a date (e.g., Dec 25, 2024)
- [ ] Date updates in field
- [ ] Verify From Date < To Date

### Date Filter - Quick Buttons
- [ ] Click "Today" button
- [ ] From Date = Today
- [ ] To Date = Today
- [ ] Click "This Week" button
- [ ] From Date = Last Sunday
- [ ] To Date = Today
- [ ] Click "This Month" button
- [ ] From Date = 1st of month
- [ ] To Date = Today

### Running Report
- [ ] Click "Run Report" button
- [ ] Loading spinner appears
- [ ] Button shows loading state
- [ ] API call visible in Network tab: `GET /api/reports/sales?fromDate=...&toDate=...`
- [ ] Request has Authorization header with JWT token
- [ ] Response status: 200 OK
- [ ] Response body has `summary` and `invoices` properties

### Data Display - Summary Cards
- [ ] 4 summary cards appear
- [ ] Card 1: "Total Sales" with LKR amount
- [ ] Card 2: "Total Paid" with LKR amount (green)
- [ ] Card 3: "Outstanding" with LKR amount (orange)
- [ ] Card 4: "Invoice Count" with number
- [ ] All amounts formatted correctly (LKR X,XXX.XX)
- [ ] Colors are correct (green for paid, orange for outstanding)

### Data Display - Table
- [ ] Data table appears below summary cards
- [ ] Table has 5 columns: Invoice No, Date, Customer, Total, Status
- [ ] All rows populated with data
- [ ] Invoice numbers displayed correctly
- [ ] Dates formatted properly (MMM DD, YYYY)
- [ ] Customer names visible
- [ ] Totals formatted as currency
- [ ] Status badges display with correct colors:
  - [ ] "Paid" = Green badge
  - [ ] "Unpaid" = Orange badge
  - [ ] "Partial" = Blue badge

### Export to PDF
- [ ] "Export PDF" button now enabled (has data)
- [ ] Click "Export PDF"
- [ ] Browser print dialog opens
- [ ] Print preview shows:
  - [ ] Page header "Reports"
  - [ ] Summary cards (no filters/buttons)
  - [ ] Data table
  - [ ] Clean layout
  - [ ] Status colors preserved
- [ ] Select "Save as PDF" destination
- [ ] Choose file location
- [ ] Click Save
- [ ] PDF file created successfully
- [ ] Open PDF and verify:
  - [ ] No filter section
  - [ ] No buttons
  - [ ] Only report content
  - [ ] Readable text
  - [ ] Proper formatting

### Error Handling
- [ ] Set invalid date range (To Date < From Date)
- [ ] Click "Run Report"
- [ ] Alert message: "Please select date range"
- [ ] No API call made
- [ ] Disconnect internet/backend
- [ ] Try to run report
- [ ] Error logged in console
- [ ] Loading spinner stops
- [ ] User-friendly error message (if implemented)

---

## Purchase Report Testing

### Switch Tab
- [ ] Click "Purchase Report" tab
- [ ] Tab switches successfully
- [ ] Filter section visible
- [ ] Default dates set to "This Month"

### Quick Filters
- [ ] Click "Today"
- [ ] Dates update correctly
- [ ] Click "This Week"
- [ ] Dates update correctly
- [ ] Click "This Month"
- [ ] Dates update correctly

### Run Report
- [ ] Click "Run Report"
- [ ] Loading spinner appears
- [ ] API call: `GET /api/reports/purchases?fromDate=...&toDate=...`
- [ ] Response status: 200 OK

### Summary Cards
- [ ] 2 summary cards appear
- [ ] Card 1: "Total Purchases" with amount
- [ ] Card 2: "Invoice Count" with number
- [ ] Amounts formatted correctly

### Data Table
- [ ] Table has 4 columns: Invoice No, Date, Supplier, Total
- [ ] All data populated
- [ ] Invoice numbers visible
- [ ] Dates formatted
- [ ] Supplier names shown
- [ ] Totals as currency

### Export
- [ ] Click "Export PDF"
- [ ] Print dialog opens
- [ ] PDF preview looks clean
- [ ] Save PDF successfully

---

## Inventory Stock Report Testing

### Switch Tab
- [ ] Click "Inventory Stock" tab
- [ ] Tab switches successfully
- [ ] **No date pickers** (stock is real-time)
- [ ] Only "Refresh" and "Export PDF" buttons

### Load Data
- [ ] Click "Refresh" button
- [ ] Loading spinner appears
- [ ] API call: `GET /api/reports/stock`
- [ ] No query parameters (no dates)
- [ ] Response status: 200 OK

### Data Table
- [ ] Table has 5 columns: Code, Item Name, Type, Category, Qty on Hand
- [ ] All items listed
- [ ] Item codes visible
- [ ] Item names readable
- [ ] Item types shown (Raw Material, Finished Goods, etc.)
- [ ] Categories displayed
- [ ] Quantities with units (e.g., "50 kg")

### Low Stock Warning
- [ ] Items with qty < 10 highlighted in **RED**
- [ ] Red text stands out
- [ ] Easy to identify low stock items

### Export
- [ ] Click "Export PDF"
- [ ] Print dialog opens
- [ ] All items visible in preview
- [ ] Low stock items still red in PDF
- [ ] Save successfully

---

## Attendance & OT Report Testing

### Switch Tab
- [ ] Click "Attendance & OT" tab
- [ ] Tab switches successfully
- [ ] Date pickers visible
- [ ] Default to "This Month"

### Quick Filters
- [ ] Test "Today" button
- [ ] Test "This Week" button
- [ ] Test "This Month" button
- [ ] All update dates correctly

### Run Report
- [ ] Click "Run Report"
- [ ] API call: `GET /api/reports/attendance?fromDate=...&toDate=...`
- [ ] Response status: 200 OK

### Summary Cards
- [ ] 3 summary cards appear
- [ ] Card 1: "Total Records" with number
- [ ] Card 2: "Regular Hours" with hours (X.X hrs)
- [ ] Card 3: "OT Hours" with hours (blue)
- [ ] Numbers formatted with 1 decimal place

### Data Table
- [ ] Table has 5 columns: Employee Code, Name, Days Worked, Total Hours, OT Hours
- [ ] All employees listed
- [ ] Employee codes visible
- [ ] Full names shown
- [ ] Days worked as integers
- [ ] Hours with 1 decimal (e.g., 8.5)
- [ ] OT hours with 1 decimal

### Export
- [ ] Click "Export PDF"
- [ ] Print dialog opens
- [ ] Employee data visible
- [ ] Totals shown
- [ ] Save successfully

---

## Profit & Loss Report Testing

### Switch Tab
- [ ] Click "Profit & Loss" tab
- [ ] Tab switches successfully
- [ ] Date pickers visible
- [ ] Default to "This Month"

### Quick Filters
- [ ] Test "Today" button
- [ ] Test "This Week" button
- [ ] Test "This Month" button

### Run Report
- [ ] Click "Run Report"
- [ ] API call: `GET /api/reports/profit?fromDate=...&toDate=...`
- [ ] Response status: 200 OK

### Summary Cards (Large)
- [ ] 4 large summary cards appear
- [ ] Card 1: "Total Income" (green)
- [ ] Card 2: "Total Expenses" (orange)
- [ ] Card 3: "Net Profit" (green if positive, red if negative)
- [ ] Card 4: "Profit Margin" with percentage (blue)
- [ ] All amounts formatted as currency
- [ ] Profit margin as percentage (e.g., "15.5%")

### Color Validation
- [ ] If profit > 0, text is GREEN
- [ ] If profit < 0, text is RED
- [ ] Income always green
- [ ] Expenses always orange

### Export
- [ ] Click "Export PDF"
- [ ] Print dialog opens
- [ ] All 4 cards visible
- [ ] Colors preserved
- [ ] Save successfully

---

## Cross-Tab Testing

### Tab Switching
- [ ] Switch from Sales to Purchase
- [ ] Previous data cleared
- [ ] New filters appear
- [ ] No data until "Run Report" clicked
- [ ] Switch from Purchase to Stock
- [ ] Date filters disappear (stock has no dates)
- [ ] Switch from Stock to Attendance
- [ ] Date filters reappear
- [ ] Switch from Attendance to Profit
- [ ] All working smoothly

### Data Persistence
- [ ] Run Sales report
- [ ] Switch to Purchase tab
- [ ] Switch back to Sales tab
- [ ] Sales data **NOT** still visible (expected behavior)
- [ ] Must click "Run Report" again

---

## Responsive Design Testing

### Desktop (1920x1080)
- [ ] All 4 summary cards in one row
- [ ] Tables full width
- [ ] Date pickers side-by-side
- [ ] Buttons in one row
- [ ] No horizontal scrolling

### Tablet (768x1024)
- [ ] Summary cards wrap to 2 rows (2x2 grid)
- [ ] Tables scroll horizontally if needed
- [ ] Date pickers still side-by-side
- [ ] Buttons may wrap

### Mobile (375x667)
- [ ] Summary cards stack vertically (1 per row)
- [ ] Tables scroll horizontally
- [ ] Date pickers stack vertically
- [ ] Buttons stack or wrap
- [ ] Tabs scrollable if needed
- [ ] Touch-friendly (buttons large enough)

### Test in Different Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if Mac available)
- [ ] Mobile Chrome (responsive mode)
- [ ] Mobile Safari (responsive mode)

---

## Performance Testing

### Load Time
- [ ] Reports page loads < 2 seconds
- [ ] Tab switching instant
- [ ] Date picker opens < 500ms

### API Response Time
- [ ] Sales report loads < 3 seconds
- [ ] Purchase report loads < 3 seconds
- [ ] Stock report loads < 2 seconds
- [ ] Attendance report loads < 3 seconds
- [ ] Profit report loads < 2 seconds

### Large Dataset
- [ ] Run report with 100+ records
- [ ] Table renders without lag
- [ ] Scrolling is smooth
- [ ] Export still works

### Memory
- [ ] Open DevTools Performance tab
- [ ] Run all 5 reports sequentially
- [ ] Check memory usage
- [ ] Should not exceed 200MB
- [ ] No memory leaks (use back/forward)

---

## Security Testing

### Without Login
- [ ] Open `http://localhost:4200/reports` in incognito
- [ ] Should redirect to login page
- [ ] Cannot access reports without auth

### With User Role (Not Admin/Manager)
- [ ] Login as regular User
- [ ] Try to access `/reports`
- [ ] Should see 403 Forbidden OR redirect
- [ ] Backend returns 403 for API calls

### With Manager Role
- [ ] Login as Manager
- [ ] Access all 5 reports
- [ ] All reports load successfully
- [ ] Can export all reports

### With Admin Role
- [ ] Login as Admin
- [ ] Access all 5 reports
- [ ] All reports load successfully
- [ ] Can export all reports

### Token Expiration
- [ ] Run a report successfully
- [ ] Wait for token to expire (or manually delete from localStorage)
- [ ] Try to run another report
- [ ] Should get 401 Unauthorized
- [ ] Should redirect to login

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Press Tab to move between controls
- [ ] Date pickers accessible via keyboard
- [ ] Buttons have focus indicators
- [ ] Can activate buttons with Enter/Space
- [ ] Tab order is logical (top to bottom, left to right)

### Screen Reader (Optional)
- [ ] Turn on screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate to Reports page
- [ ] Tab labels announced
- [ ] Button labels clear
- [ ] Table headers announced
- [ ] Data rows announced

### Color Contrast
- [ ] Check color contrast ratios (use browser extension)
- [ ] Text on background meets WCAG AA (4.5:1)
- [ ] Status badge text readable
- [ ] Low stock red text readable

### Font Size
- [ ] Zoom browser to 150%
- [ ] All text still readable
- [ ] No text overlap
- [ ] Layout adapts

---

## Print/PDF Quality Testing

### Sales Report PDF
- [ ] Headers clear
- [ ] Summary cards visible
- [ ] All table columns fit on page
- [ ] No cut-off text
- [ ] Page breaks appropriate
- [ ] Colors print correctly

### Purchase Report PDF
- [ ] Same checks as Sales

### Stock Report PDF
- [ ] All items visible
- [ ] Low stock items red (or gray if B&W printer)
- [ ] Multi-page if needed
- [ ] Page numbers visible

### Attendance Report PDF
- [ ] Employee table readable
- [ ] Hours with decimals
- [ ] Summary at top

### Profit Report PDF
- [ ] All 4 cards visible
- [ ] Large text readable
- [ ] Colors clear

---

## Edge Cases

### Empty Data
- [ ] Set date range with no transactions
- [ ] Run report
- [ ] Should show "No data found" message
- [ ] Summary cards show 0 values
- [ ] Empty table (no rows)

### Future Dates
- [ ] Set From Date to tomorrow
- [ ] Run report
- [ ] Should show no data or validation error

### Very Long Date Range
- [ ] Set From Date: Jan 1, 2020
- [ ] Set To Date: Dec 31, 2024
- [ ] Run report
- [ ] Should handle large dataset
- [ ] May take longer to load
- [ ] Check for timeout issues

### Special Characters
- [ ] Check if customer/supplier names have special chars (e.g., "O'Brien & Sons")
- [ ] Should display correctly in table
- [ ] Should not break PDF export

### Decimal Precision
- [ ] Check amounts with many decimals
- [ ] Should round to 2 decimal places
- [ ] Check totals add up correctly

---

## Regression Testing

### After Future Changes
- [ ] Run all above tests again
- [ ] Verify no features broken
- [ ] Check console for new errors
- [ ] Test in all browsers again

---

## Bug Tracking Template

If you find a bug, document it:

**Bug ID:** #001  
**Title:** Export PDF button not disabled when no data  
**Steps to Reproduce:**
1. Open Sales Report
2. Don't run report
3. Click Export PDF

**Expected:** Button should be disabled  
**Actual:** Button is enabled, print dialog opens with no data  
**Severity:** Low  
**Priority:** Medium  
**Browser:** Chrome 120  
**Screenshot:** [attach]  
**Console Errors:** [paste]  

---

## Sign-Off Checklist

### Functional Sign-Off
- [ ] All 5 reports load successfully
- [ ] All date filters work
- [ ] All data displays correctly
- [ ] All exports work
- [ ] No critical bugs

### Performance Sign-Off
- [ ] Load times acceptable
- [ ] No lag or freezing
- [ ] Memory usage reasonable

### Security Sign-Off
- [ ] Authentication enforced
- [ ] RBAC working
- [ ] No sensitive data exposed

### Accessibility Sign-Off
- [ ] Keyboard navigation works
- [ ] Color contrast passes
- [ ] Screen reader compatible

### Browser Sign-Off
- [ ] Chrome: ✓
- [ ] Firefox: ✓
- [ ] Edge: ✓
- [ ] Safari: ✓ (if applicable)

---

## Final Approval

**Tester Name:** ___________________  
**Date:** ___________________  
**Signature:** ___________________  

**Status:** 
- [ ] PASS - Ready for production
- [ ] CONDITIONAL PASS - Minor issues, can deploy
- [ ] FAIL - Critical issues, do not deploy

**Comments:**
_______________________________________________
_______________________________________________
_______________________________________________

---

**Testing completed on:** ___________________  
**Environment:** Development / Staging / Production  
**Version:** 1.0
