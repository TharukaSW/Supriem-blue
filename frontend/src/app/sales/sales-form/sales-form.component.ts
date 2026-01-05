import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SalesService, CreateSalesOrderDto, SalesOrder } from '../services/sales.service';
import { CustomerService, Customer } from '../../masters/services/customer.service';
import { ItemService, Item } from '../../masters/services/item.service';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
        <div class="page-container">
            <div class="page-header">
                <button mat-icon-button (click)="goBack()" class="back-button">
                    <mat-icon>arrow_back</mat-icon>
                </button>
                <div class="header-info">
                    <h1>{{ isEditMode ? 'Edit Sales Order' : 'New Sales Order' }}</h1>
                    @if (!isEditMode) {
                        <div class="so-number">
                            <span class="label">SO Number:</span>
                            <span class="value">{{ soNumber() || 'Generating...' }}</span>
                        </div>
                    }
                </div>
            </div>

            <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
                <!-- Header Information -->
                <mat-card class="form-section">
                    <mat-card-header>
                        <mat-card-title>Order Information</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="form-grid">
                            <mat-form-field appearance="outline" class="full-width">
                                <mat-label>Customer</mat-label>
                                <mat-select formControlName="customerId" (selectionChange)="onCustomerChange($event.value)" required>
                                    @for (customer of customers(); track customer.customerId) {
                                        <mat-option [value]="customer.customerId">
                                            {{ customer.customerCode }} - {{ customer.customerName }}
                                        </mat-option>
                                    }
                                </mat-select>
                                <mat-error *ngIf="orderForm.get('customerId')?.hasError('required')">
                                    Please select a customer
                                </mat-error>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                                <mat-label>Order Date</mat-label>
                                <input matInput [matDatepicker]="picker" formControlName="orderDate" required>
                                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                                <mat-datepicker #picker></mat-datepicker>
                            </mat-form-field>

                            <mat-form-field appearance="outline" class="full-width">
                                <mat-label>Notes</mat-label>
                                <textarea matInput formControlName="notes" rows="3" placeholder="Additional notes..."></textarea>
                            </mat-form-field>
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Line Items -->
                <mat-card class="form-section">
                    <mat-card-header>
                        <mat-card-title>Order Items</mat-card-title>
                        <button mat-raised-button type="button" color="primary" (click)="addLine()">
                            <mat-icon>add</mat-icon>
                            Add Item
                        </button>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="table-container">
                            <table class="lines-table">
                                <thead>
                                    <tr>
                                        <th>Product *</th>
                                        <th>Quantity *</th>
                                        <th>Unit Price *</th>
                                        <th>Line Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody formArrayName="lines">
                                    @for (line of lines.controls; track $index; let i = $index) {
                                        <tr [formGroupName]="i">
                                            <td>
                                                <mat-form-field appearance="outline" class="table-field">
                                                    <mat-select formControlName="itemId" 
                                                                (selectionChange)="onProductChange(i)" required>
                                                        @for (item of filteredProducts(); track item.itemId) {
                                                            <mat-option [value]="item.itemId">
                                                                {{ item.itemCode }} - {{ item.itemName }}
                                                            </mat-option>
                                                        }
                                                    </mat-select>
                                                </mat-form-field>
                                            </td>
                                            <td>
                                                <mat-form-field appearance="outline" class="table-field">
                                                    <input matInput type="number" formControlName="qty" 
                                                           (input)="calculateLineTotal(i)" min="0.01" step="0.01" required>
                                                </mat-form-field>
                                            </td>
                                            <td>
                                                <mat-form-field appearance="outline" class="table-field">
                                                    <input matInput type="number" formControlName="unitPrice" 
                                                           (input)="calculateLineTotal(i)" min="0.01" step="0.01" required>
                                                </mat-form-field>
                                            </td>
                                            <td>
                                                <span class="line-total">{{ getLineTotal(i) | currency:'LKR ':'symbol':'1.2-2' }}</span>
                                            </td>
                                            <td class="action-cell">
                                                <button mat-icon-button type="button" color="warn" 
                                                        (click)="removeLine(i)">
                                                    <mat-icon>delete</mat-icon>
                                                </button>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>

                            @if (lines.length === 0) {
                                <div class="no-items">
                                    <mat-icon>shopping_cart</mat-icon>
                                    <p>No items added yet</p>
                                    <button mat-button color="primary" type="button" (click)="addLine()">
                                        Add your first item
                                    </button>
                                </div>
                            }
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Totals -->
                <mat-card class="form-section">
                    <mat-card-header>
                        <mat-card-title>Order Summary</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="totals-grid">
                            <div class="totals-row">
                                <label>Subtotal:</label>
                                <span class="amount">{{ subtotal() | currency:'LKR ':'symbol':'1.2-2' }}</span>
                            </div>

                            <div class="totals-row">
                                <mat-form-field appearance="outline" class="discount-field">
                                    <mat-label>Discount</mat-label>
                                    <input matInput type="number" formControlName="discount" 
                                           (input)="calculateTotals()" min="0" step="0.01">
                                    <span matSuffix>LKR</span>
                                </mat-form-field>
                                <span class="amount">{{ orderForm.get('discount')?.value || 0 | currency:'LKR ':'symbol':'1.2-2' }}</span>
                            </div>

                            <div class="totals-row">
                                <mat-form-field appearance="outline" class="tax-field">
                                    <mat-label>Tax</mat-label>
                                    <input matInput type="number" formControlName="tax" 
                                           (input)="calculateTotals()" min="0" step="0.01">
                                    <span matSuffix>LKR</span>
                                </mat-form-field>
                                <span class="amount">{{ orderForm.get('tax')?.value || 0 | currency:'LKR ':'symbol':'1.2-2' }}</span>
                            </div>

                            <div class="totals-row total-row">
                                <label>Grand Total:</label>
                                <span class="amount grand-total">{{ grandTotal() | currency:'LKR ':'symbol':'1.2-2' }}</span>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Actions -->
                <div class="form-actions">
                    <button mat-button type="button" (click)="goBack()">Cancel</button>
                    <button mat-raised-button color="accent" type="submit" [disabled]="saving || !orderForm.valid || lines.length === 0">
                        {{ saving ? 'Saving...' : (isEditMode ? 'Update Order' : 'Save as Draft') }}
                    </button>
                    <button mat-raised-button color="primary" type="button" 
                            (click)="onSubmitAndConfirm()" 
                            [disabled]="saving || !orderForm.valid || lines.length === 0">
                        {{ saving ? 'Saving...' : (isEditMode ? 'Update & Confirm' : 'Save & Confirm') }}
                    </button>
                </div>
            </form>
        </div>
    `,
  styles: [`
        .page-container {
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }

        .header-info {
            flex: 1;
        }

        .page-header h1 {
            margin: 0;
            font-size: 28px;
        }

        .so-number {
            margin-top: 8px;
            font-size: 16px;
        }

        .so-number .label {
            font-weight: 500;
            color: #666;
            margin-right: 8px;
        }

        .so-number .value {
            font-weight: 600;
            color: #1976d2;
            font-size: 18px;
        }

        .back-button {
            margin-left: -12px;
        }

        .form-section {
            margin-bottom: 24px;
        }

        .form-section mat-card-header {
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .full-width {
            grid-column: 1 / -1;
        }

        .table-container {
            overflow-x: auto;
        }

        .lines-table {
            width: 100%;
            min-width: 800px;
            border-collapse: collapse;
        }

        .lines-table thead th {
            text-align: left;
            padding: 12px 8px;
            background-color: #f5f5f5;
            font-weight: 500;
            border-bottom: 2px solid #e0e0e0;
        }

        .lines-table tbody td {
            padding: 8px 8px;
            vertical-align: middle;
            border-bottom: 1px solid #f0f0f0;
        }

        .action-cell {
            text-align: center;
        }

        .table-field {
            width: 100%;
            margin: 0;
        }

        .table-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
            display: none;
        }

        .table-field ::ng-deep .mat-mdc-form-field-wrapper {
            padding-bottom: 0;
        }

        .line-total {
            font-weight: 500;
            color: #4caf50;
        }

        .no-items {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #999;
        }

        .no-items mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            margin-bottom: 12px;
            color: #ccc;
        }

        .totals-grid {
            max-width: 500px;
            margin-left: auto;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
        }

        .totals-row label {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
        }

        .totals-row .amount {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
        }

        .discount-field,
        .tax-field {
            width: 200px;
            margin: 0;
        }

        .total-row {
            border-bottom: none;
            border-top: 2px solid #333;
            padding-top: 16px;
            margin-top: 8px;
        }

        .total-row label {
            font-size: 18px;
            font-weight: 600;
        }

        .grand-total {
            font-size: 24px;
            font-weight: 600;
            color: #4caf50;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class SalesFormComponent implements OnInit {
  orderForm!: FormGroup;
  customers = signal<Customer[]>([]);
  finishedGoods = signal<Item[]>([]);
  filteredProducts = signal<Item[]>([]);
  customerProducts = signal<Item[]>([]); // Products bought by selected customer
  soNumber = signal<string>(''); // Auto-generated SO number
  saving = false;
  isEditMode = false;
  orderId?: string;

  subtotal = computed(() => {
    let total = 0;
    this.lines.controls.forEach((line) => {
      const qty = line.get('qty')?.value || 0;
      const price = line.get('unitPrice')?.value || 0;
      total += qty * price;
    });
    return total;
  });

  grandTotal = computed(() => {
    const sub = this.subtotal();
    const discount = this.orderForm?.get('discount')?.value || 0;
    const tax = this.orderForm?.get('tax')?.value || 0;
    return sub - discount + tax;
  });

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private customerService: CustomerService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadCustomers();
    this.loadFinishedGoods();

    // Check if edit mode
    this.orderId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.orderId) {
      this.isEditMode = true;
      this.loadOrder(this.orderId);
    } else {
      // Generate SO number for new orders
      this.generateSONumber();
    }

    // Watch form changes to recalculate totals in real-time
    this.orderForm.valueChanges.subscribe(() => {
      // Totals are computed automatically via signals
    });
  }

  generateSONumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    this.soNumber.set(`SO-${year}${month}${day}-${time}-${random}`);
  }

  initForm() {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      orderDate: [new Date(), Validators.required],
      notes: [''],
      discount: [0, [Validators.min(0)]],
      tax: [0, [Validators.min(0)]],
      lines: this.fb.array([])
    });
  }

  get lines(): FormArray {
    return this.orderForm.get('lines') as FormArray;
  }

  createLineGroup(): FormGroup {
    return this.fb.group({
      itemId: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  addLine() {
    this.lines.push(this.createLineGroup());
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
    this.calculateTotals();
  }

  getLineControl(index: number, controlName: string) {
    return this.lines.at(index).get(controlName) as any;
  }

  getLineTotal(index: number): number {
    const line = this.lines.at(index);
    const qty = line.get('qty')?.value || 0;
    const price = line.get('unitPrice')?.value || 0;
    return qty * price;
  }

  calculateLineTotal(index: number) {
    this.calculateTotals();
  }

  calculateTotals() {
    // Trigger computed signals update
    this.orderForm.updateValueAndValidity();
  }

  onProductChange(index: number) {
    const itemId = this.getLineControl(index, 'itemId').value;
    const customerId = this.orderForm.get('customerId')?.value;

    if (itemId && customerId) {
      // Fetch customer-specific price
      this.customerService.getActivePrice(customerId, itemId).subscribe({
        next: (price) => {
          if (price) {
            this.getLineControl(index, 'unitPrice').setValue(price.unitPrice);
          } else {
            // Fallback to item's default selling price
            const item = this.finishedGoods().find(i => i.itemId === itemId);
            if (item && item.sellingPrice) {
              this.getLineControl(index, 'unitPrice').setValue(item.sellingPrice);
            }
          }
          this.calculateLineTotal(index);
        },
        error: () => {
          // Fallback to item's default selling price
          const item = this.finishedGoods().find(i => i.itemId === itemId);
          if (item && item.sellingPrice) {
            this.getLineControl(index, 'unitPrice').setValue(item.sellingPrice);
            this.calculateLineTotal(index);
          }
        }
      });
    }
  }

  loadCustomers() {
    this.customerService.getAll({ isActive: true }).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.customers.set(data);
      },
      error: () => {
        this.snackBar.open('Error loading customers', 'Close', { duration: 3000 });
      }
    });
  }

  loadFinishedGoods() {
    this.itemService.getFinishedGoods().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.finishedGoods.set(data);
        this.filteredProducts.set(data);
      },
      error: () => {
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
      }
    });
  }

  onCustomerChange(customerId: string) {
    if (!customerId) {
      this.customerProducts.set([]);
      this.filteredProducts.set(this.finishedGoods());
      return;
    }

    // Warn user if they have items already added
    if (this.lines.length > 0) {
      const confirmed = confirm('Changing customer will clear existing items. Continue?');
      if (!confirmed) {
        // Revert customer selection
        this.orderForm.patchValue({ customerId: '' }, { emitEvent: false });
        return;
      }
      // Clear existing lines
      while (this.lines.length > 0) {
        this.lines.removeAt(0);
      }
    }

    // Load products for selected customer
    this.saving = true;
    this.customerService.getPrices(customerId, { activeOnly: true }).subscribe({
      next: (prices) => {
        // Get unique item IDs from customer prices
        const itemIds = new Set(prices.map(p => p.itemId));
        
        // Filter products to only those bought by this customer
        const customerSpecificProducts = this.finishedGoods().filter(item => itemIds.has(item.itemId));
        
        this.customerProducts.set(customerSpecificProducts);
        
        // If customer has no products defined, show all products
        if (customerSpecificProducts.length === 0) {
          this.filteredProducts.set(this.finishedGoods());
          this.snackBar.open('No products defined for this customer. Showing all products.', 'Close', { duration: 3000 });
        } else {
          this.filteredProducts.set(customerSpecificProducts);
        }
        
        this.saving = false;
      },
      error: () => {
        // On error, show all products so user can still create order
        this.filteredProducts.set(this.finishedGoods());
        this.snackBar.open('Error loading customer products. Showing all products.', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  loadOrder(id: string) {
    this.salesService.getSalesOrder(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          customerId: order.customerId,
          orderDate: new Date(order.orderDate),
          notes: order.notes || '',
          discount: order.discount || 0,
          tax: order.tax || 0
        });

        // Load lines
        order.lines.forEach(line => {
          const lineGroup = this.createLineGroup();
          lineGroup.patchValue({
            itemId: line.itemId,
            qty: line.qty,
            unitPrice: line.unitPrice
          });
          this.lines.push(lineGroup);
        });
      },
      error: () => {
        this.snackBar.open('Error loading sales order', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.orderForm.valid && this.lines.length > 0) {
      this.saveOrder(false);
    }
  }

  onSubmitAndConfirm() {
    if (this.orderForm.valid && this.lines.length > 0) {
      this.saveOrder(true);
    }
  }

  saveOrder(confirmAfterSave: boolean) {
    this.saving = true;
    const formValue = this.orderForm.value;

    const dto: CreateSalesOrderDto = {
      customerId: formValue.customerId,
      orderDate: this.formatDate(formValue.orderDate),
      notes: formValue.notes,
      discount: formValue.discount || 0,
      tax: formValue.tax || 0,
      lines: formValue.lines.map((line: any) => ({
        itemId: line.itemId,
        qty: line.qty,
        unitPrice: line.unitPrice
      }))
    };

    const operation = this.isEditMode && this.orderId
      ? this.salesService.updateSalesOrder(this.orderId, {
        notes: dto.notes,
        discount: dto.discount,
        tax: dto.tax
      })
      : this.salesService.createSalesOrder(dto);

    operation.subscribe({
      next: (order) => {
        const message = this.isEditMode ? 'Sales order updated' : 'Sales order created';
        this.snackBar.open(message, 'Close', { duration: 3000 });

        if (confirmAfterSave && !this.isEditMode) {
          this.confirmOrder(order.salesOrderId);
        } else {
          this.router.navigate(['/sales']);
        }
      },
      error: (err) => {
        this.snackBar.open('Error saving sales order', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  confirmOrder(orderId: string) {
    this.salesService.confirmSalesOrder(orderId).subscribe({
      next: () => {
        this.snackBar.open('Sales order confirmed', 'Close', { duration: 3000 });
        this.router.navigate(['/sales']);
      },
      error: () => {
        this.snackBar.open('Order saved but confirmation failed', 'Close', { duration: 3000 });
        this.router.navigate(['/sales']);
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goBack() {
    this.router.navigate(['/sales']);
  }
}
