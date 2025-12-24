import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from '../services/customer.service';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';

@Component({
    selector: 'app-customers-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatChipsModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    template: `
        <div class="page-container">
            <div class="page-header">
                <h1>Customers</h1>
                <button mat-raised-button color="primary" (click)="addCustomer()">
                    <mat-icon>add</mat-icon>
                    Add Customer
                </button>
            </div>

            <mat-card>
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search Customers</mat-label>
                            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by code or name...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                    </div>

                    <table mat-table [dataSource]="filteredCustomers()" class="customers-table">
                        <ng-container matColumnDef="code">
                            <th mat-header-cell *matHeaderCellDef>Code</th>
                            <td mat-cell *matCellDef="let customer">{{ customer.customerCode }}</td>
                        </ng-container>

                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Name</th>
                            <td mat-cell *matCellDef="let customer">
                                <div>
                                    <strong>{{ customer.customerName }}</strong>
                                    <div class="text-muted">{{ customer.contactName || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="contact">
                            <th mat-header-cell *matHeaderCellDef>Contact</th>
                            <td mat-cell *matCellDef="let customer">
                                <div>
                                    <div>{{ customer.phone || '-' }}</div>
                                    <div class="text-muted">{{ customer.email || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="address">
                            <th mat-header-cell *matHeaderCellDef>Address</th>
                            <td mat-cell *matCellDef="let customer">
                                {{ customer.address || '-' }}
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Status</th>
                            <td mat-cell *matCellDef="let customer">
                                <mat-chip [class.active]="customer.isActive" [class.inactive]="!customer.isActive">
                                    {{ customer.isActive ? 'Active' : 'Inactive' }}
                                </mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let customer">
                                <button mat-icon-button (click)="viewCustomer(customer)" matTooltip="View Details">
                                    <mat-icon>visibility</mat-icon>
                                </button>
                                <button mat-icon-button (click)="editCustomer(customer)" matTooltip="Edit">
                                    <mat-icon>edit</mat-icon>
                                </button>
                                <button mat-icon-button 
                                        *ngIf="customer.isActive"
                                        (click)="deactivateCustomer(customer)" 
                                        matTooltip="Deactivate"
                                        color="warn">
                                    <mat-icon>block</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>
                    </table>

                    @if (filteredCustomers().length === 0 && !loading()) {
                        <div class="no-data">
                            <mat-icon>groups</mat-icon>
                            <p>{{ searchText ? 'No customers found' : 'No customers added yet' }}</p>
                            @if (!searchText) {
                                <button mat-raised-button color="primary" (click)="addCustomer()">
                                    Add First Customer
                                </button>
                            }
                        </div>
                    }

                    @if (loading()) {
                        <div class="loading">
                            <p>Loading customers...</p>
                        </div>
                    }
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [`
        .page-container {
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .page-header h1 {
            margin: 0;
            font-size: 28px;
        }

        .filters {
            margin-bottom: 16px;
        }

        .search-field {
            width: 400px;
        }

        .customers-table {
            width: 100%;
        }

        .text-muted {
            color: #666;
            font-size: 0.9em;
        }

        mat-chip.active {
            background-color: #4caf50;
            color: white;
        }

        mat-chip.inactive {
            background-color: #f44336;
            color: white;
        }

        .clickable-row:hover {
            background-color: #f5f5f5;
            cursor: pointer;
        }

        .no-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: #999;
        }

        .no-data mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    `],
})
export class CustomersListComponent implements OnInit {
    customers = signal<Customer[]>([]);
    filteredCustomers = signal<Customer[]>([]);
    loading = signal(false);
    searchText = '';

    displayedColumns = ['code', 'name', 'contact', 'address', 'status', 'actions'];

    constructor(
        private router: Router,
        private customerService: CustomerService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadCustomers();
    }

    loadCustomers() {
        this.loading.set(true);
        this.customerService.getAll().subscribe({
            next: (response) => {
                const customers = Array.isArray(response) ? response : (response.data || []);
                this.customers.set(customers);
                this.filteredCustomers.set(customers);
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Error loading customers', 'Close', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    applyFilter() {
        const search = this.searchText.toLowerCase();
        const filtered = this.customers().filter(c =>
            c.customerCode.toLowerCase().includes(search) ||
            c.customerName.toLowerCase().includes(search) ||
            (c.contactName && c.contactName.toLowerCase().includes(search))
        );
        this.filteredCustomers.set(filtered);
    }

    addCustomer() {
        const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
            width: '600px',
            data: { mode: 'create' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadCustomers();
            }
        });
    }

    viewCustomer(customer: Customer) {
        this.router.navigate(['/customers', customer.customerId]);
    }

    editCustomer(customer: Customer) {
        const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
            width: '600px',
            data: { mode: 'edit', customer }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadCustomers();
            }
        });
    }

    deactivateCustomer(customer: Customer) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Deactivate Customer',
                message: `Are you sure you want to deactivate ${customer.customerName}?`,
                confirmText: 'Deactivate'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.customerService.deactivate(customer.customerId).subscribe({
                    next: () => {
                        this.snackBar.open('Customer deactivated successfully', 'Close', { duration: 3000 });
                        this.loadCustomers();
                    },
                    error: () => {
                        this.snackBar.open('Error deactivating customer', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
