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
export declare class CreateSupplierItemPriceDto {
    itemId: string;
    unitPrice: number;
    effectiveFrom?: string;
    endDate?: string;
}
export declare class CreateSupplierDto {
    supplierCode?: string;
    supplierName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    items: CreateSupplierItemPriceDto[];
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
    includePrices?: boolean;
}
export declare class DeactivateSupplierDto {
    reason?: string;
}
export declare class CreateCustomerItemPriceDto {
    itemId: string;
    unitPrice: number;
    effectiveFrom?: string;
    endDate?: string;
}
export declare class CreateCustomerDto {
    customerCode?: string;
    customerName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    products: CreateCustomerItemPriceDto[];
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
    includePrices?: boolean;
}
export declare class DeactivateCustomerDto {
    reason?: string;
}
export declare class UpdateSupplierItemPriceDto {
    unitPrice?: number;
    endDate?: string;
    isActive?: boolean;
}
export declare class SupplierPriceQueryDto {
    itemId?: string;
    activeOnly?: boolean;
    asOfDate?: string;
}
export declare class DeactivateSupplierPriceDto {
    endDate?: string;
}
export declare class UpdateCustomerItemPriceDto {
    unitPrice?: number;
    endDate?: string;
    isActive?: boolean;
}
export declare class CustomerPriceQueryDto {
    itemId?: string;
    activeOnly?: boolean;
    asOfDate?: string;
}
export declare class DeactivateCustomerPriceDto {
    endDate?: string;
}
