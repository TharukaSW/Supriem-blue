import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductionService } from '../services/production.service';
import { ItemService } from '../../masters/services/item.service';

@Component({
  selector: 'app-production-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>factory</mat-icon>
      {{ isEdit ? 'Edit' : 'New' }} Production Entry
    </h2>
    <div mat-dialog-content>
      <form [formGroup]="productionForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Production Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="productionDate" required>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="productionForm.get('productionDate')?.hasError('required')">
            Production date is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Finished Product</mat-label>
          <mat-select formControlName="finishedProductId" required>
            <mat-option>
              <input type="text" placeholder="Search products..." (input)="onProductSearch($event)" 
                     (click)="$event.stopPropagation()" class="search-input">
            </mat-option>
            @for (product of filteredProducts(); track product.itemId) {
              <mat-option [value]="product.itemId">
                {{ product.itemName }} ({{ product.unit?.unitName }})
              </mat-option>
            }
          </mat-select>
          <mat-error *ngIf="productionForm.get('finishedProductId')?.hasError('required')">
            Product is required
          </mat-error>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Quantity Produced</mat-label>
            <input matInput type="number" formControlName="quantity" required min="0" step="0.01">
            <mat-error *ngIf="productionForm.get('quantity')?.hasError('required')">
              Quantity is required
            </mat-error>
            <mat-error *ngIf="productionForm.get('quantity')?.hasError('min')">
              Quantity must be positive
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Scrap Quantity</mat-label>
            <input matInput type="number" formControlName="scrapQuantity" min="0" step="0.01">
            <mat-hint>Optional - damaged or unusable</mat-hint>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3" placeholder="Production notes or remarks..."></textarea>
        </mat-form-field>
      </form>

      @if (loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!productionForm.valid || loading()">
        <mat-icon>save</mat-icon>
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-input {
      width: calc(100% - 20px);
      padding: 8px;
      margin: 4px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      outline: none;
      &:focus {
        border-color: #3f51b5;
      }
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  `]
})
export class ProductionFormDialogComponent implements OnInit {
  productionForm: FormGroup;
  isEdit = false;
  loading = signal(false);
  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private productionService: ProductionService,
    private itemService: ItemService,
    private dialogRef: MatDialogRef<ProductionFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data;
    this.productionForm = this.fb.group({
      productionDate: [data?.productionDate ? new Date(data.productionDate) : new Date(), Validators.required],
      finishedProductId: [data?.finishedProductId || '', Validators.required],
      quantity: [data?.quantity || '', [Validators.required, Validators.min(0.01)]],
      scrapQuantity: [data?.scrapQuantity || 0, [Validators.min(0)]],
      notes: [data?.notes || '']
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.itemService.getProducts().subscribe({
      next: (response: any) => {
        this.products.set(response.data);
        this.filteredProducts.set(response.data);
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  onProductSearch(event: any) {
    const search = event.target.value.toLowerCase();
    const filtered = this.products().filter(p =>
      p.itemName.toLowerCase().includes(search) ||
      p.itemCode?.toLowerCase().includes(search)
    );
    this.filteredProducts.set(filtered);
  }

  onSubmit() {
    if (this.productionForm.valid) {
      this.loading.set(true);
      const formData = {
        ...this.productionForm.value,
        productionDate: this.formatDate(this.productionForm.value.productionDate),
        quantity: Number(this.productionForm.value.quantity),
        scrapQuantity: Number(this.productionForm.value.scrapQuantity || 0)
      };

      const request = this.isEdit
        ? this.productionService.updateProduction(this.data.productionDayId, formData)
        : this.productionService.createProduction(formData);

      request.subscribe({
        next: (response) => {
          this.snackBar.open(
            `Production ${this.isEdit ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.loading.set(false);
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error saving production:', err);
          this.snackBar.open(
            err.error?.message || 'Failed to save production',
            'Close',
            { duration: 3000 }
          );
          this.loading.set(false);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
