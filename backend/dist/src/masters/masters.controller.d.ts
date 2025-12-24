import { MastersService } from './masters.service';
import { CreateUnitDto, UpdateUnitDto, CreateCategoryDto, UpdateCategoryDto, CreateItemDto, UpdateItemDto, ItemQueryDto, CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, DeactivateSupplierDto, CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, DeactivateCustomerDto, CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto, SupplierPriceQueryDto, DeactivateSupplierPriceDto, CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto, CustomerPriceQueryDto, DeactivateCustomerPriceDto } from './dto';
export declare class MastersController {
    private readonly mastersService;
    constructor(mastersService: MastersService);
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
    findOneUnit(id: string): Promise<{
        symbol: string | null;
        unitId: number;
        unitName: string;
    }>;
    updateUnit(id: string, dto: UpdateUnitDto): Promise<{
        symbol: string | null;
        unitId: number;
        unitName: string;
    }>;
    deleteUnit(id: string): Promise<{
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
    findOneCategory(id: string): Promise<{
        categoryId: number;
        categoryName: string;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        categoryId: number;
        categoryName: string;
    }>;
    deleteCategory(id: string): Promise<{
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
    findOneItem(id: string): Promise<any>;
    updateItem(id: string, dto: UpdateItemDto): Promise<any>;
    deleteItem(id: string): Promise<{
        message: string;
    }>;
    createSupplier(dto: CreateSupplierDto, user: any): Promise<any>;
    findAllSuppliers(query: SupplierQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneSupplier(id: string, includePrices?: string): Promise<any>;
    updateSupplier(id: string, dto: UpdateSupplierDto, user: any): Promise<any>;
    deactivateSupplier(id: string, dto: DeactivateSupplierDto, user: any): Promise<{
        message: string;
        reason: string | undefined;
        supplier: any;
    }>;
    deleteSupplier(id: string): Promise<{
        message: string;
    }>;
    createCustomer(dto: CreateCustomerDto, user: any): Promise<any>;
    findAllCustomers(query: CustomerQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneCustomer(id: string, includePrices?: string): Promise<any>;
    updateCustomer(id: string, dto: UpdateCustomerDto, user: any): Promise<any>;
    deactivateCustomer(id: string, dto: DeactivateCustomerDto, user: any): Promise<{
        message: string;
        reason: string | undefined;
        customer: any;
    }>;
    deleteCustomer(id: string): Promise<{
        message: string;
    }>;
    createSupplierItemPrice(supplierId: string, dto: CreateSupplierItemPriceDto, user: any): Promise<any>;
    findSupplierItemPrices(supplierId: string, query: SupplierPriceQueryDto): Promise<any[]>;
    getSupplierActivePrice(supplierId: string, itemId: string, asOfDate?: string): Promise<any>;
    updateSupplierItemPrice(supplierId: string, priceId: string, dto: UpdateSupplierItemPriceDto, user: any): Promise<any>;
    deactivateSupplierItemPrice(supplierId: string, priceId: string, dto: DeactivateSupplierPriceDto, user: any): Promise<{
        message: string;
        price: any;
    }>;
    createCustomerItemPrice(customerId: string, dto: CreateCustomerItemPriceDto, user: any): Promise<any>;
    findCustomerItemPrices(customerId: string, query: CustomerPriceQueryDto): Promise<any[]>;
    getCustomerActivePrice(customerId: string, itemId: string, asOfDate?: string): Promise<any>;
    updateCustomerItemPrice(customerId: string, priceId: string, dto: UpdateCustomerItemPriceDto, user: any): Promise<any>;
    deactivateCustomerItemPrice(customerId: string, priceId: string, dto: DeactivateCustomerPriceDto, user: any): Promise<{
        message: string;
        price: any;
    }>;
}
