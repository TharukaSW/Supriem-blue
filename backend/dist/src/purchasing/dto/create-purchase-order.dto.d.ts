import { CreatePurchaseOrderLineDto } from './create-purchase-order-line.dto';
export declare class CreatePurchaseOrderDto {
    supplierId: number;
    purchaseDate?: string;
    notes?: string;
    discount?: number;
    tax?: number;
    lines: CreatePurchaseOrderLineDto[];
}
