import { InvoiceType, DocStatus, MatchStatus } from '@prisma/client';
export declare class InvoiceQueryDto {
    page?: number;
    limit?: number;
    invoiceType?: InvoiceType;
    status?: DocStatus;
    matchStatus?: MatchStatus;
    customerId?: string;
    supplierId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
}
export declare class UpdateInvoiceMatchDto {
    vendorInvoiceNo: string;
    vendorInvoiceDate?: string;
    vendorInvoiceTotal: number;
}
