import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoicesService } from '../services/invoices.service';

@Component({
    selector: 'app-invoice-match-dialog',
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
        MatIconModule,
        MatProgressSpinnerModule
    ],
    template: `
    <h2 mat-dialog-title>
      <mat-icon>compare_arrows</mat-icon>
      Match Vendor Invoice
    </h2>
    <mat-dialog-content>
      <div class="match-info">
        <div class="info-row">
          <label>System Invoice No:</label>
          <strong>{{ data.invoice.invoiceNo }}</strong>
        </div>
        <div class="info-row">
          <label>System Total:</label>
          <strong class="system-total">{{ data.invoice.total | currency:'LKR ':'symbol':'1.2-2' }}</strong>
        </div>
      </div>

      <form [formGroup]="matchForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vendor Invoice Number</mat-label>
          <input matInput formControlName="vendorInvoiceNo" placeholder="Enter vendor invoice number">
          <mat-icon matSuffix>receipt</mat-icon>
          @if (matchForm.get('vendorInvoiceNo')?.hasError('required') && matchForm.get('vendorInvoiceNo')?.touched) {
            <mat-error>Vendor invoice number is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vendor Invoice Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="vendorInvoiceDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vendor Invoice Total</mat-label>
          <input matInput type="number" step="0.01" formControlName="vendorInvoiceTotal" placeholder="0.00">
          <span matPrefix>LKR&nbsp;</span>
          @if (matchForm.get('vendorInvoiceTotal')?.hasError('required') && matchForm.get('vendorInvoiceTotal')?.touched) {
            <mat-error>Vendor invoice total is required</mat-error>
          }
          @if (matchForm.get('vendorInvoiceTotal')?.hasError('min')) {
            <mat-error>Amount must be greater than 0</mat-error>
          }
        </mat-form-field>

        @if (difference() !== null) {
          <div class="difference-panel" [class.matched]="isMatched()" [class.mismatched]="!isMatched()">
            <mat-icon>{{ isMatched() ? 'check_circle' : 'error' }}</mat-icon>
            <div class="difference-content">
              <strong>{{ isMatched() ? 'Matched!' : 'Mismatch Detected' }}</strong>
              @if (!isMatched()) {
                <div class="difference-amount">
                  Difference: {{ difference() | currency:'LKR ':'symbol':'1.2-2' }}
                </div>
              }
            </div>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="!matchForm.valid || submitting()">
        @if (submitting()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
        }
        Save Match
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-dialog-content {
      min-width: 500px;
      padding: 24px !important;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      mat-icon {
        color: #1976d2;
      }
    }
    .match-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        label {
          color: #666;
        }
        .system-total {
          color: #1976d2;
          font-size: 18px;
        }
      }
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .difference-panel {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
      &.matched {
        background: #e8f5e9;
        color: #2e7d32;
        mat-icon {
          color: #2e7d32;
        }
      }
      &.mismatched {
        background: #ffebee;
        color: #c62828;
        mat-icon {
          color: #c62828;
        }
      }
      .difference-content {
        flex: 1;
        strong {
          display: block;
          margin-bottom: 4px;
        }
        .difference-amount {
          font-size: 14px;
        }
      }
    }
    mat-dialog-actions {
      padding: 16px 24px !important;
      button {
        mat-icon {
          margin-right: 8px;
        }
      }
    }
  `]
})
export class InvoiceMatchDialogComponent {
    matchForm: FormGroup;
    submitting = signal(false);
    difference = signal<number | null>(null);

    constructor(
        private fb: FormBuilder,
        private invoicesService: InvoicesService,
        private dialogRef: MatDialogRef<InvoiceMatchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.matchForm = this.fb.group({
            vendorInvoiceNo: ['', Validators.required],
            vendorInvoiceDate: [new Date()],
            vendorInvoiceTotal: [0, [Validators.required, Validators.min(0.01)]]
        });

        // Calculate difference when vendor total changes
        this.matchForm.get('vendorInvoiceTotal')?.valueChanges.subscribe(vendorTotal => {
            if (vendorTotal && vendorTotal > 0) {
                const systemTotal = Number(this.data.invoice.total);
                const diff = vendorTotal - systemTotal;
                this.difference.set(diff);
            } else {
                this.difference.set(null);
            }
        });
    }

    isMatched(): boolean {
        const diff = this.difference();
        return diff !== null && Math.abs(diff) < 0.01;
    }

    submit() {
        if (this.matchForm.valid) {
            this.submitting.set(true);
            const formValue = this.matchForm.value;
            
            const payload = {
                vendorInvoiceNo: formValue.vendorInvoiceNo,
                vendorInvoiceDate: formValue.vendorInvoiceDate ? 
                    formValue.vendorInvoiceDate.toISOString().split('T')[0] : null,
                vendorInvoiceTotal: Number(formValue.vendorInvoiceTotal)
            };

            this.invoicesService.updateMatch(this.data.invoice.invoiceId, payload).subscribe({
                next: () => {
                    this.submitting.set(false);
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Error updating match:', err);
                    this.submitting.set(false);
                }
            });
        }
    }
}
