import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { InvoicesService } from '../services/invoices.service';

@Component({
    selector: 'app-invoices-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatTabsModule
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1><mat-icon>receipt_long</mat-icon> Invoices</h1>
      </div>

      <mat-tab-group [(selectedIndex)]="selectedTab" (selectedIndexChange)="onTabChange()">
        <!-- All Invoices -->
        <mat-tab label="All Invoices">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <div class="filters">
                  <mat-form-field appearance="outline">
                    <mat-label>Search</mat-label>
                    <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Invoice No...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Type</mat-label>
                    <mat-select [(ngModel)]="filterType" (ngModelChange)="loadInvoices()">
                      <mat-option value="">All Types</mat-option>
                      <mat-option value="SALES">Sales</mat-option>
                      <mat-option value="PURCHASE">Purchase</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Status</mat-label>
                    <mat-select [(ngModel)]="filterStatus" (ngModelChange)="loadInvoices()">
                      <mat-option value="">All Status</mat-option>
                      <mat-option value="DRAFT">Draft</mat-option>
                      <mat-option value="CONFIRMED">Confirmed</mat-option>
                      <mat-option value="PAID">Paid</mat-option>
                      <mat-option value="CANCELLED">Cancelled</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>From Date</mat-label>
                    <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate" (ngModelChange)="loadInvoices()">
                    <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                    <mat-datepicker #fromPicker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>To Date</mat-label>
                    <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate" (ngModelChange)="loadInvoices()">
                    <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                    <mat-datepicker #toPicker></mat-datepicker>
                  </mat-form-field>

                  <button mat-raised-button color="primary" (click)="clearFilters()">
                    <mat-icon>clear</mat-icon> Clear
                  </button>
                </div>

                @if (loading()) {
                  <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
                } @else {
                  <table mat-table [dataSource]="invoices()" class="invoice-table">
                    <ng-container matColumnDef="invoiceNo">
                      <th mat-header-cell *matHeaderCellDef>Invoice No</th>
                      <td mat-cell *matCellDef="let invoice">{{ invoice.invoiceNo }}</td>
                    </ng-container>

                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let invoice">{{ invoice.invoiceDate | date:'mediumDate' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let invoice">
                        <mat-chip-listbox>
                          <mat-chip [class]="'chip-' + invoice.invoiceType.toLowerCase()">
                            {{ invoice.invoiceType }}
                          </mat-chip>
                        </mat-chip-listbox>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="party">
                      <th mat-header-cell *matHeaderCellDef>Customer/Supplier</th>
                      <td mat-cell *matCellDef="let invoice">
                        {{ invoice.customer?.companyName || invoice.supplier?.companyName || '-' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef class="text-right">Total</th>
                      <td mat-cell *matCellDef="let invoice" class="text-right">
                        {{ invoice.total | currency:'LKR ':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="paid">
                      <th mat-header-cell *matHeaderCellDef class="text-right">Paid</th>
                      <td mat-cell *matCellDef="let invoice" class="text-right">
                        {{ invoice.paidAmount | currency:'LKR ':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let invoice">
                        <span class="status-badge" [class]="invoice.status.toLowerCase()">
                          {{ invoice.status }}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="matchStatus">
                      <th mat-header-cell *matHeaderCellDef>Match</th>
                      <td mat-cell *matCellDef="let invoice">
                        @if (invoice.invoiceType === 'PURCHASE') {
                          <span class="match-badge" [class]="invoice.matchStatus?.toLowerCase() || 'pending'">
                            {{ invoice.matchStatus || 'PENDING' }}
                          </span>
                        } @else {
                          <span class="text-muted">N/A</span>
                        }
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let invoice">
                        <button mat-icon-button [matMenuTriggerFor]="menu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #menu="matMenu">
                          <button mat-menu-item (click)="viewInvoice(invoice.invoiceId)">
                            <mat-icon>visibility</mat-icon>
                            <span>View Details</span>
                          </button>
                          @if (invoice.invoiceType === 'PURCHASE' && invoice.matchStatus !== 'MATCHED') {
                            <button mat-menu-item (click)="matchInvoice(invoice.invoiceId)">
                              <mat-icon>compare_arrows</mat-icon>
                              <span>Match Invoice</span>
                            </button>
                          }
                          <button mat-menu-item (click)="downloadPdf(invoice.invoiceId)">
                            <mat-icon>download</mat-icon>
                            <span>Download PDF</span>
                          </button>
                          <button mat-menu-item (click)="printInvoice(invoice.invoiceId)">
                            <mat-icon>print</mat-icon>
                            <span>Print</span>
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="invoice-row"></tr>
                  </table>

                  <mat-paginator
                    [length]="totalItems()"
                    [pageSize]="pageSize()"
                    [pageIndex]="currentPage() - 1"
                    [pageSizeOptions]="[10, 25, 50, 100]"
                    (page)="onPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Sales Invoices -->
        <mat-tab label="Sales Invoices">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                @if (loading()) {
                  <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
                } @else if (salesInvoices().length === 0) {
                  <div class="no-data">
                    <mat-icon>receipt</mat-icon>
                    <p>No sales invoices found</p>
                  </div>
                } @else {
                  <div class="invoice-grid">
                    @for (invoice of salesInvoices(); track invoice.invoiceId) {
                      <mat-card class="invoice-card" (click)="viewInvoice(invoice.invoiceId)">
                        <mat-card-header>
                          <mat-card-title>{{ invoice.invoiceNo }}</mat-card-title>
                          <button mat-icon-button [matMenuTriggerFor]="cardMenu" (click)="$event.stopPropagation()">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #cardMenu="matMenu">
                            <button mat-menu-item (click)="downloadPdf(invoice.invoiceId)">
                              <mat-icon>download</mat-icon> Download PDF
                            </button>
                            <button mat-menu-item (click)="printInvoice(invoice.invoiceId)">
                              <mat-icon>print</mat-icon> Print
                            </button>
                          </mat-menu>
                        </mat-card-header>
                        <mat-card-content>
                          <div class="invoice-info">
                            <div class="info-row">
                              <mat-icon>business</mat-icon>
                              <span>{{ invoice.customer?.companyName || 'N/A' }}</span>
                            </div>
                            <div class="info-row">
                              <mat-icon>calendar_today</mat-icon>
                              <span>{{ invoice.invoiceDate | date:'mediumDate' }}</span>
                            </div>
                            <div class="info-row">
                              <mat-icon>attach_money</mat-icon>
                              <span class="amount">{{ invoice.total | currency:'LKR ':'symbol':'1.2-2' }}</span>
                            </div>
                            <div class="info-row">
                              <span class="status-badge" [class]="invoice.status.toLowerCase()">
                                {{ invoice.status }}
                              </span>
                            </div>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Purchase Invoices -->
        <mat-tab label="Purchase Invoices">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                @if (loading()) {
                  <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
                } @else if (purchaseInvoices().length === 0) {
                  <div class="no-data">
                    <mat-icon>shopping_cart</mat-icon>
                    <p>No purchase invoices found</p>
                  </div>
                } @else {
                  <div class="invoice-grid">
                    @for (invoice of purchaseInvoices(); track invoice.invoiceId) {
                      <mat-card class="invoice-card" (click)="viewInvoice(invoice.invoiceId)">
                        <mat-card-header>
                          <mat-card-title>{{ invoice.invoiceNo }}</mat-card-title>
                          <button mat-icon-button [matMenuTriggerFor]="cardMenu" (click)="$event.stopPropagation()">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #cardMenu="matMenu">
                            @if (invoice.matchStatus !== 'MATCHED') {
                              <button mat-menu-item (click)="matchInvoice(invoice.invoiceId); $event.stopPropagation()">
                                <mat-icon>compare_arrows</mat-icon> Match Invoice
                              </button>
                            }
                            <button mat-menu-item (click)="downloadPdf(invoice.invoiceId)">
                              <mat-icon>download</mat-icon> Download PDF
                            </button>
                          </mat-menu>
                        </mat-card-header>
                        <mat-card-content>
                          <div class="invoice-info">
                            <div class="info-row">
                              <mat-icon>store</mat-icon>
                              <span>{{ invoice.supplier?.companyName || 'N/A' }}</span>
                            </div>
                            <div class="info-row">
                              <mat-icon>calendar_today</mat-icon>
                              <span>{{ invoice.invoiceDate | date:'mediumDate' }}</span>
                            </div>
                            <div class="info-row">
                              <mat-icon>attach_money</mat-icon>
                              <span class="amount">{{ invoice.total | currency:'LKR ':'symbol':'1.2-2' }}</span>
                            </div>
                            <div class="info-row">
                              <span class="match-badge" [class]="invoice.matchStatus?.toLowerCase() || 'pending'">
                                {{ invoice.matchStatus || 'PENDING' }}
                              </span>
                            </div>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
    styles: [`
    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      h1 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }
    }
    .tab-content {
      padding: 20px 0;
    }
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      mat-form-field {
        flex: 1;
        min-width: 200px;
      }
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    .invoice-table {
      width: 100%;
      .text-right {
        text-align: right;
      }
      .invoice-row {
        cursor: pointer;
        &:hover {
          background-color: #f5f5f5;
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
      &.draft {
        background: #fff3e0;
        color: #f57c00;
      }
      &.confirmed {
        background: #e3f2fd;
        color: #1976d2;
      }
      &.paid {
        background: #e8f5e9;
        color: #388e3c;
      }
      &.cancelled {
        background: #ffebee;
        color: #d32f2f;
      }
    }
    .match-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      &.matched {
        background: #e8f5e9;
        color: #388e3c;
      }
      &.mismatched {
        background: #ffebee;
        color: #d32f2f;
      }
      &.pending {
        background: #fff3e0;
        color: #f57c00;
      }
    }
    .text-muted {
      color: #999;
      font-size: 12px;
    }
    .invoice-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .invoice-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        mat-card-title {
          font-size: 18px;
          font-weight: 600;
        }
      }
      .invoice-info {
        margin-top: 12px;
        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: #666;
          }
          .amount {
            font-weight: 600;
            color: #1976d2;
            font-size: 16px;
          }
        }
      }
    }
    .no-data {
      text-align: center;
      padding: 60px;
      color: #999;
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
    }
  `],
})
export class InvoicesListComponent implements OnInit {
    invoices = signal<any[]>([]);
    loading = signal(false);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);

    searchTerm = '';
    filterType = '';
    filterStatus = '';
    fromDate: Date | null = null;
    toDate: Date | null = null;
    selectedTab = 0;

    displayedColumns = ['invoiceNo', 'date', 'type', 'party', 'total', 'paid', 'status', 'matchStatus', 'actions'];

    salesInvoices = computed(() => 
        this.invoices().filter(inv => inv.invoiceType === 'SALES')
    );

    purchaseInvoices = computed(() => 
        this.invoices().filter(inv => inv.invoiceType === 'PURCHASE')
    );

    constructor(
        private invoicesService: InvoicesService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadInvoices();
    }

    onTabChange() {
        if (this.selectedTab === 1) {
            this.filterType = 'SALES';
        } else if (this.selectedTab === 2) {
            this.filterType = 'PURCHASE';
        } else {
            this.filterType = '';
        }
        this.loadInvoices();
    }

    loadInvoices() {
        this.loading.set(true);
        const params: any = {
            page: this.currentPage(),
            limit: this.pageSize(),
        };

        if (this.searchTerm) params.search = this.searchTerm;
        if (this.filterType) params.invoiceType = this.filterType;
        if (this.filterStatus) params.status = this.filterStatus;
        if (this.fromDate) params.fromDate = this.formatDate(this.fromDate);
        if (this.toDate) params.toDate = this.formatDate(this.toDate);

        this.invoicesService.getInvoices(params).subscribe({
            next: (response) => {
                this.invoices.set(response.data);
                this.totalItems.set(response.meta.total);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading invoices:', err);
                this.loading.set(false);
            }
        });
    }

    onSearch() {
        this.currentPage.set(1);
        this.loadInvoices();
    }

    clearFilters() {
        this.searchTerm = '';
        this.filterType = '';
        this.filterStatus = '';
        this.fromDate = null;
        this.toDate = null;
        this.loadInvoices();
    }

    onPageChange(event: PageEvent) {
        this.currentPage.set(event.pageIndex + 1);
        this.pageSize.set(event.pageSize);
        this.loadInvoices();
    }

    viewInvoice(id: string) {
        this.router.navigate(['/invoices', id]);
    }

    matchInvoice(id: string) {
        this.router.navigate(['/invoices', id, 'match']);
    }

    downloadPdf(id: string) {
        this.invoicesService.downloadPdf(id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${id}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => console.error('Error downloading PDF:', err)
        });
    }

    printInvoice(id: string) {
        this.invoicesService.downloadPdf(id).subscribe({
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

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
