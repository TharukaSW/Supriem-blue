import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface GrnMismatchDialogData {
  purchaseOrder: any;
}

@Component({
  selector: 'app-grn-mismatch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
        <div class="mismatch-dialog">
            <!-- Header -->
            <div class="dialog-header">
                <div class="header-title">
                    <div class="icon-container">
                        <mat-icon>report_problem</mat-icon>
                    </div>
                    <h2>Report Mismatch</h2>
                </div>
                <button mat-icon-button (click)="onCancel()" tabindex="-1">
                    <mat-icon>close</mat-icon>
                </button>
            </div>

            <mat-dialog-content>
                <!-- Reference Data Card -->
                <div class="ref-data-card">
                    <span class="card-label">Reference Details</span>
                    <div class="data-grid">
                        <div class="data-item">
                            <span class="label">Purchase Order</span>
                            <span class="value">{{ data.purchaseOrder.purchaseNo }}</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Supplier</span>
                            <span class="value">{{ data.purchaseOrder.supplier?.supplierName || '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Form Section -->
                <form [formGroup]="form" class="mismatch-form">
                    
                    <!-- Row 1: Type & Action -->
                    <div class="form-row">
                        <mat-form-field appearance="outline">
                            <mat-label>Issue Type</mat-label>
                            <mat-select formControlName="issueType" required>
                                <mat-option value="QUANTITY_MISMATCH">Quantity Mismatch</mat-option>
                                <mat-option value="QUALITY_ISSUE">Quality Issue</mat-option>
                                <mat-option value="DAMAGED_GOODS">Damaged Goods</mat-option>
                                <mat-option value="MISSING_ITEMS">Missing Items</mat-option>
                                <mat-option value="WRONG_ITEMS">Wrong Items</mat-option>
                                <mat-option value="OTHER">Other</mat-option>
                            </mat-select>
                            <mat-error *ngIf="form.get('issueType')?.hasError('required')">
                                Issue type is required
                            </mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                            <mat-label>Action Required</mat-label>
                            <mat-select formControlName="actionRequired">
                                <mat-option value="RETURN">Return Items</mat-option>
                                <mat-option value="REPLACE">Request Replacement</mat-option>
                                <mat-option value="CREDIT_NOTE">Issue Credit Note</mat-option>
                                <mat-option value="ACCEPT_WITH_DISCOUNT">Accept with Discount</mat-option>
                                <mat-option value="PENDING_REVIEW">Pending Review</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <!-- Description -->
                    <mat-form-field appearance="outline">
                        <mat-label>Description of Issue</mat-label>
                        <textarea 
                            matInput 
                            formControlName="description"
                            placeholder="Please describe the discrepancy in detail..."
                            required
                        ></textarea>
                        <mat-error *ngIf="form.get('description')?.hasError('required')">
                            Description is required
                        </mat-error>
                    </mat-form-field>

                    <!-- Additional Notes -->
                    <mat-form-field appearance="outline">
                        <mat-label>Internal Notes (Optional)</mat-label>
                        <textarea 
                            matInput 
                            formControlName="notes"
                            placeholder="Any internal comments regarding this issue..."
                        ></textarea>
                    </mat-form-field>

                </form>
            </mat-dialog-content>

            <!-- Actions -->
            <mat-dialog-actions>
                <button mat-stroked-button (click)="onCancel()">Cancel</button>
                <button 
                    mat-flat-button 
                    color="warn" 
                    (click)="onSubmit()"
                    [disabled]="form.invalid"
                >
                    Report Issue
                </button>
            </mat-dialog-actions>
        </div>
    `,
  styles: [`
        .mismatch-dialog {
            width: 600px;
            max-width: 95vw;
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }

        /* Header */
        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid #e0e0e0;
            background-color: #fff;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .icon-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background-color: rgba(244, 67, 54, 0.1);
            color: #f44336;
        }

        .icon-container mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
        }

        .dialog-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a1a1a;
        }

        /* Content */
        :host ::ng-deep mat-dialog-content {
            padding: 24px !important;
            display: flex;
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
        }

        /* Ref Data Section */
        .ref-data-card {
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #e0e0e0;
        }

        .card-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
            font-weight: 600;
            margin-bottom: 12px;
            display: block;
        }

        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .data-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .data-item .label {
            font-size: 0.8rem;
            color: #666;
        }

        .data-item .value {
            font-size: 0.95rem;
            font-weight: 500;
            color: #1a1a1a;
        }

        /* Form */
        .mismatch-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .mismatch-form mat-form-field {
            width: 100%;
        }

        .mismatch-form textarea {
            resize: none;
            min-height: 80px;
        }

        /* Actions */
        :host ::ng-deep mat-dialog-actions {
            padding: 16px 24px !important;
            border-top: 1px solid #e0e0e0;
            margin: 0 !important;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background-color: #fff;
        }

        :host ::ng-deep mat-dialog-actions button {
            min-width: 100px;
        }
    `]
})
export class GrnMismatchDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GrnMismatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GrnMismatchDialogData,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      issueType: ['', Validators.required],
      description: ['', Validators.required],
      actionRequired: ['PENDING_REVIEW'],
      notes: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
