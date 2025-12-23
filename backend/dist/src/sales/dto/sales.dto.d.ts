import { DocStatus } from '@prisma/client';
export declare class SalesOrderLineDto {
    itemId: string;
    qty: number;
    unitPrice?: number;
}
export declare class CreateSalesOrderDto {
    customerId: string;
    orderDate?: string;
    notes?: string;
    discount?: number;
    tax?: number;
    lines: SalesOrderLineDto[];
}
export declare class UpdateSalesOrderDto {
    notes?: string;
    discount?: number;
    tax?: number;
}
export declare class SalesQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: DocStatus;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
}
export declare class CreateDispatchDto {
    salesOrderId: string;
    vehicleNo?: string;
    driverName?: string;
    remarks?: string;
}
export declare class UpdateDispatchDto {
    vehicleNo?: string;
    driverName?: string;
    remarks?: string;
}
export declare class DispatchQueryDto {
    page?: number;
    limit?: number;
    status?: DocStatus;
    fromDate?: string;
    toDate?: string;
}
