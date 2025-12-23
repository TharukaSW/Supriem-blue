import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-items-list',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    template: `
    <div class="page-container">
      <div class="page-header"><h1>Items</h1></div>
      <mat-card>
        <mat-card-content class="placeholder">
          <mat-icon>inventory_2</mat-icon>
          <p>Items management module - Coming soon</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`.placeholder { text-align: center; padding: 48px; mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; } p { color: #666; } }`],
})
export class ItemsListComponent { }
