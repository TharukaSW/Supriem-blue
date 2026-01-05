import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../core/services/api.service';

interface DashboardData {
    period: { month: string };
    sales: { total: number; count: number };
    purchases: { total: number; count: number };
    expenses: { total: number; count: number };
    pendingOrders: number;
    lowStockItems: number;
    todayAttendance: number;
    profit: number;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Dashboard</h1>
        @if (data()) {
          <span class="period">{{ data()?.period?.month }}</span>
        }
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (data()) {
        <div class="card-grid">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon sales">point_of_sale</mat-icon>
              <mat-card-title>Sales This Month</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value">LKR {{ formatNumber(data()!.sales.total) }}</div>
              <div class="label">{{ data()!.sales.count }} invoices</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon purchases">shopping_cart</mat-icon>
              <mat-card-title>Purchases This Month</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value">LKR {{ formatNumber(data()!.purchases.total) }}</div>
              <div class="label">{{ data()!.purchases.count }} orders</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon expenses">payments</mat-icon>
              <mat-card-title>Expenses This Month</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value">LKR {{ formatNumber(data()!.expenses.total) }}</div>
              <div class="label">{{ data()!.expenses.count }} entries</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon profit" [class.negative]="data()!.profit < 0">trending_up</mat-icon>
              <mat-card-title>Profit</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value" [class.text-success]="data()!.profit >= 0" [class.text-danger]="data()!.profit < 0">
                LKR {{ formatNumber(data()!.profit) }}
              </div>
              <div class="label">This month</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon orders">pending_actions</mat-icon>
              <mat-card-title>Pending Orders</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value">{{ data()!.pendingOrders }}</div>
              <div class="label">Awaiting confirmation</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon stock" [class.warning]="data()!.lowStockItems > 0">inventory</mat-icon>
              <mat-card-title>Low Stock Items</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value" [class.text-warning]="data()!.lowStockItems > 0">{{ data()!.lowStockItems }}</div>
              <div class="label">Items below 10 units</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon attendance">badge</mat-icon>
              <mat-card-title>Today's Attendance</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="value">{{ data()!.todayAttendance }}</div>
              <div class="label">Employees clocked in</div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
    styles: [`
    .period {
      color: #666;
      font-size: 0.875rem;
    }

    .card-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      line-height: 48px;
      border-radius: 8px;
      color: white;

      &.sales { background: #4caf50; }
      &.purchases { background: #2196f3; }
      &.expenses { background: #ff9800; }
      &.profit { background: #9c27b0; }
      &.orders { background: #607d8b; }
      &.stock { background: #795548; }
      &.stock.warning { background: #f44336; }
      &.attendance { background: #00bcd4; }
    }
  `],
})
export class DashboardComponent implements OnInit {
    loading = signal(true);
    data = signal<DashboardData | null>(null);

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.api.get<DashboardData>('reports/dashboard').subscribe({
            next: (res) => {
                this.data.set(res);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    formatNumber(num: number): string {
        return num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
