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
                <div class="page-header">
                    <div class="header-content">
                        <button mat-icon-button (click)="goBack()">
                            <mat-icon>arrow_back</mat-icon>
                        </button>
                        <div>
                            <h1>{{ customer()!.customerName }}</h1>
                            <p>{{ customer()!.customerCode }}</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button mat-raised-button (click)="editCustomer()">
                            <mat-icon>edit</mat-icon>
                            Edit
                        </button>
                    </div>
                </div>

                <mat-tab-group>
                    <mat-tab label="Information">
                        <div class="tab-content">
                            <mat-card>
                                <mat-card-header>
                                    <mat-card-title>Customer Details</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Code:</label>
                                            <span>{{ customer()!.customerCode }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Name:</label>
                                            <span>{{ customer()!.customerName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Contact Person:</label>
                                            <span>{{ customer()!.contactName || '-' }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Phone:</label>
                                            <span>{{ customer()!.phone || '-' }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Email:</label>
                                            <span>{{ customer()!.email || '-' }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Status:</label>
                                            <mat-chip [class.active]="customer()!.isActive" [class.inactive]="!customer()!.isActive">
                                                {{ customer()!.isActive ? 'Active' : 'Inactive' }}
                                            </mat-chip>
                                        </div>
                                        <div class="info-item full-width">
                                            <label>Address:</label>
                                            <span>{{ customer()!.address || '-' }}</span>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>

                    <mat-tab label="Price List">
                        <div class="tab-content">
                            <div class="tab-header">
                                <h2>Item Prices</h2>
                                <button mat-raised-button color="primary" (click)="addPrice()">
                                    <mat-icon>add</mat-icon>
                                    Add Price
                                </button>
                            </div>

                            <table mat-table [dataSource]="prices()" class="prices-table">
                                <ng-container matColumnDef="item">
                                    <th mat-header-cell *matHeaderCellDef>Item</th>
                                    <td mat-cell *matCellDef="let price">
                                        <div>
                                            <strong>{{ price.item?.itemCode }}</strong>
                                            <div class="text-muted">{{ price.item?.itemName }}</div>
                                        </div>
                                    </td>
                                </ng-container>

                                <ng-container matColumnDef="unitPrice">
                                    <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                                    <td mat-cell *matCellDef="let price">
                                        LKR {{ price.unitPrice | number:'1.2-2' }}
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
                                        <mat-chip [class.active]="price.isActive" [class.inactive]="!price.isActive">
                                            {{ price.isActive ? 'Active' : 'Inactive' }}
                                        </mat-chip>
                                    </td>
                                </ng-container>

                                <ng-container matColumnDef="actions">
                                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                                    <td mat-cell *matCellDef="let price">
                                        <button mat-icon-button (click)="editPrice(price)" matTooltip="Edit Price">
                                            <mat-icon>edit</mat-icon>
                                        </button>
                                        <button mat-icon-button 
                                                *ngIf="price.isActive"
                                                (click)="deactivatePrice(price)" 
                                                matTooltip="Deactivate"
                                                color="warn">
                                            <mat-icon>block</mat-icon>
                                        </button>
                                    </td>
                                </ng-container>

                                <tr mat-header-row *matHeaderRowDef="priceColumns"></tr>
                                <tr mat-row *matRowDef="let row; columns: priceColumns;"></tr>
                            </table>

                            @if (prices().length === 0) {
                                <div class="no-data">
                                    <mat-icon>attach_money</mat-icon>
                                    <p>No prices defined yet</p>
                                    <button mat-raised-button color="primary" (click)="addPrice()">
                                        Add First Price
                                    </button>
                                </div>
                            }
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

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .header-content h1 {
            margin: 0;
            font-size: 28px;
        }

        .header-content p {
            margin: 4px 0 0 0;
            color: #666;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .tab-content {
            padding: 24px 0;
        }

        .tab-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .tab-header h2 {
            margin: 0;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-top: 16px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .info-item.full-width {
            grid-column: 1 / -1;
        }

        .info-item label {
            font-weight: 500;
            color: #666;
            font-size: 0.9em;
        }

        .prices-table {
            width: 100%;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .text-muted {
            color: #666;
            font-size: 0.9em;
        }

        .unit-text {
            color: #666;
            font-size: 0.9em;
        }

        mat-chip.active {
            background-color: #4caf50;
            color: white;
        }

        mat-chip.inactive {
            background-color: #f44336;
            color: white;
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
    ) {}

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
