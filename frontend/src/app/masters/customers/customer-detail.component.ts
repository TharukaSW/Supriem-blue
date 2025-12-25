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
import { CustomerService, Customer, CustomerItemPrice } from '../services/customer.service';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';
import { CustomerPriceDialogComponent } from './customer-price-dialog.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';

@Component({
    selector: 'app-customer-detail',
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
            @if (customer()) {
                <div class="profile-header">
                    <button mat-icon-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div class="header-content">
                        <div class="customer-avatar">
                            <mat-icon>person</mat-icon>
                        </div>
                        <div class="header-info">
                            <h1>{{ customer()!.customerName }}</h1>
                            <p class="customer-code">{{ customer()!.customerCode }}</p>
                            <mat-chip [class.active]="customer()!.isActive" [class.inactive]="!customer()!.isActive">
                                <mat-icon>{{ customer()!.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                                {{ customer()!.isActive ? 'Active' : 'Inactive' }}
                            </mat-chip>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button mat-raised-button color="primary" (click)="editCustomer()">
                            <mat-icon>edit</mat-icon>
                            Edit Customer
                        </button>
                    </div>
                </div>

                <mat-tab-group class="profile-tabs">
                    <mat-tab label="Customer Information">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>business_center</mat-icon>
                                        Customer Details
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Customer Code</label>
                                            <p>{{ customer()!.customerCode }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Customer Name</label>
                                            <p>{{ customer()!.customerName }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Contact Person</label>
                                            <p>{{ customer()!.contactName || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Phone</label>
                                            <p>{{ customer()!.phone || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Email</label>
                                            <p>{{ customer()!.email || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Status</label>
                                            <p>
                                                <mat-chip [class.status-active]="customer()!.isActive" [class.status-inactive]="!customer()!.isActive">
                                                    {{ customer()!.isActive ? 'Active' : 'Inactive' }}
                                                </mat-chip>
                                            </p>
                                        </div>
                                        <div class="info-item full-width">
                                            <label>Address</label>
                                            <p>{{ customer()!.address || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Created At</label>
                                            <p>{{ customer()!.createdAt | date: 'medium' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Last Updated</label>
                                            <p>{{ customer()!.updatedAt | date: 'medium' }}</p>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>

                    <mat-tab label="Product Prices">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>shopping_cart</mat-icon>
                                        Product Price List
                                    </mat-card-title>
                                    <button mat-raised-button color="primary" (click)="addPrice()">
                                        <mat-icon>add</mat-icon>
                                        Add Product Price
                                    </button>
                                </mat-card-header>
                                <mat-card-content>
                                    @if (prices().length > 0) {
                                        <table mat-table [dataSource]="prices()" class="prices-table">
                                            <ng-container matColumnDef="item">
                                                <th mat-header-cell *matHeaderCellDef>Product</th>
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
                                            <mat-icon>shopping_cart</mat-icon>
                                            <p>No product prices available</p>
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
            background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%);
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

        .customer-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .customer-avatar mat-icon {
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

        .customer-code {
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
            color: #43a047;
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
            color: #43a047;
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
export class CustomerDetailComponent implements OnInit {
    customer = signal<Customer | null>(null);
    prices = signal<CustomerItemPrice[]>([]);

    priceColumns = ['item', 'unitPrice', 'effectiveFrom', 'endDate', 'status', 'actions'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private customerService: CustomerService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadCustomer(id);
            this.loadPrices(id);
        }
    }

    loadCustomer(id: string) {
        this.customerService.getOne(id, false).subscribe({
            next: (customer) => {
                this.customer.set(customer);
            },
            error: () => {
                this.snackBar.open('Error loading customer', 'Close', { duration: 3000 });
                this.goBack();
            }
        });
    }

    loadPrices(id: string) {
        this.customerService.getPrices(id).subscribe({
            next: (prices) => {
                this.prices.set(prices);
            },
            error: () => {
                this.snackBar.open('Error loading prices', 'Close', { duration: 3000 });
            }
        });
    }

    goBack() {
        this.router.navigate(['/customers']);
    }

    editCustomer() {
        const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
            width: '600px',
            data: { mode: 'edit', customer: this.customer() }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadCustomer(this.customer()!.customerId);
            }
        });
    }

    addPrice() {
        const dialogRef = this.dialog.open(CustomerPriceDialogComponent, {
            width: '500px',
            data: { mode: 'create', customerId: this.customer()!.customerId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadPrices(this.customer()!.customerId);
            }
        });
    }

    editPrice(price: CustomerItemPrice) {
        const dialogRef = this.dialog.open(CustomerPriceDialogComponent, {
            width: '500px',
            data: { mode: 'edit', customerId: this.customer()!.customerId, price }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadPrices(this.customer()!.customerId);
            }
        });
    }

    deactivatePrice(price: CustomerItemPrice) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Deactivate Price',
                message: `Are you sure you want to deactivate this price for ${price.item?.itemName}?`,
                confirmText: 'Deactivate'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.customerService.deactivatePrice(
                    this.customer()!.customerId,
                    price.customerItemPriceId
                ).subscribe({
                    next: () => {
                        this.snackBar.open('Price deactivated successfully', 'Close', { duration: 3000 });
                        this.loadPrices(this.customer()!.customerId);
                    },
                    error: () => {
                        this.snackBar.open('Error deactivating price', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
