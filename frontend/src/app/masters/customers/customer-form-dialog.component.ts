import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerService, Customer } from '../services/customer.service';
import { ItemService, Item } from '../services/item.service';

@Component({
    selector: 'app-customer-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTableModule,
        MatIconModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Customer' : 'Edit Customer' }}</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="customer-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Customer Name</mat-label>
                    <input matInput formControlName="customerName" placeholder="XYZ Trading Ltd" required>
                    <mat-error *ngIf="form.get('customerName')?.hasError('required')">
                        Customer name is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Contact Name</mat-label>
                    <input matInput formControlName="contactName" placeholder="Jane Doe">
                </mat-form-field>

                <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Phone</mat-label>
                        <input matInput formControlName="phone" placeholder="+94771234567">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Email</mat-label>
                        <input matInput formControlName="email" type="email" placeholder="customer@example.com">
                        <mat-error *ngIf="form.get('email')?.hasError('email')">
                            Invalid email format
                        </mat-error>
                    </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" rows="3" placeholder="456 Business Park, Colombo"></textarea>
                </mat-form-field>

                <div class="products-section">
                    <h3>Customer Products & Prices</h3>
                    
                    <div class="add-product-form" *ngIf="data.mode === 'create'">
                        <mat-form-field appearance="outline" class="product-field">
                            <mat-label>Select Product</mat-label>
                            <mat-select [(value)]="selectedProductId">
                                @for (item of finishedGoods(); track item.itemId) {
                                    <mat-option [value]="item.itemId">
                                        {{ item.itemCode }} - {{ item.itemName }}
                                    </mat-option>
                                }
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="price-field">
                            <mat-label>Unit Price</mat-label>
                            <input matInput type="number" step="0.01" min="0.01" [(ngModel)]="newProductPrice" [ngModelOptions]="{standalone: true}" placeholder="0.00">
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="date-field">
                            <mat-label>Effective From</mat-label>
                            <input matInput [matDatepicker]="picker" [(ngModel)]="newProductEffectiveFrom" [ngModelOptions]="{standalone: true}">
                            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                            <mat-datepicker #picker></mat-datepicker>
                        </mat-form-field>

                        <button mat-icon-button color="primary" (click)="addProduct()" [disabled]="!selectedProductId || !newProductPrice">
                            <mat-icon>add</mat-icon>
                        </button>
                    </div>

                    <div class="products-list-section">
                        <div *ngIf="products.length > 0" class="products-count-badge">
                            {{ products.length }} product{{ products.length > 1 ? 's' : '' }} added
                        </div>
                        
                        <table mat-table [dataSource]="productsDataSource" class="products-table" *ngIf="products.length > 0">
                            <ng-container matColumnDef="product">
                                <th mat-header-cell *matHeaderCellDef>Product</th>
                                <td mat-cell *matCellDef="let productControl">
                                    {{ getProductName(productControl.get('itemId')?.value) }}
                                </td>
                            </ng-container>

                            <ng-container matColumnDef="unitPrice">
                                <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                                <td mat-cell *matCellDef="let productControl">
                                    Rs. {{ productControl.get('unitPrice')?.value | number:'1.2-2' }}
                                </td>
                            </ng-container>

                            <ng-container matColumnDef="effectiveFrom">
                                <th mat-header-cell *matHeaderCellDef>Effective From</th>
                                <td mat-cell *matCellDef="let productControl">
                                    {{ productControl.get('effectiveFrom')?.value | date:'mediumDate' }}
                                </td>
                            </ng-container>

                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>Actions</th>
                                <td mat-cell *matCellDef="let productControl; let i = index">
                                    <button mat-icon-button color="warn" (click)="removeProduct(i)" *ngIf="data.mode === 'create'" title="Remove product">
                                        <mat-icon>delete</mat-icon>
                                    </button>
                                </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                        </table>

                        <p *ngIf="products.length === 0" class="no-products error-message">
                            {{ data.mode === 'create' ? '⚠ At least one product is required. Add products using the form above.' : 'No products added yet. Use the Customer Prices dialog to manage prices.' }}
                        </p>
                    </div>
                </div>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!isFormValid() || saving" (click)="onSave()">
                {{ saving ? 'Saving...' : 'Save' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        :host ::ng-deep .mat-mdc-dialog-container {
            width: auto !important;
            max-width: none !important;
        }

        .customer-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 800px;
            max-width: 1100px;
            padding: 20px 0;
        }

        .full-width {
            width: 100%;
        }

        .form-row {
            display: flex;
            gap: 16px;
        }

        .half-width {
            flex: 1;
        }

        .products-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e0e0e0;
        }

        .products-section h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
        }

        .add-product-form {
            display: flex;
            gap: 12px;
            align-items: center;
            margin-bottom: 16px;
        }

        .product-field {
            flex: 2;
        }

        .price-field {
            flex: 1;
        }

        .date-field {
            flex: 1;
        }

        .products-list-section {
            position: relative;
            margin-top: 16px;
        }

        .products-count-badge {
            display: inline-block;
            background: #1976d2;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 12px;
        }

        .products-table {
            width: 100%;
            margin-top: 8px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }

        .products-table th {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
            background-color: #f5f5f5;
        }

        .products-table td, .products-table th {
            padding: 12px 8px;
        }

        .products-table tr:hover {
            background-color: #f5f5f5;
        }

        .no-products {
            text-align: center;
            color: rgba(0, 0, 0, 0.54);
            padding: 24px;
            font-style: italic;
        }

        .no-products.error-message {
            color: #d32f2f;
            font-weight: 500;
        }

        mat-dialog-content {
            max-height: 70vh;
            overflow-y: auto;
        }
    `]
})
export class CustomerFormDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;
    finishedGoods = signal<Item[]>([]);
    selectedProductId: string = '';
    newProductPrice: number | null = null;
    newProductEffectiveFrom: Date = new Date();
    displayedColumns: string[] = ['product', 'unitPrice', 'effectiveFrom', 'actions'];
    productsDataSource: any[] = [];

    constructor(
        private fb: FormBuilder,
        private customerService: CustomerService,
        private itemService: ItemService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<CustomerFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; customer?: Customer }
    ) { }

    get products() {
        return this.form.get('products') as FormArray;
    }

    ngOnInit() {
        this.form = this.fb.group({
            customerName: [this.data.customer?.customerName || '', [Validators.required]],
            contactName: [this.data.customer?.contactName || ''],
            phone: [this.data.customer?.phone || ''],
            email: [this.data.customer?.email || '', [Validators.email]],
            address: [this.data.customer?.address || ''],
            products: this.fb.array([]),
        });

        // Load finished goods for selection
        this.loadFinishedGoods();

        // Load existing prices if editing
        if (this.data.mode === 'edit' && this.data.customer?.itemPrices) {
            this.data.customer.itemPrices.forEach(price => {
                this.products.push(this.fb.group({
                    itemId: [price.itemId],
                    unitPrice: [price.unitPrice],
                    effectiveFrom: [price.effectiveFrom]
                }));
            });
        }
        
        // Initialize data source
        this.updateDataSource();
    }

    loadFinishedGoods() {
        this.itemService.getAll({ limit: 1000, itemType: 'PRODUCT' as any, isActive: true }).subscribe({
            next: (res: any) => {
                this.finishedGoods.set(res.data || []);
            },
            error: () => {
                this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
            }
        });
    }

    updateDataSource() {
        this.productsDataSource = [...this.products.controls];
    }

    addProduct() {
        if (this.selectedProductId && this.newProductPrice && this.newProductPrice > 0) {
            const productExists = this.products.controls.some(
                control => control.get('itemId')?.value === this.selectedProductId
            );

            if (productExists) {
                this.snackBar.open('This product is already added', 'Close', { duration: 3000 });
                return;
            }

            this.products.push(this.fb.group({
                itemId: [this.selectedProductId],
                unitPrice: [this.newProductPrice],
                effectiveFrom: [this.newProductEffectiveFrom || new Date()]
            }));

            // Update the data source to refresh the table
            this.updateDataSource();

            // Get product name for success message
            const productName = this.getProductName(this.selectedProductId);
            this.snackBar.open(`Added: ${productName}`, 'Close', { duration: 2000 });

            // Reset inputs
            this.selectedProductId = '';
            this.newProductPrice = null;
            this.newProductEffectiveFrom = new Date();
        }
    }

    removeProduct(index: number) {
        this.products.removeAt(index);
        this.updateDataSource();
    }

    getProductName(itemId: string): string {
        const item = this.finishedGoods().find(i => i.itemId === itemId);
        return item ? `${item.itemCode} - ${item.itemName}` : itemId;
    }

    isFormValid(): boolean {
        if (!this.form.valid) return false;
        if (this.data.mode === 'create' && this.products.length === 0) return false;
        return true;
    }

    onSave() {
        if (this.isFormValid()) {
            this.saving = true;
            const formValue = this.form.getRawValue();

            if (this.data.mode === 'create') {
                // Format products for API
                formValue.products = formValue.products.map((p: any) => ({
                    itemId: p.itemId,
                    unitPrice: Number(p.unitPrice),
                    effectiveFrom: p.effectiveFrom ? new Date(p.effectiveFrom).toISOString().split('T')[0] : undefined,
                }));
            }

            const observable = this.data.mode === 'create'
                ? this.customerService.create(formValue)
                : this.customerService.update(this.data.customer!.customerId, formValue);

            observable.subscribe({
                next: () => {
                    this.snackBar.open(
                        `Customer ${this.data.mode === 'create' ? 'created' : 'updated'} successfully`,
                        'Close',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error?.message || 'Error saving customer',
                        'Close',
                        { duration: 3000 }
                    );
                    this.saving = false;
                }
            });
        }
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
