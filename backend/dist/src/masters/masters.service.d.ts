import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, CreateCategoryDto, UpdateCategoryDto, CreateItemDto, UpdateItemDto, ItemQueryDto, CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto, CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto } from './dto';
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
        itemCode: string;
        itemName: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        itemId: bigint;
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
    createSupplier(dto: CreateSupplierDto): Promise<any>;
    findAllSuppliers(query: SupplierQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneSupplier(id: bigint): Promise<any>;
    updateSupplier(id: bigint, dto: UpdateSupplierDto): Promise<any>;
    deleteSupplier(id: bigint): Promise<{
        message: string;
    }>;
    private transformSupplier;
    createCustomer(dto: CreateCustomerDto): Promise<any>;
    findAllCustomers(query: CustomerQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneCustomer(id: bigint): Promise<any>;
    updateCustomer(id: bigint, dto: UpdateCustomerDto): Promise<any>;
    deleteCustomer(id: bigint): Promise<{
        message: string;
    }>;
    private transformCustomer;
    createSupplierItemPrice(dto: CreateSupplierItemPriceDto): Promise<any>;
    findSupplierItemPrices(supplierId?: string, itemId?: string): Promise<any[]>;
    getLatestSupplierPrice(supplierId: bigint, itemId: bigint): Promise<{
        isActive: boolean;
        supplierId: bigint;
        itemId: bigint;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        effectiveFrom: Date;
        supplierItemPriceId: bigint;
    } | null>;
    updateSupplierItemPrice(id: bigint, dto: UpdateSupplierItemPriceDto): Promise<any>;
    private transformSupplierPrice;
    createCustomerItemPrice(dto: CreateCustomerItemPriceDto): Promise<any>;
    findCustomerItemPrices(customerId?: string, itemId?: string): Promise<any[]>;
    getLatestCustomerPrice(customerId: bigint, itemId: bigint): Promise<{
        isActive: boolean;
        itemId: bigint;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        effectiveFrom: Date;
        customerId: bigint;
        customerItemPriceId: bigint;
    } | null>;
    updateCustomerItemPrice(id: bigint, dto: UpdateCustomerItemPriceDto): Promise<any>;
    private transformCustomerPrice;
}
