import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesService } from '../services/sales.service';

@Component({
  selector: 'app-dispatch-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><mat-icon>local_shipping</mat-icon> Dispatch Tracking</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Order No, Customer...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>From Date</mat-label>
              <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate" (ngModelChange)="loadDispatches()">
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To Date</mat-label>
              <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate" (ngModelChange)="loadDispatches()">
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button (click)="setToday()">Today</button>
            <button mat-raised-button (click)="setThisWeek()">This Week</button>
            <button mat-raised-button color="primary" (click)="clearFilters()">
              <mat-icon>clear</mat-icon> Clear
            </button>
          </div>

          @if (loading()) {
            <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          } @else {
            <table mat-table [dataSource]="dispatches()" class="dispatch-table">
              <ng-container matColumnDef="dispatchNo">
                <th mat-header-cell *matHeaderCellDef>Dispatch No</th>
                <td mat-cell *matCellDef="let dispatch">
                  <strong>{{ dispatch.dispatchNo }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="orderNo">
                <th mat-header-cell *matHeaderCellDef>Sales Order</th>
                <td mat-cell *matCellDef="let dispatch">
                  <a [routerLink]="['/sales', dispatch.salesOrder?.salesOrderId]" class="link">
                    {{ dispatch.salesOrder?.orderNo }}
                  </a>
                </td>
              </ng-container>

              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let dispatch">
                  {{ dispatch.salesOrder?.customer?.customerName }}
                </td>
              </ng-container>

              <ng-container matColumnDef="dispatchDate">
                <th mat-header-cell *matHeaderCellDef>Dispatch Date</th>
                <td mat-cell *matCellDef="let dispatch">
                  {{ dispatch.dispatchDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="vehicle">
                <th mat-header-cell *matHeaderCellDef>Vehicle</th>
                <td mat-cell *matCellDef="let dispatch">
                  <div class="vehicle-info">
                    <div><strong>{{ dispatch.vehicleNo }}</strong></div>
                    <div class="text-muted small">{{ dispatch.driverName }}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="deliveryStatus">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let dispatch">
                  @if (dispatch.isDelivered) {
                    <mat-chip class="chip-delivered">
                      <mat-icon>check_circle</mat-icon> Delivered
                    </mat-chip>
                  } @else {
                    <mat-chip class="chip-in-transit">
                      <mat-icon>local_shipping</mat-icon> In Transit
                    </mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="deliveryDate">
                <th mat-header-cell *matHeaderCellDef>Delivered On</th>
                <td mat-cell *matCellDef="let dispatch">
                  @if (dispatch.deliveryDate) {
                    {{ dispatch.deliveryDate | date:'medium' }}
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let dispatch">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewDispatch(dispatch)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    @if (!dispatch.isDelivered && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
                      <button mat-menu-item (click)="markAsDelivered(dispatch)">
                        <mat-icon>check_circle</mat-icon>
                        <span>Mark as Delivered</span>
                      </button>
                    }
                    <button mat-menu-item (click)="viewOrder(dispatch)">
                      <mat-icon>receipt</mat-icon>
                      <span>View Sales Order</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="dispatch-row"></tr>
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
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    .dispatch-table {
      width: 100%;
      .dispatch-row {
        cursor: pointer;
        &:hover {
          background-color: #f5f5f5;
        }
      }
      .vehicle-info {
        .small {
          font-size: 12px;
        }
        .text-muted {
          color: #666;
        }
      }
      .text-muted {
        color: #999;
      }
      .link {
        color: #3f51b5;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .chip-delivered {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
    .chip-in-transit {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class DispatchListComponent implements OnInit {
  dispatches = signal<any[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchTerm = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  userRole = localStorage.getItem('userRole') || 'USER';

  displayedColumns = ['dispatchNo', 'orderNo', 'customer', 'dispatchDate', 'vehicle', 'deliveryStatus', 'deliveryDate', 'actions'];

  constructor(
    private salesService: SalesService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.setToday();
    this.loadDispatches();
  }

  loadDispatches() {
    this.loading.set(true);
    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.fromDate) params.fromDate = this.formatDate(this.fromDate);
    if (this.toDate) params.toDate = this.formatDate(this.toDate);

    this.salesService.getDispatches(params).subscribe({
      next: (response) => {
        this.dispatches.set(response.data);
        this.totalItems.set(response.total || response.data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dispatches:', err);
        this.loading.set(false);
      }
    });
  }

  viewDispatch(dispatch: any) {
    this.snackBar.open(`Viewing dispatch ${dispatch.dispatchNo}`, 'Close', { duration: 3000 });
  }

  viewOrder(dispatch: any) {
    this.router.navigate(['/sales', dispatch.salesOrder?.salesOrderId]);
  }

  markAsDelivered(dispatch: any) {
    if (confirm(`Mark dispatch ${dispatch.dispatchNo} as delivered?`)) {
      this.salesService.markDispatchDelivered(dispatch.dispatchId).subscribe({
        next: () => {
          this.snackBar.open('Dispatch marked as delivered', 'Close', { duration: 3000 });
          this.loadDispatches();
        },
        error: (err) => {
          console.error('Error marking as delivered:', err);
          this.snackBar.open('Failed to update dispatch status', 'Close', { duration: 3000 });
        }
      });
    }
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

  clearFilters() {
    this.searchTerm = '';
    this.fromDate = null;
    this.toDate = null;
    this.loadDispatches();
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadDispatches();
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadDispatches();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
