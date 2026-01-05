import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface StockItem {
    itemId: string;
    itemCode: string;
    itemName: string;
    itemType: string;
    category: string;
    unit: string;
    qtyOnHand: number;
    lastUpdated: string;
}

@Component({
    selector: 'app-inventory',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    template: `
        <div class="page-container">
            <div class="page-header">
                <div class="header-content">
                    <mat-icon class="page-icon">inventory</mat-icon>
                    <div>
                        <h1>Inventory Management</h1>
                        <p class="subtitle">Track stock levels and inventory movements</p>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="summary-cards">
                <mat-card class="summary-card raw">
                    <mat-icon>category</mat-icon>
                    <div class="summary-info">
                        <span class="summary-value">{{ rawMaterialsCount() }}</span>
                        <span class="summary-label">Raw Materials</span>
                    </div>
                </mat-card>
                <mat-card class="summary-card finished">
                    <mat-icon>inventory_2</mat-icon>
                    <div class="summary-info">
                        <span class="summary-value">{{ finishedProductsCount() }}</span>
                        <span class="summary-label">Finished Products</span>
                    </div>
                </mat-card>
                <mat-card class="summary-card low">
                    <mat-icon>warning</mat-icon>
                    <div class="summary-info">
                        <span class="summary-value">{{ lowStockCount() }}</span>
                        <span class="summary-label">Low Stock Items</span>
                    </div>
                </mat-card>
                <mat-card class="summary-card total">
                    <mat-icon>assessment</mat-icon>
                    <div class="summary-info">
                        <span class="summary-value">{{ totalItems() }}</span>
                        <span class="summary-label">Total Items</span>
                    </div>
                </mat-card>
            </div>

            <!-- Filters -->
            <mat-card class="filters-card">
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search Items</mat-label>
                            <input matInput [(ngModel)]="searchText" (ngModelChange)="onSearchTextChange()" placeholder="Search by code or name...">
                            <mat-icon matPrefix>search</mat-icon>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                            <mat-label>Item Type</mat-label>
                            <mat-select [(ngModel)]="selectedType" (ngModelChange)="applyFilters()">
                                <mat-option value="">All Types</mat-option>
                                <mat-option value="RAW">Raw Materials</mat-option>
                                <mat-option value="PRODUCT">Finished Products</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                            <mat-label>Stock Level</mat-label>
                            <mat-select [(ngModel)]="stockFilter" (ngModelChange)="applyFilters()">
                                <mat-option value="">All Levels</mat-option>
                                <mat-option value="low">Low Stock (< 10)</mat-option>
                                <mat-option value="out">Out of Stock</mat-option>
                                <mat-option value="healthy">Healthy (>= 10)</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <button mat-stroked-button color="primary" (click)="refreshData()">
                            <mat-icon>refresh</mat-icon>
                            Refresh
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Data Table -->
            <mat-card>
                <mat-card-content>
                    @if (loading()) {
                        <div class="loading-container">
                            <mat-spinner></mat-spinner>
                            <p>Loading inventory data...</p>
                        </div>
                    } @else if (filteredItems().length === 0) {
                        <div class="no-data">
                            <mat-icon>inventory_2</mat-icon>
                            <p>No inventory items found</p>
                        </div>
                    } @else {
                        <div class="table-container">
                            <table mat-table [dataSource]="filteredItems()" class="inventory-table">
                                
                                <!-- Item Code Column -->
                                <ng-container matColumnDef="itemCode">
                                    <th mat-header-cell *matHeaderCellDef>Item Code</th>
                                    <td mat-cell *matCellDef="let item">
                                        <span class="item-code">{{ item.itemCode }}</span>
                                    </td>
                                </ng-container>

                                <!-- Item Name Column -->
                                <ng-container matColumnDef="itemName">
                                    <th mat-header-cell *matHeaderCellDef>Item Name</th>
                                    <td mat-cell *matCellDef="let item">
                                        <div class="item-info">
                                            <span class="item-name">{{ item.itemName }}</span>
                                            <span class="item-category" *ngIf="item.category">{{ item.category }}</span>
                                        </div>
                                    </td>
                                </ng-container>

                                <!-- Type Column -->
                                <ng-container matColumnDef="itemType">
                                    <th mat-header-cell *matHeaderCellDef>Type</th>
                                    <td mat-cell *matCellDef="let item">
                                        <mat-chip [class]="'type-' + item.itemType.toLowerCase()">
                                            <mat-icon *ngIf="item.itemType === 'RAW'">category</mat-icon>
                                            <mat-icon *ngIf="item.itemType === 'PRODUCT'">inventory_2</mat-icon>
                                            {{ item.itemType === 'RAW' ? 'Raw Material' : 'Finished' }}
                                        </mat-chip>
                                    </td>
                                </ng-container>

                                <!-- Quantity Column -->
                                <ng-container matColumnDef="qtyOnHand">
                                    <th mat-header-cell *matHeaderCellDef class="text-right">Quantity</th>
                                    <td mat-cell *matCellDef="let item" class="text-right">
                                        <div class="qty-cell">
                                            <span class="qty-value" [class.low-stock]="item.qtyOnHand < 10" [class.out-of-stock]="item.qtyOnHand <= 0">
                                                {{ item.qtyOnHand | number:'1.0-3' }}
                                            </span>
                                            <span class="qty-unit">{{ item.unit }}</span>
                                        </div>
                                    </td>
                                </ng-container>

                                <!-- Status Column -->
                                <ng-container matColumnDef="status">
                                    <th mat-header-cell *matHeaderCellDef class="text-center">Status</th>
                                    <td mat-cell *matCellDef="let item" class="text-center">
                                        <mat-chip *ngIf="item.qtyOnHand <= 0" class="status-out">
                                            <mat-icon>error</mat-icon>
                                            Out of Stock
                                        </mat-chip>
                                        <mat-chip *ngIf="item.qtyOnHand > 0 && item.qtyOnHand < 10" class="status-low">
                                            <mat-icon>warning</mat-icon>
                                            Low Stock
                                        </mat-chip>
                                        <mat-chip *ngIf="item.qtyOnHand >= 10" class="status-ok">
                                            <mat-icon>check_circle</mat-icon>
                                            In Stock
                                        </mat-chip>
                                    </td>
                                </ng-container>

                                <!-- Last Updated Column -->
                                <ng-container matColumnDef="lastUpdated">
                                    <th mat-header-cell *matHeaderCellDef>Last Updated</th>
                                    <td mat-cell *matCellDef="let item">
                                        {{ item.lastUpdated | date:'MMM dd, yyyy HH:mm' }}
                                    </td>
                                </ng-container>

                                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                                <tr mat-row *matRowDef="let row; columns: displayedColumns; trackBy: trackByItem" class="inventory-row"></tr>
                            </table>
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
            margin-bottom: 24px;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .page-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: #1976d2;
        }

        .page-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            color: #1a1a1a;
        }

        .subtitle {
            margin: 4px 0 0 0;
            color: #666;
            font-size: 14px;
        }

        /* Summary Cards */
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .summary-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border-radius: 12px;
            border: none;
        }

        .summary-card mat-icon {
            font-size: 40px;
            width: 40px;
            height: 40px;
        }

        .summary-card.raw {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }

        .summary-card.raw mat-icon {
            color: #1565c0;
        }

        .summary-card.finished {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        }

        .summary-card.finished mat-icon {
            color: #2e7d32;
        }

        .summary-card.low {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        }

        .summary-card.low mat-icon {
            color: #ef6c00;
        }

        .summary-card.total {
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        }

        .summary-card.total mat-icon {
            color: #7b1fa2;
        }

        .summary-info {
            display: flex;
            flex-direction: column;
        }

        .summary-value {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1;
        }

        .summary-label {
            font-size: 13px;
            color: #666;
            margin-top: 4px;
        }

        /* Filters */
        .filters-card {
            margin-bottom: 24px;
        }

        .filters {
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
        }

        .search-field {
            flex: 1;
            min-width: 250px;
        }

        /* Table */
        .table-container {
            overflow-x: auto;
        }

        .inventory-table {
            width: 100%;
        }

        .inventory-table th {
            font-weight: 600;
            color: #666;
            background: #f8f9fa;
        }

        .inventory-row {
            transition: background-color 0.2s;
        }

        .inventory-row:hover {
            background-color: #f5f5f5;
        }

        .item-code {
            font-weight: 600;
            color: #1976d2;
            font-family: monospace;
        }

        .item-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .item-name {
            font-weight: 500;
            color: #1a1a1a;
        }

        .item-category {
            font-size: 12px;
            color: #666;
        }

        .type-raw {
            background-color: #e3f2fd;
            color: #1565c0;
        }

        .type-product {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .type-raw mat-icon,
        .type-product mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            margin-right: 4px;
        }

        .qty-cell {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
        }

        .qty-value {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
        }

        .qty-value.low-stock {
            color: #ef6c00;
        }

        .qty-value.out-of-stock {
            color: #d32f2f;
        }

        .qty-unit {
            font-size: 12px;
            color: #666;
        }

        .status-ok {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .status-low {
            background-color: #fff3e0;
            color: #ef6c00;
        }

        .status-out {
            background-color: #ffebee;
            color: #c62828;
        }

        .status-ok mat-icon,
        .status-low mat-icon,
        .status-out mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            margin-right: 4px;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .loading-container,
        .no-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 64px 24px;
            gap: 16px;
        }

        .no-data mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            color: #ccc;
        }

        .no-data p {
            color: #999;
            font-size: 16px;
        }
    `]
})
export class InventoryComponent implements OnInit {
    items = signal<StockItem[]>([]);
    filteredItems = signal<StockItem[]>([]);
    loading = signal(false);

    searchText = '';
    selectedType = '';
    stockFilter = '';

    private searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

    trackByItem = (_index: number, item: StockItem) => item.itemId;

    displayedColumns = ['itemCode', 'itemName', 'itemType', 'qtyOnHand', 'status', 'lastUpdated'];

    // Computed values for summary cards
    rawMaterialsCount = computed(() => this.items().filter(i => i.itemType === 'RAW').length);
    finishedProductsCount = computed(() => this.items().filter(i => i.itemType === 'PRODUCT').length);
    lowStockCount = computed(() => this.items().filter(i => i.qtyOnHand < 10).length);
    totalItems = computed(() => this.items().length);

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadInventory();
    }

    onSearchTextChange() {
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => this.applyFilters(), 200);
    }

    loadInventory() {
        this.loading.set(true);
        this.http.get<StockItem[]>(`${environment.apiUrl}/reports/stock`).subscribe({
            next: (data) => {
                this.items.set(data);
                this.applyFilters();
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading inventory:', err);
                this.snackBar.open('Error loading inventory data', 'Close', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    applyFilters() {
        let result = [...this.items()];

        // Search filter
        if (this.searchText.trim()) {
            const search = this.searchText.toLowerCase().trim();
            result = result.filter(item =>
                item.itemCode.toLowerCase().includes(search) ||
                item.itemName.toLowerCase().includes(search) ||
                (item.category && item.category.toLowerCase().includes(search))
            );
        }

        // Type filter
        if (this.selectedType) {
            result = result.filter(item => item.itemType === this.selectedType);
        }

        // Stock level filter
        if (this.stockFilter) {
            switch (this.stockFilter) {
                case 'low':
                    result = result.filter(item => item.qtyOnHand < 10 && item.qtyOnHand > 0);
                    break;
                case 'out':
                    result = result.filter(item => item.qtyOnHand <= 0);
                    break;
                case 'healthy':
                    result = result.filter(item => item.qtyOnHand >= 10);
                    break;
            }
        }

        this.filteredItems.set(result);
    }

    refreshData() {
        this.loadInventory();
        this.snackBar.open('Inventory data refreshed', 'Close', { duration: 2000 });
    }
}
