import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateUnitDto, UpdateUnitDto,
    CreateCategoryDto, UpdateCategoryDto,
    CreateItemDto, UpdateItemDto, ItemQueryDto,
    CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, DeactivateSupplierDto,
    CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, DeactivateCustomerDto,
    CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto, SupplierPriceQueryDto, DeactivateSupplierPriceDto,
    CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto, CustomerPriceQueryDto, DeactivateCustomerPriceDto,
} from './dto';
import { DateTime } from 'luxon';

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

        try {
            return this.prisma.item.create({
                data: dto,
                include: { category: true, unit: true },
            });
        } catch (error: any) {
            // Handle Prisma unique constraint error for item_name + item_type
            if (error.code === 'P2002' && error.meta?.target?.includes('item_name')) {
                throw new ConflictException(`An item with the name "${dto.itemName}" and type "${dto.itemType}" already exists`);
            }
            throw error;
        }
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
    async createSupplier(dto: CreateSupplierDto, userId: string) {
        // Auto-generate supplier code if not provided
        const supplierCode = dto.supplierCode || await this.generateSupplierCode();
        
        const existing = await this.prisma.supplier.findUnique({ where: { supplierCode } });
        if (existing) throw new ConflictException('Supplier code already exists');

        const { items, ...supplierData } = dto;

        const supplier = await this.prisma.supplier.create({
            data: {
                ...supplierData,
                supplierCode,
                createdBy: BigInt(userId),
                updatedBy: BigInt(userId),
                ...(items && items.length > 0 ? {
                    itemPrices: {
                        create: items.map(item => ({
                            itemId: BigInt(item.itemId),
                            unitPrice: item.unitPrice,
                            effectiveFrom: item.effectiveFrom ? new Date(item.effectiveFrom) : new Date(),
                            endDate: item.endDate ? new Date(item.endDate) : null,
                            createdBy: BigInt(userId),
                            updatedBy: BigInt(userId),
                        }))
                    }
                } : {})
            },
            include: {
                itemPrices: {
                    include: { item: true }
                }
            }
        });
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
                { contactName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive === true || String(query.isActive) === 'true';
        }

        const include: any = {};
        if (query.includePrices) {
            include.itemPrices = {
                include: { item: true },
                orderBy: { effectiveFrom: 'desc' as const },
            };
        }

        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where,
                skip,
                take: limit,
                include,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.supplier.count({ where }),
        ]);

        return {
            data: suppliers.map(s => this.transformSupplier(s)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOneSupplier(id: bigint, includePrices = false) {
        const include: any = {};
        if (includePrices) {
            include.itemPrices = {
                include: { item: { include: { unit: true } } },
                orderBy: { effectiveFrom: 'desc' as const },
            };
        }

        const supplier = await this.prisma.supplier.findUnique({
            where: { supplierId: id },
            include,
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return this.transformSupplier(supplier);
    }

    async updateSupplier(id: bigint, dto: UpdateSupplierDto, userId: string) {
        await this.findOneSupplier(id);
        const supplier = await this.prisma.supplier.update({
            where: { supplierId: id },
            data: {
                ...dto,
                updatedBy: BigInt(userId),
            }
        });
        return this.transformSupplier(supplier);
    }

    async deactivateSupplier(id: bigint, dto: DeactivateSupplierDto, userId: string) {
        await this.findOneSupplier(id);
        const supplier = await this.prisma.supplier.update({
            where: { supplierId: id },
            data: {
                isActive: false,
                deactivatedAt: new Date(),
                deactivatedBy: BigInt(userId),
                updatedBy: BigInt(userId),
            }
        });
        return {
            message: 'Supplier deactivated successfully',
            reason: dto.reason,
            supplier: this.transformSupplier(supplier)
        };
    }

    async deleteSupplier(id: bigint) {
        await this.findOneSupplier(id);
        await this.prisma.supplier.update({ where: { supplierId: id }, data: { isActive: false } });
        return { message: 'Supplier deactivated successfully' };
    }

    private transformSupplier(supplier: any) {
        const transformed: any = {
            ...supplier,
            supplierId: supplier.supplierId.toString(),
            createdBy: supplier.createdBy?.toString(),
            updatedBy: supplier.updatedBy?.toString(),
            deactivatedBy: supplier.deactivatedBy?.toString(),
        };

        if (supplier.itemPrices) {
            transformed.itemPrices = supplier.itemPrices.map((p: any) => this.transformSupplierPrice(p));
        }

        return transformed;
    }

    // ========== CUSTOMERS ==========
    async createCustomer(dto: CreateCustomerDto, userId: string) {
        // Auto-generate customer code if not provided
        const customerCode = dto.customerCode || await this.generateCustomerCode();
        
        const existing = await this.prisma.customer.findUnique({ where: { customerCode } });
        if (existing) throw new ConflictException('Customer code already exists');

        const { products, ...customerData } = dto;

        const customer = await this.prisma.customer.create({
            data: {
                ...customerData,
                customerCode,
                createdBy: BigInt(userId),
                updatedBy: BigInt(userId),
                itemPrices: {
                    create: products.map(product => ({
                        itemId: BigInt(product.itemId),
                        unitPrice: product.unitPrice,
                        effectiveFrom: product.effectiveFrom ? new Date(product.effectiveFrom) : new Date(),
                        endDate: product.endDate ? new Date(product.endDate) : null,
                        isActive: true,
                        createdBy: BigInt(userId),
                        updatedBy: BigInt(userId),
                    })),
                },
            },
            include: {
                itemPrices: {
                    include: { item: true },
                },
            },
        });
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
                { contactName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive === true || String(query.isActive) === 'true';
        }

        const include: any = {};
        if (query.includePrices) {
            include.itemPrices = {
                include: { item: true },
                orderBy: { effectiveFrom: 'desc' as const },
            };
        }

        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                include,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.customer.count({ where }),
        ]);

        return {
            data: customers.map(c => this.transformCustomer(c)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOneCustomer(id: bigint, includePrices = false) {
        const include: any = {};
        if (includePrices) {
            include.itemPrices = {
                include: { item: { include: { unit: true } } },
                orderBy: { effectiveFrom: 'desc' as const },
            };
        }

        const customer = await this.prisma.customer.findUnique({
            where: { customerId: id },
            include,
        });
        if (!customer) throw new NotFoundException('Customer not found');
        return this.transformCustomer(customer);
    }

    async updateCustomer(id: bigint, dto: UpdateCustomerDto, userId: string) {
        await this.findOneCustomer(id);
        const customer = await this.prisma.customer.update({
            where: { customerId: id },
            data: {
                ...dto,
                updatedBy: BigInt(userId),
            }
        });
        return this.transformCustomer(customer);
    }

    async deactivateCustomer(id: bigint, dto: DeactivateCustomerDto, userId: string) {
        await this.findOneCustomer(id);
        const customer = await this.prisma.customer.update({
            where: { customerId: id },
            data: {
                isActive: false,
                deactivatedAt: new Date(),
                deactivatedBy: BigInt(userId),
                updatedBy: BigInt(userId),
            }
        });
        return {
            message: 'Customer deactivated successfully',
            reason: dto.reason,
            customer: this.transformCustomer(customer)
        };
    }

    async deleteCustomer(id: bigint) {
        await this.findOneCustomer(id);
        await this.prisma.customer.update({ where: { customerId: id }, data: { isActive: false } });
        return { message: 'Customer deactivated successfully' };
    }

    private transformCustomer(customer: any) {
        const transformed: any = {
            ...customer,
            customerId: customer.customerId.toString(),
            createdBy: customer.createdBy?.toString(),
            updatedBy: customer.updatedBy?.toString(),
            deactivatedBy: customer.deactivatedBy?.toString(),
        };

        if (customer.itemPrices) {
            transformed.itemPrices = customer.itemPrices.map((p: any) => this.transformCustomerPrice(p));
        }

        return transformed;
    }

    // ========== SUPPLIER ITEM PRICES ==========
    async createSupplierItemPrice(supplierId: bigint, dto: CreateSupplierItemPriceDto, userId: string) {
        // Verify supplier and item exist
        await this.findOneSupplier(supplierId);
        await this.findOneItem(BigInt(dto.itemId));

        const effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();
        const endDate = dto.endDate ? new Date(dto.endDate) : null;

        // Validate dates
        if (endDate && endDate < effectiveFrom) {
            throw new BadRequestException('End date cannot be before effective from date');
        }

        const price = await this.prisma.supplierItemPrice.create({
            data: {
                supplierId,
                itemId: BigInt(dto.itemId),
                unitPrice: dto.unitPrice,
                effectiveFrom,
                endDate,
                createdBy: BigInt(userId),
                updatedBy: BigInt(userId),
            },
            include: { supplier: true, item: { include: { unit: true } } },
        });
        return this.transformSupplierPrice(price);
    }

    async findSupplierItemPrices(supplierId: bigint, query: SupplierPriceQueryDto) {
        const where: any = { supplierId };

        if (query.itemId) {
            where.itemId = BigInt(query.itemId);
        }

        if (query.activeOnly) {
            const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();
            where.isActive = true;
            where.effectiveFrom = { lte: asOfDate };
            where.OR = [
                { endDate: null },
                { endDate: { gte: asOfDate } },
            ];
        }

        const prices = await this.prisma.supplierItemPrice.findMany({
            where,
            include: { item: { include: { unit: true } } },
            orderBy: [
                { effectiveFrom: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return prices.map(p => this.transformSupplierPrice(p));
    }

    async updateSupplierItemPrice(supplierId: bigint, priceId: bigint, dto: UpdateSupplierItemPriceDto, userId: string) {
        const existing = await this.prisma.supplierItemPrice.findUnique({
            where: { supplierItemPriceId: priceId },
        });

        if (!existing) {
            throw new NotFoundException('Supplier item price not found');
        }

        if (existing.supplierId !== supplierId) {
            throw new BadRequestException('Price does not belong to this supplier');
        }

        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new BadRequestException('End date cannot be before effective from date');
            }
        }

        const price = await this.prisma.supplierItemPrice.update({
            where: { supplierItemPriceId: priceId },
            data: {
                ...dto,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                updatedBy: BigInt(userId),
            },
            include: { supplier: true, item: { include: { unit: true } } },
        });
        return this.transformSupplierPrice(price);
    }

    async deactivateSupplierItemPrice(supplierId: bigint, priceId: bigint, dto: DeactivateSupplierPriceDto, userId: string) {
        const existing = await this.prisma.supplierItemPrice.findUnique({
            where: { supplierItemPriceId: priceId },
        });

        if (!existing) {
            throw new NotFoundException('Supplier item price not found');
        }

        if (existing.supplierId !== supplierId) {
            throw new BadRequestException('Price does not belong to this supplier');
        }

        const updateData: any = {
            isActive: false,
            updatedBy: BigInt(userId),
        };

        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new BadRequestException('End date cannot be before effective from date');
            }
            updateData.endDate = endDate;
        } else {
            // Set end date to today if not provided
            updateData.endDate = new Date();
        }

        const price = await this.prisma.supplierItemPrice.update({
            where: { supplierItemPriceId: priceId },
            data: updateData,
            include: { supplier: true, item: { include: { unit: true } } },
        });

        return {
            message: 'Supplier item price deactivated successfully',
            price: this.transformSupplierPrice(price),
        };
    }

    /**
     * Get active supplier price for a specific item as of a given date
     * This is the critical function for purchase order pricing
     */
    async getSupplierActivePrice(supplierId: bigint, itemId: bigint, asOfDate?: Date) {
        const targetDate = asOfDate || new Date();

        const price = await this.prisma.supplierItemPrice.findFirst({
            where: {
                supplierId,
                itemId,
                isActive: true,
                effectiveFrom: { lte: targetDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: targetDate } },
                ],
            },
            orderBy: { effectiveFrom: 'desc' },
            include: { item: { include: { unit: true } } },
        });

        return price ? this.transformSupplierPrice(price) : null;
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

    private transformSupplierPrice(price: any) {
        return {
            ...price,
            supplierItemPriceId: price.supplierItemPriceId.toString(),
            supplierId: price.supplierId.toString(),
            itemId: price.itemId.toString(),
            createdBy: price.createdBy?.toString(),
            updatedBy: price.updatedBy?.toString(),
            supplier: price.supplier ? this.transformSupplier(price.supplier) : undefined,
            item: price.item ? this.transformItem(price.item) : undefined,
        };
    }

    // ========== CUSTOMER ITEM PRICES ==========
    async createCustomerItemPrice(customerId: bigint, dto: CreateCustomerItemPriceDto, userId: string) {
        // Verify customer and item exist
        await this.findOneCustomer(customerId);
        await this.findOneItem(BigInt(dto.itemId));

        const effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();
        const endDate = dto.endDate ? new Date(dto.endDate) : null;

        // Validate dates
        if (endDate && endDate < effectiveFrom) {
            throw new BadRequestException('End date cannot be before effective from date');
        }

        const price = await this.prisma.customerItemPrice.create({
            data: {
                customerId,
                itemId: BigInt(dto.itemId),
                unitPrice: dto.unitPrice,
                effectiveFrom,
                endDate,
                createdBy: BigInt(userId),
                updatedBy: BigInt(userId),
            },
            include: { customer: true, item: { include: { unit: true } } },
        });
        return this.transformCustomerPrice(price);
    }

    async findCustomerItemPrices(customerId: bigint, query: CustomerPriceQueryDto) {
        const where: any = { customerId };

        if (query.itemId) {
            where.itemId = BigInt(query.itemId);
        }

        if (query.activeOnly) {
            const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();
            where.isActive = true;
            where.effectiveFrom = { lte: asOfDate };
            where.OR = [
                { endDate: null },
                { endDate: { gte: asOfDate } },
            ];
        }

        const prices = await this.prisma.customerItemPrice.findMany({
            where,
            include: { item: { include: { unit: true } } },
            orderBy: [
                { effectiveFrom: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return prices.map(p => this.transformCustomerPrice(p));
    }

    async updateCustomerItemPrice(customerId: bigint, priceId: bigint, dto: UpdateCustomerItemPriceDto, userId: string) {
        const existing = await this.prisma.customerItemPrice.findUnique({
            where: { customerItemPriceId: priceId },
        });

        if (!existing) {
            throw new NotFoundException('Customer item price not found');
        }

        if (existing.customerId !== customerId) {
            throw new BadRequestException('Price does not belong to this customer');
        }

        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new BadRequestException('End date cannot be before effective from date');
            }
        }

        const price = await this.prisma.customerItemPrice.update({
            where: { customerItemPriceId: priceId },
            data: {
                ...dto,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                updatedBy: BigInt(userId),
            },
            include: { customer: true, item: { include: { unit: true } } },
        });
        return this.transformCustomerPrice(price);
    }

    async deactivateCustomerItemPrice(customerId: bigint, priceId: bigint, dto: DeactivateCustomerPriceDto, userId: string) {
        const existing = await this.prisma.customerItemPrice.findUnique({
            where: { customerItemPriceId: priceId },
        });

        if (!existing) {
            throw new NotFoundException('Customer item price not found');
        }

        if (existing.customerId !== customerId) {
            throw new BadRequestException('Price does not belong to this customer');
        }

        const updateData: any = {
            isActive: false,
            updatedBy: BigInt(userId),
        };

        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new BadRequestException('End date cannot be before effective from date');
            }
            updateData.endDate = endDate;
        } else {
            // Set end date to today if not provided
            updateData.endDate = new Date();
        }

        const price = await this.prisma.customerItemPrice.update({
            where: { customerItemPriceId: priceId },
            data: updateData,
            include: { customer: true, item: { include: { unit: true } } },
        });

        return {
            message: 'Customer item price deactivated successfully',
            price: this.transformCustomerPrice(price),
        };
    }

    /**
     * Get active customer price for a specific item as of a given date
     * This is the critical function for sales order pricing
     */
    async getCustomerActivePrice(customerId: bigint, itemId: bigint, asOfDate?: Date) {
        const targetDate = asOfDate || new Date();

        const price = await this.prisma.customerItemPrice.findFirst({
            where: {
                customerId,
                itemId,
                isActive: true,
                effectiveFrom: { lte: targetDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: targetDate } },
                ],
            },
            orderBy: { effectiveFrom: 'desc' },
            include: { item: { include: { unit: true } } },
        });

        return price ? this.transformCustomerPrice(price) : null;
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

    private transformCustomerPrice(price: any) {
        return {
            ...price,
            customerItemPriceId: price.customerItemPriceId.toString(),
            customerId: price.customerId.toString(),
            itemId: price.itemId.toString(),
            createdBy: price.createdBy?.toString(),
            updatedBy: price.updatedBy?.toString(),
            customer: price.customer ? this.transformCustomer(price.customer) : undefined,
            item: price.item ? this.transformItem(price.item) : undefined,
        };
    }

    // Helper method to generate supplier code
    private async generateSupplierCode(): Promise<string> {
        const prefix = 'SUP';
        const lastSupplier = await this.prisma.supplier.findFirst({
            where: { supplierCode: { startsWith: prefix } },
            orderBy: { supplierCode: 'desc' },
        });

        let nextNumber = 1;
        if (lastSupplier) {
            const currentNumber = parseInt(lastSupplier.supplierCode.replace(prefix, ''), 10);
            nextNumber = currentNumber + 1;
        }

        return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    }

    // Helper method to generate customer code
    private async generateCustomerCode(): Promise<string> {
        const prefix = 'CUS';
        const lastCustomer = await this.prisma.customer.findFirst({
            where: { customerCode: { startsWith: prefix } },
            orderBy: { customerCode: 'desc' },
        });

        let nextNumber = 1;
        if (lastCustomer) {
            const currentNumber = parseInt(lastCustomer.customerCode.replace(prefix, ''), 10);
            nextNumber = currentNumber + 1;
        }

        return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    }
}
