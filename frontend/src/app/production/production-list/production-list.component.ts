import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductionService } from '../services/production.service';
import { ProductionFormDialogComponent } from '../production-form-dialog/production-form-dialog.component';

@Component({
    selector: 'app-production-list',
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
        MatChipsModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1><mat-icon>factory</mat-icon> Daily Production</h1>
        <button mat-raised-button color="primary" (click)="openProductionDialog()">
          <mat-icon>add</mat-icon> New Production Entry
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Product name...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>From Date</mat-label>
              <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate" (ngModelChange)="loadProduction()">
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To Date</mat-label>
              <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate" (ngModelChange)="loadProduction()">
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button (click)="setToday()">Today</button>
            <button mat-raised-button (click)="setThisWeek()">This Week</button>
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
                  <div class="summary-label">Total Days</div>
                  <div class="summary-value">{{ productionDays().length }}</div>
                </mat-card-content>
              </mat-card>
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-label">Closed Days</div>
                  <div class="summary-value success">{{ closedDaysCount() }}</div>
                </mat-card-content>
              </mat-card>
              <mat-card class="summary-card">
                <mat-card-content>
                  <div class="summary-label">Open Days</div>
                  <div class="summary-value warn">{{ openDaysCount() }}</div>
                </mat-card-content>
              </mat-card>
            </div>

            <table mat-table [dataSource]="productionDays()" class="production-table">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Production Date</th>
                <td mat-cell *matCellDef="let day">
                  {{ day.productionDate | date:'fullDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let day">
                  {{ day.finishedProduct?.itemName || 'N/A' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef class="text-right">Quantity</th>
                <td mat-cell *matCellDef="let day" class="text-right">
                  <strong>{{ day.quantity }}</strong> {{ day.finishedProduct?.unit?.unitName }}
                </td>
              </ng-container>

              <ng-container matColumnDef="scrap">
                <th mat-header-cell *matHeaderCellDef class="text-right">Scrap</th>
                <td mat-cell *matCellDef="let day" class="text-right">
                  @if (day.scrapQuantity > 0) {
                    <span class="scrap-qty">{{ day.scrapQuantity }}</span>
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="recordedBy">
                <th mat-header-cell *matHeaderCellDef>Recorded By</th>
                <td mat-cell *matCellDef="let day">
                  {{ day.creator?.fullName || 'System' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let day">
                  @if (day.isClosed) {
                    <mat-chip class="chip-closed">
                      <mat-icon>lock</mat-icon> Closed
                    </mat-chip>
                  } @else {
                    <mat-chip class="chip-open">
                      <mat-icon>lock_open</mat-icon> Open
                    </mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let day">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewProduction(day)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    @if (!day.isClosed && isSameDay(day.productionDate)) {
                      <button mat-menu-item (click)="editProduction(day)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                    }
                    @if (day.isClosed && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
                      <button mat-menu-item (click)="reopenDay(day)">
                        <mat-icon>lock_open</mat-icon>
                        <span>Reopen Day</span>
                      </button>
                    }
                    @if (!day.isClosed && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
                      <button mat-menu-item (click)="closeDay(day)">
                        <mat-icon>lock</mat-icon>
                        <span>Close Day</span>
                      </button>
                    }
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="production-row"></tr>
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
        &.success { color: #4caf50; }
        &.warn { color: #ff9800; }
      }
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    .production-table {
      width: 100%;
      .text-right {
        text-align: right;
      }
      .production-row {
        cursor: pointer;
        &:hover {
          background-color: #f5f5f5;
        }
      }
      .scrap-qty {
        color: #f57c00;
        font-weight: 600;
      }
      .text-muted {
        color: #999;
      }
    }
    .chip-closed {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
    .chip-open {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `],
})
export class ProductionListComponent implements OnInit {
    productionDays = signal<any[]>([]);
    loading = signal(false);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);

    searchTerm = '';
    fromDate: Date | null = null;
    toDate: Date | null = null;
    userRole = localStorage.getItem('userRole') || 'USER';

    displayedColumns = ['date', 'product', 'quantity', 'scrap', 'recordedBy', 'status', 'actions'];

    closedDaysCount = signal(0);
    openDaysCount = signal(0);

    constructor(
        private productionService: ProductionService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit() {
        this.setToday();
        this.loadProduction();
    }

    loadProduction() {
        this.loading.set(true);
        const params: any = {
            page: this.currentPage(),
            limit: this.pageSize(),
        };

        if (this.searchTerm) params.search = this.searchTerm;
        if (this.fromDate) params.fromDate = this.formatDate(this.fromDate);
        if (this.toDate) params.toDate = this.formatDate(this.toDate);

        this.productionService.getProduction(params).subscribe({
            next: (response) => {
                this.productionDays.set(response.data);
                this.totalItems.set(response.meta.total);
                this.closedDaysCount.set(response.data.filter((d: any) => d.isClosed).length);
                this.openDaysCount.set(response.data.filter((d: any) => !d.isClosed).length);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading production:', err);
                this.loading.set(false);
            }
        });
    }

    openProductionDialog() {
        const dialogRef = this.dialog.open(ProductionFormDialogComponent, {
            width: '600px',
            data: null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadProduction();
            }
        });
    }

    editProduction(day: any) {
        const dialogRef = this.dialog.open(ProductionFormDialogComponent, {
            width: '600px',
            data: day
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadProduction();
            }
        });
    }

    viewProduction(day: any) {
        // Navigate to detail view or show in dialog
        this.snackBar.open(`Viewing production for ${day.finishedProduct?.itemName}`, 'Close', { duration: 3000 });
    }

    closeDay(day: any) {
        if (confirm(`Close production day for ${new Date(day.productionDate).toLocaleDateString()}?\n\nOnce closed, editing will require Manager/Admin override.`)) {
            this.productionService.closeDay(day.productionDayId).subscribe({
                next: () => {
                    this.snackBar.open('Production day closed successfully', 'Close', { duration: 3000 });
                    this.loadProduction();
                },
                error: (err) => {
                    console.error('Error closing day:', err);
                    this.snackBar.open('Failed to close production day', 'Close', { duration: 3000 });
                }
            });
        }
    }

    reopenDay(day: any) {
        const reason = prompt('Enter reason for reopening this production day:');
        if (reason) {
            this.productionService.reopenDay(day.productionDayId, reason).subscribe({
                next: () => {
                    this.snackBar.open('Production day reopened successfully', 'Close', { duration: 3000 });
                    this.loadProduction();
                },
                error: (err) => {
                    console.error('Error reopening day:', err);
                    this.snackBar.open('Failed to reopen production day', 'Close', { duration: 3000 });
                }
            });
        }
    }

    isSameDay(dateStr: string): boolean {
        const prodDate = new Date(dateStr);
        const today = new Date();
        return prodDate.toDateString() === today.toDateString();
    }

    setToday() {
        const today = new Date();
        this.fromDate = today;
        this.toDate = today;
    }

    setThisWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        this.fromDate = startOfWeek;
        this.toDate = today;
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
        this.loadProduction();
    }

    onSearch() {
        this.currentPage.set(1);
        this.loadProduction();
    }

    onPageChange(event: PageEvent) {
        this.currentPage.set(event.pageIndex + 1);
        this.pageSize.set(event.pageSize);
        this.loadProduction();
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
