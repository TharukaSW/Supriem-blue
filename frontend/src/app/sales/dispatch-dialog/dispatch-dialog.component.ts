import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesService, CreateDispatchDto } from '../services/sales.service';

@Component({
    selector: 'app-dispatch-dialog',
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
        <h2 mat-dialog-title>Create Dispatch</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="dispatch-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Vehicle Number</mat-label>
                    <input matInput formControlName="vehicleNo" placeholder="e.g., CAR-1234">
                    <mat-error *ngIf="form.get('vehicleNo')?.hasError('required')">
                        Vehicle number is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Driver Name</mat-label>
                    <input matInput formControlName="driverName" placeholder="e.g., John Doe">
                    <mat-error *ngIf="form.get('driverName')?.hasError('required')">
                        Driver name is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Remarks</mat-label>
                    <textarea matInput formControlName="remarks" rows="3" placeholder="Additional notes..."></textarea>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!form.valid || saving" (click)="onSave()">
                {{ saving ? 'Creating...' : 'Create Dispatch' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .dispatch-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 450px;
            padding: 20px 0;
        }

        .full-width {
            width: 100%;
        }
    `]
})
export class DispatchDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private salesService: SalesService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DispatchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { salesOrderId: string }
    ) { }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.form = this.fb.group({
            vehicleNo: ['', Validators.required],
            driverName: ['', Validators.required],
            remarks: ['']
        });
    }

    onSave() {
        if (this.form.valid) {
            this.saving = true;
            const dto: CreateDispatchDto = {
                salesOrderId: this.data.salesOrderId,
                vehicleNo: this.form.value.vehicleNo,
                driverName: this.form.value.driverName,
                remarks: this.form.value.remarks
            };

            this.salesService.createDispatch(dto).subscribe({
                next: () => {
                    this.snackBar.open('Dispatch created successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error?.message || 'Error creating dispatch',
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
