import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../core/services/api.service';

interface UserProfile {
    userId: string;
    userCode: string;
    roleId: number;
    fullName: string;
    username?: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    role?: {
        roleId: number;
        roleName: string;
        idPrefix: string;
    };
    employeeProfile?: {
        userId: string;
        nic?: string;
        address?: string;
        joinedDate?: string;
        designation?: string;
        basicSalary: number;
        salaryRangeId?: string;
        otRate: number;
        notes?: string;
        salaryRange?: {
            rangeName: string;
            minSalary: number;
            maxSalary: number;
        };
    };
}

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        MatTabsModule,
    ],
    template: `
        <div class="page-container">
            @if (loading()) {
                <div class="loading-container">
                    <mat-spinner></mat-spinner>
                </div>
            } @else if (user()) {
                <div class="profile-header">
                    <button mat-icon-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <div class="header-content">
                        <div class="user-avatar">
                            <mat-icon>account_circle</mat-icon>
                        </div>
                        <div class="header-info">
                            <h1>{{ user()?.fullName }}</h1>
                            <p class="user-code">{{ user()?.userCode }}</p>
                            <mat-chip [class]="getRoleClass()">
                                <mat-icon>{{ getRoleIcon() }}</mat-icon>
                                {{ user()?.role?.roleName }}
                            </mat-chip>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button mat-raised-button color="primary" [routerLink]="['/users', user()?.userId, 'edit']">
                            <mat-icon>edit</mat-icon>
                            Edit Profile
                        </button>
                    </div>
                </div>

                <mat-tab-group class="profile-tabs">
                    <!-- General Information Tab -->
                    <mat-tab label="General Information">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>person</mat-icon>
                                        Personal Information
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <label>Full Name</label>
                                            <p>{{ user()?.fullName }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>User Code</label>
                                            <p>{{ user()?.userCode }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Username</label>
                                            <p>{{ user()?.username || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Email</label>
                                            <p>{{ user()?.email || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Phone</label>
                                            <p>{{ user()?.phone || '-' }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Role</label>
                                            <p>{{ user()?.role?.roleName }}</p>
                                        </div>
                                        <div class="info-item">
                                            <label>Status</label>
                                            <p>
                                                <mat-chip [class]="user()?.isActive ? 'status-active' : 'status-inactive'">
                                                    {{ user()?.isActive ? 'Active' : 'Inactive' }}
                                                </mat-chip>
                                            </p>
                                        </div>
                                        <div class="info-item">
                                            <label>Created At</label>
                                            <p>{{ user()?.createdAt | date: 'medium' }}</p>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>

                    <!-- Employee Details Tab (if applicable) -->
                    @if (user()?.employeeProfile) {
                        <mat-tab label="Employee Details">
                            <div class="tab-content">
                                <mat-card class="info-card">
                                    <mat-card-header>
                                        <mat-card-title>
                                            <mat-icon>badge</mat-icon>
                                            Employment Information
                                        </mat-card-title>
                                    </mat-card-header>
                                    <mat-card-content>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <label>NIC</label>
                                                <p>{{ user()?.employeeProfile?.nic || '-' }}</p>
                                            </div>
                                            <div class="info-item">
                                                <label>Designation</label>
                                                <p>{{ user()?.employeeProfile?.designation || '-' }}</p>
                                            </div>
                                            <div class="info-item">
                                                <label>Joined Date</label>
                                                <p>{{ user()?.employeeProfile?.joinedDate | date: 'mediumDate' }}</p>
                                            </div>
                                            <div class="info-item">
                                                <label>Address</label>
                                                <p>{{ user()?.employeeProfile?.address || '-' }}</p>
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
                                                <p class="amount">{{ user()?.employeeProfile?.basicSalary | number: '1.2-2' }} LKR</p>
                                            </div>
                                            <div class="info-item">
                                                <label>OT Rate</label>
                                                <p class="amount">{{ user()?.employeeProfile?.otRate | number: '1.2-2' }} LKR/hr</p>
                                            </div>
                                            @if (user()?.employeeProfile?.salaryRange) {
                                                <div class="info-item">
                                                    <label>Salary Range</label>
                                                    <p>{{ user()?.employeeProfile?.salaryRange?.rangeName }}</p>
                                                </div>
                                                <div class="info-item">
                                                    <label>Range Min - Max</label>
                                                    <p class="amount">
                                                        {{ user()?.employeeProfile?.salaryRange?.minSalary | number: '1.2-2' }} - 
                                                        {{ user()?.employeeProfile?.salaryRange?.maxSalary | number: '1.2-2' }} LKR
                                                    </p>
                                                </div>
                                            }
                                        </div>

                                        @if (user()?.employeeProfile?.notes) {
                                            <mat-divider class="section-divider"></mat-divider>
                                            <div class="info-item full-width">
                                                <label>Notes</label>
                                                <p class="notes">{{ user()?.employeeProfile?.notes }}</p>
                                            </div>
                                        }
                                    </mat-card-content>
                                </mat-card>
                            </div>
                        </mat-tab>
                    }

                    <!-- Activity Tab -->
                    <mat-tab label="Activity">
                        <div class="tab-content">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>
                                        <mat-icon>history</mat-icon>
                                        Recent Activity
                                    </mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <p class="no-data">Activity tracking coming soon...</p>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </mat-tab>
                </mat-tab-group>
            } @else {
                <div class="error-container">
                    <mat-icon>error_outline</mat-icon>
                    <p>User not found</p>
                    <button mat-raised-button (click)="goBack()">Go Back</button>
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

        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
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

        .user-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-avatar mat-icon {
            font-size: 80px;
            width: 80px;
            height: 80px;
            color: white;
        }

        .header-info h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 600;
        }

        .user-code {
            margin: 0 0 12px 0;
            opacity: 0.9;
            font-size: 16px;
        }

        .header-info mat-chip {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 500;
        }

        .header-info mat-chip mat-icon {
            color: white;
            margin-right: 4px;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .header-actions button {
            background: white;
            color: #667eea;
        }

        .profile-tabs {
            margin-top: 24px;
        }

        .tab-content {
            padding: 24px 0;
        }

        .info-card {
            margin-bottom: 24px;
        }

        .info-card mat-card-header {
            margin-bottom: 24px;
        }

        .info-card mat-card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            color: rgba(0, 0, 0, 0.87);
        }

        .info-card mat-card-title mat-icon {
            color: #667eea;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-item.full-width {
            grid-column: 1 / -1;
        }

        .info-item label {
            font-size: 12px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.6);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .info-item p {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            margin: 0;
        }

        .info-item p.amount {
            font-size: 18px;
            font-weight: 600;
            color: #4caf50;
        }

        .info-item p.notes {
            white-space: pre-wrap;
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
        }

        .section-divider {
            margin: 32px 0;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 24px 0 16px 0;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.87);
        }

        .section-title mat-icon {
            color: #667eea;
        }

        .status-active {
            background: #4caf50 !important;
            color: white !important;
        }

        .status-inactive {
            background: #f44336 !important;
            color: white !important;
        }

        .admin {
            background: #f44336;
            color: white;
        }

        .manager {
            background: #ff9800;
            color: white;
        }

        .user {
            background: #2196f3;
            color: white;
        }

        .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
        }

        .error-container mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            color: rgba(0, 0, 0, 0.54);
        }

        .no-data {
            text-align: center;
            color: rgba(0, 0, 0, 0.54);
            padding: 40px;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .page-container {
                padding: 16px;
            }

            .profile-header {
                padding: 24px 16px;
            }

            .header-content {
                flex-direction: column;
                text-align: center;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class UserProfileComponent implements OnInit {
    user = signal<UserProfile | null>(null);
    loading = signal(true);
    userId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private api: ApiService
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.userId = params['id'];
            this.loadUserProfile();
        });
    }

    loadUserProfile() {
        this.loading.set(true);
        this.api.get<UserProfile>(`users/${this.userId}`, { includeEmployee: true }).subscribe({
            next: (data) => {
                this.user.set(data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading user profile:', error);
                this.loading.set(false);
            }
        });
    }

    getRoleClass(): string {
        const roleName = this.user()?.role?.roleName?.toLowerCase();
        return roleName || 'user';
    }

    getRoleIcon(): string {
        const roleName = this.user()?.role?.roleName?.toLowerCase();
        switch (roleName) {
            case 'admin':
                return 'admin_panel_settings';
            case 'manager':
                return 'supervisor_account';
            default:
                return 'person';
        }
    }

    goBack() {
        this.router.navigate(['/users']);
    }
}
