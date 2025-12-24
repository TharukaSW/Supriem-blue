"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MastersService = class MastersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUnit(dto) {
        const existing = await this.prisma.unit.findUnique({ where: { unitName: dto.unitName } });
        if (existing)
            throw new common_1.ConflictException('Unit already exists');
        return this.prisma.unit.create({ data: dto });
    }
    async findAllUnits() {
        return this.prisma.unit.findMany({ orderBy: { unitName: 'asc' } });
    }
    async findOneUnit(id) {
        const unit = await this.prisma.unit.findUnique({ where: { unitId: id } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        return unit;
    }
    async updateUnit(id, dto) {
        await this.findOneUnit(id);
        return this.prisma.unit.update({ where: { unitId: id }, data: dto });
    }
    async deleteUnit(id) {
        await this.findOneUnit(id);
        await this.prisma.unit.delete({ where: { unitId: id } });
        return { message: 'Unit deleted successfully' };
    }
    async createCategory(dto) {
        const existing = await this.prisma.itemCategory.findUnique({ where: { categoryName: dto.categoryName } });
        if (existing)
            throw new common_1.ConflictException('Category already exists');
        return this.prisma.itemCategory.create({ data: dto });
    }
    async findAllCategories() {
        return this.prisma.itemCategory.findMany({ orderBy: { categoryName: 'asc' } });
    }
    async findOneCategory(id) {
        const category = await this.prisma.itemCategory.findUnique({ where: { categoryId: id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async updateCategory(id, dto) {
        await this.findOneCategory(id);
        return this.prisma.itemCategory.update({ where: { categoryId: id }, data: dto });
    }
    async deleteCategory(id) {
        await this.findOneCategory(id);
        await this.prisma.itemCategory.delete({ where: { categoryId: id } });
        return { message: 'Category deleted successfully' };
    }
    async createItem(dto) {
        const existing = await this.prisma.item.findUnique({ where: { itemCode: dto.itemCode } });
        if (existing)
            throw new common_1.ConflictException('Item code already exists');
        return this.prisma.item.create({
            data: dto,
            include: { category: true, unit: true },
        });
    }
    async findAllItems(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { itemCode: { contains: query.search, mode: 'insensitive' } },
                { itemName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.itemType)
            where.itemType = query.itemType;
        if (query.categoryId)
            where.categoryId = Number(query.categoryId);
        if (query.isActive !== undefined)
            where.isActive = query.isActive === true || String(query.isActive) === 'true';
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
    async findOneItem(id) {
        const item = await this.prisma.item.findUnique({
            where: { itemId: id },
            include: { category: true, unit: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return this.transformItem(item);
    }
    async updateItem(id, dto) {
        await this.findOneItem(id);
        const item = await this.prisma.item.update({
            where: { itemId: id },
            data: dto,
            include: { category: true, unit: true },
        });
        return this.transformItem(item);
    }
    async deleteItem(id) {
        await this.findOneItem(id);
        await this.prisma.item.update({ where: { itemId: id }, data: { isActive: false } });
        return { message: 'Item deactivated successfully' };
    }
    transformItem(item) {
        return { ...item, itemId: item.itemId.toString() };
    }
    async createSupplier(dto, userId) {
        const existing = await this.prisma.supplier.findUnique({ where: { supplierCode: dto.supplierCode } });
        if (existing)
            throw new common_1.ConflictException('Supplier code already exists');
        const supplier = await this.prisma.supplier.create({
            data: {
                ...dto,
                createdBy: BigInt(userId),
                updatedBy: BigInt(userId),
            }
        });
        return this.transformSupplier(supplier);
    }
    async findAllSuppliers(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
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
        const include = {};
        if (query.includePrices) {
            include.itemPrices = {
                include: { item: true },
                orderBy: { effectiveFrom: 'desc' },
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
    async findOneSupplier(id, includePrices = false) {
        const include = {};
        if (includePrices) {
            include.itemPrices = {
                include: { item: { include: { unit: true } } },
                orderBy: { effectiveFrom: 'desc' },
            };
        }
        const supplier = await this.prisma.supplier.findUnique({
            where: { supplierId: id },
            include,
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return this.transformSupplier(supplier);
    }
    async updateSupplier(id, dto, userId) {
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
    async deactivateSupplier(id, dto, userId) {
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
    async deleteSupplier(id) {
        await this.findOneSupplier(id);
        await this.prisma.supplier.update({ where: { supplierId: id }, data: { isActive: false } });
        return { message: 'Supplier deactivated successfully' };
    }
    transformSupplier(supplier) {
        const transformed = {
            ...supplier,
            supplierId: supplier.supplierId.toString(),
            createdBy: supplier.createdBy?.toString(),
            updatedBy: supplier.updatedBy?.toString(),
            deactivatedBy: supplier.deactivatedBy?.toString(),
        };
        if (supplier.itemPrices) {
            transformed.itemPrices = supplier.itemPrices.map((p) => this.transformSupplierPrice(p));
        }
        return transformed;
    }
    async createCustomer(dto, userId) {
        const existing = await this.prisma.customer.findUnique({ where: { customerCode: dto.customerCode } });
        if (existing)
            throw new common_1.ConflictException('Customer code already exists');
        const customer = await this.prisma.customer.create({
            data: {
                ...dto,
                createdBy: BigInt(userId),
                updatedBy: BigInt(userId),
            }
        });
        return this.transformCustomer(customer);
    }
    async findAllCustomers(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
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
        const include = {};
        if (query.includePrices) {
            include.itemPrices = {
                include: { item: true },
                orderBy: { effectiveFrom: 'desc' },
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
    async findOneCustomer(id, includePrices = false) {
        const include = {};
        if (includePrices) {
            include.itemPrices = {
                include: { item: { include: { unit: true } } },
                orderBy: { effectiveFrom: 'desc' },
            };
        }
        const customer = await this.prisma.customer.findUnique({
            where: { customerId: id },
            include,
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.transformCustomer(customer);
    }
    async updateCustomer(id, dto, userId) {
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
    async deactivateCustomer(id, dto, userId) {
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
    async deleteCustomer(id) {
        await this.findOneCustomer(id);
        await this.prisma.customer.update({ where: { customerId: id }, data: { isActive: false } });
        return { message: 'Customer deactivated successfully' };
    }
    transformCustomer(customer) {
        const transformed = {
            ...customer,
            customerId: customer.customerId.toString(),
            createdBy: customer.createdBy?.toString(),
            updatedBy: customer.updatedBy?.toString(),
            deactivatedBy: customer.deactivatedBy?.toString(),
        };
        if (customer.itemPrices) {
            transformed.itemPrices = customer.itemPrices.map((p) => this.transformCustomerPrice(p));
        }
        return transformed;
    }
    async createSupplierItemPrice(supplierId, dto, userId) {
        await this.findOneSupplier(supplierId);
        await this.findOneItem(BigInt(dto.itemId));
        const effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();
        const endDate = dto.endDate ? new Date(dto.endDate) : null;
        if (endDate && endDate < effectiveFrom) {
            throw new common_1.BadRequestException('End date cannot be before effective from date');
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
    async findSupplierItemPrices(supplierId, query) {
        const where = { supplierId };
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
    async updateSupplierItemPrice(supplierId, priceId, dto, userId) {
        const existing = await this.prisma.supplierItemPrice.findUnique({
            where: { supplierItemPriceId: priceId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Supplier item price not found');
        }
        if (existing.supplierId !== supplierId) {
            throw new common_1.BadRequestException('Price does not belong to this supplier');
        }
        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new common_1.BadRequestException('End date cannot be before effective from date');
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
    async deactivateSupplierItemPrice(supplierId, priceId, dto, userId) {
        const existing = await this.prisma.supplierItemPrice.findUnique({
            where: { supplierItemPriceId: priceId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Supplier item price not found');
        }
        if (existing.supplierId !== supplierId) {
            throw new common_1.BadRequestException('Price does not belong to this supplier');
        }
        const updateData = {
            isActive: false,
            updatedBy: BigInt(userId),
        };
        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new common_1.BadRequestException('End date cannot be before effective from date');
            }
            updateData.endDate = endDate;
        }
        else {
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
    async getSupplierActivePrice(supplierId, itemId, asOfDate) {
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
    async getLatestSupplierPrice(supplierId, itemId) {
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
    transformSupplierPrice(price) {
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
    async createCustomerItemPrice(customerId, dto, userId) {
        await this.findOneCustomer(customerId);
        await this.findOneItem(BigInt(dto.itemId));
        const effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();
        const endDate = dto.endDate ? new Date(dto.endDate) : null;
        if (endDate && endDate < effectiveFrom) {
            throw new common_1.BadRequestException('End date cannot be before effective from date');
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
    async findCustomerItemPrices(customerId, query) {
        const where = { customerId };
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
    async updateCustomerItemPrice(customerId, priceId, dto, userId) {
        const existing = await this.prisma.customerItemPrice.findUnique({
            where: { customerItemPriceId: priceId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Customer item price not found');
        }
        if (existing.customerId !== customerId) {
            throw new common_1.BadRequestException('Price does not belong to this customer');
        }
        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new common_1.BadRequestException('End date cannot be before effective from date');
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
    async deactivateCustomerItemPrice(customerId, priceId, dto, userId) {
        const existing = await this.prisma.customerItemPrice.findUnique({
            where: { customerItemPriceId: priceId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Customer item price not found');
        }
        if (existing.customerId !== customerId) {
            throw new common_1.BadRequestException('Price does not belong to this customer');
        }
        const updateData = {
            isActive: false,
            updatedBy: BigInt(userId),
        };
        if (dto.endDate) {
            const endDate = new Date(dto.endDate);
            if (endDate < existing.effectiveFrom) {
                throw new common_1.BadRequestException('End date cannot be before effective from date');
            }
            updateData.endDate = endDate;
        }
        else {
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
    async getCustomerActivePrice(customerId, itemId, asOfDate) {
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
    async getLatestCustomerPrice(customerId, itemId) {
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
    transformCustomerPrice(price) {
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
};
exports.MastersService = MastersService;
exports.MastersService = MastersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MastersService);
//# sourceMappingURL=masters.service.js.map