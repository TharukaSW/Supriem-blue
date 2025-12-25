import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvoicesService } from '../services/invoices.service';
import { InvoiceMatchDialogComponent } from '../invoice-match-dialog/invoice-match-dialog.component';

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatDividerModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatDialogModule
    ],
    template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="50"></mat-spinner></div>
      } @else if (invoice()) {
        <div class="invoice-header">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1>Invoice Details</h1>
          </div>
          <div class="header-actions">
            @if (invoice().invoiceType === 'PURCHASE' && invoice().matchStatus !== 'MATCHED') {
              <button mat-raised-button color="accent" (click)="openMatchDialog()">
                <mat-icon>compare_arrows</mat-icon> Match Invoice
              </button>
            }
            <button mat-raised-button (click)="downloadPdf()">
              <mat-icon>download</mat-icon> Download PDF
            </button>
            <button mat-raised-button color="primary" (click)="print()">
              <mat-icon>print</mat-icon> Print
            </button>
          </div>
        </div>

        <div class="invoice-content">
          <!-- Header Info Card -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <div class="title-row">
                  <span>{{ invoice().invoiceNo }}</span>
                  <mat-chip-listbox>
                    <mat-chip [class]="'chip-' + invoice().invoiceType.toLowerCase()">
                      {{ invoice().invoiceType }}
                    </mat-chip>
                  </mat-chip-listbox>
                </div>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Invoice Date</label>
                  <div>{{ invoice().invoiceDate | date:'fullDate' }}</div>
                </div>
                <div class="info-item">
                  <label>Due Date</label>
                  <div>{{ invoice().dueDate | date:'fullDate' }}</div>
                </div>
                <div class="info-item">
                  <label>Status</label>
                  <span class="status-badge" [class]="invoice().status.toLowerCase()">
                    {{ invoice().status }}
                  </span>
                </div>
                @if (invoice().invoiceType === 'SALES') {
                  <div class="info-item">
                    <label>Customer</label>
                    <div>{{ invoice().customer?.companyName || 'N/A' }}</div>
                  </div>
                } @else {
                  <div class="info-item">
                    <label>Supplier</label>
                    <div>{{ invoice().supplier?.companyName || 'N/A' }}</div>
                  </div>
                }
                <div class="info-item">
                  <label>Created By</label>
                  <div>{{ invoice().creator?.fullName || 'System' }}</div>
                </div>
                <div class="info-item">
                  <label>Created At</label>
                  <div>{{ invoice().createdAt | date:'medium' }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Invoice Lines -->
          <mat-card class="lines-card">
            <mat-card-header>
              <mat-card-title>Invoice Items</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="invoice().lines || []" class="lines-table">
                <ng-container matColumnDef="item">
                  <th mat-header-cell *matHeaderCellDef>Item</th>
                  <td mat-cell *matCellDef="let line">
                    <div class="item-cell">
                      <strong>{{ line.item?.itemName || line.description }}</strong>
                      <small>{{ line.item?.itemCode || '' }}</small>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="qty">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Quantity</th>
                  <td mat-cell *matCellDef="let line" class="text-right">
                    {{ line.qty }} {{ line.item?.unit?.unitName || '' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Unit Price</th>
                  <td mat-cell *matCellDef="let line" class="text-right">
                    {{ line.unitPrice | currency:'LKR ':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="lineTotal">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Total</th>
                  <td mat-cell *matCellDef="let line" class="text-right">
                    {{ line.lineTotal | currency:'LKR ':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="lineColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: lineColumns;"></tr>
              </table>

              <mat-divider></mat-divider>

              <div class="totals">
                <div class="total-row">
                  <span>Subtotal</span>
                  <strong>{{ invoice().subtotal | currency:'LKR ':'symbol':'1.2-2' }}</strong>
                </div>
                @if (invoice().discountAmount > 0) {
                  <div class="total-row">
                    <span>Discount</span>
                    <strong class="text-success">-{{ invoice().discountAmount | currency:'LKR ':'symbol':'1.2-2' }}</strong>
                  </div>
                }
                @if (invoice().taxAmount > 0) {
                  <div class="total-row">
                    <span>Tax</span>
                    <strong>{{ invoice().taxAmount | currency:'LKR ':'symbol':'1.2-2' }}</strong>
                  </div>
                }
                <mat-divider></mat-divider>
                <div class="total-row grand-total">
                  <span>Grand Total</span>
                  <strong>{{ invoice().total | currency:'LKR ':'symbol':'1.2-2' }}</strong>
                </div>
                <div class="total-row">
                  <span>Paid Amount</span>
                  <strong class="text-success">{{ invoice().paidAmount | currency:'LKR ':'symbol':'1.2-2' }}</strong>
                </div>
                <div class="total-row">
                  <span>Balance Due</span>
                  <strong class="text-warning">{{ invoice().balanceDue | currency:'LKR ':'symbol':'1.2-2' }}</strong>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Vendor Invoice Matching (for Purchase Invoices) -->
          @if (invoice().invoiceType === 'PURCHASE') {
            <mat-card class="match-card">
              <mat-card-header>
                <mat-card-title>Vendor Invoice Matching</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="match-info">
                  <div class="info-item">
                    <label>Match Status</label>
                    <span class="match-badge" [class]="invoice().matchStatus?.toLowerCase() || 'pending'">
                      {{ invoice().matchStatus || 'PENDING' }}
                    </span>
                  </div>
                  @if (invoice().vendorInvoiceNo) {
                    <div class="info-item">
                      <label>Vendor Invoice No</label>
                      <div>{{ invoice().vendorInvoiceNo }}</div>
                    </div>
                    <div class="info-item">
                      <label>Vendor Invoice Date</label>
                      <div>{{ invoice().vendorInvoiceDate | date:'mediumDate' }}</div>
                    </div>
                    <div class="info-item">
                      <label>Vendor Invoice Total</label>
                      <div>{{ invoice().vendorInvoiceTotal | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </div>
                    <div class="info-item">
                      <label>System Total</label>
                      <div>{{ invoice().total | currency:'LKR ':'symbol':'1.2-2' }}</div>
                    </div>
                    @if (invoice().matchStatus === 'MISMATCHED') {
                      <div class="info-item">
                        <label>Mismatch Amount</label>
                        <div class="text-danger">
                          {{ invoice().mismatchAmount | currency:'LKR ':'symbol':'1.2-2' }}
                        </div>
                      </div>
                    }
                    <div class="info-item">
                      <label>Matched By</label>
                      <div>{{ invoice().matchedBy?.fullName || 'N/A' }}</div>
                    </div>
                    <div class="info-item">
                      <label>Matched At</label>
                      <div>{{ invoice().matchCheckedAt | date:'medium' }}</div>
                    </div>
                  } @else {
                    <div class="no-match">
                      <mat-icon>info</mat-icon>
                      <p>Vendor invoice details not yet entered</p>
                      <button mat-raised-button color="primary" (click)="openMatchDialog()">
                        Enter Vendor Invoice Details
                      </button>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- Payment History -->
          @if (invoice().payments && invoice().payments.length > 0) {
            <mat-card class="payments-card">
              <mat-card-header>
                <mat-card-title>Payment History</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="invoice().payments" class="payments-table">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let payment">
                      {{ payment.paymentDate | date:'mediumDate' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="method">
                    <th mat-header-cell *matHeaderCellDef>Method</th>
                    <td mat-cell *matCellDef="let payment">{{ payment.paymentMethod }}</td>
                  </ng-container>

                  <ng-container matColumnDef="reference">
                    <th mat-header-cell *matHeaderCellDef>Reference</th>
                    <td mat-cell *matCellDef="let payment">{{ payment.referenceNo || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                    <td mat-cell *matCellDef="let payment" class="text-right">
                      {{ payment.amount | currency:'LKR ':'symbol':'1.2-2' }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: paymentColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        h1 {
          margin: 0;
          font-size: 24px;
        }
      }
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
    .invoice-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .info-card {
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 16px;
      }
      .info-item {
        label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        div, span {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
    .lines-table, .payments-table {
      width: 100%;
      margin-bottom: 16px;
      .text-right {
        text-align: right;
      }
      .item-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        small {
          color: #666;
          font-size: 12px;
        }
      }
    }
    .totals {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        &.grand-total {
          font-size: 18px;
          padding: 12px 0;
        }
      }
    }
    .match-card {
      .match-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }
      .no-match {
        text-align: center;
        padding: 40px;
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #999;
          margin-bottom: 16px;
        }
        p {
          color: #666;
          margin-bottom: 16px;
        }
      }
    }
    .chip-sales {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }
    .chip-purchase {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      &.draft { background: #fff3e0; color: #f57c00; }
      &.confirmed { background: #e3f2fd; color: #1976d2; }
      &.paid { background: #e8f5e9; color: #388e3c; }
      &.cancelled { background: #ffebee; color: #d32f2f; }
    }
    .match-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      &.matched { background: #e8f5e9; color: #388e3c; }
      &.mismatched { background: #ffebee; color: #d32f2f; }
      &.pending { background: #fff3e0; color: #f57c00; }
    }
    .text-success { color: #388e3c; }
    .text-warning { color: #f57c00; }
    .text-danger { color: #d32f2f; }
  `]
})
export class InvoiceDetailComponent implements OnInit {
    invoice = signal<any>(null);
    loading = signal(true);

    lineColumns = ['item', 'qty', 'unitPrice', 'lineTotal'];
    paymentColumns = ['date', 'method', 'reference', 'amount'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private invoicesService: InvoicesService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadInvoice(id);
        }
    }

    loadInvoice(id: string) {
        this.loading.set(true);
        this.invoicesService.getInvoice(id).subscribe({
            next: (data) => {
                this.invoice.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading invoice:', err);
                this.loading.set(false);
            }
        });
    }

    goBack() {
        this.router.navigate(['/invoices']);
    }

    openMatchDialog() {
        const dialogRef = this.dialog.open(InvoiceMatchDialogComponent, {
            width: '600px',
            data: {
                invoice: this.invoice(),
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadInvoice(this.invoice().invoiceId);
            }
        });
    }

    downloadPdf() {
        this.invoicesService.downloadPdf(this.invoice().invoiceId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.invoice().invoiceNo}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => console.error('Error downloading PDF:', err)
        });
    }

    print() {
        this.invoicesService.downloadPdf(this.invoice().invoiceId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const printWindow = window.open(url, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                }
            },
            error: (err) => console.error('Error printing invoice:', err)
        });
    }
}
