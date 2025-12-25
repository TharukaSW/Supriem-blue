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
import { SupplierService, Supplier, SupplierItemPrice } from '../services/supplier.service';
import { SupplierFormDialogComponent } from './supplier-form-dialog.component';
import { SupplierPriceDialogComponent } from './supplier-price-dialog.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';

@Component({
    selector: 'app-supplier-detail',
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
            @if (supplier()) {
                <div class="profile-header">
                    <button mat-icon-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div class="header-content">
                        <div class="supplier-avatar">
                            <mat-icon>store</mat-icon>
                        </div>
                        <div class="header-info">
                            <h1>{{ supplier()!.supplierName }}</h1>
                            <p class="supplier-code">{{ supplier()!.supplierCode }}</p>
                            <mat-chip [class.active]="supplier()!.isActive" [class.inactive]="!supplier()!.isActive">
                                <mat-icon>{{ supplier()!.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                                {{ supplier()!.isActive ? 'Active' : 'Inactive' }}
                            </mat-chip>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button mat-raised-button color="primary" (click)="editSupplier()">
                            <mat-icon>edit</mat-icon>
                            Edit Supplier
                        </button>
                    </div>
                </div>

                <mat-tab-group class="profile-tabs">
                    <mat-tab label="Supplier Information">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>business</mat-icon>
                                        Business Details
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Supplier Code</label>
                                            <p>{{ supplier()!.supplierCode }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Supplier Name</label>
                                            <p>{{ supplier()!.supplierName }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Contact Person</label>
                                            <p>{{ supplier()!.contactName || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Phone</label>
                                            <p>{{ supplier()!.phone || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Email</label>
                                            <p>{{ supplier()!.email || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Status</label>
                                            <p>
                                                <mat-chip [class.status-active]="supplier()!.isActive" [class.status-inactive]="!supplier()!.isActive">
                                                    {{ supplier()!.isActive ? 'Active' : 'Inactive' }}
                                                </mat-chip>
                                            </p>
                                        </div>
                                        <div class="info-item full-width">
                                            <label>Address</label>
                                            <p>{{ supplier()!.address || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Created At</label>
                                            <p>{{ supplier()!.createdAt | date: 'medium' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Last Updated</label>
                                            <p>{{ supplier()!.updatedAt | date: 'medium' }}</p>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>

                    <mat-tab label="Items & Prices">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>inventory_2</mat-icon>
                                        Item Price List
                                    </mat-card-title>
                                    <button mat-raised-button color="primary" (click)="addPrice()">
                                        <mat-icon>add</mat-icon>
                                        Add Item Price
                                    </button>
                                </mat-card-header>
                                <mat-card-content>
                                    @if (prices().length > 0) {
                                        <table mat-table [dataSource]="prices()" class="prices-table">
                                            <ng-container matColumnDef="item">
                                                <th mat-header-cell *matHeaderCellDef>Item</th>
                                                <td mat-cell *matCellDef="let price">
                                                    <div class="item-info">
                                                        <strong>{{ price.item?.itemCode }}</strong>
                                                        <span class="item-name">{{ price.item?.itemName }}</span>
                                                    </div>
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="unitPrice">
                                                <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                                                <td mat-cell *matCellDef="let price">
                                                    <span class="price-amount">LKR {{ price.unitPrice | number:'1.2-2' }}</span>
                                                    @if (price.item?.unit) {
                                                        <span class="unit-text">/ {{ price.item.unit.symbol }}</span>
                                                    }
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="effectiveFrom">
                                                <th mat-header-cell *matHeaderCellDef>Effective From</th>
                                                <td mat-cell *matCellDef="let price">
                                                    {{ price.effectiveFrom | date:'mediumDate' }}
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="endDate">
                                                <th mat-header-cell *matHeaderCellDef>End Date</th>
                                                <td mat-cell *matCellDef="let price">
                                                    {{ price.endDate ? (price.endDate | date:'mediumDate') : 'Ongoing' }}
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="status">
                                                <th mat-header-cell *matHeaderCellDef>Status</th>
                                                <td mat-cell *matCellDef="let price">
                                                    <mat-chip [class.status-active]="price.isActive" [class.status-inactive]="!price.isActive">
                                                        {{ price.isActive ? 'Active' : 'Inactive' }}
                                                    </mat-chip>
                                                </td>
                                            </ng-container>

                                            <ng-container matColumnDef="actions">
                                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                                <td mat-cell *matCellDef="let price">
                                                    <button mat-icon-button matTooltip="Edit Price" (click)="editPrice(price)">
                                                        <mat-icon>edit</mat-icon>
                                                    </button>
                                                    <button mat-icon-button matTooltip="Deactivate" color="warn" 
                                                            (click)="deactivatePrice(price)" [disabled]="!price.isActive">
                                                        <mat-icon>block</mat-icon>
                                                    </button>
                                                </td>
                                            </ng-container>

                                            <tr mat-header-row *matHeaderRowDef="priceColumns"></tr>
                                            <tr mat-row *matRowDef="let row; columns: priceColumns;"></tr>
                                        </table>
                                    } @else {
                                        <div class="no-data">
                                            <mat-icon>inventory_2</mat-icon>
                                            <p>No item prices available</p>
                                            <button mat-raised-button color="primary" (click)="addPrice()">
                                                <mat-icon>add</mat-icon>
                                                Add First Price
                                            </button>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        .supplier-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .supplier-avatar mat-icon {
            font-size: 60px;
            width: 60px;
            height: 60px;
            color: white;
        }

        .header-info h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 600;
        }

        .supplier-code {
            margin: 0 0 12px 0;
            opacity: 0.9;
            font-size: 16px;
        }

        .header-info mat-chip {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 500;
        }

        .header-info mat-chip mat-icon {
            color: white;
            margin-right: 4px;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .header-actions button {
            background: white;
            color: #667eea;
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
            color: #667eea;
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

        .prices-table {
            width: 100%;
            margin-top: 16px;
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

        .price-amount {
            font-size: 16px;
            font-weight: 600;
            color: #4caf50;
        }

        .unit-text {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.6);
            margin-left: 4px;
        }

        .status-active {
            background: #4caf50 !important;
            color: white !important;
        }

        .status-inactive {
            background: #f44336 !important;
            color: white !important;
        }

        .no-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            gap: 16px;
        }

        .no-data mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            color: rgba(0, 0, 0, 0.26);
        }

        .no-data p {
            color: rgba(0, 0, 0, 0.54);
            font-size: 16px;
            margin: 0;
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
export class SupplierDetailComponent implements OnInit {
    supplier = signal<Supplier | null>(null);
    prices = signal<SupplierItemPrice[]>([]);

    priceColumns = ['item', 'unitPrice', 'effectiveFrom', 'endDate', 'status', 'actions'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private supplierService: SupplierService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadSupplier(id);
            this.loadPrices(id);
        }
    }

    loadSupplier(id: string) {
        this.supplierService.getOne(id, false).subscribe({
            next: (supplier) => {
                this.supplier.set(supplier);
            },
            error: () => {
                this.snackBar.open('Error loading supplier', 'Close', { duration: 3000 });
                this.goBack();
            }
        });
    }

    loadPrices(id: string) {
        this.supplierService.getPrices(id).subscribe({
            next: (prices) => {
                this.prices.set(prices);
            },
            error: () => {
                this.snackBar.open('Error loading prices', 'Close', { duration: 3000 });
            }
        });
    }

    goBack() {
        this.router.navigate(['/suppliers']);
    }

    editSupplier() {
        const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
            data: { mode: 'edit', supplier: this.supplier() }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadSupplier(this.supplier()!.supplierId);
            }
        });
    }

    addPrice() {
        const dialogRef = this.dialog.open(SupplierPriceDialogComponent, {
            width: '500px',
            data: { mode: 'create', supplierId: this.supplier()!.supplierId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadPrices(this.supplier()!.supplierId);
            }
        });
    }

    editPrice(price: SupplierItemPrice) {
        const dialogRef = this.dialog.open(SupplierPriceDialogComponent, {
            width: '500px',
            data: { mode: 'edit', supplierId: this.supplier()!.supplierId, price }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadPrices(this.supplier()!.supplierId);
            }
        });
    }

    deactivatePrice(price: SupplierItemPrice) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Deactivate Price',
                message: `Are you sure you want to deactivate this price for ${price.item?.itemName}?`,
                confirmText: 'Deactivate'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.supplierService.deactivatePrice(
                    this.supplier()!.supplierId,
                    price.supplierItemPriceId
                ).subscribe({
                    next: () => {
                        this.snackBar.open('Price deactivated successfully', 'Close', { duration: 3000 });
                        this.loadPrices(this.supplier()!.supplierId);
                    },
                    error: () => {
                        this.snackBar.open('Error deactivating price', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
