import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ExpenseService } from '../services/expense.service';
import { ExpenseFormDialogComponent } from './expense-form-dialog.component';

@Component({
    selector: 'app-expenses-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDialogModule,
        MatChipsModule
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1><mat-icon>payments</mat-icon> Expenses</h1>
        <button mat-raised-button color="primary" (click)="openExpenseDialog()">
          <mat-icon>add</mat-icon> New Expense
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search Category</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Category name...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>From Date</mat-label>
              <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate" (ngModelChange)="loadExpenses()">
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To Date</mat-label>
              <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate" (ngModelChange)="loadExpenses()">
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button (click)="setThisMonth()">This Month</button>
            <button mat-raised-button color="primary" (click)="clearFilters()">
              <mat-icon>clear</mat-icon> Clear
            </button>
          </div>

          @if (loading()) {
            <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          } @else {
            <div class="summary-cards">
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-label">Total Expenses</div>
                  <div class="summary-value expense">LKR {{ totalAmount().toFixed(2) }}</div>
                </mat-card-content>
              </mat-card>
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-label">Number of Expenses</div>
                  <div class="summary-value">{{ expenses().length }}</div>
                </mat-card-content>
              </mat-card>
            </div>

            <table mat-table [dataSource]="expenses()" class="expense-table">
              <ng-container matColumnDef="expenseNo">
                <th mat-header-cell *matHeaderCellDef>Expense No</th>
                <td mat-cell *matCellDef="let expense">
                  <strong>{{ expense.expenseNo }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let expense">
                  {{ expense.expenseDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let expense">
                  <strong>{{ expense.category }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let expense">
                  {{ expense.description || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="paidTo">
                <th mat-header-cell *matHeaderCellDef>Paid To</th>
                <td mat-cell *matCellDef="let expense">
                  {{ expense.paidTo || expense.supplier?.supplierName || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="method">
                <th mat-header-cell *matHeaderCellDef>Method</th>
                <td mat-cell *matCellDef="let expense">
                  <mat-chip [class]="'chip-' + expense.method.toLowerCase()">
                    {{ expense.method }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                <td mat-cell *matCellDef="let expense" class="text-right">
                  <strong class="amount">LKR {{ expense.amount.toFixed(2) }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let expense">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="editExpense(expense)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="viewExpense(expense)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="expense-row"></tr>
            </table>

            <mat-paginator
              [length]="totalItems()"
              [pageSize]="pageSize()"
              [pageIndex]="currentPage() - 1"
              [pageSizeOptions]="[10, 25, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
      h1 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }
    }
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      mat-form-field {
        flex: 1;
        min-width: 200px;
      }
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
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
        &.expense { color: #f44336; }
      }
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    .expense-table {
      width: 100%;
      .text-right {
        text-align: right;
      }
      .expense-row {
        cursor: pointer;
        &:hover {
          background-color: #f5f5f5;
        }
      }
      .amount {
        color: #f44336;
        font-size: 16px;
      }
    }
    .chip-cash {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    .chip-bank {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }
    .chip-card {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }
    .chip-upi {
      background-color: #f3e5f5 !important;
      color: #7b1fa2 !important;
    }
  `],
})
export class ExpensesListComponent implements OnInit {
    expenses = signal<any[]>([]);
    loading = signal(false);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);
    totalAmount = signal(0);

    searchTerm = '';
    fromDate: Date | null = null;
    toDate: Date | null = null;

    displayedColumns = ['expenseNo', 'date', 'category', 'description', 'paidTo', 'method', 'amount', 'actions'];

    constructor(
        private expenseService: ExpenseService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.setThisMonth();
        this.loadExpenses();
    }

    loadExpenses() {
        this.loading.set(true);
        const params: any = {
            page: this.currentPage(),
            limit: this.pageSize(),
        };

        if (this.searchTerm) params.category = this.searchTerm;
        if (this.fromDate) params.fromDate = this.formatDate(this.fromDate);
        if (this.toDate) params.toDate = this.formatDate(this.toDate);

        this.expenseService.getExpenses(params).subscribe({
            next: (response) => {
                this.expenses.set(response.data);
                this.totalItems.set(response.meta.total);
                this.totalAmount.set(response.data.reduce((sum: number, e: any) => sum + e.amount, 0));
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading expenses:', err);
                this.loading.set(false);
            }
        });
    }

    openExpenseDialog() {
        const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
            width: '600px',
            data: null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadExpenses();
            }
        });
    }

    editExpense(expense: any) {
        const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
            width: '600px',
            data: expense
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadExpenses();
            }
        });
    }

    viewExpense(expense: any) {
        this.snackBar.open(`Viewing expense ${expense.expenseNo}`, 'Close', { duration: 3000 });
    }

    setThisMonth() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.fromDate = startOfMonth;
        this.toDate = today;
    }

    clearFilters() {
        this.searchTerm = '';
        this.fromDate = null;
        this.toDate = null;
        this.loadExpenses();
    }

    onSearch() {
        this.currentPage.set(1);
        this.loadExpenses();
    }

    onPageChange(event: PageEvent) {
        this.currentPage.set(event.pageIndex + 1);
        this.pageSize.set(event.pageSize);
        this.loadExpenses();
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
