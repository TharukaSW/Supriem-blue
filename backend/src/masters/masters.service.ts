import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateUnitDto, UpdateUnitDto,
    CreateCategoryDto, UpdateCategoryDto,
    CreateItemDto, UpdateItemDto, ItemQueryDto,
    CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto,
    CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto,
    CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto,
    CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto,
} from './dto';

@Injectable()
export class MastersService {
    constructor(private prisma: PrismaService) { }

    // ========== UNITS ==========
    async createUnit(dto: CreateUnitDto) {
        const existing = await this.prisma.unit.findUnique({ where: { unitName: dto.unitName } });
        if (existing) throw new ConflictException('Unit already exists');
        return this.prisma.unit.create({ data: dto });
    }

    async findAllUnits() {
        return this.prisma.unit.findMany({ orderBy: { unitName: 'asc' } });
    }

    async findOneUnit(id: number) {
        const unit = await this.prisma.unit.findUnique({ where: { unitId: id } });
        if (!unit) throw new NotFoundException('Unit not found');
        return unit;
    }

    async updateUnit(id: number, dto: UpdateUnitDto) {
        await this.findOneUnit(id);
        return this.prisma.unit.update({ where: { unitId: id }, data: dto });
    }

    async deleteUnit(id: number) {
        await this.findOneUnit(id);
        await this.prisma.unit.delete({ where: { unitId: id } });
        return { message: 'Unit deleted successfully' };
    }

    // ========== CATEGORIES ==========
    async createCategory(dto: CreateCategoryDto) {
        const existing = await this.prisma.itemCategory.findUnique({ where: { categoryName: dto.categoryName } });
        if (existing) throw new ConflictException('Category already exists');
        return this.prisma.itemCategory.create({ data: dto });
    }

    async findAllCategories() {
        return this.prisma.itemCategory.findMany({ orderBy: { categoryName: 'asc' } });
    }

    async findOneCategory(id: number) {
        const category = await this.prisma.itemCategory.findUnique({ where: { categoryId: id } });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async updateCategory(id: number, dto: UpdateCategoryDto) {
        await this.findOneCategory(id);
        return this.prisma.itemCategory.update({ where: { categoryId: id }, data: dto });
    }

    async deleteCategory(id: number) {
        await this.findOneCategory(id);
        await this.prisma.itemCategory.delete({ where: { categoryId: id } });
        return { message: 'Category deleted successfully' };
    }

    // ========== ITEMS ==========
    async createItem(dto: CreateItemDto) {
        const existing = await this.prisma.item.findUnique({ where: { itemCode: dto.itemCode } });
        if (existing) throw new ConflictException('Item code already exists');
        return this.prisma.item.create({
            data: dto,
            include: { category: true, unit: true },
        });
    }

    async findAllItems(query: ItemQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { itemCode: { contains: query.search, mode: 'insensitive' } },
                { itemName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.itemType) where.itemType = query.itemType;
        if (query.categoryId) where.categoryId = Number(query.categoryId);
        if (query.isActive !== undefined) where.isActive = query.isActive === true || String(query.isActive) === 'true';

        const [items, total] = await Promise.all([
            this.prisma.item.findMany({
                where,
                skip,
                take: limit,
                include: { category: true, unit: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.item.count({ where }),
        ]);

        return {
            data: items.map(i => this.transformItem(i)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOneItem(id: bigint) {
        const item = await this.prisma.item.findUnique({
            where: { itemId: id },
            include: { category: true, unit: true },
        });
        if (!item) throw new NotFoundException('Item not found');
        return this.transformItem(item);
    }

    async updateItem(id: bigint, dto: UpdateItemDto) {
        await this.findOneItem(id);
        const item = await this.prisma.item.update({
            where: { itemId: id },
            data: dto,
            include: { category: true, unit: true },
        });
        return this.transformItem(item);
    }

    async deleteItem(id: bigint) {
        await this.findOneItem(id);
        await this.prisma.item.update({ where: { itemId: id }, data: { isActive: false } });
        return { message: 'Item deactivated successfully' };
    }

    private transformItem(item: any) {
        return { ...item, itemId: item.itemId.toString() };
    }

    // ========== SUPPLIERS ==========
    async createSupplier(dto: CreateSupplierDto) {
        const existing = await this.prisma.supplier.findUnique({ where: { supplierCode: dto.supplierCode } });
        if (existing) throw new ConflictException('Supplier code already exists');
        const supplier = await this.prisma.supplier.create({ data: dto });
        return this.transformSupplier(supplier);
    }

    async findAllSuppliers(query: SupplierQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { supplierCode: { contains: query.search, mode: 'insensitive' } },
                { supplierName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.isActive !== undefined) where.isActive = query.isActive === true || String(query.isActive) === 'true';

        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.supplier.count({ where }),
        ]);

        return {
            data: suppliers.map(s => this.transformSupplier(s)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOneSupplier(id: bigint) {
        const supplier = await this.prisma.supplier.findUnique({ where: { supplierId: id } });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return this.transformSupplier(supplier);
    }

    async updateSupplier(id: bigint, dto: UpdateSupplierDto) {
        await this.findOneSupplier(id);
        const supplier = await this.prisma.supplier.update({ where: { supplierId: id }, data: dto });
        return this.transformSupplier(supplier);
    }

    async deleteSupplier(id: bigint) {
        await this.findOneSupplier(id);
        await this.prisma.supplier.update({ where: { supplierId: id }, data: { isActive: false } });
        return { message: 'Supplier deactivated successfully' };
    }

    private transformSupplier(supplier: any) {
        return { ...supplier, supplierId: supplier.supplierId.toString() };
    }

    // ========== CUSTOMERS ==========
    async createCustomer(dto: CreateCustomerDto) {
        const existing = await this.prisma.customer.findUnique({ where: { customerCode: dto.customerCode } });
        if (existing) throw new ConflictException('Customer code already exists');
        const customer = await this.prisma.customer.create({ data: dto });
        return this.transformCustomer(customer);
    }

    async findAllCustomers(query: CustomerQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { customerCode: { contains: query.search, mode: 'insensitive' } },
                { customerName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.isActive !== undefined) where.isActive = query.isActive === true || String(query.isActive) === 'true';

        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.customer.count({ where }),
        ]);

        return {
            data: customers.map(c => this.transformCustomer(c)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOneCustomer(id: bigint) {
        const customer = await this.prisma.customer.findUnique({ where: { customerId: id } });
        if (!customer) throw new NotFoundException('Customer not found');
        return this.transformCustomer(customer);
    }

    async updateCustomer(id: bigint, dto: UpdateCustomerDto) {
        await this.findOneCustomer(id);
        const customer = await this.prisma.customer.update({ where: { customerId: id }, data: dto });
        return this.transformCustomer(customer);
    }

    async deleteCustomer(id: bigint) {
        await this.findOneCustomer(id);
        await this.prisma.customer.update({ where: { customerId: id }, data: { isActive: false } });
        return { message: 'Customer deactivated successfully' };
    }

    private transformCustomer(customer: any) {
        return { ...customer, customerId: customer.customerId.toString() };
    }

    // ========== SUPPLIER ITEM PRICES ==========
    async createSupplierItemPrice(dto: CreateSupplierItemPriceDto) {
        const price = await this.prisma.supplierItemPrice.create({
            data: {
                supplierId: BigInt(dto.supplierId),
                itemId: BigInt(dto.itemId),
                unitPrice: dto.unitPrice,
                effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
            },
            include: { supplier: true, item: true },
        });
        return this.transformSupplierPrice(price);
    }

    async findSupplierItemPrices(supplierId?: string, itemId?: string) {
        const where: any = {};
        if (supplierId) where.supplierId = BigInt(supplierId);
        if (itemId) where.itemId = BigInt(itemId);

        const prices = await this.prisma.supplierItemPrice.findMany({
            where,
            include: { supplier: true, item: true },
            orderBy: { effectiveFrom: 'desc' },
        });
        return prices.map(p => this.transformSupplierPrice(p));
    }

    async getLatestSupplierPrice(supplierId: bigint, itemId: bigint) {
        const price = await this.prisma.supplierItemPrice.findFirst({
            where: {
                supplierId,
                itemId,
                isActive: true,
                effectiveFrom: { lte: new Date() },
            },
            orderBy: { effectiveFrom: 'desc' },
        });
        return price;
    }

    async updateSupplierItemPrice(id: bigint, dto: UpdateSupplierItemPriceDto) {
        const price = await this.prisma.supplierItemPrice.update({
            where: { supplierItemPriceId: id },
            data: dto,
            include: { supplier: true, item: true },
        });
        return this.transformSupplierPrice(price);
    }

    private transformSupplierPrice(price: any) {
        return {
            ...price,
            supplierItemPriceId: price.supplierItemPriceId.toString(),
            supplierId: price.supplierId.toString(),
            itemId: price.itemId.toString(),
            supplier: price.supplier ? this.transformSupplier(price.supplier) : undefined,
            item: price.item ? this.transformItem(price.item) : undefined,
        };
    }

    // ========== CUSTOMER ITEM PRICES ==========
    async createCustomerItemPrice(dto: CreateCustomerItemPriceDto) {
        const price = await this.prisma.customerItemPrice.create({
            data: {
                customerId: BigInt(dto.customerId),
                itemId: BigInt(dto.itemId),
                unitPrice: dto.unitPrice,
                effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
            },
            include: { customer: true, item: true },
        });
        return this.transformCustomerPrice(price);
    }

    async findCustomerItemPrices(customerId?: string, itemId?: string) {
        const where: any = {};
        if (customerId) where.customerId = BigInt(customerId);
        if (itemId) where.itemId = BigInt(itemId);

        const prices = await this.prisma.customerItemPrice.findMany({
            where,
            include: { customer: true, item: true },
            orderBy: { effectiveFrom: 'desc' },
        });
        return prices.map(p => this.transformCustomerPrice(p));
    }

    async getLatestCustomerPrice(customerId: bigint, itemId: bigint) {
        const price = await this.prisma.customerItemPrice.findFirst({
            where: {
                customerId,
                itemId,
                isActive: true,
                effectiveFrom: { lte: new Date() },
            },
            orderBy: { effectiveFrom: 'desc' },
        });
        return price;
    }

    async updateCustomerItemPrice(id: bigint, dto: UpdateCustomerItemPriceDto) {
        const price = await this.prisma.customerItemPrice.update({
            where: { customerItemPriceId: id },
            data: dto,
            include: { customer: true, item: true },
        });
        return this.transformCustomerPrice(price);
    }

    private transformCustomerPrice(price: any) {
        return {
            ...price,
            customerItemPriceId: price.customerItemPriceId.toString(),
            customerId: price.customerId.toString(),
            itemId: price.itemId.toString(),
            customer: price.customer ? this.transformCustomer(price.customer) : undefined,
            item: price.item ? this.transformItem(price.item) : undefined,
        };
    }
}
