import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface DateFilter {
  fromDate: string;
  toDate: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Reports</h1>
      </div>

      <mat-tab-group class="reports-tabs">
        <!-- Sales Report -->
        <mat-tab label="Sales Report">
          <div class="tab-content">
            <div class="filter-section">
              <div class="date-filters">
                <mat-form-field appearance="outline">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="salesFromPicker" [(ngModel)]="salesFilter().fromDate">
                  <mat-datepicker-toggle matSuffix [for]="salesFromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #salesFromPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="salesToPicker" [(ngModel)]="salesFilter().toDate">
                  <mat-datepicker-toggle matSuffix [for]="salesToPicker"></mat-datepicker-toggle>
                  <mat-datepicker #salesToPicker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="quick-buttons">
                <button mat-stroked-button (click)="setToday('sales')">Today</button>
                <button mat-stroked-button (click)="setThisWeek('sales')">This Week</button>
                <button mat-stroked-button (click)="setThisMonth('sales')">This Month</button>
                <button mat-raised-button color="primary" (click)="loadSalesReport()">
                  <mat-icon>search</mat-icon> Run Report
                </button>
                <button mat-raised-button color="accent" (click)="exportToPDF('sales')" [disabled]="!salesData()">
                  <mat-icon>picture_as_pdf</mat-icon> Export PDF
                </button>
              </div>
            </div>

            @if (salesLoading()) {
              <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
            } @else if (salesData()) {
              <div class="report-content">
                <div class="summary-cards">
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Total Sales</div>
                      <div class="summary-value">{{ salesData().summary.totalSales | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Total Paid</div>
                      <div class="summary-value success">{{ salesData().summary.totalPaid | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Outstanding</div>
                      <div class="summary-value warn">{{ salesData().summary.outstanding | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Invoice Count</div>
                      <div class="summary-value">{{ salesData().summary.invoiceCount }}</div>
                    </mat-card-content>
                  </mat-card>
                </div>

                <table mat-table [dataSource]="salesData().invoices" class="report-table">
                  <ng-container matColumnDef="invoiceNo">
                    <th mat-header-cell *matHeaderCellDef>Invoice No</th>
                    <td mat-cell *matCellDef="let row">{{ row.invoiceNo }}</td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let row">{{ row.date | date:'mediumDate' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="customer">
                    <th mat-header-cell *matHeaderCellDef>Customer</th>
                    <td mat-cell *matCellDef="let row">{{ row.customer }}</td>
                  </ng-container>
                  <ng-container matColumnDef="total">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let row">{{ row.total | currency:'LKR ':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="status-badge" [class]="row.status">{{ row.status }}</span>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="salesColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: salesColumns;"></tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Purchase Report -->
        <mat-tab label="Purchase Report">
          <div class="tab-content">
            <div class="filter-section">
              <div class="date-filters">
                <mat-form-field appearance="outline">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="purchaseFromPicker" [(ngModel)]="purchaseFilter().fromDate">
                  <mat-datepicker-toggle matSuffix [for]="purchaseFromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #purchaseFromPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="purchaseToPicker" [(ngModel)]="purchaseFilter().toDate">
                  <mat-datepicker-toggle matSuffix [for]="purchaseToPicker"></mat-datepicker-toggle>
                  <mat-datepicker #purchaseToPicker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="quick-buttons">
                <button mat-stroked-button (click)="setToday('purchase')">Today</button>
                <button mat-stroked-button (click)="setThisWeek('purchase')">This Week</button>
                <button mat-stroked-button (click)="setThisMonth('purchase')">This Month</button>
                <button mat-raised-button color="primary" (click)="loadPurchaseReport()">
                  <mat-icon>search</mat-icon> Run Report
                </button>
                <button mat-raised-button color="accent" (click)="exportToPDF('purchase')" [disabled]="!purchaseData()">
                  <mat-icon>picture_as_pdf</mat-icon> Export PDF
                </button>
              </div>
            </div>

            @if (purchaseLoading()) {
              <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
            } @else if (purchaseData()) {
              <div class="report-content">
                <div class="summary-cards">
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Total Purchases</div>
                      <div class="summary-value">{{ purchaseData().summary.totalPurchases | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Invoice Count</div>
                      <div class="summary-value">{{ purchaseData().summary.invoiceCount }}</div>
                    </mat-card-content>
                  </mat-card>
                </div>

                <table mat-table [dataSource]="purchaseData().invoices" class="report-table">
                  <ng-container matColumnDef="invoiceNo">
                    <th mat-header-cell *matHeaderCellDef>Invoice No</th>
                    <td mat-cell *matCellDef="let row">{{ row.invoiceNo }}</td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let row">{{ row.date | date:'mediumDate' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="supplier">
                    <th mat-header-cell *matHeaderCellDef>Supplier</th>
                    <td mat-cell *matCellDef="let row">{{ row.supplier }}</td>
                  </ng-container>
                  <ng-container matColumnDef="total">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let row">{{ row.total | currency:'LKR ':'symbol':'1.2-2' }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="purchaseColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: purchaseColumns;"></tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Stock Report -->
        <mat-tab label="Inventory Stock">
          <div class="tab-content">
            <div class="filter-section">
              <div class="quick-buttons">
                <button mat-raised-button color="primary" (click)="loadStockReport()">
                  <mat-icon>refresh</mat-icon> Refresh
                </button>
                <button mat-raised-button color="accent" (click)="exportToPDF('stock')" [disabled]="!stockData()">
                  <mat-icon>picture_as_pdf</mat-icon> Export PDF
                </button>
              </div>
            </div>

            @if (stockLoading()) {
              <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
            } @else if (stockData()) {
              <table mat-table [dataSource]="stockData()" class="report-table">
                <ng-container matColumnDef="itemCode">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let row">{{ row.itemCode }}</td>
                </ng-container>
                <ng-container matColumnDef="itemName">
                  <th mat-header-cell *matHeaderCellDef>Item Name</th>
                  <td mat-cell *matCellDef="let row">{{ row.itemName }}</td>
                </ng-container>
                <ng-container matColumnDef="itemType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let row">{{ row.itemType }}</td>
                </ng-container>
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let row">{{ row.category || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="qtyOnHand">
                  <th mat-header-cell *matHeaderCellDef>Qty on Hand</th>
                  <td mat-cell *matCellDef="let row" [class.low-stock]="row.qtyOnHand < 10">{{ row.qtyOnHand }} {{ row.unit }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="stockColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: stockColumns;"></tr>
              </table>
            }
          </div>
        </mat-tab>

        <!-- Attendance & OT Report -->
        <mat-tab label="Attendance & OT">
          <div class="tab-content">
            <div class="filter-section">
              <div class="date-filters">
                <mat-form-field appearance="outline">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="attendanceFromPicker" [(ngModel)]="attendanceFilter().fromDate">
                  <mat-datepicker-toggle matSuffix [for]="attendanceFromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #attendanceFromPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="attendanceToPicker" [(ngModel)]="attendanceFilter().toDate">
                  <mat-datepicker-toggle matSuffix [for]="attendanceToPicker"></mat-datepicker-toggle>
                  <mat-datepicker #attendanceToPicker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="quick-buttons">
                <button mat-stroked-button (click)="setToday('attendance')">Today</button>
                <button mat-stroked-button (click)="setThisWeek('attendance')">This Week</button>
                <button mat-stroked-button (click)="setThisMonth('attendance')">This Month</button>
                <button mat-raised-button color="primary" (click)="loadAttendanceReport()">
                  <mat-icon>search</mat-icon> Run Report
                </button>
                <button mat-raised-button color="accent" (click)="exportToPDF('attendance')" [disabled]="!attendanceData()">
                  <mat-icon>picture_as_pdf</mat-icon> Export PDF
                </button>
              </div>
            </div>

            @if (attendanceLoading()) {
              <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
            } @else if (attendanceData()) {
              <div class="report-content">
                <div class="summary-cards">
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Total Records</div>
                      <div class="summary-value">{{ attendanceData().summary.totalRecords }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">Regular Hours</div>
                      <div class="summary-value">{{ attendanceData().summary.totalRegularHours | number:'1.1-1' }} hrs</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card">
                    <mat-card-content>
                      <div class="summary-label">OT Hours</div>
                      <div class="summary-value accent">{{ attendanceData().summary.totalOtHours | number:'1.1-1' }} hrs</div>
                    </mat-card-content>
                  </mat-card>
                </div>

                <table mat-table [dataSource]="attendanceData().byEmployee" class="report-table">
                  <ng-container matColumnDef="userCode">
                    <th mat-header-cell *matHeaderCellDef>Employee Code</th>
                    <td mat-cell *matCellDef="let row">{{ row.userCode }}</td>
                  </ng-container>
                  <ng-container matColumnDef="fullName">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let row">{{ row.fullName }}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalDays">
                    <th mat-header-cell *matHeaderCellDef>Days Worked</th>
                    <td mat-cell *matCellDef="let row">{{ row.totalDays }}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalHours">
                    <th mat-header-cell *matHeaderCellDef>Total Hours</th>
                    <td mat-cell *matCellDef="let row">{{ row.totalHours | number:'1.1-1' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalOtHours">
                    <th mat-header-cell *matHeaderCellDef>OT Hours</th>
                    <td mat-cell *matCellDef="let row">{{ row.totalOtHours | number:'1.1-1' }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="attendanceColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: attendanceColumns;"></tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Profit Report -->
        <mat-tab label="Profit & Loss">
          <div class="tab-content">
            <div class="filter-section">
              <div class="date-filters">
                <mat-form-field appearance="outline">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="profitFromPicker" [(ngModel)]="profitFilter().fromDate">
                  <mat-datepicker-toggle matSuffix [for]="profitFromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #profitFromPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="profitToPicker" [(ngModel)]="profitFilter().toDate">
                  <mat-datepicker-toggle matSuffix [for]="profitToPicker"></mat-datepicker-toggle>
                  <mat-datepicker #profitToPicker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="quick-buttons">
                <button mat-stroked-button (click)="setToday('profit')">Today</button>
                <button mat-stroked-button (click)="setThisWeek('profit')">This Week</button>
                <button mat-stroked-button (click)="setThisMonth('profit')">This Month</button>
                <button mat-raised-button color="primary" (click)="loadProfitReport()">
                  <mat-icon>search</mat-icon> Run Report
                </button>
                <button mat-raised-button color="accent" (click)="exportToPDF('profit')" [disabled]="!profitData()">
                  <mat-icon>picture_as_pdf</mat-icon> Export PDF
                </button>
              </div>
            </div>

            @if (profitLoading()) {
              <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
            } @else if (profitData()) {
              <div class="report-content">
                <div class="profit-summary">
                  <mat-card class="summary-card large">
                    <mat-card-content>
                      <div class="summary-label">Total Income</div>
                      <div class="summary-value success">{{ profitData().totalIncome | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card large">
                    <mat-card-content>
                      <div class="summary-label">Total Expenses</div>
                      <div class="summary-value warn">{{ profitData().totalExpenses | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card large">
                    <mat-card-content>
                      <div class="summary-label">Net Profit</div>
                      <div class="summary-value" [class.success]="profitData().profit > 0" [class.warn]="profitData().profit < 0">
                        {{ profitData().profit | currency:'LKR ':'symbol':'1.2-2' }}
                      </div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card class="summary-card large">
                    <mat-card-content>
                      <div class="summary-label">Profit Margin</div>
                      <div class="summary-value accent">{{ profitData().profitMargin }}%</div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    .page-header {
      margin-bottom: 20px;
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
    }
    .reports-tabs {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding: 20px 0;
      }
    }
    .tab-content {
      min-height: 400px;
    }
    .filter-section {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .date-filters {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      mat-form-field {
        flex: 1;
        max-width: 250px;
      }
    }
    .quick-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      button {
        mat-icon {
          margin-right: 4px;
        }
      }
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px 20px;
    }
    .report-content {
      margin-top: 20px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      mat-card-content {
        padding: 16px !important;
      }
      .summary-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .summary-value {
        font-size: 24px;
        font-weight: 600;
        &.success { color: #4caf50; }
        &.warn { color: #ff9800; }
        &.accent { color: #2196f3; }
      }
      &.large .summary-value {
        font-size: 28px;
      }
    }
    .profit-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .report-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      th {
        background: #f5f5f5;
        font-weight: 600;
        padding: 12px 16px !important;
      }
      td {
        padding: 12px 16px !important;
      }
      .low-stock {
        color: #f44336;
        font-weight: 600;
      }
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      &.Paid {
        background: #e8f5e9;
        color: #2e7d32;
      }
      &.Unpaid {
        background: #fff3e0;
        color: #e65100;
      }
      &.Partial {
        background: #e3f2fd;
        color: #1565c0;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Sales Report
  salesFilter = signal<DateFilter>({ fromDate: '', toDate: '' });
  salesData = signal<any>(null);
  salesLoading = signal(false);
  salesColumns = ['invoiceNo', 'date', 'customer', 'total', 'status'];

  // Purchase Report
  purchaseFilter = signal<DateFilter>({ fromDate: '', toDate: '' });
  purchaseData = signal<any>(null);
  purchaseLoading = signal(false);
  purchaseColumns = ['invoiceNo', 'date', 'supplier', 'total'];

  // Stock Report
  stockData = signal<any[]>([]);
  stockLoading = signal(false);
  stockColumns = ['itemCode', 'itemName', 'itemType', 'category', 'qtyOnHand'];

  // Attendance Report
  attendanceFilter = signal<DateFilter>({ fromDate: '', toDate: '' });
  attendanceData = signal<any>(null);
  attendanceLoading = signal(false);
  attendanceColumns = ['userCode', 'fullName', 'totalDays', 'totalHours', 'totalOtHours'];

  // Profit Report
  profitFilter = signal<DateFilter>({ fromDate: '', toDate: '' });
  profitData = signal<any>(null);
  profitLoading = signal(false);

  ngOnInit() {
    // Set default filters to this month
    this.setThisMonth('sales');
    this.setThisMonth('purchase');
    this.setThisMonth('attendance');
    this.setThisMonth('profit');
  }

  // Date Filter Helpers
  setToday(reportType: string) {
    const today = new Date();
    const filter = { fromDate: today, toDate: today };
    this.updateFilter(reportType, filter);
  }

  setThisWeek(reportType: string) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const filter = { fromDate: startOfWeek, toDate: today };
    this.updateFilter(reportType, filter);
  }

  setThisMonth(reportType: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const filter = { fromDate: startOfMonth, toDate: today };
    this.updateFilter(reportType, filter);
  }

  private updateFilter(reportType: string, filter: any) {
    switch (reportType) {
      case 'sales':
        this.salesFilter.set(filter);
        break;
      case 'purchase':
        this.purchaseFilter.set(filter);
        break;
      case 'attendance':
        this.attendanceFilter.set(filter);
        break;
      case 'profit':
        this.profitFilter.set(filter);
        break;
    }
  }

  private formatDateParam(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Load Reports
  loadSalesReport() {
    const fromDate = this.formatDateParam(this.salesFilter().fromDate);
    const toDate = this.formatDateParam(this.salesFilter().toDate);
    
    if (!fromDate || !toDate) {
      alert('Please select date range');
      return;
    }

    this.salesLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/reports/sales`, {
      params: { fromDate, toDate }
    }).subscribe({
      next: (data) => {
        this.salesData.set(data);
        this.salesLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading sales report:', err);
        this.salesLoading.set(false);
      }
    });
  }

  loadPurchaseReport() {
    const fromDate = this.formatDateParam(this.purchaseFilter().fromDate);
    const toDate = this.formatDateParam(this.purchaseFilter().toDate);
    
    if (!fromDate || !toDate) {
      alert('Please select date range');
      return;
    }

    this.purchaseLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/reports/purchases`, {
      params: { fromDate, toDate }
    }).subscribe({
      next: (data) => {
        this.purchaseData.set(data);
        this.purchaseLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading purchase report:', err);
        this.purchaseLoading.set(false);
      }
    });
  }

  loadStockReport() {
    this.stockLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/reports/stock`).subscribe({
      next: (data) => {
        this.stockData.set(data);
        this.stockLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading stock report:', err);
        this.stockLoading.set(false);
      }
    });
  }

  loadAttendanceReport() {
    const fromDate = this.formatDateParam(this.attendanceFilter().fromDate);
    const toDate = this.formatDateParam(this.attendanceFilter().toDate);
    
    if (!fromDate || !toDate) {
      alert('Please select date range');
      return;
    }

    this.attendanceLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/reports/attendance`, {
      params: { fromDate, toDate }
    }).subscribe({
      next: (data) => {
        this.attendanceData.set(data);
        this.attendanceLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading attendance report:', err);
        this.attendanceLoading.set(false);
      }
    });
  }

  loadProfitReport() {
    const fromDate = this.formatDateParam(this.profitFilter().fromDate);
    const toDate = this.formatDateParam(this.profitFilter().toDate);
    
    if (!fromDate || !toDate) {
      alert('Please select date range');
      return;
    }

    this.profitLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/reports/profit`, {
      params: { fromDate, toDate }
    }).subscribe({
      next: (data) => {
        this.profitData.set(data);
        this.profitLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading profit report:', err);
        this.profitLoading.set(false);
      }
    });
  }

  // Export to PDF
  exportToPDF(reportType: string) {
    window.print();
  }
}

// Add inject function
import { inject } from '@angular/core';
