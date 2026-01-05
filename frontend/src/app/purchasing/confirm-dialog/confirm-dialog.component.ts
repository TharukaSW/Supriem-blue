import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  type?: 'confirm' | 'warning' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="confirm-dialog" [@dialogAnimation]>
      <button mat-icon-button class="close-button" (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="dialog-icon-container" [ngClass]="'icon-' + data.type">
        <div class="icon-wrapper">
          <mat-icon class="dialog-icon">
            @if (data.type === 'danger') {
              error_outline
            } @else if (data.type === 'warning') {
              warning_amber
            } @else {
              check_circle
            }
          </mat-icon>
        </div>
      </div>

      <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>

      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
        
        @if (data.requireReason) {
          <mat-form-field appearance="outline" class="w-full reason-field">
            <mat-label>{{ data.reasonLabel || 'Reason' }}</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="reason" 
              rows="4"
              placeholder="Please provide a detailed reason..."
              required
              #reasonInput
            ></textarea>
            <mat-hint>Required field</mat-hint>
          </mat-form-field>
        }
      </mat-dialog-content>

      <mat-dialog-actions>
        <button 
          mat-stroked-button 
          class="cancel-btn"
          (click)="onCancel()"
        >
          <mat-icon>close</mat-icon>
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [ngClass]="'confirm-btn-' + data.type"
          (click)="onConfirm()"
          [disabled]="data.requireReason && !reason.trim()"
        >
          <mat-icon>
            @if (data.type === 'danger') {
              block
            } @else if (data.type === 'warning') {
              done
            } @else {
              check
            }
          </mat-icon>
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 450px;
      max-width: 550px;
      padding: 0;
      position: relative;
      overflow: visible;
    }

    .close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 10;
      color: #666;
      opacity: 0.7;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .dialog-icon-container {
      display: flex;
      justify-content: center;
      padding: 32px 24px 16px;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .icon-wrapper::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      opacity: 0.15;
    }

    .icon-confirm .icon-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .icon-warning .icon-wrapper {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
    }

    .icon-danger .icon-wrapper {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      box-shadow: 0 8px 20px rgba(250, 112, 154, 0.3);
    }

    .dialog-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
      animation: iconPulse 2s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .dialog-title {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      margin: 8px 0 0 0;
      padding: 0 24px;
      color: #1a1a1a;
      line-height: 1.3;
    }

    mat-dialog-content {
      padding: 20px 32px;
      text-align: center;
      overflow: visible;
    }

    .message {
      font-size: 15px;
      color: #666;
      margin: 0 0 24px 0;
      line-height: 1.6;
      text-align: center;
    }

    .w-full {
      width: 100%;
    }

    .reason-field {
      margin-top: 8px;
      text-align: left;
    }

    .reason-field textarea {
      font-size: 14px;
      line-height: 1.5;
    }

    mat-dialog-actions {
      padding: 16px 32px 32px;
      margin: 0;
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    mat-dialog-actions button {
      min-width: 130px;
      height: 44px;
      font-size: 15px;
      font-weight: 500;
      border-radius: 8px;
      text-transform: none;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 6px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .cancel-btn {
      border: 2px solid #e0e0e0;
      color: #666;
      background: white;
    }

    .cancel-btn:hover:not([disabled]) {
      border-color: #bdbdbd;
      background: #f5f5f5;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .confirm-btn-confirm {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .confirm-btn-confirm:hover:not([disabled]) {
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      transform: translateY(-2px);
    }

    .confirm-btn-warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
    }

    .confirm-btn-warning:hover:not([disabled]) {
      box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
      transform: translateY(-2px);
    }

    .confirm-btn-danger {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
    }

    .confirm-btn-danger:hover:not([disabled]) {
      box-shadow: 0 6px 20px rgba(250, 112, 154, 0.5);
      transform: translateY(-2px);
    }

    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Smooth entrance animation */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .confirm-dialog {
      animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ConfirmDialogComponent {
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set default type if not provided
    if (!this.data.type) {
      this.data.type = 'confirm';
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (this.data.requireReason) {
      this.dialogRef.close(this.reason.trim());
    } else {
      this.dialogRef.close(true);
    }
  }
}
