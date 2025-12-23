import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="logo">
          <h2>SUPREME BLUE</h2>
          <span>ERP System</span>
        </div>
        <mat-divider></mat-divider>
        <mat-nav-list>
          @for (item of filteredNavItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ user()?.fullName }}
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item disabled>
              <mat-icon>badge</mat-icon>
              <span>{{ user()?.userCode }} ({{ user()?.role }})</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: #fafafa;
    }

    .logo {
      padding: 24px 16px;
      text-align: center;

      h2 {
        margin: 0;
        color: #1a237e;
        font-weight: 500;
      }

      span {
        color: #666;
        font-size: 0.875rem;
      }
    }

    .spacer {
      flex: 1;
    }

    .content {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }

    mat-nav-list {
      padding-top: 8px;

      a {
        margin: 4px 8px;
        border-radius: 8px;

        &.active {
          background: rgba(63, 81, 181, 0.1);
          color: #3f51b5;
        }
      }
    }
  `],
})
export class LayoutComponent {
  user;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Users', icon: 'people', route: '/users', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Attendance', icon: 'access_time', route: '/attendance' },
    { label: 'Items', icon: 'inventory_2', route: '/items', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Suppliers', icon: 'local_shipping', route: '/suppliers', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Customers', icon: 'groups', route: '/customers', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Purchases', icon: 'shopping_cart', route: '/purchases', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Sales', icon: 'point_of_sale', route: '/sales', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Production', icon: 'factory', route: '/production', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Invoices', icon: 'receipt_long', route: '/invoices', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Expenses', icon: 'payments', route: '/expenses', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Reports', icon: 'assessment', route: '/reports', roles: ['ADMIN', 'MANAGER'] },
  ];

  filteredNavItems = computed(() => {
    const user = this.user();
    if (!user) return [];
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  });

  constructor(private authService: AuthService) {
    this.user = this.authService.user;
  }

  logout() {
    this.authService.logout();
  }
}

