import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>payments</mat-icon>
      {{ isEdit ? 'Edit' : 'New' }} Expense
    </h2>
    <div mat-dialog-content>
      <form [formGroup]="expenseForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Expense Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="expenseDate" required>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="expenseForm.get('expenseDate')?.hasError('required')">
            Date is required
          </mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category" required>
              @for (cat of categories; track cat) {
                <mat-option [value]="cat">{{ cat }}</mat-option>
              }
            </mat-select>
            <mat-error *ngIf="expenseForm.get('category')?.hasError('required')">
              Category is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="method" required>
              <mat-option value="CASH">Cash</mat-option>
              <mat-option value="BANK">Bank Transfer</mat-option>
              <mat-option value="CARD">Card</mat-option>
              <mat-option value="UPI">UPI</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" required min="0" step="0.01" placeholder="0.00">
          <span matPrefix>LKR&nbsp;</span>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('required')">
            Amount is required
          </mat-error>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('min')">
            Amount must be positive
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Paid To</mat-label>
          <input matInput formControlName="paidTo" placeholder="Vendor or person name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Expense details or notes..."></textarea>
        </mat-form-field>
      </form>

      @if (loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!expenseForm.valid || loading()">
        <mat-icon>save</mat-icon>
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  `]
})
export class ExpenseFormDialogComponent implements OnInit {
  expenseForm: FormGroup;
  isEdit = false;
  loading = signal(false);

  categories = [
    'Rent',
    'Electricity',
    'Water',
    'Internet',
    'Phone',
    'Office Supplies',
    'Maintenance',
    'Transportation',
    'Fuel',
    'Salaries',
    'Marketing',
    'Professional Fees',
    'Insurance',
    'Taxes',
    'Miscellaneous'
  ];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private dialogRef: MatDialogRef<ExpenseFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data;
    this.expenseForm = this.fb.group({
      expenseDate: [data?.expenseDate ? new Date(data.expenseDate) : new Date(), Validators.required],
      category: [data?.category || '', Validators.required],
      amount: [data?.amount || '', [Validators.required, Validators.min(0.01)]],
      method: [data?.method || 'CASH', Validators.required],
      paidTo: [data?.paidTo || ''],
      description: [data?.description || '']
    });
  }

  ngOnInit() { }

  onSubmit() {
    if (this.expenseForm.valid) {
      this.loading.set(true);
      const formData = {
        ...this.expenseForm.value,
        expenseDate: this.formatDate(this.expenseForm.value.expenseDate),
        amount: Number(this.expenseForm.value.amount)
      };

      const request = this.isEdit
        ? this.expenseService.updateExpense(this.data.expenseId, formData)
        : this.expenseService.createExpense(formData);

      request.subscribe({
        next: (response) => {
          this.snackBar.open(
            `Expense ${this.isEdit ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.loading.set(false);
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error saving expense:', err);
          this.snackBar.open(
            err.error?.message || 'Failed to save expense',
            'Close',
            { duration: 3000 }
          );
          this.loading.set(false);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
