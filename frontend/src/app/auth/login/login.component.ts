import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <h1>SUPREME BLUE</h1>
            <p>Water Bottling Factory ERP</p>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>User Code / Username</mat-label>
              <input matInput [(ngModel)]="username" name="username" required placeholder="SBA001">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [(ngModel)]="password" name="password" type="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width login-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Login
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 32px;
    }

    mat-card-header {
      justify-content: center;
      margin-bottom: 24px;
    }

    mat-card-title {
      text-align: center;

      h1 {
        margin: 0;
        color: #1a237e;
        font-size: 1.75rem;
      }

      p {
        margin: 4px 0 0;
        color: #666;
        font-size: 0.875rem;
      }
    }

    .login-btn {
      height: 48px;
      font-size: 1rem;
      margin-top: 16px;
    }

    mat-form-field {
      margin-bottom: 8px;
    }
  `],
})
export class LoginComponent {
    username = '';
    password = '';
    loading = signal(false);

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar,
    ) {
        if (authService.isAuthenticated()) {
            router.navigate(['/dashboard']);
        }
    }

    onSubmit() {
        if (!this.username || !this.password) {
            this.snackBar.open('Please enter username and password', 'Close', { duration: 3000 });
            return;
        }

        this.loading.set(true);
        this.authService.login(this.username, this.password).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                const message = err.error?.message || 'Login failed. Please try again.';
                this.snackBar.open(message, 'Close', { duration: 5000 });
            },
        });
    }
}
