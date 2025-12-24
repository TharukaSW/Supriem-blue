# Frontend Component Templates
# Supreme Blue ERP - Partner Management Module

## Component 1: Confirm Dialog Component

**File:** `frontend/src/app/core/components/confirm-dialog.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <mat-dialog-content>
            <p>{{ data.message }}</p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">
                {{ data.cancelText || 'Cancel' }}
            </button>
            <button mat-raised-button color="warn" (click)="onConfirm()">
                {{ data.confirmText || 'Confirm' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        mat-dialog-content {
            min-width: 300px;
            padding: 20px 0;
        }
    `]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
```

## Component 2: Supplier Form Dialog

**File:** `frontend/src/app/masters/suppliers/supplier-form-dialog.component.ts`

```typescript
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupplierService, Supplier } from '../services/supplier.service';

@Component({
    selector: 'app-supplier-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Supplier' : 'Edit Supplier' }}</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="supplier-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Supplier Code</mat-label>
                    <input matInput formControlName="supplierCode" placeholder="SUP001" required>
                    <mat-error *ngIf="form.get('supplierCode')?.hasError('required')">
                        Supplier code is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Supplier Name</mat-label>
                    <input matInput formControlName="supplierName" placeholder="ABC Plastics Pvt Ltd" required>
                    <mat-error *ngIf="form.get('supplierName')?.hasError('required')">
                        Supplier name is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Contact Name</mat-label>
                    <input matInput formControlName="contactName" placeholder="John Smith">
                </mat-form-field>

                <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Phone</mat-label>
                        <input matInput formControlName="phone" placeholder="+94771234567">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Email</mat-label>
                        <input matInput formControlName="email" type="email" placeholder="supplier@example.com">
                        <mat-error *ngIf="form.get('email')?.hasError('email')">
                            Invalid email format
                        </mat-error>
                    </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" rows="3" placeholder="123 Industrial Zone, Colombo"></textarea>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!form.valid || saving" (click)="onSave()">
                {{ saving ? 'Saving...' : 'Save' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .supplier-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 500px;
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
    `]
})
export class SupplierFormDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private supplierService: SupplierService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<SupplierFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; supplier?: Supplier }
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            supplierCode: [
                { value: this.data.supplier?.supplierCode || '', disabled: this.data.mode === 'edit' },
                [Validators.required]
            ],
            supplierName: [this.data.supplier?.supplierName || '', [Validators.required]],
            contactName: [this.data.supplier?.contactName || ''],
            phone: [this.data.supplier?.phone || ''],
            email: [this.data.supplier?.email || '', [Validators.email]],
            address: [this.data.supplier?.address || ''],
        });
    }

    onSave() {
        if (this.form.valid) {
            this.saving = true;
            const formValue = this.form.getRawValue();

            const observable = this.data.mode === 'create'
                ? this.supplierService.create(formValue)
                : this.supplierService.update(this.data.supplier!.supplierId, formValue);

            observable.subscribe({
                next: () => {
                    this.snackBar.open(
                        `Supplier ${this.data.mode === 'create' ? 'created' : 'updated'} successfully`,
                        'Close',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error?.message || 'Error saving supplier',
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
```

## Component 3: Supplier Price Dialog

**File:** `frontend/src/app/masters/suppliers/supplier-price-dialog.component.ts`

```typescript
import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupplierService, SupplierItemPrice } from '../services/supplier.service';
import { ItemService, Item } from '../services/item.service';

@Component({
    selector: 'app-supplier-price-dialog',
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
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Item Price' : 'Edit Item Price' }}</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="price-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Item (Raw Material)</mat-label>
                    <mat-select formControlName="itemId" required>
                        @for (item of items(); track item.itemId) {
                            <mat-option [value]="item.itemId">
                                {{ item.itemCode }} - {{ item.itemName }}
                                @if (item.unit) {
                                    <span class="unit-badge">({{ item.unit.symbol }})</span>
                                }
                            </mat-option>
                        }
                    </mat-select>
                    <mat-error *ngIf="form.get('itemId')?.hasError('required')">
                        Please select an item
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Unit Price (LKR)</mat-label>
                    <input matInput type="number" formControlName="unitPrice" placeholder="0.00" required step="0.01">
                    <mat-error *ngIf="form.get('unitPrice')?.hasError('required')">
                        Unit price is required
                    </mat-error>
                    <mat-error *ngIf="form.get('unitPrice')?.hasError('min')">
                        Unit price must be greater than 0
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Effective From Date</mat-label>
                    <input matInput [matDatepicker]="pickerFrom" formControlName="effectiveFrom" required>
                    <mat-datepicker-toggle matSuffix [for]="pickerFrom"></mat-datepicker-toggle>
                    <mat-datepicker #pickerFrom></mat-datepicker>
                    <mat-error *ngIf="form.get('effectiveFrom')?.hasError('required')">
                        Effective from date is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>End Date (Optional)</mat-label>
                    <input matInput [matDatepicker]="pickerEnd" formControlName="endDate">
                    <mat-datepicker-toggle matSuffix [for]="pickerEnd"></mat-datepicker-toggle>
                    <mat-datepicker #pickerEnd></mat-datepicker>
                    <mat-hint>Leave blank for indefinite pricing</mat-hint>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!form.valid || saving" (click)="onSave()">
                {{ saving ? 'Saving...' : 'Save' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .price-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 450px;
            padding: 20px 0;
        }

        .full-width {
            width: 100%;
        }

        .unit-badge {
            color: #666;
            font-size: 0.9em;
            margin-left: 4px;
        }
    `]
})
export class SupplierPriceDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;
    items = signal<Item[]>([]);

    constructor(
        private fb: FormBuilder,
        private supplierService: SupplierService,
        private itemService: ItemService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<SupplierPriceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            mode: 'create' | 'edit';
            supplierId: string;
            price?: SupplierItemPrice;
        }
    ) {}

    ngOnInit() {
        this.loadItems();
        this.initForm();
    }

    loadItems() {
        this.itemService.getRawMaterials().subscribe({
            next: (response) => {
                this.items.set(response.data);
            },
            error: () => {
                this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
            }
        });
    }

    initForm() {
        const today = new Date();
        this.form = this.fb.group({
            itemId: [
                { value: this.data.price?.itemId || '', disabled: this.data.mode === 'edit' },
                [Validators.required]
            ],
            unitPrice: [this.data.price?.unitPrice || '', [Validators.required, Validators.min(0.01)]],
            effectiveFrom: [
                this.data.price?.effectiveFrom ? new Date(this.data.price.effectiveFrom) : today,
                [Validators.required]
            ],
            endDate: [this.data.price?.endDate ? new Date(this.data.price.endDate) : null],
        });
    }

    onSave() {
        if (this.form.valid) {
            this.saving = true;
            const formValue = {
                ...this.form.getRawValue(),
                effectiveFrom: this.formatDate(this.form.value.effectiveFrom),
                endDate: this.form.value.endDate ? this.formatDate(this.form.value.endDate) : undefined,
            };

            const observable = this.data.mode === 'create'
                ? this.supplierService.createPrice(this.data.supplierId, formValue)
                : this.supplierService.updatePrice(
                    this.data.supplierId,
                    this.data.price!.supplierItemPriceId,
                    { unitPrice: formValue.unitPrice, endDate: formValue.endDate }
                );

            observable.subscribe({
                next: () => {
                    this.snackBar.open(
                        `Price ${this.data.mode === 'create' ? 'added' : 'updated'} successfully`,
                        'Close',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error?.message || 'Error saving price',
                        'Close',
                        { duration: 3000 }
                    );
                    this.saving = false;
                }
            });
        }
    }

    formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
```

## Component 4: Supplier Detail with Price Tab

**File:** `frontend/src/app/masters/suppliers/supplier-detail.component.ts`

```typescript
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
                <div class="page-header">
                    <div class="header-content">
                        <button mat-icon-button (click)="goBack()">
                            <mat-icon>arrow_back</mat-icon>
                        </button>
                        <div>
                            <h1>{{ supplier()!.supplierName }}</h1>
                            <p>{{ supplier()!.supplierCode }}</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button mat-raised-button (click)="editSupplier()">
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
                                    <mat-card-title>Supplier Details</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Code:</label>
                                            <span>{{ supplier()!.supplierCode }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Name:</label>
                                            <span>{{ supplier()!.supplierName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Contact Person:</label>
                                            <span>{{ supplier()!.contactName || '-' }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Phone:</label>
                                            <span>{{ supplier()!.phone || '-' }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Email:</label>
                                            <span>{{ supplier()!.email || '-' }}</span>
                                        </div>
                                        <div class="info-item">
                                            <label>Status:</label>
                                            <mat-chip [class.active]="supplier()!.isActive" [class.inactive]="!supplier()!.isActive">
                                                {{ supplier()!.isActive ? 'Active' : 'Inactive' }}
                                            </mat-chip>
                                        </div>
                                        <div class="info-item full-width">
                                            <label>Address:</label>
                                            <span>{{ supplier()!.address || '-' }}</span>
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
            width: '600px',
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
```

---

## Customer Components

The customer components are identical to supplier components with these changes:
1. Replace "Supplier" with "Customer" in all names
2. Replace "supplierService" with "customerService"
3. In price dialog, use `itemService.getProducts()` instead of `getRawMaterials()`
4. Update all IDs and properties (supplierId → customerId, etc.)

Create these files:
- `customers/customers-list.component.ts` (same as suppliers-list)
- `customers/customer-form-dialog.component.ts` (same as supplier-form-dialog)
- `customers/customer-detail.component.ts` (same as supplier-detail)
- `customers/customer-price-dialog.component.ts` (same as supplier-price-dialog, but for PRODUCT items)

---

## Setup Instructions

1. **Create all component files** using the templates above
2. **Update routing** in `app.routes.ts` with the routes specified in the main README
3. **Update existing placeholder files** in `masters/suppliers/` and `masters/customers/`
4. **Run migration**: `npm run prisma:migrate` in backend
5. **Start backend**: `npm run start:dev`
6. **Start frontend**: `ng serve`
7. **Test all functionality** using the manual testing checklist

All services are ready, backend is complete. Just create the Angular components from these templates!
