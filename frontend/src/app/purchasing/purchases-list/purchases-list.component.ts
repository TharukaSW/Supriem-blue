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
import { PurchasingService, PurchaseOrder } from '../services/purchasing.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-purchases-list',
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
        <h1>Purchase Orders</h1>
        <button mat-raised-button color="primary" routerLink="/purchases/new">
          <mat-icon>add</mat-icon>
          New Purchase Order
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Purchases</mat-label>
              <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by PO number or supplier...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="table-container">
            @if (loading()) {
              <div class="loading-shade">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            }

            <table mat-table [dataSource]="filteredPurchases()" class="purchases-table">
              
              <!-- PO Number Column -->
              <ng-container matColumnDef="purchaseNo">
                <th mat-header-cell *matHeaderCellDef>PO Number</th>
                <td mat-cell *matCellDef="let po">
                  <span class="po-number">{{ po.purchaseNo }}</span>
                </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let po">
                  {{ po.purchaseDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- Supplier Column -->
              <ng-container matColumnDef="supplier">
                <th mat-header-cell *matHeaderCellDef>Supplier</th>
                <td mat-cell *matCellDef="let po">
                  {{ po.supplier?.supplierName || '-' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let po">
                  <mat-chip [ngClass]="'status-' + po.status.toLowerCase()">
                    {{ po.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let po">
                  {{ po.total | currency:'LKR ':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let po">
                  <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewPurchase(po)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    <button mat-menu-item *ngIf="po.status === 'DRAFT'" (click)="editPurchase(po)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item *ngIf="po.status === 'DRAFT'" (click)="confirmPurchase(po)">
                      <mat-icon>check_circle</mat-icon>
                      <span>Confirm</span>
                    </button>
                    <button mat-menu-item *ngIf="po.status === 'CONFIRMED'" (click)="receivePurchase(po)">
                      <mat-icon>inventory</mat-icon>
                      <span>Receive Goods</span>
                    </button>
                    <button mat-menu-item *ngIf="['DRAFT', 'CONFIRMED'].includes(po.status)" (click)="cancelPurchase(po)" class="text-warn">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span class="text-warn">Cancel Order</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>
            </table>

            @if (filteredPurchases().length === 0 && !loading()) {
              <div class="no-data">
                <mat-icon>shopping_cart</mat-icon>
                <p>{{ searchText ? 'No purchases found matching your search' : 'No purchase orders yet' }}</p>
                @if (!searchText) {
                  <button mat-button color="primary" routerLink="/purchases/new">Create your first PO</button>
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

    .purchases-table {
      width: 100%;
    }

    .po-number {
      font-weight: 500;
      color: #3f51b5;
    }

    .status-draft { background-color: #e0e0e0; color: #616161; }
    .status-confirmed { background-color: #e3f2fd; color: #1976d2; }
    .status-received { background-color: #e8f5e9; color: #388e3c; }
    .status-cancelled { background-color: #ffebee; color: #d32f2f; }

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
  `],
})
export class PurchasesListComponent implements OnInit {
  purchases = signal<PurchaseOrder[]>([]);
  filteredPurchases = signal<PurchaseOrder[]>([]);
  loading = signal(false);
  searchText = '';

  displayedColumns = ['purchaseNo', 'date', 'supplier', 'status', 'total', 'actions'];

  constructor(
    private purchasingService: PurchasingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadPurchases();
  }

  loadPurchases() {
    this.loading.set(true);
    this.purchasingService.getPurchaseOrders().subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.purchases.set(data);
        this.filteredPurchases.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading purchases', err);
        this.snackBar.open('Error loading purchase orders', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase();
    const filtered = this.purchases().filter(po =>
      po.purchaseNo.toLowerCase().includes(search) ||
      po.supplier?.supplierName.toLowerCase().includes(search)
    );
    this.filteredPurchases.set(filtered);
  }

  viewPurchase(po: PurchaseOrder) {
    this.router.navigate(['/purchases', po.purchaseId]);
  }

  editPurchase(po: PurchaseOrder) {
    this.router.navigate(['/purchases', po.purchaseId, 'edit']);
  }

  confirmPurchase(po: PurchaseOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirm Purchase Order',
        message: `Are you sure you want to confirm purchase order ${po.purchaseNo}? This action cannot be undone.`,
        confirmText: 'Confirm Order',
        cancelText: 'Cancel',
        type: 'confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading.set(true);
      this.purchasingService.confirmPurchaseOrder(po.purchaseId).subscribe({
        next: () => {
          this.snackBar.open('Purchase order confirmed', 'Close', { duration: 3000 });
          this.loadPurchases();
        },
        error: (err) => {
          this.snackBar.open('Error confirming purchase order', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  receivePurchase(po: PurchaseOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Receive Goods',
        message: `Are you sure you want to mark purchase order ${po.purchaseNo} as received? This will update stock levels and cannot be undone.`,
        confirmText: 'Receive Goods',
        cancelText: 'Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading.set(true);
      this.purchasingService.receivePurchaseOrder(po.purchaseId).subscribe({
        next: () => {
          this.snackBar.open('Goods received successfully', 'Close', { duration: 3000 });
          this.loadPurchases();
        },
        error: (err) => {
          this.snackBar.open('Error receiving goods', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  cancelPurchase(po: PurchaseOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Cancel Purchase Order',
        message: `Are you sure you want to cancel purchase order ${po.purchaseNo}?`,
        confirmText: 'Cancel Order',
        cancelText: 'Go Back',
        type: 'danger',
        requireReason: true,
        reasonLabel: 'Cancellation Reason'
      }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (!reason) return;

      this.loading.set(true);
      this.purchasingService.cancelPurchaseOrder(po.purchaseId, reason).subscribe({
        next: () => {
          this.snackBar.open('Purchase order cancelled', 'Close', { duration: 3000 });
          this.loadPurchases();
        },
        error: (err) => {
          this.snackBar.open('Error cancelling purchase order', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }
}
