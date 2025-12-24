"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
let PdfService = class PdfService {
    generateDotMatrixInvoice(invoice) {
        const lines = [];
        lines.push('='.repeat(80));
        lines.push(this.centerText('SUPREME BLUE', 80));
        lines.push(this.centerText('Water Bottling Factory', 80));
        lines.push(this.centerText('Purchase Invoice', 80));
        lines.push('='.repeat(80));
        lines.push('');
        lines.push(this.padRight(`Invoice No: ${invoice.invoiceNo}`, 40) +
            this.padRight(`Date: ${this.formatDate(invoice.invoiceDate)}`, 40));
        lines.push('');
        if (invoice.supplier) {
            lines.push('Supplier:');
            lines.push(`  ${invoice.supplier.supplierName}`);
            if (invoice.supplier.address) {
                lines.push(`  ${invoice.supplier.address}`);
            }
            if (invoice.supplier.phone) {
                lines.push(`  Tel: ${invoice.supplier.phone}`);
            }
            lines.push('');
        }
        lines.push('-'.repeat(80));
        lines.push(this.padRight('Item', 40) +
            this.padLeft('Qty', 10) +
            this.padLeft('Rate', 15) +
            this.padLeft('Amount', 15));
        lines.push('-'.repeat(80));
        if (invoice.lines && invoice.lines.length > 0) {
            for (const line of invoice.lines) {
                const itemName = line.item?.itemName || line.description || '';
                lines.push(this.padRight(itemName, 40) +
                    this.padLeft(this.formatNumber(line.qty), 10) +
                    this.padLeft(this.formatCurrency(line.unitPrice), 15) +
                    this.padLeft(this.formatCurrency(line.lineTotal), 15));
            }
        }
        lines.push('-'.repeat(80));
        lines.push('');
        lines.push(this.padRight('', 55) + this.padRight('Subtotal:', 10) + this.padLeft(this.formatCurrency(invoice.subtotal), 15));
        if (Number(invoice.discount) > 0) {
            lines.push(this.padRight('', 55) + this.padRight('Discount:', 10) + this.padLeft(this.formatCurrency(invoice.discount), 15));
        }
        if (Number(invoice.tax) > 0) {
            lines.push(this.padRight('', 55) + this.padRight('Tax:', 10) + this.padLeft(this.formatCurrency(invoice.tax), 15));
        }
        lines.push('='.repeat(80));
        lines.push(this.padRight('', 55) + this.padRight('TOTAL:', 10) + this.padLeft(this.formatCurrency(invoice.total), 15));
        lines.push('='.repeat(80));
        lines.push('');
        if (invoice.vendorInvoiceNo) {
            lines.push(`Vendor Invoice No: ${invoice.vendorInvoiceNo}`);
            if (invoice.vendorInvoiceTotal) {
                lines.push(`Vendor Total: ${this.formatCurrency(invoice.vendorInvoiceTotal)} | ` +
                    `Match Status: ${invoice.matchStatus}`);
                if (Number(invoice.mismatchAmount) > 0) {
                    lines.push(`Mismatch Amount: ${this.formatCurrency(invoice.mismatchAmount)}`);
                }
            }
            lines.push('');
        }
        lines.push('');
        lines.push(this.centerText('Thank you for your business!', 80));
        lines.push('='.repeat(80));
        return lines.join('\n');
    }
    generateA4Invoice(invoice) {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #0066cc; }
    .header p { margin: 5px 0; }
    .invoice-info { margin-bottom: 20px; }
    .invoice-info table { width: 100%; }
    .invoice-info td { padding: 5px; }
    .supplier-info { margin-bottom: 30px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .items-table th { background-color: #f2f2f2; }
    .items-table .text-right { text-align: right; }
    .totals { float: right; width: 300px; }
    .totals table { width: 100%; }
    .totals td { padding: 5px; }
    .totals .total-row { font-weight: bold; border-top: 2px solid #333; }
    .footer { clear: both; text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SUPREME BLUE</h1>
    <p>Water Bottling Factory</p>
    <h2>Purchase Invoice</h2>
  </div>

  <div class="invoice-info">
    <table>
      <tr>
        <td><strong>Invoice No:</strong> ${invoice.invoiceNo}</td>
        <td><strong>Date:</strong> ${this.formatDate(invoice.invoiceDate)}</td>
      </tr>
    </table>
  </div>

  ${invoice.supplier
            ? `
  <div class="supplier-info">
    <strong>Supplier:</strong><br>
    ${invoice.supplier.supplierName}<br>
    ${invoice.supplier.address || ''}<br>
    ${invoice.supplier.phone ? `Tel: ${invoice.supplier.phone}` : ''}
  </div>
  `
            : ''}

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lines
            ?.map((line) => `
      <tr>
        <td>${line.item?.itemName || line.description || ''}</td>
        <td class="text-right">${this.formatNumber(line.qty)}</td>
        <td class="text-right">${this.formatCurrency(line.unitPrice)}</td>
        <td class="text-right">${this.formatCurrency(line.lineTotal)}</td>
      </tr>
      `)
            .join('') || ''}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">${this.formatCurrency(invoice.subtotal)}</td>
      </tr>
      ${Number(invoice.discount) > 0
            ? `
      <tr>
        <td>Discount:</td>
        <td class="text-right">${this.formatCurrency(invoice.discount)}</td>
      </tr>
      `
            : ''}
      ${Number(invoice.tax) > 0
            ? `
      <tr>
        <td>Tax:</td>
        <td class="text-right">${this.formatCurrency(invoice.tax)}</td>
      </tr>
      `
            : ''}
      <tr class="total-row">
        <td><strong>TOTAL:</strong></td>
        <td class="text-right"><strong>${this.formatCurrency(invoice.total)}</strong></td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
  </div>
</body>
</html>
    `;
    }
    padRight(str, width) {
        return str.length >= width ? str.substring(0, width) : str + ' '.repeat(width - str.length);
    }
    padLeft(str, width) {
        return str.length >= width ? str.substring(0, width) : ' '.repeat(width - str.length) + str;
    }
    centerText(str, width) {
        if (str.length >= width)
            return str.substring(0, width);
        const leftPad = Math.floor((width - str.length) / 2);
        const rightPad = width - str.length - leftPad;
        return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    }
    formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
    formatNumber(num) {
        return Number(num).toFixed(2);
    }
    formatCurrency(amount) {
        return Number(amount).toFixed(2);
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map