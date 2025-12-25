# REPORTS MODULE - VISUAL GUIDE

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Angular)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Reports Component (reports.component.ts)      │  │
│  │                                                         │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐│  │
│  │  │ Sales  │ │Purchase│ │ Stock  │ │Attend. │ │Profit││  │
│  │  │ Report │ │ Report │ │ Report │ │ Report │ │Report││  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └──────┘│  │
│  │                                                         │  │
│  │  Each Tab Contains:                                    │  │
│  │  • Date Pickers (From/To)                              │  │
│  │  • Quick Filter Buttons (Today/Week/Month)             │  │
│  │  • Run Report Button                                   │  │
│  │  • Export PDF Button                                   │  │
│  │  • Summary Cards                                       │  │
│  │  • Data Table                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│                      HTTP Requests                           │
│                   (JWT Token in Headers)                     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Reports Controller (reports.controller.ts)     │  │
│  │                                                         │  │
│  │  @UseGuards(JwtAuthGuard, RolesGuard)                  │  │
│  │  @Roles('Admin', 'Manager')                            │  │
│  │                                                         │  │
│  │  GET /reports/sales?fromDate=&toDate=                  │  │
│  │  GET /reports/purchases?fromDate=&toDate=              │  │
│  │  GET /reports/stock                                    │  │
│  │  GET /reports/attendance?fromDate=&toDate=             │  │
│  │  GET /reports/profit?fromDate=&toDate=                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Reports Service (reports.service.ts)          │  │
│  │                                                         │  │
│  │  • getSalesReport(fromDate, toDate)                    │  │
│  │  • getPurchasesReport(fromDate, toDate)                │  │
│  │  • getStockReport()                                    │  │
│  │  • getAttendanceReport(fromDate, toDate)               │  │
│  │  • getProfitReport(fromDate, toDate)                   │  │
│  │  • getDashboardSummary(fromDate, toDate)               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Prisma Service (Database Access)             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
│                                                              │
│  Tables:                                                     │
│  • SalesInvoice (invoices with payment status)              │
│  • PurchaseInvoice (supplier invoices)                      │
│  • Items (inventory with qtyOnHand)                         │
│  • Attendance (employee hours and OT)                       │
│  • Expense (business expenses)                              │
│  • Customer, Supplier, User, etc.                           │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagram

```
┌──────────────┐
│ User Logs In │
└──────┬───────┘
       │
       ↓
┌────────────────────┐
│ Clicks "Reports"   │
│ in Navigation      │
└──────┬─────────────┘
       │
       ↓
┌────────────────────────────────────────────┐
│  Reports Page Opens (5 Tabs Visible)       │
│  Default: "This Month" filters set         │
└──────┬─────────────────────────────────────┘
       │
       ↓
┌────────────────────────────────────────────┐
│ User Selects Report Type:                  │
│  ○ Sales Report                            │
│  ○ Purchase Report                         │
│  ○ Inventory Stock                         │
│  ○ Attendance & OT                         │
│  ○ Profit & Loss                           │
└──────┬─────────────────────────────────────┘
       │
       ↓
┌────────────────────────────────────────────┐
│ User Sets Date Filter (if applicable):     │
│  Option 1: Use Date Pickers               │
│  Option 2: Click Quick Button              │
│    • Today                                 │
│    • This Week                             │
│    • This Month                            │
└──────┬─────────────────────────────────────┘
       │
       ↓
┌────────────────────┐
│ Click "Run Report" │
└──────┬─────────────┘
       │
       ↓
┌──────────────────────┐       ┌─────────────────┐
│ Loading Spinner      │       │ API Call to     │
│ Shows...             │ ←───→ │ Backend         │
└──────┬───────────────┘       └─────────────────┘
       │
       ↓
┌────────────────────────────────────────────┐
│ Report Data Displays:                      │
│  • Summary Cards (metrics)                 │
│  • Data Table (detailed records)           │
└──────┬─────────────────────────────────────┘
       │
       ↓
┌──────────────────────┐
│ User Reviews Data    │
└──────┬───────────────┘
       │
       ↓
┌────────────────────────┐
│ Click "Export PDF"     │
└──────┬─────────────────┘
       │
       ↓
┌────────────────────────────────────────────┐
│ Browser Print Dialog Opens                 │
│  • User selects "Save as PDF"              │
│  • Filters/buttons hidden in print view    │
│  • Clean layout with only data             │
└──────┬─────────────────────────────────────┘
       │
       ↓
┌──────────────────┐
│ PDF Saved        │
│ ✅ Complete!      │
└──────────────────┘
```

---

## Component Structure

```
ReportsComponent
│
├── Sales Report Tab
│   ├── Filter Section
│   │   ├── From Date Picker
│   │   ├── To Date Picker
│   │   ├── Quick Buttons (Today/Week/Month)
│   │   ├── Run Report Button
│   │   └── Export PDF Button
│   │
│   ├── Summary Cards
│   │   ├── Total Sales       (LKR amount)
│   │   ├── Total Paid        (LKR amount, green)
│   │   ├── Outstanding       (LKR amount, orange)
│   │   └── Invoice Count     (number)
│   │
│   └── Data Table
│       ├── Invoice No
│       ├── Date
│       ├── Customer
│       ├── Total
│       └── Status (Paid/Unpaid/Partial badge)
│
├── Purchase Report Tab
│   ├── Filter Section (same as above)
│   ├── Summary Cards
│   │   ├── Total Purchases
│   │   └── Invoice Count
│   └── Data Table
│       ├── Invoice No
│       ├── Date
│       ├── Supplier
│       └── Total
│
├── Inventory Stock Tab
│   ├── Filter Section (Refresh button only)
│   └── Data Table
│       ├── Item Code
│       ├── Item Name
│       ├── Item Type
│       ├── Category
│       └── Qty on Hand (red if < 10)
│
├── Attendance & OT Tab
│   ├── Filter Section (same as Sales)
│   ├── Summary Cards
│   │   ├── Total Records
│   │   ├── Regular Hours
│   │   └── OT Hours (blue)
│   └── Data Table
│       ├── Employee Code
│       ├── Full Name
│       ├── Days Worked
│       ├── Total Hours
│       └── OT Hours
│
└── Profit & Loss Tab
    ├── Filter Section (same as Sales)
    └── Summary Cards (Large)
        ├── Total Income       (green)
        ├── Total Expenses     (orange)
        ├── Net Profit        (green/red)
        └── Profit Margin %   (blue)
```

---

## Data Flow for Sales Report

```
1. User Action
   ↓
   User clicks "This Month" button
   ↓
   
2. Frontend Processing
   ↓
   setThisMonth('sales') called
   ↓
   Calculate: fromDate = 2024-12-01, toDate = 2024-12-25
   ↓
   Update salesFilter signal
   ↓
   
3. User clicks "Run Report"
   ↓
   loadSalesReport() called
   ↓
   salesLoading.set(true)
   ↓
   
4. HTTP Request
   ↓
   GET http://localhost:3000/api/reports/sales?fromDate=2024-12-01&toDate=2024-12-25
   ↓
   JWT token in Authorization header
   ↓
   
5. Backend Processing
   ↓
   ReportsController receives request
   ↓
   JwtAuthGuard validates token ✓
   ↓
   RolesGuard checks user role ✓
   ↓
   ReportsService.getSalesReport(fromDate, toDate)
   ↓
   
6. Database Query
   ↓
   Prisma queries SalesInvoice table
   ↓
   WHERE invoiceDate BETWEEN fromDate AND toDate
   ↓
   JOIN Customer
   ↓
   SUM, GROUP BY, aggregations
   ↓
   
7. Data Transformation
   ↓
   BigInt → String conversion
   ↓
   Date → ISO string
   ↓
   Calculate totals and summaries
   ↓
   Format response object:
   {
     summary: {
       totalSales: 5250000,
       totalPaid: 4800000,
       outstanding: 450000,
       invoiceCount: 42
     },
     invoices: [
       {
         invoiceNo: "INV20241225001",
         date: "2024-12-25",
         customer: "ABC Company",
         total: 125000,
         status: "Paid"
       },
       ...
     ]
   }
   ↓
   
8. Response to Frontend
   ↓
   HTTP 200 OK with JSON data
   ↓
   
9. Frontend Rendering
   ↓
   salesData.set(data)
   ↓
   salesLoading.set(false)
   ↓
   
10. UI Updates
    ↓
    Summary cards populate:
    • Total Sales: LKR 5,250,000.00
    • Total Paid: LKR 4,800,000.00
    • Outstanding: LKR 450,000.00
    • Invoice Count: 42
    ↓
    Data table populates with 42 rows
    ↓
    Status badges color-coded
    ↓
    
11. User sees report! ✅
```

---

## PDF Export Flow

```
1. User clicks "Export PDF"
   ↓
   exportToPDF('sales') called
   ↓
   
2. window.print() executed
   ↓
   
3. Browser applies @media print styles
   ↓
   CSS changes:
   • display: none for filters
   • display: none for buttons
   • display: none for tab headers
   • page-break rules applied
   • color preservation enabled
   ↓
   
4. Print dialog opens
   ↓
   Shows:
   • Page header: "Reports"
   • Summary cards (colored)
   • Data table (clean layout)
   ↓
   
5. User selects "Save as PDF"
   ↓
   Choose destination
   ↓
   
6. PDF generated
   ↓
   Clean, professional format
   ↓
   
7. File saved ✅
   Example: "Sales_Report_December_2024.pdf"
```

---

## Quick Filter Logic

```
TODAY Button:
┌────────────────────┐
│ const today = new  │
│ Date()             │
│ fromDate = today   │  → 2024-12-25 00:00:00
│ toDate = today     │  → 2024-12-25 23:59:59
└────────────────────┘

THIS WEEK Button:
┌────────────────────┐
│ const today = new  │
│ Date()             │
│ const dayOfWeek =  │
│ today.getDay()     │  → 3 (Wednesday)
│ fromDate = today - │
│ dayOfWeek          │  → 2024-12-22 (Sunday)
│ toDate = today     │  → 2024-12-25 (Today)
└────────────────────┘

THIS MONTH Button:
┌────────────────────┐
│ const today = new  │
│ Date()             │
│ const year = today │
│ .getFullYear()     │  → 2024
│ const month = today│
│ .getMonth()        │  → 11 (December)
│ fromDate = new Date│
│ (year, month, 1)   │  → 2024-12-01
│ toDate = today     │  → 2024-12-25
└────────────────────┘
```

---

## Color Coding System

```
STATUS COLORS:
┌──────────────────────────────────────┐
│ Paid      → Green (#4caf50)          │
│ Unpaid    → Orange (#ff9800)         │
│ Partial   → Blue (#2196f3)           │
│ Low Stock → Red (#f44336)            │
│ Profit    → Green (#4caf50)          │
│ Loss      → Red (#f44336)            │
│ Expenses  → Orange (#ff9800)         │
│ Info      → Blue (#2196f3)           │
└──────────────────────────────────────┘

VISUAL INDICATORS:
┌──────────────────────────────────────┐
│ ✅ Positive/Good     → Green         │
│ ⚠️  Warning/Attention → Orange        │
│ ℹ️  Information       → Blue          │
│ ❌ Negative/Alert    → Red           │
└──────────────────────────────────────┘
```

---

## State Management

```
Sales Report State:
┌────────────────────────────────────┐
│ salesFilter = signal({             │
│   fromDate: '2024-12-01',          │
│   toDate: '2024-12-25'             │
│ })                                 │
│                                    │
│ salesData = signal({               │
│   summary: {...},                  │
│   invoices: [...]                  │
│ })                                 │
│                                    │
│ salesLoading = signal(false)       │
└────────────────────────────────────┘
         ↕ (Reactive Updates)
┌────────────────────────────────────┐
│ Template automatically updates     │
│ when signals change                │
│                                    │
│ @if (salesLoading()) {             │
│   <spinner>                        │
│ } @else if (salesData()) {         │
│   <data-table>                     │
│ }                                  │
└────────────────────────────────────┘
```

---

## Error Handling

```
API Call Error Flow:
┌────────────────────────┐
│ User clicks "Run       │
│ Report"                │
└───────┬────────────────┘
        │
        ↓
┌────────────────────────┐
│ HTTP GET request       │
└───────┬────────────────┘
        │
        ↓
    ┌───┴────┐
    │ Error? │
    └───┬────┘
        │
    ┌───┴────────────────────┐
    │                        │
    YES                     NO
    │                        │
    ↓                        ↓
┌─────────────┐      ┌─────────────┐
│ .error()    │      │ .next()     │
│ callback    │      │ callback    │
└─────┬───────┘      └─────┬───────┘
      │                    │
      ↓                    ↓
┌──────────────┐    ┌──────────────┐
│ Console.error│    │ Set data     │
│ Log error    │    │ signal       │
└─────┬────────┘    └─────┬────────┘
      │                   │
      ↓                   ↓
┌──────────────┐    ┌──────────────┐
│ Set loading  │    │ Set loading  │
│ = false      │    │ = false      │
└─────┬────────┘    └─────┬────────┘
      │                   │
      └────────┬──────────┘
               │
               ↓
      ┌────────────────┐
      │ UI Updates     │
      └────────────────┘
```

---

## Responsive Breakpoints

```
DESKTOP (> 1024px):
┌─────────────────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Card │ │Card │ │Card │ │Card │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
│ ┌───────────────────────────────┐  │
│ │     Wide Data Table           │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘

TABLET (768px - 1024px):
┌─────────────────────────────────────┐
│ ┌─────┐ ┌─────┐                     │
│ │Card │ │Card │                     │
│ └─────┘ └─────┘                     │
│ ┌─────┐ ┌─────┐                     │
│ │Card │ │Card │                     │
│ └─────┘ └─────┘                     │
│ ┌───────────────────────────────┐  │
│ │   Data Table (scroll horiz)   │→ │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘

MOBILE (< 768px):
┌─────────────────┐
│ ┌─────────────┐ │
│ │   Card 1    │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Card 2    │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Card 3    │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Card 4    │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Table     │→│
│ │  (scroll)   │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## Performance Considerations

```
OPTIMIZATION STRATEGIES:

1. Lazy Loading:
   Reports component loaded only when route accessed
   
2. On-Demand Data:
   Data fetched only when "Run Report" clicked
   No auto-loading (prevents unnecessary API calls)
   
3. Date Validation:
   Client-side validation before API call
   Prevents invalid requests
   
4. Loading States:
   Spinner shows during data fetch
   Prevents multiple simultaneous requests
   Button disabled while loading
   
5. Signals (Angular):
   Fine-grained reactivity
   Only affected parts of UI update
   No full component re-render
   
6. Material Virtual Scroll (Future):
   For very large datasets
   Render only visible rows
   
7. Backend Pagination (Future):
   Limit rows per request
   Load more on scroll/click
```

---

## Security Flow

```
REQUEST SECURITY:

1. User Request
   ↓
2. JWT Token (from login)
   stored in localStorage
   ↓
3. HTTP Interceptor
   adds token to headers:
   Authorization: Bearer <token>
   ↓
4. Backend receives request
   ↓
5. JwtAuthGuard
   ├─ Validates token signature
   ├─ Checks expiration
   └─ Extracts user info
   ↓
6. RolesGuard
   ├─ Checks user role
   ├─ Admin? ✓ Allow
   ├─ Manager? ✓ Allow
   └─ User? ✗ Deny
   ↓
7. If authorized:
   ├─ Execute query
   └─ Return data
   
8. If unauthorized:
   ├─ Return 403 Forbidden
   └─ Frontend shows error

ROLE MATRIX:
┌─────────┬───────┬─────────┬──────┐
│ Report  │ Admin │ Manager │ User │
├─────────┼───────┼─────────┼──────┤
│ Sales   │   ✓   │    ✓    │  ✗   │
│ Purchase│   ✓   │    ✓    │  ✗   │
│ Stock   │   ✓   │    ✓    │  ✗   │
│ Attend. │   ✓   │    ✓    │  ✗*  │
│ Profit  │   ✓   │    ✓    │  ✗   │
└─────────┴───────┴─────────┴──────┘
* User may see own attendance only
```

---

This visual guide provides a comprehensive overview of how the reports module works from architecture to user flow!
