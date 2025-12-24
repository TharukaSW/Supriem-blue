import { Invoice, InvoiceLine, Supplier } from '@prisma/client';
export declare class PdfService {
    generateDotMatrixInvoice(invoice: Invoice & {
        supplier?: Supplier;
        lines?: (InvoiceLine & {
            item?: any;
        })[];
    }): string;
    generateA4Invoice(invoice: Invoice & {
        supplier?: Supplier;
        lines?: (InvoiceLine & {
            item?: any;
        })[];
    }): string;
    private padRight;
    private padLeft;
    private centerText;
    private formatDate;
    private formatNumber;
    private formatCurrency;
}
