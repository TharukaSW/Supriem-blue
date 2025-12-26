import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, CreateCategoryDto, UpdateCategoryDto, CreateItemDto, UpdateItemDto, ItemQueryDto, CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, DeactivateSupplierDto, CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, DeactivateCustomerDto, CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto, SupplierPriceQueryDto, DeactivateSupplierPriceDto, CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto, CustomerPriceQueryDto, DeactivateCustomerPriceDto } from './dto';
export declare class MastersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUnit(dto: CreateUnitDto): Promise<{
        symbol: string | null;
        unitId: number;
        unitName: string;
    }>;
    findAllUnits(): Promise<{
        symbol: string | null;
        unitId: number;
        unitName: string;
    }[]>;
    findOneUnit(id: number): Promise<{
        symbol: string | null;
        unitId: number;
        unitName: string;
    }>;
    updateUnit(id: number, dto: UpdateUnitDto): Promise<{
        symbol: string | null;
        unitId: number;
        unitName: string;
    }>;
    deleteUnit(id: number): Promise<{
        message: string;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
        categoryId: number;
        categoryName: string;
    }>;
    findAllCategories(): Promise<{
        categoryId: number;
        categoryName: string;
    }[]>;
    findOneCategory(id: number): Promise<{
        categoryId: number;
        categoryName: string;
    }>;
    updateCategory(id: number, dto: UpdateCategoryDto): Promise<{
        categoryId: number;
        categoryName: string;
    }>;
    deleteCategory(id: number): Promise<{
        message: string;
    }>;
    createItem(dto: CreateItemDto): Promise<{
        unit: {
            symbol: string | null;
            unitId: number;
            unitName: string;
        } | null;
        category: {
            categoryId: number;
            categoryName: string;
        } | null;
    } & {
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        unitId: number | null;
        categoryId: number | null;
        itemId: bigint;
        itemCode: string;
        itemName: string;
        itemType: import(".prisma/client").$Enums.ItemType;
    }>;
    findAllItems(query: ItemQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneItem(id: bigint): Promise<any>;
    updateItem(id: bigint, dto: UpdateItemDto): Promise<any>;
    deleteItem(id: bigint): Promise<{
        message: string;
    }>;
    private transformItem;
    createSupplier(dto: CreateSupplierDto, userId: string): Promise<any>;
    findAllSuppliers(query: SupplierQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneSupplier(id: bigint, includePrices?: boolean): Promise<any>;
    updateSupplier(id: bigint, dto: UpdateSupplierDto, userId: string): Promise<any>;
    deactivateSupplier(id: bigint, dto: DeactivateSupplierDto, userId: string): Promise<{
        message: string;
        reason: string | undefined;
        supplier: any;
    }>;
    deleteSupplier(id: bigint): Promise<{
        message: string;
    }>;
    private transformSupplier;
    createCustomer(dto: CreateCustomerDto, userId: string): Promise<any>;
    findAllCustomers(query: CustomerQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneCustomer(id: bigint, includePrices?: boolean): Promise<any>;
    updateCustomer(id: bigint, dto: UpdateCustomerDto, userId: string): Promise<any>;
    deactivateCustomer(id: bigint, dto: DeactivateCustomerDto, userId: string): Promise<{
        message: string;
        reason: string | undefined;
        customer: any;
    }>;
    deleteCustomer(id: bigint): Promise<{
        message: string;
    }>;
    private transformCustomer;
    createSupplierItemPrice(supplierId: bigint, dto: CreateSupplierItemPriceDto, userId: string): Promise<any>;
    findSupplierItemPrices(supplierId: bigint, query: SupplierPriceQueryDto): Promise<any[]>;
    updateSupplierItemPrice(supplierId: bigint, priceId: bigint, dto: UpdateSupplierItemPriceDto, userId: string): Promise<any>;
    deactivateSupplierItemPrice(supplierId: bigint, priceId: bigint, dto: DeactivateSupplierPriceDto, userId: string): Promise<{
        message: string;
        price: any;
    }>;
    getSupplierActivePrice(supplierId: bigint, itemId: bigint, asOfDate?: Date): Promise<any>;
    getLatestSupplierPrice(supplierId: bigint, itemId: bigint): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        supplierId: bigint;
        createdBy: bigint | null;
        updatedBy: bigint | null;
        itemId: bigint;
        supplierItemPriceId: bigint;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        effectiveFrom: Date;
        endDate: Date | null;
    } | null>;
    private transformSupplierPrice;
    createCustomerItemPrice(customerId: bigint, dto: CreateCustomerItemPriceDto, userId: string): Promise<any>;
    findCustomerItemPrices(customerId: bigint, query: CustomerPriceQueryDto): Promise<any[]>;
    updateCustomerItemPrice(customerId: bigint, priceId: bigint, dto: UpdateCustomerItemPriceDto, userId: string): Promise<any>;
    deactivateCustomerItemPrice(customerId: bigint, priceId: bigint, dto: DeactivateCustomerPriceDto, userId: string): Promise<{
        message: string;
        price: any;
    }>;
    getCustomerActivePrice(customerId: bigint, itemId: bigint, asOfDate?: Date): Promise<any>;
    getLatestCustomerPrice(customerId: bigint, itemId: bigint): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: bigint | null;
        updatedBy: bigint | null;
        itemId: bigint;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        effectiveFrom: Date;
        endDate: Date | null;
        customerId: bigint;
        customerItemPriceId: bigint;
    } | null>;
    private transformCustomerPrice;
    private generateSupplierCode;
    private generateCustomerCode;
}
