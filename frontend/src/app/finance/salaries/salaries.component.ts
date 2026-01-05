import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

interface SalaryRecord {
    salaryRecordId: string;
    userId: string;
    userCode: string;
    fullName: string;
    totalDays?: number;
    totalHours?: number;
    baseSalary: number;
    otHours: number;
    otRate?: number;
    otAmount: number;
    allowances: number;
    deductions: number;
    totalPay: number;
    totalPaid?: number;
    balance?: number;
    status: string;
}

interface SalaryPeriod {
    periodId: string;
    year: number;
    month: number;
    startDate: string;
    endDate: string;
    status: string;
}

interface SalarySummary {
    totalEmployees: number;
    totalBaseSalary: number;
    totalOtAmount: number;
    totalPayable: number;
}

@Component({
    selector: 'app-salaries',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Salary Calculation</h1>
      </div>

      <mat-card class="period-card">
        <mat-card-header>
          <mat-card-title>Select Period</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="period-form">
            <mat-form-field appearance="outline">
              <mat-label>Year</mat-label>
              <mat-select [(ngModel)]="selectedYear">
                @for (year of years; track year) {
                  <mat-option [value]="year">{{ year }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Month</mat-label>
              <mat-select [(ngModel)]="selectedMonth">
                @for (month of months; track month.value) {
                  <mat-option [value]="month.value">{{ month.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="loadSalaries()" [disabled]="loading()">
              <mat-icon>search</mat-icon>
              Load Records
            </button>

            <button mat-raised-button color="accent" (click)="calculateSalaries()" [disabled]="processing()">
              <mat-icon>calculate</mat-icon>
              Calculate Salaries
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (summary()) {
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-value">{{ summary()?.totalEmployees }}</div>
              <div class="summary-label">Employees</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-value">{{ formatCurrency(summary()?.totalBaseSalary || 0) }}</div>
              <div class="summary-label">Total Base Salary</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="summary-value">{{ formatCurrency(summary()?.totalOtAmount || 0) }}</div>
              <div class="summary-label">Total OT Amount</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card highlight">
            <mat-card-content>
              <div class="summary-value">{{ formatCurrency(summary()?.totalPayable || 0) }}</div>
              <div class="summary-label">Total Payable</div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <mat-card class="records-card">
        <mat-card-header>
          <mat-card-title>Salary Records</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (records().length === 0) {
            <div class="empty-state">
              <mat-icon>account_balance_wallet</mat-icon>
              <p>No salary records found. Select a period and click "Calculate Salaries" to generate records.</p>
            </div>
          } @else {
            <table mat-table [dataSource]="records()" class="full-width">
              <ng-container matColumnDef="employee">
                <th mat-header-cell *matHeaderCellDef>Employee</th>
                <td mat-cell *matCellDef="let row">{{ row.userCode }} - {{ row.fullName }}</td>
              </ng-container>
              <ng-container matColumnDef="baseSalary">
                <th mat-header-cell *matHeaderCellDef>Base Salary</th>
                <td mat-cell *matCellDef="let row">{{ formatCurrency(row.baseSalary) }}</td>
              </ng-container>
              <ng-container matColumnDef="otHours">
                <th mat-header-cell *matHeaderCellDef>OT Hours</th>
                <td mat-cell *matCellDef="let row">{{ row.otHours | number:'1.1-1' }}</td>
              </ng-container>
              <ng-container matColumnDef="otAmount">
                <th mat-header-cell *matHeaderCellDef>OT Amount</th>
                <td mat-cell *matCellDef="let row">{{ formatCurrency(row.otAmount) }}</td>
              </ng-container>
              <ng-container matColumnDef="totalPay">
                <th mat-header-cell *matHeaderCellDef>Total Pay</th>
                <td mat-cell *matCellDef="let row" class="total-cell">{{ formatCurrency(row.totalPay) }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="status-badge" [class]="row.status.toLowerCase()">{{ row.status }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .period-card {
      margin-bottom: 24px;
    }

    .period-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      mat-form-field {
        width: 150px;
      }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      text-align: center;

      .summary-value {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1a237e;
      }

      .summary-label {
        color: #666;
        font-size: 0.875rem;
        margin-top: 4px;
      }

      &.highlight {
        background: linear-gradient(135deg, #1a237e, #3f51b5);
        color: white;

        .summary-value, .summary-label {
          color: white;
        }
      }
    }

    .records-card {
      min-height: 300px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
      }
    }

    .full-width {
      width: 100%;
    }

    .total-cell {
      font-weight: 600;
      color: #1a237e;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;

      &.draft {
        background: #fff3e0;
        color: #e65100;
      }

      &.approved {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.paid {
        background: #e3f2fd;
        color: #1565c0;
      }
    }
  `],
})
export class SalariesComponent implements OnInit {
    selectedYear = new Date().getFullYear();
    selectedMonth = new Date().getMonth() + 1;

    years = [2024, 2025, 2026, 2027];
    months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    records = signal<SalaryRecord[]>([]);
    period = signal<SalaryPeriod | null>(null);
    summary = signal<SalarySummary | null>(null);
    loading = signal(false);
    processing = signal(false);

    displayedColumns = ['employee', 'baseSalary', 'otHours', 'otAmount', 'totalPay', 'status'];

    constructor(
        private api: ApiService,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadSalaries();
    }

    loadSalaries() {
        this.loading.set(true);
        this.api.get<any>('attendance/salaries', {
            year: this.selectedYear,
            month: this.selectedMonth
        }).subscribe({
            next: (res) => {
                this.period.set(res.period);
                this.records.set(res.records || []);
                if (res.records && res.records.length > 0) {
                    this.summary.set({
                        totalEmployees: res.records.length,
                        totalBaseSalary: res.records.reduce((s: number, r: any) => s + r.baseSalary, 0),
                        totalOtAmount: res.records.reduce((s: number, r: any) => s + r.otAmount, 0),
                        totalPayable: res.records.reduce((s: number, r: any) => s + r.totalPay, 0),
                    });
                } else {
                    this.summary.set(null);
                }
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.records.set([]);
                this.summary.set(null);
            },
        });
    }

    calculateSalaries() {
        this.processing.set(true);
        this.api.post<any>('attendance/salaries/calculate', {
            year: this.selectedYear,
            month: this.selectedMonth,
        }).subscribe({
            next: (res) => {
                this.snackBar.open(`Calculated salaries for ${res.summary?.totalEmployees || 0} employees`, 'Close', { duration: 3000 });
                this.period.set(res.period);
                this.records.set(res.records || []);
                this.summary.set(res.summary);
                this.processing.set(false);
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Failed to calculate salaries', 'Close', { duration: 5000 });
                this.processing.set(false);
            },
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
    }
}
