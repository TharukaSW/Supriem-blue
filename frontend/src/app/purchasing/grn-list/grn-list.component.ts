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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { PurchasingService, PurchaseOrder } from '../services/purchasing.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GrnMismatchDialogComponent } from '../grn-mismatch-dialog/grn-mismatch-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grn-list',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <mat-icon class="page-icon">inventory_2</mat-icon>
          <div>
            <h1>Goods Received Notes (GRN)</h1>
            <p class="subtitle">Verify and receive purchase orders</p>
          </div>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchText" (ngModelChange)="onSearch()" placeholder="Search by PO number or supplier...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <div class="stats">
              <div class="stat-card pending">
                <mat-icon>schedule</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">{{ confirmedPOs().length }}</span>
                  <span class="stat-label">Pending GRN</span>
                </div>
              </div>
            </div>
          </div>

          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Loading purchase orders...</p>
            </div>
          } @else if (filteredPOs().length === 0) {
            <div class="no-data">
              <mat-icon>inbox</mat-icon>
              <p>No confirmed purchase orders found</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="filteredPOs()" class="grn-table">
                
                <!-- PO Number Column -->
                <ng-container matColumnDef="purchaseNo">
                  <th mat-header-cell *matHeaderCellDef>PO Number</th>
                  <td mat-cell *matCellDef="let po">
                    <div class="po-cell">
                      <a class="po-number-link" [routerLink]="['/purchases', po.purchaseId]" matTooltip="Click to view PO details">
                        {{ po.purchaseNo }}
                        <mat-icon class="view-icon">open_in_new</mat-icon>
                      </a>
                      <span class="po-date">{{ po.purchaseDate | date:'MMM dd, yyyy' }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Supplier Column -->
                <ng-container matColumnDef="supplier">
                  <th mat-header-cell *matHeaderCellDef>Supplier</th>
                  <td mat-cell *matCellDef="let po">
                    <div class="supplier-cell">
                      <span class="supplier-name">{{ po.supplier?.supplierName }}</span>
                      <span class="supplier-code">{{ po.supplier?.supplierCode }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Items Column -->
                <ng-container matColumnDef="items">
                  <th mat-header-cell *matHeaderCellDef>Items</th>
                  <td mat-cell *matCellDef="let po">
                    <span [matBadge]="po.lines?.length || 0" matBadgeColor="primary">
                      <mat-icon>inventory</mat-icon>
                    </span>
                  </td>
                </ng-container>

                <!-- Total Column -->
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Total Amount</th>
                  <td mat-cell *matCellDef="let po" class="text-right">
                    <span class="total-amount">{{ po.total | currency:'LKR ':'symbol':'1.2-2' }}</span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let po">
                    <mat-chip class="status-confirmed">
                      <mat-icon>check_circle</mat-icon>
                      CONFIRMED
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="text-center">Actions</th>
                  <td mat-cell *matCellDef="let po" class="text-center">
                    <div class="action-buttons">
                      <button 
                        mat-stroked-button 
                        class="action-btn view-btn"
                        [routerLink]="['/purchases', po.purchaseId]"
                        matTooltip="View PO details"
                      >
                        <mat-icon>visibility</mat-icon>
                        View
                      </button>
                      <button 
                        mat-raised-button 
                        color="primary"
                        class="action-btn match-btn"
                        (click)="onMatch(po)"
                        matTooltip="Goods received match PO"
                      >
                        <mat-icon>check</mat-icon>
                        Match
                      </button>
                      <button 
                        mat-raised-button 
                        color="warn"
                        class="action-btn mismatch-btn"
                        (click)="onMismatch(po)"
                        matTooltip="Report issues or discrepancies"
                      >
                        <mat-icon>report_problem</mat-icon>
                        Mismatch
                      </button>
                      <button 
                        mat-raised-button 
                        color="accent"
                        class="action-btn receive-btn"
                        (click)="onReceive(po)"
                        matTooltip="Mark as received"
                      >
                        <mat-icon>inventory_2</mat-icon>
                        Receive
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="grn-row"></tr>
              </table>
            </div>
          }
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
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 300px;
      flex: 1;
    }

    .stats {
      display: flex;
      gap: 16px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-radius: 8px;
      background: white;
      border: 2px solid #e0e0e0;
    }

    .stat-card.pending {
      border-color: #1976d2;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .stat-card mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1976d2;
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .loading-container,
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      gap: 16px;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .no-data p {
      color: #999;
      font-size: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .grn-table {
      width: 100%;
    }

    .grn-table th {
      font-weight: 600;
      color: #666;
      background: #f8f9fa;
    }

    .grn-row {
      transition: background-color 0.2s;
    }

    .grn-row:hover {
      background-color: #f5f5f5;
    }-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      color: #1976d2;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .po-number-link:hover {
      color: #1565c0;
      text-decoration: underline;
    }

    .po-number-link .view-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }


    .po-cell,
    .supplier-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .po-number,
    .supplier-name {
      font-weight: 500;
      color: #1a1a1a;
    }

    .po-date,
    .supplier-code {
      font-size: 12px;
      color: #666;
    }

    .total-amount {
      font-weight: 600;
      color: #1976d2;
      font-size: 16px;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .status-confirmed {
      background-color: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    }

    .status-confirmed mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }view-btn {
      border: 2px solid #1976d2;
      color: #1976d2;
      background: white;
    }

    .view-btn:hover:not([disabled]) {
      background: #e3f2fd;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      min-width: 100px;
      font-size: 13px;
      font-weight: 500;
    }

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }

    .match-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .match-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .mismatch-btn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .mismatch-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
    }

    .receive-btn {
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
      color: white;
    }

    .receive-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(132, 250, 176, 0.4);
    }
  `]
})
export class GrnListComponent implements OnInit {
  confirmedPOs = signal<PurchaseOrder[]>([]);
  filteredPOs = signal<PurchaseOrder[]>([]);
  loading = signal(false);
  searchText = '';

  displayedColumns = ['purchaseNo', 'supplier', 'items', 'total', 'status', 'actions'];

  constructor(
    private purchasingService: PurchasingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadConfirmedPOs();
  }

  loadConfirmedPOs() {
    this.loading.set(true);
    this.purchasingService.getPurchaseOrders({ status: 'CONFIRMED' }).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        const confirmed = data.filter((po: PurchaseOrder) => po.status === 'CONFIRMED');
        this.confirmedPOs.set(confirmed);
        this.filteredPOs.set(confirmed);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading confirmed POs', err);
        this.snackBar.open('Error loading purchase orders', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.filteredPOs.set(this.confirmedPOs());
      return;
    }

    const filtered = this.confirmedPOs().filter(po =>
      po.purchaseNo.toLowerCase().includes(search) ||
      po.supplier?.supplierName.toLowerCase().includes(search)
    );
    this.filteredPOs.set(filtered);
  }

  onMatch(po: PurchaseOrder) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirm Match',
        message: `Confirm that goods received match the purchase order ${po.purchaseNo} exactly? This will mark the order as ready to receive.`,
        confirmText: 'Confirm Match',
        cancelText: 'Cancel',
        type: 'confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      // Here you can add logic to mark as matched
      this.snackBar.open(`PO ${po.purchaseNo} marked as matched`, 'Close', { duration: 3000 });
    });
  }

  onMismatch(po: PurchaseOrder) {
    const dialogRef = this.dialog.open(GrnMismatchDialogComponent, {
      width: '600px',
      data: { purchaseOrder: po }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      // Here you can add logic to save the mismatch report
      console.log('Mismatch reported:', result);
      this.snackBar.open(`Mismatch reported for PO ${po.purchaseNo}`, 'Close', { duration: 3000 });
      
      // Optionally, you could navigate to a detailed view or refresh the list
    });
  }

  onReceive(po: PurchaseOrder) {
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
          this.loadConfirmedPOs(); // Refresh the list
        },
        error: (err) => {
          this.snackBar.open('Error receiving goods', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }
}
