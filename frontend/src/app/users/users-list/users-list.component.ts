import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatChipsModule,
    ],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Users</h1>
        <button mat-raised-button color="primary" routerLink="/users/new">
          <mat-icon>add</mat-icon>
          New User
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="users()" class="full-width mat-elevation-z2">
          <ng-container matColumnDef="userCode">
            <th mat-header-cell *matHeaderCellDef>User Code</th>
            <td mat-cell *matCellDef="let row">{{ row.userCode }}</td>
          </ng-container>
          <ng-container matColumnDef="fullName">
            <th mat-header-cell *matHeaderCellDef>Full Name</th>
            <td mat-cell *matCellDef="let row">{{ row.fullName }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [class]="row.role?.roleName?.toLowerCase()">{{ row.role?.roleName }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <span [class.text-success]="row.isActive" [class.text-danger]="!row.isActive">
                {{ row.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button [routerLink]="['/users', row.userId]">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPageChange($event)"></mat-paginator>
      }
    </div>
  `,
    styles: [`
    mat-chip.admin { background: #e91e63; color: white; }
    mat-chip.manager { background: #9c27b0; color: white; }
    mat-chip.user { background: #2196f3; color: white; }
  `],
})
export class UsersListComponent implements OnInit {
    loading = signal(true);
    users = signal<any[]>([]);
    total = signal(0);
    pageSize = 10;
    page = 1;
    displayedColumns = ['userCode', 'fullName', 'role', 'status', 'actions'];

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);
        this.api.get<any>('users', { page: this.page, limit: this.pageSize }).subscribe({
            next: (res) => {
                this.users.set(res.data || []);
                this.total.set(res.meta?.total || 0);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    onPageChange(event: PageEvent) {
        this.page = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadUsers();
    }
}
