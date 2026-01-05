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
import { SupplierService, Supplier } from '../services/supplier.service';
import { SupplierFormDialogComponent } from './supplier-form-dialog.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';

@Component({
    selector: 'app-suppliers-list',
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
                <h1>Suppliers</h1>
                <button mat-raised-button color="primary" (click)="addSupplier()">
                    <mat-icon>add</mat-icon>
                    Add Supplier
                </button>
            </div>

            <mat-card>
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search Suppliers</mat-label>
                            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by code or name...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                    </div>

                    <table mat-table [dataSource]="filteredSuppliers()" class="suppliers-table">
                        <ng-container matColumnDef="code">
                            <th mat-header-cell *matHeaderCellDef>Code</th>
                            <td mat-cell *matCellDef="let supplier">{{ supplier.supplierCode }}</td>
                        </ng-container>

                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Name</th>
                            <td mat-cell *matCellDef="let supplier">
                                <div>
                                    <strong>{{ supplier.supplierName }}</strong>
                                    <div class="text-muted">{{ supplier.contactName || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="contact">
                            <th mat-header-cell *matHeaderCellDef>Contact</th>
                            <td mat-cell *matCellDef="let supplier">
                                <div>
                                    <div>{{ supplier.phone || '-' }}</div>
                                    <div class="text-muted">{{ supplier.email || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="address">
                            <th mat-header-cell *matHeaderCellDef>Address</th>
                            <td mat-cell *matCellDef="let supplier">
                                {{ supplier.address || '-' }}
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Status</th>
                            <td mat-cell *matCellDef="let supplier">
                                <mat-chip [class.active]="supplier.isActive" [class.inactive]="!supplier.isActive">
                                    {{ supplier.isActive ? 'Active' : 'Inactive' }}
                                </mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let supplier">
                                <button mat-icon-button (click)="viewSupplier(supplier)" matTooltip="View Details">
                                    <mat-icon>visibility</mat-icon>
                                </button>
                                <button mat-icon-button (click)="editSupplier(supplier)" matTooltip="Edit">
                                    <mat-icon>edit</mat-icon>
                                </button>
                                <button mat-icon-button 
                                        *ngIf="supplier.isActive"
                                        (click)="deactivateSupplier(supplier)" 
                                        matTooltip="Deactivate"
                                        color="warn">
                                    <mat-icon>block</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>
                    </table>

                    @if (filteredSuppliers().length === 0 && !loading()) {
                        <div class="no-data">
                            <mat-icon>local_shipping</mat-icon>
                            <p>{{ searchText ? 'No suppliers found' : 'No suppliers added yet' }}</p>
                            @if (!searchText) {
                                <button mat-raised-button color="primary" (click)="addSupplier()">
                                    Add First Supplier
                                </button>
                            }
                        </div>
                    }

                    @if (loading()) {
                        <div class="loading">
                            <p>Loading suppliers...</p>
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

        .suppliers-table {
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
export class SuppliersListComponent implements OnInit {
    suppliers = signal<Supplier[]>([]);
    filteredSuppliers = signal<Supplier[]>([]);
    loading = signal(false);
    searchText = '';

    displayedColumns = ['code', 'name', 'contact', 'address', 'status', 'actions'];

    constructor(
        private router: Router,
        private supplierService: SupplierService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadSuppliers();
    }

    loadSuppliers() {
        this.loading.set(true);
        this.supplierService.getAll().subscribe({
            next: (response) => {
                const suppliers = Array.isArray(response) ? response : (response.data || []);
                this.suppliers.set(suppliers);
                this.filteredSuppliers.set(suppliers);
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Error loading suppliers', 'Close', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    applyFilter() {
        const search = this.searchText.toLowerCase();
        const filtered = this.suppliers().filter(s =>
            s.supplierCode.toLowerCase().includes(search) ||
            s.supplierName.toLowerCase().includes(search) ||
            (s.contactName && s.contactName.toLowerCase().includes(search))
        );
        this.filteredSuppliers.set(filtered);
    }

    addSupplier() {
        const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
            data: { mode: 'create' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadSuppliers();
            }
        });
    }

    viewSupplier(supplier: Supplier) {
        this.router.navigate(['/suppliers', supplier.supplierId]);
    }

    editSupplier(supplier: Supplier) {
        const dialogRef = this.dialog.open(SupplierFormDialogComponent, {
            data: { mode: 'edit', supplier }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadSuppliers();
            }
        });
    }

    deactivateSupplier(supplier: Supplier) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Deactivate Supplier',
                message: `Are you sure you want to deactivate ${supplier.supplierName}?`,
                confirmText: 'Deactivate'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.supplierService.deactivate(supplier.supplierId).subscribe({
                    next: () => {
                        this.snackBar.open('Supplier deactivated successfully', 'Close', { duration: 3000 });
                        this.loadSuppliers();
                    },
                    error: () => {
                        this.snackBar.open('Error deactivating supplier', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
