import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-sales-form',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    template: `
    <div class="page-container">
      <div class="page-header"><h1>New Sales Order</h1></div>
      <mat-card>
        <mat-card-content class="placeholder">
          <mat-icon>add</mat-icon>
          <p>Sales order form - Coming soon</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`.placeholder { text-align: center; padding: 48px; mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; } p { color: #666; } }`],
})
export class SalesFormComponent { }
