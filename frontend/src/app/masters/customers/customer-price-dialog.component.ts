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
import { CustomerService, CustomerItemPrice } from '../services/customer.service';
import { ItemService, Item } from '../services/item.service';

@Component({
    selector: 'app-customer-price-dialog',
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
                    <mat-label>Item (Product)</mat-label>
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
export class CustomerPriceDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;
    items = signal<Item[]>([]);

    constructor(
        private fb: FormBuilder,
        private customerService: CustomerService,
        private itemService: ItemService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<CustomerPriceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            mode: 'create' | 'edit';
            customerId: string;
            price?: CustomerItemPrice;
        }
    ) {}

    ngOnInit() {
        this.loadItems();
        this.initForm();
    }

    loadItems() {
        this.itemService.getProducts().subscribe({
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
                ? this.customerService.createPrice(this.data.customerId, formValue)
                : this.customerService.updatePrice(
                    this.data.customerId,
                    this.data.price!.customerItemPriceId,
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
