import { ItemType } from '@prisma/client';
export declare class CreateUnitDto {
    unitName: string;
    symbol?: string;
}
export declare class UpdateUnitDto {
    unitName?: string;
    symbol?: string;
}
export declare class CreateCategoryDto {
    categoryName: string;
}
export declare class UpdateCategoryDto {
    categoryName?: string;
}
export declare class CreateItemDto {
    itemCode: string;
    itemName: string;
    itemType: ItemType;
    categoryId?: number;
    unitId?: number;
}
export declare class UpdateItemDto {
    itemName?: string;
    categoryId?: number;
    unitId?: number;
    isActive?: boolean;
}
export declare class ItemQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    itemType?: ItemType;
    categoryId?: number;
    isActive?: boolean;
}
export declare class CreateSupplierDto {
    supplierCode: string;
    supplierName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
}
export declare class UpdateSupplierDto {
    supplierName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive?: boolean;
}
export declare class SupplierQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}
export declare class CreateCustomerDto {
    customerCode: string;
    customerName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
}
export declare class UpdateCustomerDto {
    customerName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive?: boolean;
}
export declare class CustomerQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}
export declare class CreateSupplierItemPriceDto {
    supplierId: string;
    itemId: string;
    unitPrice: number;
    effectiveFrom?: string;
}
export declare class UpdateSupplierItemPriceDto {
    unitPrice?: number;
    isActive?: boolean;
}
export declare class CreateCustomerItemPriceDto {
    customerId: string;
    itemId: string;
    unitPrice: number;
    effectiveFrom?: string;
}
export declare class UpdateCustomerItemPriceDto {
    unitPrice?: number;
    isActive?: boolean;
}
