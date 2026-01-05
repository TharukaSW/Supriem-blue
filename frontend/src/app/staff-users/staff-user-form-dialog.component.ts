import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StaffUser, StaffUserService } from './services/staff-user.service';

export type StaffUserDialogMode = 'create' | 'edit';

export interface StaffUserFormDialogData {
    mode: StaffUserDialogMode;
    user?: StaffUser;
}

@Component({
    selector: 'app-staff-user-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Admin / Manager' : 'Edit Admin / Manager' }}</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="staff-user-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" placeholder="Enter full name" required>
                    <mat-error *ngIf="form.get('fullName')?.hasError('required')">Full name is required</mat-error>
                </mat-form-field>

                @if (data.mode === 'create') {
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Role</mat-label>
                        <mat-select formControlName="roleId" required>
                            @for (role of roles(); track role.roleId) {
                                <mat-option [value]="role.roleId">{{ role.roleName }}</mat-option>
                            }
                        </mat-select>
                        <mat-error *ngIf="form.get('roleId')?.hasError('required')">Role is required</mat-error>
                    </mat-form-field>
                }

                <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Username</mat-label>
                        <input matInput formControlName="username" placeholder="Enter username" required>
                        <mat-error *ngIf="form.get('username')?.hasError('required')">Username is required</mat-error>
                        <mat-error *ngIf="form.get('username')?.hasError('minlength')">
                            Username must be at least 3 characters
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Email</mat-label>
                        <input matInput formControlName="email" type="email" placeholder="example@email.com">
                        <mat-error *ngIf="form.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
                    </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" placeholder="07X XXX XXXX">
                    <mat-error *ngIf="form.get('phone')?.hasError('pattern')">Please enter a valid phone number</mat-error>
                </mat-form-field>

                @if (data.mode === 'create') {
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Password</mat-label>
                        <input matInput formControlName="password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" required>
                        <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
                        <mat-error *ngIf="form.get('password')?.hasError('minlength')">Password must be at least 8 characters</mat-error>
                        <mat-error *ngIf="form.get('password')?.hasError('pattern')">Password must contain at least one uppercase letter and one number</mat-error>
                    </mat-form-field>
                }
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
        .staff-user-form {
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
            .staff-user-form { min-width: auto; }
            .form-row { flex-direction: column; gap: 0; }
        }
    `],
})
export class StaffUserFormDialogComponent implements OnInit {
    form: FormGroup;
    roles = signal<Array<{ roleId: number; roleName: string }>>([]);
    saving = signal(false);

    constructor(
        private fb: FormBuilder,
        private staffUserService: StaffUserService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<StaffUserFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: StaffUserFormDialogData,
    ) {
        this.form = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            roleId: [null, Validators.required],
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.email]],
            phone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
        });

        if (data.mode === 'edit') {
            this.form.get('password')?.clearValidators();
            this.form.get('password')?.updateValueAndValidity();

            this.form.patchValue({
                fullName: data.user?.fullName || '',
                roleId: data.user?.roleId ?? null,
                username: data.user?.username || '',
                email: data.user?.email || '',
                phone: data.user?.phone || '',
            });
        }
    }

    ngOnInit() {
        if (this.data.mode === 'create') {
            this.loadRoles();
        }
    }

    private loadRoles() {
        this.staffUserService.getRoles().subscribe({
            next: (roles) => {
                const allowed = roles.filter(r => r.roleName === 'ADMIN' || r.roleName === 'MANAGER');
                this.roles.set(allowed);
            },
            error: () => this.snackBar.open('Error loading roles', 'Close', { duration: 3000 }),
        });
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
        const formData = { ...this.form.value };

        if (!formData.password) {
            delete formData.password;
        }

        const req = this.data.mode === 'edit' && this.data.user?.userId
            ? this.staffUserService.update(this.data.user.userId, formData)
            : this.staffUserService.create(formData);

        req.subscribe({
            next: () => {
                this.snackBar.open('User saved successfully', 'Close', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving.set(false);
                this.snackBar.open(err.error?.message || 'Failed to save', 'Close', { duration: 5000 });
            },
        });
    }
}
