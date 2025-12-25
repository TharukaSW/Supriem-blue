import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatSnackBarModule,
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ isEdit ? 'Edit User' : 'New User' }}</h1>
      </div>

      <mat-card class="form-container">
        <mat-card-content>
          <form (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput [(ngModel)]="form.fullName" name="fullName" required>
              </mat-form-field>
            </div>

            @if (!isEdit) {
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Role</mat-label>
                  <mat-select [(ngModel)]="form.roleId" name="roleId" required>
                    @for (role of roles(); track role.roleId) {
                      <mat-option [value]="role.roleId">{{ role.roleName }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            }

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput [(ngModel)]="form.username" name="username">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="form.email" name="email" type="email">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput [(ngModel)]="form.phone" name="phone">
              </mat-form-field>
            </div>

            @if (!isEdit) {
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput [(ngModel)]="form.password" name="password" type="password" required>
                </mat-form-field>
              </div>
            }

            <div class="actions">
              <button mat-button type="button" routerLink="/users">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
    isEdit = false;
    userId: string | null = null;
    roles = signal<any[]>([]);
    saving = signal(false);
    form: any = { fullName: '', roleId: 3, username: '', email: '', phone: '', password: '' };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private api: ApiService,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadRoles();
        this.userId = this.route.snapshot.paramMap.get('id');
        if (this.userId && this.userId !== 'new') {
            this.isEdit = true;
            this.loadUser();
        }
    }

    loadRoles() {
        this.api.get<any[]>('users/roles').subscribe({
            next: (res) => this.roles.set(res),
        });
    }

    loadUser() {
        this.api.get<any>(`users/${this.userId}`).subscribe({
            next: (res) => {
                this.form = { ...res };
            },
        });
    }

    onSubmit() {
        this.saving.set(true);
        const req = this.isEdit
            ? this.api.put(`users/${this.userId}`, this.form)
            : this.api.post('users', this.form);

        req.subscribe({
            next: (res: any) => {
                this.snackBar.open('User saved successfully', 'Close', { duration: 3000 });
                // Navigate to profile page if editing, otherwise to list
                if (this.isEdit) {
                    this.router.navigate(['/users', this.userId]);
                } else {
                    this.router.navigate(['/users', res.userId]);
                }
            },
            error: (err) => {
                this.saving.set(false);
                this.snackBar.open(err.error?.message || 'Failed to save', 'Close', { duration: 5000 });
            },
        });
    }
}
