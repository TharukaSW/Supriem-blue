import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesService, SalesOrder, Dispatch } from '../services/sales.service';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { DispatchDialogComponent } from '../dispatch-dialog/dispatch-dialog.component';

@Component({
    selector: 'app-sales-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatChipsModule,
        MatTooltipModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    template: `
        <div class="page-container">
            @if (order()) {
                <div class="profile-header">
                    <button mat-icon-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div class="header-content">
                        <div class="order-icon">
                            <mat-icon>receipt_long</mat-icon>
                        </div>
                        <div class="header-info">
                            <h1>{{ order()!.orderNo }}</h1>
                            <p class="customer-name">{{ order()!.customer?.customerName }}</p>
                            <mat-chip [ngClass]="'status-' + order()!.status.toLowerCase()">
                                {{ order()!.status }}
                            </mat-chip>
                        </div>
                    </div>
                    <div class="header-actions">
                        @if (order()!.status === 'DRAFT') {
                            <button mat-raised-button color="primary" (click)="editOrder()">
                                <mat-icon>edit</mat-icon>
                                Edit Order
                            </button>
                            <button mat-raised-button color="accent" (click)="confirmOrder()">
                                <mat-icon>check_circle</mat-icon>
                                Confirm Order
                            </button>
                        }
                        @if (['DRAFT', 'CONFIRMED'].includes(order()!.status)) {
                            <button mat-raised-button color="warn" (click)="cancelOrder()">
                                <mat-icon>cancel</mat-icon>
                                Cancel Order
                            </button>
                        }
                    </div>
                </div>

                <mat-tab-group class="profile-tabs">
                    <mat-tab label="Order Information">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>info</mat-icon>
                                        Order Details
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Order Number</label>
                                            <p>{{ order()!.orderNo }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Order Date</label>
                                            <p>{{ order()!.orderDate | date:'mediumDate' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Customer</label>
                                            <p>{{ order()!.customer?.customerName }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Status</label>
                                            <p>
                                                <mat-chip [ngClass]="'status-' + order()!.status.toLowerCase()">
                                                    {{ order()!.status }}
                                                </mat-chip>
                                            </p>
                                        </div>
                                        @if (order()!.notes) {
                                            <div class="info-item full-width">
                                                <label>Notes</label>
                                                <p>{{ order()!.notes }}</p>
                                            </div>
                                        }
                                        <div class="info-item">
                                            <label>Created At</label>
                                            <p>{{ order()!.createdAt | date:'medium' }}</p>
                                        </div>
                                        @if (order()!.confirmedAt) {
                                            <div class="info-item">
                                                <label>Confirmed At</label>
                                                <p>{{ order()!.confirmedAt | date:'medium' }}</p>
                                            </div>
                                        }
                                    </div>
                                </mat-card-content>
                            </mat-card>

                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>shopping_cart</mat-icon>
                                        Order Items
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <table mat-table [dataSource]="order()!.lines" class="items-table">
                                        <ng-container matColumnDef="product">
                                            <th mat-header-cell *matHeaderCellDef>Product</th>
                                            <td mat-cell *matCellDef="let line">
                                                <div class="item-info">
                                                    <strong>{{ line.item?.itemCode }}</strong>
                                                    <span class="item-name">{{ line.item?.itemName }}</span>
                                                </div>
                                            </td>
                                        </ng-container>

                                        <ng-container matColumnDef="quantity">
                                            <th mat-header-cell *matHeaderCellDef>Quantity</th>
                                            <td mat-cell *matCellDef="let line">
                                                {{ line.qty | number:'1.2-2' }}
                                                @if (line.item?.unit) {
                                                    <span class="unit-text">{{ line.item.unit.symbol }}</span>
                                                }
                                            </td>
                                        </ng-container>

                                        <ng-container matColumnDef="unitPrice">
                                            <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                                            <td mat-cell *matCellDef="let line">
                                                {{ line.unitPrice | currency:'LKR ':'symbol':'1.2-2' }}
                                            </td>
                                        </ng-container>

                                        <ng-container matColumnDef="lineTotal">
                                            <th mat-header-cell *matHeaderCellDef>Line Total</th>
                                            <td mat-cell *matCellDef="let line">
                                                <span class="line-total">{{ (line.qty * line.unitPrice) | currency:'LKR ':'symbol':'1.2-2' }}</span>
                                            </td>
                                        </ng-container>

                                        <tr mat-header-row *matHeaderRowDef="lineColumns"></tr>
                                        <tr mat-row *matRowDef="let row; columns: lineColumns;"></tr>
                                    </table>

                                    <div class="totals-section">
                                        <div class="totals-row">
                                            <label>Subtotal:</label>
                                            <span>{{ order()!.subtotal | currency:'LKR ':'symbol':'1.2-2' }}</span>
                                        </div>
                                        @if (order()!.discount > 0) {
                                            <div class="totals-row">
                                                <label>Discount:</label>
                                                <span class="discount">-{{ order()!.discount | currency:'LKR ':'symbol':'1.2-2' }}</span>
                                            </div>
                                        }
                                        @if (order()!.tax > 0) {
                                            <div class="totals-row">
                                                <label>Tax:</label>
                                                <span>{{ order()!.tax | currency:'LKR ':'symbol':'1.2-2' }}</span>
                                            </div>
                                        }
                                        <div class="totals-row total-row">
                                            <label>Grand Total:</label>
                                            <span class="grand-total">{{ order()!.total | currency:'LKR ':'symbol':'1.2-2' }}</span>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>

                    <mat-tab label="Dispatches">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>local_shipping</mat-icon>
                                        Dispatch History
                                    </mat-card-title>
                                    @if (order()!.status === 'CONFIRMED') {
                                        <button mat-raised-button color="primary" (click)="createDispatch()">
                                            <mat-icon>add</mat-icon>
                                            Create Dispatch
                                        </button>
                                    }
                                </mat-card-header>
                                <mat-card-content>
                                    @if (dispatches().length > 0) {
                                        <table mat-table [dataSource]="dispatches()" class="dispatches-table">
                                            <ng-container matColumnDef="dispatchNo">
                                                <th mat-header-cell *matHeaderCellDef>Dispatch No</th>
                                                <td mat-cell *matCellDef="let dispatch">
                                                    <span class="dispatch-number">{{ dispatch.dispatchNo }}</span>
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
                                                    {{ dispatch.vehicleNo || '-' }}
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="driver">
                                                <th mat-header-cell *matHeaderCellDef>Driver</th>
                                                <td mat-cell *matCellDef="let dispatch">
                                                    {{ dispatch.driverName || '-' }}
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="status">
                                                <th mat-header-cell *matHeaderCellDef>Status</th>
                                                <td mat-cell *matCellDef="let dispatch">
                                                    <mat-chip [ngClass]="'status-' + dispatch.status.toLowerCase()">
                                                        {{ dispatch.status }}
                                                    </mat-chip>
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="actions">
                                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                                <td mat-cell *matCellDef="let dispatch">
                                                    @if (dispatch.status !== 'DELIVERED') {
                                                        <button mat-icon-button matTooltip="Mark as Delivered" 
                                                                color="primary" (click)="markDelivered(dispatch)">
                                                            <mat-icon>check_circle</mat-icon>
                                                        </button>
                                                    }
                                                </td>
                                            </ng-container>

                                            <tr mat-header-row *matHeaderRowDef="dispatchColumns"></tr>
                                            <tr mat-row *matRowDef="let row; columns: dispatchColumns;"></tr>
                                        </table>
                                    } @else {
                                        <div class="no-data">
                                            <mat-icon>local_shipping</mat-icon>
                                            <p>No dispatches created yet</p>
                                            @if (order()!.status === 'CONFIRMED') {
                                                <button mat-button color="primary" (click)="createDispatch()">
                                                    Create First Dispatch
                                                </button>
                                            }
                                        </div>
                                    }
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>
                </mat-tab-group>
            }
        </div>
    `,
    styles: [`
        .page-container {
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .profile-header {
            background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
            border-radius: 12px;
            padding: 32px;
            color: white;
            margin-bottom: 24px;
            position: relative;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .back-button {
            position: absolute;
            top: 16px;
            left: 16px;
            color: white;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 16px;
        }

        .order-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .order-icon mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: white;
        }

        .header-info h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 600;
        }

        .customer-name {
            margin: 0 0 12px 0;
            opacity: 0.9;
            font-size: 16px;
        }

        .header-info mat-chip {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 500;
        }

        .header-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .header-actions button {
            background: white;
            color: #1976d2;
        }

        .header-actions button[color="accent"] {
            background: #4caf50;
            color: white;
        }

        .header-actions button[color="warn"] {
            background: #f44336;
            color: white;
        }

        .profile-tabs {
            margin-top: 24px;
        }

        .tab-content {
            padding: 24px 0;
        }

        .info-card {
            margin-bottom: 24px;
        }

        .info-card mat-card-header {
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .info-card mat-card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            color: rgba(0, 0, 0, 0.87);
        }

        .info-card mat-card-title mat-icon {
            color: #1976d2;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-item.full-width {
            grid-column: 1 / -1;
        }

        .info-item label {
            font-size: 12px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.6);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .info-item p {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            margin: 0;
        }

        .items-table,
        .dispatches-table {
            width: 100%;
            margin-bottom: 24px;
        }

        .item-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .item-name {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.6);
        }

        .unit-text {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.6);
            margin-left: 4px;
        }

        .line-total {
            font-weight: 500;
            color: #4caf50;
        }

        .totals-section {
            max-width: 400px;
            margin-left: auto;
            padding: 16px;
            background: #f5f5f5;
            border-radius: 8px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }

        .totals-row label {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
        }

        .discount {
            color: #f44336;
        }

        .total-row {
            border-top: 2px solid #333;
            padding-top: 12px;
            margin-top: 8px;
        }

        .total-row label {
            font-size: 18px;
            font-weight: 600;
        }

        .grand-total {
            font-size: 20px;
            font-weight: 600;
            color: #4caf50;
        }

        .dispatch-number {
            font-weight: 500;
            color: #1976d2;
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

        .status-delivered {
            background-color: #e8f5e9;
            color: #388e3c;
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

        @media (max-width: 768px) {
            .page-container {
                padding: 16px;
            }

            .profile-header {
                padding: 24px 16px;
            }

            .header-content {
                flex-direction: column;
                text-align: center;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class SalesDetailComponent implements OnInit {
    order = signal<SalesOrder | null>(null);
    dispatches = signal<Dispatch[]>([]);

    lineColumns = ['product', 'quantity', 'unitPrice', 'lineTotal'];
    dispatchColumns = ['dispatchNo', 'dispatchDate', 'vehicle', 'driver', 'status', 'actions'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private salesService: SalesService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadOrder(id);
            this.loadDispatches(id);
        }
    }

    loadOrder(id: string) {
        this.salesService.getSalesOrder(id).subscribe({
            next: (order) => {
                this.order.set(order);
            },
            error: () => {
                this.snackBar.open('Error loading sales order', 'Close', { duration: 3000 });
                this.goBack();
            }
        });
    }

    loadDispatches(orderId: string) {
        // For now, we'll filter all dispatches by this order
        // In a real app, you'd have an endpoint to get dispatches by order ID
        this.salesService.getDispatches().subscribe({
            next: (response) => {
                const data = Array.isArray(response) ? response : (response.data || []);
                const orderDispatches = data.filter(d => d.salesOrderId === orderId);
                this.dispatches.set(orderDispatches);
            },
            error: () => {
                this.snackBar.open('Error loading dispatches', 'Close', { duration: 3000 });
            }
        });
    }

    goBack() {
        this.router.navigate(['/sales']);
    }

    editOrder() {
        this.router.navigate(['/sales', this.order()!.salesOrderId, 'edit']);
    }

    confirmOrder() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirm Sales Order',
                message: `Are you sure you want to confirm sales order ${this.order()!.orderNo}? This action cannot be undone.`,
                confirmText: 'Confirm'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.salesService.confirmSalesOrder(this.order()!.salesOrderId).subscribe({
                    next: () => {
                        this.snackBar.open('Sales order confirmed successfully', 'Close', { duration: 3000 });
                        this.loadOrder(this.order()!.salesOrderId);
                    },
                    error: () => {
                        this.snackBar.open('Error confirming sales order', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }

    cancelOrder() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Cancel Sales Order',
                message: `Are you sure you want to cancel sales order ${this.order()!.orderNo}? This action cannot be undone.`,
                confirmText: 'Cancel Order'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.salesService.cancelSalesOrder(this.order()!.salesOrderId).subscribe({
                    next: () => {
                        this.snackBar.open('Sales order cancelled', 'Close', { duration: 3000 });
                        this.loadOrder(this.order()!.salesOrderId);
                    },
                    error: () => {
                        this.snackBar.open('Error cancelling sales order', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }

    createDispatch() {
        const dialogRef = this.dialog.open(DispatchDialogComponent, {
            width: '500px',
            data: { salesOrderId: this.order()!.salesOrderId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadDispatches(this.order()!.salesOrderId);
            }
        });
    }

    markDelivered(dispatch: Dispatch) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Mark as Delivered',
                message: `Are you sure you want to mark dispatch ${dispatch.dispatchNo} as delivered?`,
                confirmText: 'Mark Delivered'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.salesService.markDispatchDelivered(dispatch.dispatchId).subscribe({
                    next: () => {
                        this.snackBar.open('Dispatch marked as delivered', 'Close', { duration: 3000 });
                        this.loadDispatches(this.order()!.salesOrderId);
                    },
                    error: () => {
                        this.snackBar.open('Error updating dispatch', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
