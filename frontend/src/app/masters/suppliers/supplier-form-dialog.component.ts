import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SupplierService, Supplier, CreateSupplierPriceDto } from '../services/supplier.service';
import { ItemService, Item } from '../services/item.service';

@Component({
    selector: 'app-supplier-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatSelectModule,
        MatIconModule,
        MatTableModule,
        MatDatepickerModule,
        MatNativeDateModule,
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

                <div class="items-section">
                    <h3>Supplier Items & Prices</h3>
                    
                    <div class="add-item-form" *ngIf="data.mode === 'create'">
                        <mat-form-field appearance="outline" class="item-field">
                            <mat-label>Select Item</mat-label>
                            <mat-select [(value)]="selectedItemId">
                                <mat-option *ngFor="let item of availableItems" [value]="item.itemId">
                                    {{ item.itemCode }} - {{ item.itemName }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="price-field">
                            <mat-label>Unit Price</mat-label>
                            <input matInput type="number" step="0.01" min="0.01" [(ngModel)]="newItemPrice" [ngModelOptions]="{standalone: true}" placeholder="0.00">
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="date-field">
                            <mat-label>Effective From</mat-label>
                            <input matInput [matDatepicker]="picker" [(ngModel)]="newItemEffectiveFrom" [ngModelOptions]="{standalone: true}">
                            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                            <mat-datepicker #picker></mat-datepicker>
                        </mat-form-field>

                        <button mat-icon-button color="primary" (click)="addItem()" [disabled]="!selectedItemId || !newItemPrice">
                            <mat-icon>add</mat-icon>
                        </button>
                    </div>

                    <table mat-table [dataSource]="items.controls" class="items-table" *ngIf="items.length > 0">
                        <ng-container matColumnDef="item">
                            <th mat-header-cell *matHeaderCellDef>Item</th>
                            <td mat-cell *matCellDef="let itemControl">
                                {{ getItemName(itemControl.get('itemId')?.value) }}
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="unitPrice">
                            <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                            <td mat-cell *matCellDef="let itemControl">
                                {{ itemControl.get('unitPrice')?.value | number:'1.2-2' }}
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="effectiveFrom">
                            <th mat-header-cell *matHeaderCellDef>Effective From</th>
                            <td mat-cell *matCellDef="let itemControl">
                                {{ itemControl.get('effectiveFrom')?.value | date:'mediumDate' }}
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let itemControl; let i = index">
                                <button mat-icon-button color="warn" (click)="removeItem(i)" *ngIf="data.mode === 'create'">
                                    <mat-icon>delete</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>

                    <p *ngIf="items.length === 0" class="no-items error-message">
                        {{ data.mode === 'create' ? '⚠ At least one item is required. Add items using the form above.' : 'No items added yet. Use the Supplier Prices dialog to manage prices.' }}
                    </p>
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
            max-width: 1200px !important;
            width: 95vw !important;
        }

        .supplier-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 900px;
            max-width: 1200px;
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

        .items-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e0e0e0;
        }

        .items-section h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
        }

        .add-item-form {
            display: flex;
            gap: 12px;
            align-items: center;
            margin-bottom: 16px;
        }

        .item-field {
            flex: 2;
        }

        .price-field {
            flex: 1;
        }

        .date-field {
            flex: 1;
        }

        .items-table {
            width: 100%;
            margin-top: 16px;
        }

        .items-table th {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
        }

        .items-table td, .items-table th {
            padding: 12px 8px;
        }

        .no-items {
            text-align: center;
            color: rgba(0, 0, 0, 0.54);
            padding: 24px;
            font-style: italic;
        }

        .no-items.error-message {
            color: #d32f2f;
            font-weight: 500;
        }

        mat-dialog-content {
            max-height: 70vh;
            overflow-y: auto;
        }
    `]
})
export class SupplierFormDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;
    availableItems: Item[] = [];
    selectedItemId: string = '';
    newItemPrice: number | null = null;
    newItemEffectiveFrom: Date = new Date();
    displayedColumns: string[] = ['item', 'unitPrice', 'effectiveFrom', 'actions'];

    constructor(
        private fb: FormBuilder,
        private supplierService: SupplierService,
        private itemService: ItemService,
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
            items: this.fb.array([])
        });

        // Load items for selection
        this.loadItems();

        // Load existing prices if editing
        if (this.data.mode === 'edit' && this.data.supplier?.itemPrices) {
            this.data.supplier.itemPrices.forEach(price => {
                this.items.push(this.fb.group({
                    itemId: [price.itemId],
                    unitPrice: [price.unitPrice],
                    effectiveFrom: [price.effectiveFrom]
                }));
            });
        }
    }

    get items() {
        return this.form.get('items') as FormArray;
    }

    loadItems() {
        this.itemService.getRawMaterials().subscribe({
            next: (response) => {
                this.availableItems = response.data;
            },
            error: (error) => {
                this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
            }
        });
    }

    addItem() {
        if (this.selectedItemId && this.newItemPrice && this.newItemPrice > 0) {
            const itemExists = this.items.controls.some(
                control => control.get('itemId')?.value === this.selectedItemId
            );

            if (itemExists) {
                this.snackBar.open('This item is already added', 'Close', { duration: 3000 });
                return;
            }

            this.items.push(this.fb.group({
                itemId: [this.selectedItemId],
                unitPrice: [this.newItemPrice],
                effectiveFrom: [this.newItemEffectiveFrom || new Date()]
            }));

            // Reset inputs
            this.selectedItemId = '';
            this.newItemPrice = null;
            this.newItemEffectiveFrom = new Date();
        }
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    getItemName(itemId: string): string {
        const item = this.availableItems.find(i => i.itemId === itemId);
        return item ? `${item.itemCode} - ${item.itemName}` : itemId;
    }

    isFormValid(): boolean {
        if (this.data.mode === 'create') {
            return this.form.valid && this.items.length > 0;
        }
        return this.form.valid;
    }

    onSave() {
        // Validate items for create mode
        if (this.data.mode === 'create' && this.items.length === 0) {
            this.snackBar.open('At least one item is required', 'Close', { duration: 3000 });
            return;
        }

        if (this.form.valid) {
            this.saving = true;
            const formValue = this.form.getRawValue();

            if (this.data.mode === 'create') {
                // Format items for API - required for create
                const supplierData = {
                    supplierCode: formValue.supplierCode,
                    supplierName: formValue.supplierName,
                    contactName: formValue.contactName,
                    phone: formValue.phone,
                    email: formValue.email,
                    address: formValue.address,
                    items: formValue.items.map((item: any) => ({
                        itemId: item.itemId,
                        unitPrice: parseFloat(item.unitPrice),
                        effectiveFrom: item.effectiveFrom instanceof Date 
                            ? item.effectiveFrom.toISOString().split('T')[0]
                            : item.effectiveFrom
                    }))
                };

                this.supplierService.create(supplierData).subscribe({
                    next: () => {
                        this.snackBar.open('Supplier created successfully', 'Close', { duration: 3000 });
                        this.dialogRef.close(true);
                    },
                    error: (error) => {
                        console.error('Error creating supplier:', error);
                        this.snackBar.open(
                            error.error?.message || 'Error saving supplier',
                            'Close',
                            { duration: 3000 }
                        );
                        this.saving = false;
                    }
                });
            } else {
                // Edit mode - don't send items
                const updateData = {
                    supplierName: formValue.supplierName,
                    contactName: formValue.contactName,
                    phone: formValue.phone,
                    email: formValue.email,
                    address: formValue.address
                };

                this.supplierService.update(this.data.supplier!.supplierId, updateData).subscribe({
                    next: () => {
                        this.snackBar.open('Supplier updated successfully', 'Close', { duration: 3000 });
                        this.dialogRef.close(true);
                    },
                    error: (error) => {
                        console.error('Error updating supplier:', error);
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
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
