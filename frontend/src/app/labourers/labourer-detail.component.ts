import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Labourer, LabourerService } from './services/labourer.service';
import { LabourerFormDialogComponent } from './labourer-form-dialog.component';

@Component({
    selector: 'app-labourer-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatTooltipModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    template: `
        <div class="page-container">
            @if (labourer()) {
                <div class="profile-header">
                    <button mat-icon-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div class="header-content">
                        <div class="labourer-avatar">
                            <mat-icon>badge</mat-icon>
                        </div>
                        <div class="header-info">
                            <h1>{{ labourer()!.fullName }}</h1>
                            <p class="labourer-code">{{ labourer()!.userCode }}</p>
                            <mat-chip [class.active]="labourer()!.isActive" [class.inactive]="!labourer()!.isActive">
                                <mat-icon>{{ labourer()!.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                                {{ labourer()!.isActive ? 'Active' : 'Inactive' }}
                            </mat-chip>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button mat-raised-button color="primary" (click)="editLabourer()">
                            <mat-icon>edit</mat-icon>
                            Edit Labourer
                        </button>
                    </div>
                </div>

                <mat-tab-group class="profile-tabs">
                    <mat-tab label="Labourer Information">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>person</mat-icon>
                                        Labourer Details
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Labourer Code</label>
                                            <p>{{ labourer()!.userCode }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Full Name</label>
                                            <p>{{ labourer()!.fullName }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Phone</label>
                                            <p>{{ labourer()!.phone || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Role</label>
                                            <p>{{ displayRole(labourer()!.role?.roleName) }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Status</label>
                                            <p>
                                                <mat-chip [class.status-active]="labourer()!.isActive" [class.status-inactive]="!labourer()!.isActive">
                                                    {{ labourer()!.isActive ? 'Active' : 'Inactive' }}
                                                </mat-chip>
                                            </p>
                                        </div>
                                        <div class="info-item">
                                            <label>Created At</label>
                                            <p>{{ labourer()!.createdAt | date: 'medium' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Last Updated</label>
                                            <p>{{ labourer()!.updatedAt | date: 'medium' }}</p>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>

                    @if (labourer()!.employeeProfile) {
                        <mat-tab label="Employee Details">
                            <div class="tab-content">
                                <mat-card class="info-card">
                                    <mat-card-header>
                                        <mat-card-title>
                                            <mat-icon>work</mat-icon>
                                            Employment Information
                                        </mat-card-title>
                                    </mat-card-header>
                                    <mat-card-content>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <label>NIC</label>
                                                <p>{{ labourer()!.employeeProfile?.nic || '-' }}</p>
                                            </div>
                                            <div class="info-item">
                                                <label>Designation</label>
                                                <p>{{ labourer()!.employeeProfile?.designation || '-' }}</p>
                                            </div>
                                            <div class="info-item">
                                                <label>Joined Date</label>
                                                <p>{{ labourer()!.employeeProfile?.joinedDate | date: 'mediumDate' }}</p>
                                            </div>
                                            <div class="info-item full-width">
                                                <label>Address</label>
                                                <p>{{ labourer()!.employeeProfile?.address || '-' }}</p>
                                            </div>
                                        </div>

                                        <mat-divider class="section-divider"></mat-divider>

                                        <h3 class="section-title">
                                            <mat-icon>payments</mat-icon>
                                            Salary Information
                                        </h3>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <label>Basic Salary</label>
                                                <p class="amount">{{ labourer()!.employeeProfile?.basicSalary | number: '1.2-2' }} LKR</p>
                                            </div>
                                            <div class="info-item">
                                                <label>OT Rate</label>
                                                <p class="amount">{{ labourer()!.employeeProfile?.otRate | number: '1.2-2' }} LKR/hr</p>
                                            </div>
                                            @if (labourer()!.employeeProfile?.salaryRange) {
                                                <div class="info-item">
                                                    <label>Salary Range</label>
                                                    <p>{{ labourer()!.employeeProfile?.salaryRange?.rangeName }}</p>
                                                </div>
                                                <div class="info-item">
                                                    <label>Range Min - Max</label>
                                                    <p class="amount">
                                                        {{ labourer()!.employeeProfile?.salaryRange?.minSalary | number: '1.2-2' }} -
                                                        {{ labourer()!.employeeProfile?.salaryRange?.maxSalary | number: '1.2-2' }} LKR
                                                    </p>
                                                </div>
                                            }
                                        </div>

                                        @if (labourer()!.employeeProfile?.notes) {
                                            <mat-divider class="section-divider"></mat-divider>
                                            <div class="info-item full-width">
                                                <label>Notes</label>
                                                <p class="notes">{{ labourer()!.employeeProfile?.notes }}</p>
                                            </div>
                                        }
                                    </mat-card-content>
                                </mat-card>
                            </div>
                        </mat-tab>
                    }
                </mat-tab-group>
            } @else if (!loading()) {
                <div class="error-container">
                    <mat-icon>error_outline</mat-icon>
                    <p>Labourer not found</p>
                    <button mat-raised-button (click)="goBack()">Go Back</button>
                </div>
            } @else {
                <div class="loading">
                    <p>Loading labourer...</p>
                </div>
            }
        </div>
    `,
    styles: [`
        .page-container {
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .profile-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 32px;
            color: white;
            margin-bottom: 24px;
            position: relative;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .back-button {
            position: absolute;
            top: 16px;
            left: 16px;
            color: white;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 16px;
        }

        .labourer-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .labourer-avatar mat-icon {
            font-size: 60px;
            width: 60px;
            height: 60px;
            color: white;
        }

        .header-info h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 500;
        }

        .labourer-code {
            margin: 4px 0 12px;
            opacity: 0.9;
            font-size: 16px;
        }

        mat-chip.active {
            background: rgba(255, 255, 255, 0.25);
            color: white;
        }

        mat-chip.inactive {
            background: rgba(0, 0, 0, 0.25);
            color: white;
        }

        .header-actions {
            display: flex;
            justify-content: flex-end;
        }

        .info-card {
            margin-bottom: 16px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }

        .info-item label {
            display: block;
            color: rgba(0, 0, 0, 0.6);
            font-size: 12px;
            margin-bottom: 4px;
        }

        .info-item p {
            margin: 0;
            font-size: 14px;
        }

        .info-item.full-width {
            grid-column: span 3;
        }

        .section-divider {
            margin: 20px 0;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 12px;
            font-size: 16px;
            font-weight: 500;
        }

        .amount {
            font-weight: 500;
        }

        .notes {
            white-space: pre-wrap;
        }

        mat-chip.status-active {
            background-color: #4caf50;
            color: white;
        }

        mat-chip.status-inactive {
            background-color: #f44336;
            color: white;
        }

        .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: #999;
        }

        .error-container mat-icon {
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

        @media (max-width: 900px) {
            .info-grid {
                grid-template-columns: 1fr;
            }

            .info-item.full-width {
                grid-column: span 1;
            }

            .header-content {
                flex-direction: column;
                align-items: flex-start;
            }

            .header-actions {
                justify-content: flex-start;
            }
        }
    `],
})
export class LabourerDetailComponent implements OnInit {
    labourer = signal<Labourer | null>(null);
    loading = signal(true);

    private labourerId = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private labourerService: LabourerService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.labourerId = params['id'];
            this.load();
        });
    }

    displayRole(roleName?: string): string {
        return roleName === 'USER' ? 'LABOURER' : (roleName || '-');
    }

    load() {
        this.loading.set(true);
        this.labourerService.getOne(this.labourerId, true).subscribe({
            next: (data) => {
                this.labourer.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.snackBar.open('Error loading labourer', 'Close', { duration: 3000 });
            },
        });
    }

    goBack() {
        this.router.navigate(['/labourers']);
    }

    editLabourer() {
        const current = this.labourer();
        if (!current) return;

        const ref = this.dialog.open(LabourerFormDialogComponent, {
            data: { mode: 'edit', labourer: current },
            width: '700px',
        });

        ref.afterClosed().subscribe((saved) => {
            if (saved) this.load();
        });
    }
}
