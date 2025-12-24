import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PurchasingService } from '../services/purchasing.service';
import { SupplierService, Supplier } from '../../masters/services/supplier.service';
import { ItemService, Item } from '../../masters/services/item.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Edit' : 'New' }} Purchase Order</h1>
        <button mat-button routerLink="/purchases">Cancel</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>Header Details</mat-card-title>
          </mat-card-header>
          <mat-card-content class="grid-form">
            
            <!-- Supplier Selection -->
            <mat-form-field appearance="outline">
              <mat-label>Supplier</mat-label>
              <mat-select formControlName="supplierId" (selectionChange)="onSupplierChange($event.value)">
                @for (supplier of suppliers(); track supplier.supplierId) {
                  <mat-option [value]="supplier.supplierId">
                    {{ supplier.supplierName }} ({{ supplier.supplierCode }})
                  </mat-option>
                }
              </mat-select>
              <mat-error *ngIf="form.get('supplierId')?.hasError('required')">Supplier is required</mat-error>
            </mat-form-field>

            <!-- Purchase Date -->
            <mat-form-field appearance="outline">
              <mat-label>Purchase Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="purchaseDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('purchaseDate')?.hasError('required')">Date is required</mat-error>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="notes-field">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="1"></textarea>
            </mat-form-field>

          </mat-card-content>
        </mat-card>

        <!-- Items Table -->
        <mat-card class="mb-4">
          <mat-card-header class="flex-header">
            <mat-card-title>Items</mat-card-title>
            <button type="button" mat-stroked-button color="primary" (click)="addItem()">
              <mat-icon>add</mat-icon> Add Item
            </button>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="lines">
              <table class="w-full data-table">
                <thead>
                  <tr>
                    <th style="width: 30%">Item</th>
                    <th style="width: 15%">Qty</th>
                    <th style="width: 15%">Unit Price</th>
                    <th style="width: 15%">Total</th>
                    <th style="width: 10%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let line of lines.controls; let i=index" [formGroupName]="i">
                    
                    <!-- Item Select -->
                    <td>
                      <mat-form-field appearance="outline" class="dense-field w-full">
                        <mat-select formControlName="itemId" (selectionChange)="onItemChange(i)">
                          <mat-option>
                            <input class="search-input" (keyup)="onItemSearch($event)" placeholder="Search item..." (click)="$event.stopPropagation()">
                          </mat-option>
                          @for (item of filteredItems(); track item.itemId) {
                            <mat-option [value]="item.itemId">
                              {{ item.itemName }} ({{ item.itemCode }})
                            </mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                    </td>

                    <!-- Quantity -->
                    <td>
                      <mat-form-field appearance="outline" class="dense-field w-full">
                        <input matInput type="number" formControlName="qty" min="0.001">
                      </mat-form-field>
                    </td>

                    <!-- Unit Price -->
                    <td>
                      <mat-form-field appearance="outline" class="dense-field w-full">
                        <span matPrefix>Rs.&nbsp;</span>
                        <input matInput type="number" formControlName="unitPrice" min="0">
                      </mat-form-field>
                    </td>

                    <!-- Line Total -->
                    <td class="text-right font-medium">
                      {{ (line.get('qty')?.value * line.get('unitPrice')?.value) || 0 | currency:'LKR ':'symbol':'1.2-2' }}
                    </td>

                    <!-- Actions -->
                    <td class="text-center">
                      <button type="button" mat-icon-button color="warn" (click)="removeLine(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                  
                  @if (lines.length === 0) {
                    <tr>
                      <td colspan="5" class="text-center py-4 text-gray-500">
                        No items added. Click "Add Item" to start.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            
            <!-- Summary Footer -->
             <div class="summary-section">
               <div class="summary-row">
                 <span>Subtotal:</span>
                 <span>{{ subtotal() | currency:'LKR ':'symbol':'1.2-2' }}</span>
               </div>
               <div class="summary-row">
                 <span>Tax:</span>
                 <mat-form-field appearance="outline" class="compact-field">
                    <input matInput type="number" formControlName="tax" min="0">
                 </mat-form-field>
               </div>
               <div class="summary-row">
                 <span>Discount:</span>
                 <mat-form-field appearance="outline" class="compact-field">
                    <input matInput type="number" formControlName="discount" min="0">
                 </mat-form-field>
               </div>
               <div class="summary-row total">
                 <span>Grand Total:</span>
                 <span>{{ grandTotal() | currency:'LKR ':'symbol':'1.2-2' }}</span>
               </div>
             </div>

          </mat-card-content>
        </mat-card>

        <div class="actions-bar">
          <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid || lines.length === 0 || loading()">
            {{ isEditMode ? 'Update Order' : 'Create Order' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .grid-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .notes-field {
      grid-column: span 2;
    }

    .w-full { width: 100%; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .mb-4 { margin-bottom: 16px; }

    .flex-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .data-table {
      border-collapse: collapse;
    }
    
    .data-table th {
      text-align: left;
      padding: 8px 16px;
      color: #666;
      font-weight: 500;
      border-bottom: 1px solid #eee;
    }

    .data-table td {
      padding: 8px 4px;
      vertical-align: middle;
    }

    .dense-field .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }

    .search-input {
      width: 90%;
      margin: 8px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .summary-section {
      margin-top: 24px;
      margin-left: auto;
      width: 300px;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 1.2em;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 8px;
    }

    .compact-field {
      width: 100px;
      text-align: right;
    }

    .actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
      margin-bottom: 48px;
    }
  `]
})
export class PurchaseFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  loading = signal(false);

  suppliers = signal<Supplier[]>([]);
  items = signal<Item[]>([]);
  filteredItems = signal<Item[]>([]);

  // Track form values for reactive computation
  private formValueSignal = signal<any>(null);

  constructor(
    private fb: FormBuilder,
    private purchasingService: PurchasingService,
    private supplierService: SupplierService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      supplierId: ['', Validators.required],
      purchaseDate: [new Date(), Validators.required],
      notes: [''],
      tax: [0, [Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      lines: this.fb.array([])
    });
  }

  get lines() {
    return this.form.get('lines') as FormArray;
  }

  ngOnInit() {
    this.loadMasterData();

    // Track form changes to trigger reactive computations
    this.form.valueChanges.subscribe((value) => {
      this.formValueSignal.set(value);
    });

    // Initialize the signal with current form value
    this.formValueSignal.set(this.form.value);
  }

  loadMasterData() {
    this.loading.set(true);
    // Load Suppliers
    this.supplierService.getAll({ limit: 1000, isActive: true }).subscribe({
      next: (res) => this.suppliers.set(res.data || []),
      error: () => this.snackBar.open('Error loading suppliers', 'Close')
    });

    // Load Items (Raw materials mostly for purchasing)
    this.itemService.getAll({ limit: 1000, isActive: true }).subscribe({
      next: (res) => {
        const items = res.data || [];
        this.items.set(items);
        this.filteredItems.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onItemSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredItems.set(
      this.items().filter(i =>
        i.itemName.toLowerCase().includes(term) ||
        i.itemCode.toLowerCase().includes(term)
      )
    );
  }

  onSupplierChange(supplierId: string) {
    // Optionally alert user if changing supplier with items already added
    // Update prices for existing items (optional logic)
  }

  addItem() {
    const lineGroup = this.fb.group({
      itemId: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(0.001)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });

    // Subscribe to line changes to trigger recalculation
    lineGroup.valueChanges.subscribe(() => {
      this.formValueSignal.set(this.form.value);
    });

    this.lines.push(lineGroup);
    this.formValueSignal.set(this.form.value);
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
    this.formValueSignal.set(this.form.value);
  }

  onItemChange(index: number) {
    const line = this.lines.at(index);
    const itemId = line.get('itemId')?.value;
    const supplierId = this.form.get('supplierId')?.value;

    if (itemId && supplierId) {
      // Fetch agreed price
      this.purchasingService.getSupplierItemPrice(supplierId, itemId).subscribe({
        next: (price) => {
          if (price) {
            line.patchValue({ unitPrice: price.unitPrice });
          }
        }
      });
    }
  }

  // Computed properties - reactively calculated from form values
  subtotal = computed(() => {
    const formValue = this.formValueSignal();
    if (!formValue) return 0;

    const lines = formValue.lines || [];
    return lines.reduce((acc: number, line: any) => {
      const qty = parseFloat(line.qty) || 0;
      const price = parseFloat(line.unitPrice) || 0;
      return acc + (qty * price);
    }, 0);
  });

  grandTotal = computed(() => {
    const formValue = this.formValueSignal();
    if (!formValue) return 0;

    const sub = this.subtotal();
    const tax = parseFloat(formValue.tax) || 0;
    const disc = parseFloat(formValue.discount) || 0;
    return sub + tax - disc;
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formData = this.form.value;

    // Transform lines to match DTO
    const payload = {
      supplierId: formData.supplierId,
      purchaseDate: formData.purchaseDate,
      notes: formData.notes,
      tax: formData.tax,
      discount: formData.discount,
      lines: formData.lines.map((l: any) => ({
        itemId: l.itemId,
        qty: l.qty,
        unitPrice: l.unitPrice
      }))
    };

    if (this.isEditMode) {
      // Update logic here
    } else {
      this.purchasingService.createPurchaseOrder(payload).subscribe({
        next: () => {
          this.snackBar.open('Purchase created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/purchases']);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Error creating purchase order', 'Close', { duration: 3000 });
          this.loading.set(false);
        }
      });
    }
  }
}

