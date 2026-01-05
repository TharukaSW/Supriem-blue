import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Labourer, LabourerService } from './services/labourer.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export type LabourerDialogMode = 'create' | 'edit';

export interface LabourerFormDialogData {
    mode: LabourerDialogMode;
    labourer?: Labourer;
}

@Component({
    selector: 'app-labourer-form-dialog',
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
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Labourer' : 'Edit Labourer' }}</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="labourer-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" placeholder="Enter full name" required>
                    <mat-error *ngIf="form.get('fullName')?.hasError('required')">Full name is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" rows="3" placeholder="Enter address"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" placeholder="07X XXX XXXX">
                    <mat-error *ngIf="form.get('phone')?.hasError('pattern')">Please enter a valid phone number</mat-error>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="saving() || form.invalid" (click)="onSave()">
                {{ saving() ? 'Saving...' : 'Save' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .labourer-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 520px;
            padding: 12px 0;
        }

        .full-width { width: 100%; }

        .form-row {
            display: flex;
            gap: 16px;
        }

        .half-width { flex: 1; }

        @media (max-width: 768px) {
            .labourer-form { min-width: auto; }
            .form-row { flex-direction: column; gap: 0; }
        }
    `],
})
export class LabourerFormDialogComponent {
    form: FormGroup;
    saving = signal(false);

    constructor(
        private fb: FormBuilder,
        private labourerService: LabourerService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<LabourerFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LabourerFormDialogData,
    ) {
        this.form = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
            address: [''],
        });

        if (data.mode === 'edit') {
            this.form.patchValue({
                fullName: data.labourer?.fullName || '',
                phone: data.labourer?.phone || '',
                address: data.labourer?.employeeProfile?.address || '',
            });
        }
    }

    private generateSystemPassword(): string {
        // Backend requires: min 8 chars, at least 1 uppercase and 1 number.
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const all = letters + upper + numbers;

        const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

        const base = [pick(upper), pick(numbers)];
        while (base.length < 10) base.push(pick(all));
        for (let i = base.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [base[i], base[j]] = [base[j], base[i]];
        }
        return base.join('');
    }

    onCancel() {
        this.dialogRef.close(false);
    }

    onSave() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.saving.set(true);
        const formData: any = { ...this.form.value };
        const address = String(formData.address || '').trim();
        const hasAddress = !!address;

        const userUpdatePayload = {
            fullName: formData.fullName,
            phone: formData.phone,
        };

        const req = this.data.mode === 'edit' && this.data.labourer?.userId
            ? this.labourerService.update(this.data.labourer.userId, userUpdatePayload).pipe(
                switchMap(() => {
                    if (!hasAddress) return of(true);
                    return this.labourerService.updateEmployeeProfile(this.data.labourer!.userId, { address });
                })
            )
            : this.labourerService.create({
                ...userUpdatePayload,
                roleId: 3,
                password: this.generateSystemPassword(),
            }).pipe(
                switchMap((created) => {
                    if (!hasAddress) return of(created);
                    return this.labourerService.updateEmployeeProfile(created.userId, { address }).pipe(
                        switchMap(() => of(created))
                    );
                })
            );

        req.subscribe({
            next: () => {
                this.snackBar.open('Labourer saved successfully', 'Close', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving.set(false);
                this.snackBar.open(err.error?.message || 'Failed to save', 'Close', { duration: 5000 });
            },
        });
    }
}
