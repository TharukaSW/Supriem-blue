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
