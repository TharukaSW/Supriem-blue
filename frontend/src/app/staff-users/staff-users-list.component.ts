import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { forkJoin } from 'rxjs';
import { StaffUser, StaffUserService } from './services/staff-user.service';
import { StaffUserFormDialogComponent } from './staff-user-form-dialog.component';

@Component({
    selector: 'app-staff-users-list',
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
                <h1>Admins & Managers</h1>
                <button mat-raised-button color="primary" (click)="addUser()">
                    <mat-icon>add</mat-icon>
                    Add User
                </button>
            </div>

            <mat-card>
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search</mat-label>
                            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by code or name...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                    </div>

                    <table mat-table [dataSource]="filteredUsers()" class="users-table">
                        <ng-container matColumnDef="code">
                            <th mat-header-cell *matHeaderCellDef>Code</th>
                            <td mat-cell *matCellDef="let u">{{ u.userCode }}</td>
                        </ng-container>

                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Name</th>
                            <td mat-cell *matCellDef="let u">
                                <div>
                                    <strong>{{ u.fullName }}</strong>
                                    <div class="text-muted">{{ u.username || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="contact">
                            <th mat-header-cell *matHeaderCellDef>Contact</th>
                            <td mat-cell *matCellDef="let u">
                                <div>
                                    <div>{{ u.phone || '-' }}</div>
                                    <div class="text-muted">{{ u.email || '-' }}</div>
                                </div>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="role">
                            <th mat-header-cell *matHeaderCellDef>Role</th>
                            <td mat-cell *matCellDef="let u">
                                <mat-chip>{{ u.role?.roleName || '-' }}</mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Status</th>
                            <td mat-cell *matCellDef="let u">
                                <mat-chip [class.active]="u.isActive" [class.inactive]="!u.isActive">
                                    {{ u.isActive ? 'Active' : 'Inactive' }}
                                </mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let u">
                                <button mat-icon-button (click)="editUser(u)" matTooltip="Edit">
                                    <mat-icon>edit</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>
                    </table>

                    @if (filteredUsers().length === 0 && !loading()) {
                        <div class="no-data">
                            <mat-icon>admin_panel_settings</mat-icon>
                            <p>{{ searchText ? 'No users found' : 'No admins or managers added yet' }}</p>
                            @if (!searchText) {
                                <button mat-raised-button color="primary" (click)="addUser()">
                                    Add First User
                                </button>
                            }
                        </div>
                    }

                    @if (loading()) {
                        <div class="loading">
                            <p>Loading users...</p>
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

        .users-table {
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
export class StaffUsersListComponent implements OnInit {
    users = signal<StaffUser[]>([]);
    filteredUsers = signal<StaffUser[]>([]);
    loading = signal(false);
    searchText = '';

    displayedColumns = ['code', 'name', 'contact', 'role', 'status', 'actions'];

    constructor(
        private staffUserService: StaffUserService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);

        const unwrap = (response: any): StaffUser[] =>
            Array.isArray(response) ? response : (response?.data || []);

        // Backend supports roleId filter; fetch only ADMIN (1) and MANAGER (2)
        forkJoin({
            admins: this.staffUserService.getAll({ page: 1, limit: 2000, roleId: 1 }),
            managers: this.staffUserService.getAll({ page: 1, limit: 2000, roleId: 2 }),
        }).subscribe({
            next: ({ admins, managers }) => {
                const merged = [...unwrap(admins), ...unwrap(managers)];
                const uniqueById = new Map<string, StaffUser>();
                for (const u of merged) uniqueById.set(u.userId, u);
                const staff = Array.from(uniqueById.values());

                staff.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

                this.users.set(staff);
                this.filteredUsers.set(staff);
                this.loading.set(false);
            },
            error: () => {
                this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
                this.loading.set(false);
            },
        });
    }

    applyFilter() {
        const search = this.searchText.toLowerCase().trim();
        const filtered = this.users().filter(u =>
            u.userCode.toLowerCase().includes(search) ||
            u.fullName.toLowerCase().includes(search) ||
            (u.username && u.username.toLowerCase().includes(search))
        );
        this.filteredUsers.set(filtered);
    }

    addUser() {
        const ref = this.dialog.open(StaffUserFormDialogComponent, {
            data: { mode: 'create' },
            width: '700px',
        });
        ref.afterClosed().subscribe((saved) => {
            if (saved) this.loadUsers();
        });
    }

    editUser(user: StaffUser) {
        const ref = this.dialog.open(StaffUserFormDialogComponent, {
            data: { mode: 'edit', user },
            width: '700px',
        });
        ref.afterClosed().subscribe((saved) => {
            if (saved) this.loadUsers();
        });
    }
}
