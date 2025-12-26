import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { SalesService, SalesOrder, DocStatus } from '../services/sales.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
        <div class="page-container">
            <div class="page-header">
                <h1>Sales Orders</h1>
                <button mat-raised-button color="primary" routerLink="/sales/new">
                    <mat-icon>add</mat-icon>
                    New Sales Order
                </button>
            </div>

            <mat-card>
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search Sales Orders</mat-label>
                            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by SO number or customer...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                    </div>

                    <div class="table-container">
                        @if (loading()) {
                            <div class="loading-shade">
                                <mat-spinner diameter="40"></mat-spinner>
                            </div>
                        }

                        <table mat-table [dataSource]="filteredOrders()" class="orders-table">
                            
                            <!-- SO Number Column -->
                            <ng-container matColumnDef="salesOrderNo">
                                <th mat-header-cell *matHeaderCellDef>SO Number</th>
                                <td mat-cell *matCellDef="let order">
                                    <span class="so-number">{{ order.orderNo }}</span>
                                </td>
                            </ng-container>

                            <!-- Date Column -->
                            <ng-container matColumnDef="date">
                                <th mat-header-cell *matHeaderCellDef>Date</th>
                                <td mat-cell *matCellDef="let order">
                                    {{ order.orderDate | date:'mediumDate' }}
                                </td>
                            </ng-container>

                            <!-- Customer Column -->
                            <ng-container matColumnDef="customer">
                                <th mat-header-cell *matHeaderCellDef>Customer</th>
                                <td mat-cell *matCellDef="let order">
                                    {{ order.customer?.customerName || '-' }}
                                </td>
                            </ng-container>

                            <!-- Status Column -->
                            <ng-container matColumnDef="status">
                                <th mat-header-cell *matHeaderCellDef>Status</th>
                                <td mat-cell *matCellDef="let order">
                                    <mat-chip [ngClass]="'status-' + order.status.toLowerCase()">
                                        {{ order.status }}
                                    </mat-chip>
                                </td>
                            </ng-container>

                            <!-- Total Column -->
                            <ng-container matColumnDef="total">
                                <th mat-header-cell *matHeaderCellDef>Total</th>
                                <td mat-cell *matCellDef="let order">
                                    {{ order.total | currency:'LKR ':'symbol':'1.2-2' }}
                                </td>
                            </ng-container>

                            <!-- Actions Column -->
                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                <td mat-cell *matCellDef="let order" (click)="$event.stopPropagation()">
                                    <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                                        <mat-icon>more_vert</mat-icon>
                                    </button>
                                    <mat-menu #menu="matMenu">
                                        <button mat-menu-item (click)="viewOrder(order)">
                                            <mat-icon>visibility</mat-icon>
                                            <span>View Details</span>
                                        </button>
                                        <button mat-menu-item *ngIf="order.status === 'DRAFT'" (click)="editOrder(order)">
                                            <mat-icon>edit</mat-icon>
                                            <span>Edit</span>
                                        </button>
                                        <button mat-menu-item *ngIf="order.status === 'DRAFT'" (click)="confirmOrder(order)">
                                            <mat-icon>check_circle</mat-icon>
                                            <span>Confirm</span>
                                        </button>
                                        <button mat-menu-item *ngIf="['DRAFT', 'CONFIRMED'].includes(order.status)" (click)="cancelOrder(order)" class="text-warn">
                                            <mat-icon color="warn">cancel</mat-icon>
                                            <span class="text-warn">Cancel Order</span>
                                        </button>
                                    </mat-menu>
                                </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row" (click)="viewOrder(row)"></tr>
                        </table>

                        @if (filteredOrders().length === 0 && !loading()) {
                            <div class="no-data">
                                <mat-icon>point_of_sale</mat-icon>
                                <p>{{ searchText ? 'No sales orders found matching your search' : 'No sales orders yet' }}</p>
                                @if (!searchText) {
                                    <button mat-button color="primary" routerLink="/sales/new">Create your first sales order</button>
                                }
                            </div>
                        }
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
  styles: [`
        .page-container {
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .page-header h1 {
            margin: 0;
            font-size: 28px;
        }

        .filters {
            margin-bottom: 16px;
        }

        .search-field {
            width: 400px;
        }

        .table-container {
            position: relative;
            min-height: 200px;
        }

        .loading-shade {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.7);
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .orders-table {
            width: 100%;
        }

        .so-number {
            font-weight: 500;
            color: #3f51b5;
        }

        .status-draft { 
            background-color: #e0e0e0; 
            color: #616161; 
        }
        
        .status-confirmed { 
            background-color: #e3f2fd; 
            color: #1976d2; 
        }
        
        .status-cancelled { 
            background-color: #ffebee; 
            color: #d32f2f; 
        }

        .clickable-row {
            cursor: pointer;
        }

        .clickable-row:hover {
            background-color: #f5f5f5;
        }

        .no-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: #999;
        }

        .no-data mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
            color: #ccc;
        }

        .text-warn {
            color: #f44336;
        }
    `]
})
export class SalesListComponent implements OnInit {
  orders = signal<SalesOrder[]>([]);
  filteredOrders = signal<SalesOrder[]>([]);
  loading = signal(false);
  searchText = '';

  displayedColumns = ['salesOrderNo', 'date', 'customer', 'status', 'total', 'actions'];

  constructor(
    private salesService: SalesService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.salesService.getSalesOrders().subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.orders.set(data);
        this.filteredOrders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading sales orders', err);
        this.snackBar.open('Error loading sales orders', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase();
    const filtered = this.orders().filter(order =>
      order.orderNo.toLowerCase().includes(search) ||
      order.customer?.customerName.toLowerCase().includes(search)
    );
    this.filteredOrders.set(filtered);
  }

  viewOrder(order: SalesOrder) {
    this.router.navigate(['/sales', order.salesOrderId]);
  }

  editOrder(order: SalesOrder) {
    this.router.navigate(['/sales', order.salesOrderId, 'edit']);
  }

  confirmOrder(order: SalesOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Sales Order',
        message: `Are you sure you want to confirm sales order ${order.orderNo}? This action cannot be undone.`,
        confirmText: 'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading.set(true);
        this.salesService.confirmSalesOrder(order.salesOrderId).subscribe({
          next: () => {
            this.snackBar.open('Sales order confirmed successfully', 'Close', { duration: 3000 });
            this.loadOrders();
          },
          error: (err) => {
            this.snackBar.open('Error confirming sales order', 'Close', { duration: 3000 });
            this.loading.set(false);
          }
        });
      }
    });
  }

  cancelOrder(order: SalesOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Sales Order',
        message: `Are you sure you want to cancel sales order ${order.orderNo}? This action cannot be undone.`,
        confirmText: 'Cancel Order'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading.set(true);
        this.salesService.cancelSalesOrder(order.salesOrderId).subscribe({
          next: () => {
            this.snackBar.open('Sales order cancelled', 'Close', { duration: 3000 });
            this.loadOrders();
          },
          error: (err) => {
            this.snackBar.open('Error cancelling sales order', 'Close', { duration: 3000 });
            this.loading.set(false);
          }
        });
      }
    });
  }
}
