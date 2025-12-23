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
    async createSupplier(dto) {
        const existing = await this.prisma.supplier.findUnique({ where: { supplierCode: dto.supplierCode } });
        if (existing)
            throw new common_1.ConflictException('Supplier code already exists');
        const supplier = await this.prisma.supplier.create({ data: dto });
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
            ];
        }
        if (query.isActive !== undefined)
            where.isActive = query.isActive === true || String(query.isActive) === 'true';
        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.supplier.count({ where }),
        ]);
        return {
            data: suppliers.map(s => this.transformSupplier(s)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOneSupplier(id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { supplierId: id } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return this.transformSupplier(supplier);
    }
    async updateSupplier(id, dto) {
        await this.findOneSupplier(id);
        const supplier = await this.prisma.supplier.update({ where: { supplierId: id }, data: dto });
        return this.transformSupplier(supplier);
    }
    async deleteSupplier(id) {
        await this.findOneSupplier(id);
        await this.prisma.supplier.update({ where: { supplierId: id }, data: { isActive: false } });
        return { message: 'Supplier deactivated successfully' };
    }
    transformSupplier(supplier) {
        return { ...supplier, supplierId: supplier.supplierId.toString() };
    }
    async createCustomer(dto) {
        const existing = await this.prisma.customer.findUnique({ where: { customerCode: dto.customerCode } });
        if (existing)
            throw new common_1.ConflictException('Customer code already exists');
        const customer = await this.prisma.customer.create({ data: dto });
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
            ];
        }
        if (query.isActive !== undefined)
            where.isActive = query.isActive === true || String(query.isActive) === 'true';
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.customer.count({ where }),
        ]);
        return {
            data: customers.map(c => this.transformCustomer(c)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOneCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { customerId: id } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.transformCustomer(customer);
    }
    async updateCustomer(id, dto) {
        await this.findOneCustomer(id);
        const customer = await this.prisma.customer.update({ where: { customerId: id }, data: dto });
        return this.transformCustomer(customer);
    }
    async deleteCustomer(id) {
        await this.findOneCustomer(id);
        await this.prisma.customer.update({ where: { customerId: id }, data: { isActive: false } });
        return { message: 'Customer deactivated successfully' };
    }
    transformCustomer(customer) {
        return { ...customer, customerId: customer.customerId.toString() };
    }
    async createSupplierItemPrice(dto) {
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
    async findSupplierItemPrices(supplierId, itemId) {
        const where = {};
        if (supplierId)
            where.supplierId = BigInt(supplierId);
        if (itemId)
            where.itemId = BigInt(itemId);
        const prices = await this.prisma.supplierItemPrice.findMany({
            where,
            include: { supplier: true, item: true },
            orderBy: { effectiveFrom: 'desc' },
        });
        return prices.map(p => this.transformSupplierPrice(p));
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
    async updateSupplierItemPrice(id, dto) {
        const price = await this.prisma.supplierItemPrice.update({
            where: { supplierItemPriceId: id },
            data: dto,
            include: { supplier: true, item: true },
        });
        return this.transformSupplierPrice(price);
    }
    transformSupplierPrice(price) {
        return {
            ...price,
            supplierItemPriceId: price.supplierItemPriceId.toString(),
            supplierId: price.supplierId.toString(),
            itemId: price.itemId.toString(),
            supplier: price.supplier ? this.transformSupplier(price.supplier) : undefined,
            item: price.item ? this.transformItem(price.item) : undefined,
        };
    }
    async createCustomerItemPrice(dto) {
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
    async findCustomerItemPrices(customerId, itemId) {
        const where = {};
        if (customerId)
            where.customerId = BigInt(customerId);
        if (itemId)
            where.itemId = BigInt(itemId);
        const prices = await this.prisma.customerItemPrice.findMany({
            where,
            include: { customer: true, item: true },
            orderBy: { effectiveFrom: 'desc' },
        });
        return prices.map(p => this.transformCustomerPrice(p));
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
    async updateCustomerItemPrice(id, dto) {
        const price = await this.prisma.customerItemPrice.update({
            where: { customerItemPriceId: id },
            data: dto,
            include: { customer: true, item: true },
        });
        return this.transformCustomerPrice(price);
    }
    transformCustomerPrice(price) {
        return {
            ...price,
            customerItemPriceId: price.customerItemPriceId.toString(),
            customerId: price.customerId.toString(),
            itemId: price.itemId.toString(),
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