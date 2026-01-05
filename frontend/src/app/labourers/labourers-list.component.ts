import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { Labourer, LabourerService } from './services/labourer.service';
import { LabourerFormDialogComponent } from './labourer-form-dialog.component';

@Component({
    selector: 'app-labourers-list',
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
                <h1>Labourers</h1>
                <button mat-raised-button color="primary" (click)="addLabourer()">
                    <mat-icon>add</mat-icon>
                    Add Labourer
                </button>
            </div>

            <mat-card>
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search Labourers</mat-label>
                            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by code or name...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                    </div>

                    <table mat-table [dataSource]="filteredLabourers()" class="labourers-table">
                        <ng-container matColumnDef="code">
                            <th mat-header-cell *matHeaderCellDef>Code</th>
                            <td mat-cell *matCellDef="let labourer">{{ labourer.userCode }}</td>
                        </ng-container>

                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Name</th>
                            <td mat-cell *matCellDef="let labourer">
                                <div>
                                    <strong>{{ labourer.fullName }}</strong>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="contact">
                            <th mat-header-cell *matHeaderCellDef>Contact</th>
                            <td mat-cell *matCellDef="let labourer">
                                <div>
                                    <div>{{ labourer.phone || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="role">
                            <th mat-header-cell *matHeaderCellDef>Role</th>
                            <td mat-cell *matCellDef="let labourer">
                                <mat-chip>{{ displayRole(labourer.role?.roleName) }}</mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Status</th>
                            <td mat-cell *matCellDef="let labourer">
                                <mat-chip [class.active]="labourer.isActive" [class.inactive]="!labourer.isActive">
                                    {{ labourer.isActive ? 'Active' : 'Inactive' }}
                                </mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let labourer">
                                <button mat-icon-button (click)="viewLabourer(labourer)" matTooltip="View Details">
                                    <mat-icon>visibility</mat-icon>
                                </button>
                                <button mat-icon-button (click)="editLabourer(labourer)" matTooltip="Edit">
                                    <mat-icon>edit</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>
                    </table>

                    @if (filteredLabourers().length === 0 && !loading()) {
                        <div class="no-data">
                            <mat-icon>people</mat-icon>
                            <p>{{ searchText ? 'No labourers found' : 'No labourers added yet' }}</p>
                            @if (!searchText) {
                                <button mat-raised-button color="primary" (click)="addLabourer()">
                                    Add First Labourer
                                </button>
                            }
                        </div>
                    }

                    @if (loading()) {
                        <div class="loading">
                            <p>Loading labourers...</p>
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

        .labourers-table {
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
export class LabourersListComponent implements OnInit {
    labourers = signal<Labourer[]>([]);
    filteredLabourers = signal<Labourer[]>([]);
    loading = signal(false);
    searchText = '';

    displayedColumns = ['code', 'name', 'contact', 'role', 'status', 'actions'];

    constructor(
        private router: Router,
        private labourerService: LabourerService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadLabourers();
    }

    displayRole(roleName?: string): string {
        return roleName === 'USER' ? 'LABOURER' : (roleName || '-');
    }

    loadLabourers() {
        this.loading.set(true);
        // roleId=3 is USER (labourer) per backend CreateUserDto docs
        this.labourerService.getAll({ page: 1, limit: 1000, roleId: 3 }).subscribe({
            next: (response: any) => {
                const labourers = Array.isArray(response) ? response : (response.data || []);
                this.labourers.set(labourers);
                this.filteredLabourers.set(labourers);
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Error loading labourers', 'Close', { duration: 3000 });
                this.loading.set(false);
            },
        });
    }

    applyFilter() {
        const search = this.searchText.toLowerCase().trim();
        const filtered = this.labourers().filter(l =>
            l.userCode.toLowerCase().includes(search) ||
            l.fullName.toLowerCase().includes(search) ||
            (l.username && l.username.toLowerCase().includes(search))
        );
        this.filteredLabourers.set(filtered);
    }

    addLabourer() {
        const ref = this.dialog.open(LabourerFormDialogComponent, {
            data: { mode: 'create' },
            width: '700px',
        });
        ref.afterClosed().subscribe((saved) => {
            if (saved) this.loadLabourers();
        });
    }

    editLabourer(labourer: Labourer) {
        this.labourerService.getOne(labourer.userId, true).subscribe({
            next: (full) => {
                const ref = this.dialog.open(LabourerFormDialogComponent, {
                    data: { mode: 'edit', labourer: full },
                    width: '700px',
                });
                ref.afterClosed().subscribe((saved) => {
                    if (saved) this.loadLabourers();
                });
            },
            error: () => {
                this.snackBar.open('Error loading labourer details', 'Close', { duration: 3000 });
            },
        });
    }

    viewLabourer(labourer: Labourer) {
        this.router.navigate(['/labourers', labourer.userId]);
    }
}
