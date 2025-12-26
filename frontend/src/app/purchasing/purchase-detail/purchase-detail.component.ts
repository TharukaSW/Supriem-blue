import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { PurchasingService, PurchaseOrder } from '../services/purchasing.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GrnMismatchDialogComponent } from '../grn-mismatch-dialog/grn-mismatch-dialog.component';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (purchase()) {
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <button mat-icon-button routerLink="/purchases" class="back-button">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="title-section">
              <h1>{{ purchase()?.purchaseNo }}</h1>
              <mat-chip [ngClass]="'status-' + purchase()?.status?.toLowerCase()">
                {{ purchase()?.status }}
              </mat-chip>
            </div>
          </div>
          <div class="header-actions">
            @if (purchase()?.status === 'DRAFT') {
              <button mat-stroked-button color="primary" (click)="editPurchase()">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-raised-button color="primary" (click)="confirmPurchase()">
                <mat-icon>check_circle</mat-icon>
                Confirm Order
              </button>
            }
            @if (purchase()?.status === 'CONFIRMED') {
              <button mat-raised-button class="match-btn" (click)="onMatch()">
                <mat-icon>check</mat-icon>
                Match
              </button>
              <button mat-raised-button class="mismatch-btn" (click)="onMismatch()">
                <mat-icon>report_problem</mat-icon>
                Mismatch
              </button>
              <button mat-raised-button color="accent" (click)="receivePurchase()">
                <mat-icon>inventory_2</mat-icon>
                Receive Goods
              </button>
            }
            @if (purchase()?.status === 'DRAFT' || purchase()?.status === 'CONFIRMED') {
              <button mat-stroked-button color="warn" (click)="cancelPurchase()">
                <mat-icon>block</mat-icon>
                Cancel
              </button>
            }
          </div>
        </div>

        <!-- Main Content -->
        <div class="content-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Order Information -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>receipt</mat-icon>
                  Order Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Purchase Order No.</label>
                    <span class="value">{{ purchase()?.purchaseNo }}</span>
                  </div>
                  <div class="info-item">
                    <label>Purchase Date</label>
                    <span class="value">{{ purchase()?.purchaseDate | date:'MMM dd, yyyy' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Status</label>
                    <mat-chip [ngClass]="'status-' + purchase()?.status?.toLowerCase()">
                      {{ purchase()?.status }}
                    </mat-chip>
                  </div>
                  <div class="info-item">
                    <label>Created Date</label>
                    <span class="value">{{ purchase()?.createdAt | date:'MMM dd, yyyy HH:mm' }}</span>
                  </div>
                  @if (purchase()?.notes) {
                    <div class="info-item full-width">
                      <label>Notes</label>
                      <span class="value notes">{{ purchase()?.notes }}</span>
                    </div>
                  }
                  @if (purchase()?.cancellationReason) {
                    <div class="info-item full-width">
                      <label>Cancellation Reason</label>
                      <span class="value cancellation-reason">{{ purchase()?.cancellationReason }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Supplier Information -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>business</mat-icon>
                  Supplier Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Supplier Name</label>
                    <span class="value">{{ purchase()?.supplier?.supplierName }}</span>
                  </div>
                  <div class="info-item">
                    <label>Supplier Code</label>
                    <span class="value">{{ purchase()?.supplier?.supplierCode }}</span>
                  </div>
                  @if (purchase()?.supplier?.contactPerson) {
                    <div class="info-item">
                      <label>Contact Person</label>
                      <span class="value">{{ purchase()?.supplier?.contactPerson }}</span>
                    </div>
                  }
                  @if (purchase()?.supplier?.phone) {
                    <div class="info-item">
                      <label>Phone</label>
                      <span class="value">{{ purchase()?.supplier?.phone }}</span>
                    </div>
                  }
                  @if (purchase()?.supplier?.email) {
                    <div class="info-item full-width">
                      <label>Email</label>
                      <span class="value">{{ purchase()?.supplier?.email }}</span>
                    </div>
                  }
                  @if (purchase()?.supplier?.address) {
                    <div class="info-item full-width">
                      <label>Address</label>
                      <span class="value">{{ purchase()?.supplier?.address }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Items Table -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>inventory</mat-icon>
                  Order Items
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="purchase()?.lines || []" class="items-table">
                  <!-- Item Column -->
                  <ng-container matColumnDef="item">
                    <th mat-header-cell *matHeaderCellDef>Item</th>
                    <td mat-cell *matCellDef="let line">
                      <div class="item-cell">
                        <span class="item-name">{{ line.item?.itemName }}</span>
                        <span class="item-code">{{ line.item?.itemCode }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Quantity Column -->
                  <ng-container matColumnDef="qty">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Quantity</th>
                    <td mat-cell *matCellDef="let line" class="text-right">
                      {{ line.qty }} {{ line.item?.unit }}
                    </td>
                  </ng-container>

                  <!-- Unit Price Column -->
                  <ng-container matColumnDef="unitPrice">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Unit Price</th>
                    <td mat-cell *matCellDef="let line" class="text-right">
                      {{ line.unitPrice | currency:'LKR ':'symbol':'1.2-2' }}
                    </td>
                  </ng-container>

                  <!-- Line Total Column -->
                  <ng-container matColumnDef="lineTotal">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Total</th>
                    <td mat-cell *matCellDef="let line" class="text-right font-medium">
                      {{ line.lineTotal | currency:'LKR ':'symbol':'1.2-2' }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <mat-divider class="my-3"></mat-divider>

                <!-- Summary Section -->
                <div class="summary-section">
                  <div class="summary-row">
                    <span class="label">Subtotal:</span>
                    <span class="value">{{ subtotal() | currency:'LKR ':'symbol':'1.2-2' }}</span>
                  </div>
                  @if (purchase()?.tax && purchase()!.tax > 0) {
                    <div class="summary-row">
                      <span class="label">Tax:</span>
                      <span class="value">{{ purchase()?.tax | currency:'LKR ':'symbol':'1.2-2' }}</span>
                    </div>
                  }
                  @if (purchase()?.discount && purchase()!.discount > 0) {
                    <div class="summary-row">
                      <span class="label">Discount:</span>
                      <span class="value discount">-{{ purchase()?.discount | currency:'LKR ':'symbol':'1.2-2' }}</span>
                    </div>
                  }
                  <mat-divider class="my-2"></mat-divider>
                  <div class="summary-row total">
                    <span class="label">Grand Total:</span>
                    <span class="value">{{ purchase()?.total | currency:'LKR ':'symbol':'1.2-2' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      } @else {
        <div class="error-container">
          <mat-icon>error_outline</mat-icon>
          <h2>Purchase Order Not Found</h2>
          <button mat-raised-button color="primary" routerLink="/purchases">
            Back to Purchases
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
    }

    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      margin-top: 4px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-section h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .header-actions button {
      min-width: 120px;
    }

    .header-actions button mat-icon {
      margin-right: 6px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24px;
    }

    @media (max-width: 968px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .left-column,
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    mat-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
    }

    mat-card-title mat-icon {
      color: #666;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item.full-width {
      grid-column: span 2;
    }

    .info-item label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item .value {
      font-size: 14px;
      color: #1a1a1a;
      font-weight: 500;
    }

    .info-item .value.notes {
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .info-item .value.cancellation-reason {
      color: #d32f2f;
      background: #ffebee;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 3px solid #d32f2f;
    }

    .items-table {
      width: 100%;
    }

    .items-table th {
      font-weight: 600;
      color: #666;
    }

    .item-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-name {
      font-weight: 500;
      color: #1a1a1a;
    }

    .item-code {
      font-size: 12px;
      color: #666;
    }

    .text-right {
      text-align: right;
    }

    .font-medium {
      font-weight: 500;
    }

    .my-2 {
      margin: 8px 0;
    }

    .my-3 {
      margin: 16px 0;
    }

    .summary-section {
      margin-top: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    .summary-row .label {
      font-size: 14px;
      color: #666;
    }

    .summary-row .value {
      font-size: 16px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .summary-row .value.discount {
      color: #f57c00;
    }

    .summary-row.total {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 2px solid #ddd;
    }

    .summary-row.total .label {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .summary-row.total .value {
      font-size: 24px;
      font-weight: 700;
      color: #1976d2;
    }

    mat-chip {
      font-weight: 500;
    }

    .status-draft {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-confirmed {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-received {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-cancelled {
      background-color: #ffebee;
      color: #c62828;
    }

    .match-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .match-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }

    .mismatch-btn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .mismatch-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
      transform: translateY(-1px);
    }
  `]
})
export class PurchaseDetailComponent implements OnInit {
  purchase = signal<PurchaseOrder | null>(null);
  loading = signal(false);
  displayedColumns = ['item', 'qty', 'unitPrice', 'lineTotal'];

  subtotal = signal(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchasingService: PurchasingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPurchase(id);
    }
  }

  loadPurchase(id: string) {
    this.loading.set(true);
    this.purchasingService.getPurchaseOrder(id).subscribe({
      next: (po) => {
        this.purchase.set(po);
        this.calculateSubtotal();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading purchase order', err);
        this.snackBar.open('Error loading purchase order', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  calculateSubtotal() {
    const lines = this.purchase()?.lines || [];
    const total = lines.reduce((sum, line) => sum + (line.lineTotal || 0), 0);
    this.subtotal.set(total);
  }

  editPurchase() {
    this.router.navigate(['/purchases', this.purchase()?.purchaseId, 'edit']);
  }

  onMatch() {
    const po = this.purchase();
    if (!po) return;

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

      this.snackBar.open(`PO ${po.purchaseNo} marked as matched`, 'Close', { duration: 3000 });
    });
  }

  onMismatch() {
    const po = this.purchase();
    if (!po) return;

    const dialogRef = this.dialog.open(GrnMismatchDialogComponent, {
      width: '600px',
      data: { purchaseOrder: po }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      console.log('Mismatch reported:', result);
      this.snackBar.open(`Mismatch reported for PO ${po.purchaseNo}`, 'Close', { duration: 3000 });
    });
  }

  confirmPurchase() {
    const po = this.purchase();
    if (!po) return;

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
          this.loadPurchase(po.purchaseId);
        },
        error: (err) => {
          this.snackBar.open('Error confirming purchase order', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  receivePurchase() {
    const po = this.purchase();
    if (!po) return;

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
          this.loadPurchase(po.purchaseId);
        },
        error: (err) => {
          this.snackBar.open('Error receiving goods', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }

  cancelPurchase() {
    const po = this.purchase();
    if (!po) return;

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
          this.loadPurchase(po.purchaseId);
        },
        error: (err) => {
          this.snackBar.open('Error cancelling purchase order', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    });
  }
}
