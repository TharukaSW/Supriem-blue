import { MastersService } from './masters.service';
import { CreateUnitDto, UpdateUnitDto, CreateCategoryDto, UpdateCategoryDto, CreateItemDto, UpdateItemDto, ItemQueryDto, CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto, CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto } from './dto';
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
    findOneItem(id: string): Promise<any>;
    updateItem(id: string, dto: UpdateItemDto): Promise<any>;
    deleteItem(id: string): Promise<{
        message: string;
    }>;
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
    findOneSupplier(id: string): Promise<any>;
    updateSupplier(id: string, dto: UpdateSupplierDto): Promise<any>;
    deleteSupplier(id: string): Promise<{
        message: string;
    }>;
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
    findOneCustomer(id: string): Promise<any>;
    updateCustomer(id: string, dto: UpdateCustomerDto): Promise<any>;
    deleteCustomer(id: string): Promise<{
        message: string;
    }>;
    createSupplierItemPrice(dto: CreateSupplierItemPriceDto): Promise<any>;
    findSupplierItemPrices(supplierId?: string, itemId?: string): Promise<any[]>;
    updateSupplierItemPrice(id: string, dto: UpdateSupplierItemPriceDto): Promise<any>;
    createCustomerItemPrice(dto: CreateCustomerItemPriceDto): Promise<any>;
    findCustomerItemPrices(customerId?: string, itemId?: string): Promise<any[]>;
    updateCustomerItemPrice(id: string, dto: UpdateCustomerItemPriceDto): Promise<any>;
}
