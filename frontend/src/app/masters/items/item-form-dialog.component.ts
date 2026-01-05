import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ItemService, Item } from '../services/item.service';

@Component({
    selector: 'app-item-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Item' : 'Edit Item' }}</h2>
        <mat-dialog-content>
            <form [formGroup]="form" class="item-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Item Code</mat-label>
                    <input matInput formControlName="itemCode" placeholder="RM001" required>
                    <mat-error *ngIf="form.get('itemCode')?.hasError('required')">
                        Item code is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Item Name</mat-label>
                    <input matInput formControlName="itemName" placeholder="Cotton Fabric" required>
                    <mat-error *ngIf="form.get('itemName')?.hasError('required')">
                        Item name is required
                    </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Item Type</mat-label>
                    <mat-select formControlName="itemType" required>
                        <mat-option value="RAW">Raw Material</mat-option>
                        <mat-option value="PRODUCT">Product</mat-option>
                        <mat-option value="SERVICE">Service</mat-option>
                    </mat-select>
                    <mat-error *ngIf="form.get('itemType')?.hasError('required')">
                        Item type is required
                    </mat-error>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!form.valid || saving" (click)="onSave()">
                {{ saving ? 'Saving...' : 'Save' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .item-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 400px;
            padding: 20px 0;
        }

        .full-width {
            width: 100%;
        }
    `]
})
export class ItemFormDialogComponent implements OnInit {
    form!: FormGroup;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private itemService: ItemService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ItemFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; item?: Item }
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            itemCode: [
                { value: this.data.item ? this.data.item.itemCode : '', disabled: this.data.mode === 'edit' },
                [Validators.required]
            ],
            itemName: [this.data.item ? this.data.item.itemName : '', [Validators.required]],
            itemType: [this.data.item ? this.data.item.itemType : 'RAW', [Validators.required]],
        });
    }

    onSave() {
        if (this.form.valid) {
            this.saving = true;
            const formValue = this.form.getRawValue();

            const observable = this.data.mode === 'create'
                ? this.itemService.create(formValue)
                : this.itemService.update(this.data.item!.itemId, formValue);

            observable.subscribe({
                next: () => {
                    this.snackBar.open(
                        `Item ${this.data.mode === 'create' ? 'created' : 'updated'} successfully`,
                        'Close',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this.snackBar.open(
                        error.error?.message || 'Error saving item',
                        'Close',
                        { duration: 3000 }
                    );
                    this.saving = false;
                }
            });
        }
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
