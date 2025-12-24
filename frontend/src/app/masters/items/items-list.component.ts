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
import { ItemService, Item } from '../services/item.service';
import { ItemFormDialogComponent } from './item-form-dialog.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';

@Component({
  selector: 'app-items-list',
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
                <h1>Items</h1>
                <button mat-raised-button color="primary" (click)="addItem()">
                    <mat-icon>add</mat-icon>
                    Add Item
                </button>
            </div>

            <mat-card>
                <mat-card-content>
                    <div class="filters">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Search Items</mat-label>
                            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Search by code or name...">
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                    </div>

                    <table mat-table [dataSource]="filteredItems()" class="items-table">
                        <ng-container matColumnDef="code">
                            <th mat-header-cell *matHeaderCellDef>Code</th>
                            <td mat-cell *matCellDef="let item">{{ item.itemCode }}</td>
                        </ng-container>

                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef>Name</th>
                            <td mat-cell *matCellDef="let item">
                                <strong>{{ item.itemName }}</strong>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="type">
                            <th mat-header-cell *matHeaderCellDef>Type</th>
                            <td mat-cell *matCellDef="let item">
                                <mat-chip>{{ item.itemType }}</mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Status</th>
                            <td mat-cell *matCellDef="let item">
                                <mat-chip [class.active]="item.isActive" [class.inactive]="!item.isActive">
                                    {{ item.isActive ? 'Active' : 'Inactive' }}
                                </mat-chip>
                            </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let item">
                                <button mat-icon-button (click)="editItem(item)" matTooltip="Edit">
                                    <mat-icon>edit</mat-icon>
                                </button>
                                <button mat-icon-button 
                                        *ngIf="item.isActive"
                                        (click)="deleteItem(item)" 
                                        matTooltip="Deactivate"
                                        color="warn">
                                    <mat-icon>block</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>
                    </table>

                    @if (filteredItems().length === 0 && !loading()) {
                        <div class="no-data">
                            <mat-icon>inventory_2</mat-icon>
                            <p>{{ searchText ? 'No items found' : 'No items added yet' }}</p>
                            @if (!searchText) {
                                <button mat-raised-button color="primary" (click)="addItem()">
                                    Add First Item
                                </button>
                            }
                        </div>
                    }

                    @if (loading()) {
                        <div class="loading">
                            <p>Loading items...</p>
                        </div>
                    }
                </mat-card-content>
            </mat-card>
        </div>
    `,
  styles: [`
        .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 28px; }
        .filters { margin-bottom: 16px; }
        .search-field { width: 400px; }
        .items-table { width: 100%; }
        mat-chip.active { background-color: #4caf50; color: white; }
        mat-chip.inactive { background-color: #f44336; color: white; }
        .clickable-row:hover { background-color: #f5f5f5; cursor: pointer; }
        .no-data { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #999; }
        .no-data mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
        .loading { text-align: center; padding: 40px; color: #666; }
    `],
})
export class ItemsListComponent implements OnInit {
  items = signal<Item[]>([]);
  filteredItems = signal<Item[]>([]);
  loading = signal(false);
  searchText = '';

  displayedColumns = ['code', 'name', 'type', 'status', 'actions'];

  constructor(
    private router: Router,
    private itemService: ItemService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading.set(true);
    this.itemService.getAll().subscribe({
      next: (response) => {
        // Handle response format from backend { data: [], meta: {} } from api.service
        const items = Array.isArray(response) ? response : (response.data || []);
        this.items.set(items);
        this.filteredItems.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase();
    const filtered = this.items().filter(i =>
      i.itemCode.toLowerCase().includes(search) ||
      i.itemName.toLowerCase().includes(search)
    );
    this.filteredItems.set(filtered);
  }

  addItem() {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }

  editItem(item: Item) {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }

  deleteItem(item: Item) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate Item',
        message: `Are you sure you want to deactivate ${item.itemName}?`,
        confirmText: 'Deactivate'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.itemService.delete(item.itemId).subscribe({
          next: () => {
            this.snackBar.open('Item deactivated successfully', 'Close', { duration: 3000 });
            this.loadItems();
          },
          error: () => {
            this.snackBar.open('Error deactivating item', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
