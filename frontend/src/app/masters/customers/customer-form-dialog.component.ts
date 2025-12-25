import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
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
                    <mat-label>Customer Code</mat-label>
                    <input matInput formControlName="customerCode" placeholder="CUS001" required>
                    <mat-error *ngIf="form.get('customerCode')?.hasError('required')">
                        Customer code is required
                    </mat-error>
                </mat-form-field>

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

                @if (data.mode === 'create') {
                    <div class="products-section">
                        <div class="section-header">
                            <h3>Products & Prices</h3>
                            <button mat-stroked-button type="button" color="primary" (click)="addProduct()">
                                <mat-icon>add</mat-icon> Add Product
                            </button>
                        </div>

                        @if (products.length > 0) {
                            <table class="products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price (Rs.)</th>
                                        <th>Effective Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody formArrayName="products">
                                    @for (product of products.controls; track $index) {
                                        <tr [formGroupName]="$index">
                                            <td>
                                                <mat-form-field appearance="outline" class="table-field">
                                                    <mat-select formControlName="itemId" required>
                                                        @for (item of finishedGoods(); track item.itemId) {
                                                            <mat-option [value]="item.itemId">
                                                                {{ item.itemName }} ({{ item.itemCode }})
                                                            </mat-option>
                                                        }
                                                    </mat-select>
                                                </mat-form-field>
                                            </td>
                                            <td>
                                                <mat-form-field appearance="outline" class="table-field">
                                                    <input matInput type="number" formControlName="unitPrice" 
                                                           placeholder="0.00" min="0.01" step="0.01" required>
                                                </mat-form-field>
                                            </td>
                                            <td>
                                                <mat-form-field appearance="outline" class="table-field">
                                                    <input matInput [matDatepicker]="picker" formControlName="effectiveFrom">
                                                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                                                    <mat-datepicker #picker></mat-datepicker>
                                                </mat-form-field>
                                            </td>
                                            <td class="action-cell">
                                                <button mat-icon-button type="button" color="warn" 
                                                        (click)="removeProduct($index)">
                                                    <mat-icon>delete</mat-icon>
                                                </button>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        } @else {
                            <div class="no-products">
                                <mat-icon>inventory_2</mat-icon>
                                <p>No products added yet. Add at least one product.</p>
                            </div>
                        }
                    </div>
                }
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
        .customer-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 700px;
            max-width: 900px;
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
            border-top: 1px solid #e0e0e0;
            padding-top: 16px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .section-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
        }

        .products-table th {
            text-align: left;
            padding: 8px;
            background-color: #f5f5f5;
            font-weight: 500;
            border-bottom: 2px solid #e0e0e0;
        }

        .products-table td {
            padding: 4px 8px;
            vertical-align: middle;
        }

        .table-field {
            width: 100%;
        }

        .table-field ::ng-deep .mat-mdc-form-field-wrapper {
            padding-bottom: 0;
        }

        .no-products {
            text-align: center;
            padding: 32px;
            color: #666;
        }

        .no-products mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            margin-bottom: 8px;
            color: #999;
        }
    `]
})
export class CustomerFormDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;
    finishedGoods = signal<Item[]>([]);

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
            customerCode: [
                { value: this.data.customer?.customerCode || '', disabled: this.data.mode === 'edit' },
                [Validators.required]
            ],
            customerName: [this.data.customer?.customerName || '', [Validators.required]],
            contactName: [this.data.customer?.contactName || ''],
            phone: [this.data.customer?.phone || ''],
            email: [this.data.customer?.email || '', [Validators.email]],
            address: [this.data.customer?.address || ''],
            products: this.fb.array([]),
        });

        if (this.data.mode === 'create') {
            this.loadFinishedGoods();
        }
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

    addProduct() {
        const productGroup = this.fb.group({
            itemId: ['', Validators.required],
            unitPrice: [0, [Validators.required, Validators.min(0.01)]],
            effectiveFrom: [new Date()],
        });
        this.products.push(productGroup);
    }

    removeProduct(index: number) {
        this.products.removeAt(index);
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
