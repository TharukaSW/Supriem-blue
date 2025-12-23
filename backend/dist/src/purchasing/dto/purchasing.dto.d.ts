import { DocStatus } from '@prisma/client';
export declare class PurchaseOrderLineDto {
    itemId: string;
    qty: number;
    unitPrice?: number;
}
export declare class CreatePurchaseOrderDto {
    supplierId: string;
    purchaseDate?: string;
    notes?: string;
    discount?: number;
    tax?: number;
    lines: PurchaseOrderLineDto[];
}
export declare class UpdatePurchaseOrderDto {
    notes?: string;
    discount?: number;
    tax?: number;
}
export declare class ConfirmPurchaseOrderDto {
    vendorInvoiceNo?: string;
    vendorInvoiceDate?: string;
    vendorInvoiceTotal?: number;
}
export declare class PurchaseQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: DocStatus;
    supplierId?: string;
    fromDate?: string;
    toDate?: string;
}
