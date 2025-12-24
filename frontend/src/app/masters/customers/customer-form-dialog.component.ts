import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerService, Customer } from '../services/customer.service';

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
        .customer-form {
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
export class CustomerFormDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private customerService: CustomerService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<CustomerFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; customer?: Customer }
    ) {}

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
        });
    }

    onSave() {
        if (this.form.valid) {
            this.saving = true;
            const formValue = this.form.getRawValue();

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
