import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';

interface Employee {
    userId: string;
    userCode: string;
    fullName: string;
}

interface AttendanceRecord {
    attendanceId: string;
    userId: string;
    workDate: string;
    timeIn: string | null;
    timeOut: string | null;
    systemHours: number;
    manualOtHours: number;
    user: { userCode: string; fullName: string };
}

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatTableModule,
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Attendance</h1>
      </div>

      <mat-card class="clock-card">
        <mat-card-header>
          <mat-card-title>Clock In / Out</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="clock-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Employee</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="searchEmployees()" 
                     placeholder="Employee code or name" [matAutocomplete]="auto">
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectEmployee($event.option.value)">
                @for (emp of employees(); track emp.userId) {
                  <mat-option [value]="emp">
                    {{ emp.userCode }} - {{ emp.fullName }}
                  </mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>

            @if (selectedEmployee()) {
              <div class="selected-employee">
                <strong>{{ selectedEmployee()?.userCode }}</strong> - {{ selectedEmployee()?.fullName }}
              </div>
            }

            <div class="clock-buttons">
              <button mat-raised-button color="primary" (click)="clockIn()" [disabled]="!selectedEmployee() || processing()">
                <mat-icon>login</mat-icon>
                Clock IN
              </button>
              <button mat-raised-button color="accent" (click)="clockOut()" [disabled]="!selectedEmployee() || processing()">
                <mat-icon>logout</mat-icon>
                Clock OUT
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="records-card">
        <mat-card-header>
          <mat-card-title>Today's Records</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="records()" class="full-width">
              <ng-container matColumnDef="userCode">
                <th mat-header-cell *matHeaderCellDef>Employee</th>
                <td mat-cell *matCellDef="let row">{{ row.user?.userCode }} - {{ row.user?.fullName }}</td>
              </ng-container>
              <ng-container matColumnDef="timeIn">
                <th mat-header-cell *matHeaderCellDef>Time In</th>
                <td mat-cell *matCellDef="let row">{{ formatTime(row.timeIn) }}</td>
              </ng-container>
              <ng-container matColumnDef="timeOut">
                <th mat-header-cell *matHeaderCellDef>Time Out</th>
                <td mat-cell *matCellDef="let row">{{ formatTime(row.timeOut) }}</td>
              </ng-container>
              <ng-container matColumnDef="hours">
                <th mat-header-cell *matHeaderCellDef>Hours</th>
                <td mat-cell *matCellDef="let row">{{ row.systemHours }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .clock-card {
      margin-bottom: 24px;
    }

    .clock-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 500px;
    }

    .search-field {
      width: 100%;
    }

    .selected-employee {
      padding: 12px 16px;
      background: #e3f2fd;
      border-radius: 8px;
    }

    .clock-buttons {
      display: flex;
      gap: 16px;

      button {
        flex: 1;
        height: 56px;
      }
    }

    .records-card {
      min-height: 300px;
    }
  `],
})
export class AttendanceComponent implements OnInit {
    searchQuery = '';
    employees = signal<Employee[]>([]);
    selectedEmployee = signal<Employee | null>(null);
    records = signal<AttendanceRecord[]>([]);
    loading = signal(true);
    processing = signal(false);
    displayedColumns = ['userCode', 'timeIn', 'timeOut', 'hours'];

    constructor(
        private api: ApiService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadTodayRecords();
    }

    loadTodayRecords() {
        const today = new Date().toISOString().split('T')[0];
        this.api.get<any>('attendance', { fromDate: today, toDate: today, limit: 100 }).subscribe({
            next: (res) => {
                this.records.set(res.data || []);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    searchEmployees() {
        if (this.searchQuery.length < 2) {
            this.employees.set([]);
            return;
        }
        this.api.get<Employee[]>('attendance/search', { q: this.searchQuery }).subscribe({
            next: (res) => this.employees.set(res),
        });
    }

    selectEmployee(emp: Employee) {
        this.selectedEmployee.set(emp);
        this.searchQuery = `${emp.userCode} - ${emp.fullName}`;
    }

    clockIn() {
        const emp = this.selectedEmployee();
        if (!emp) return;
        this.processing.set(true);
        this.api.post('attendance/clock-in', { userIdentifier: emp.userCode }).subscribe({
            next: () => {
                this.snackBar.open(`${emp.fullName} clocked in successfully`, 'Close', { duration: 3000 });
                this.loadTodayRecords();
                this.processing.set(false);
                this.selectedEmployee.set(null);
                this.searchQuery = '';
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Clock in failed', 'Close', { duration: 5000 });
                this.processing.set(false);
            },
        });
    }

    clockOut() {
        const emp = this.selectedEmployee();
        if (!emp) return;
        this.processing.set(true);
        this.api.post('attendance/clock-out', { userIdentifier: emp.userCode }).subscribe({
            next: () => {
                this.snackBar.open(`${emp.fullName} clocked out successfully`, 'Close', { duration: 3000 });
                this.loadTodayRecords();
                this.processing.set(false);
                this.selectedEmployee.set(null);
                this.searchQuery = '';
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Clock out failed', 'Close', { duration: 5000 });
                this.processing.set(false);
            },
        });
    }

    formatTime(dateStr: string | null): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
    }
}
