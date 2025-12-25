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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProductionService = class ProductionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const existing = await this.prisma.productionDay.findFirst({
            where: {
                productionDate: new Date(dto.productionDate),
                finishedProductId: BigInt(dto.finishedProductId),
            },
        });
        if (existing)
            throw new common_1.ConflictException('Production record already exists for this product on this date');
        return this.prisma.$transaction(async (tx) => {
            const productionDay = await tx.productionDay.create({
                data: {
                    productionDate: new Date(dto.productionDate),
                    finishedProductId: BigInt(dto.finishedProductId),
                    quantity: dto.quantity,
                    scrapQuantity: dto.scrapQuantity || 0,
                    notes: dto.notes,
                    isClosed: false,
                    createdBy: BigInt(userId),
                },
                include: {
                    finishedProduct: { include: { unit: true } },
                    creator: true
                },
            });
            await tx.stockMovement.create({
                data: {
                    movementType: client_1.MovementType.PRODUCTION_OUTPUT,
                    itemId: BigInt(dto.finishedProductId),
                    qtyIn: dto.quantity,
                    qtyOut: 0,
                    refTable: 'production_days',
                    refId: productionDay.productionDayId,
                    createdBy: BigInt(userId),
                },
            });
            await tx.stockBalance.upsert({
                where: { itemId: BigInt(dto.finishedProductId) },
                update: { qtyOnHand: { increment: dto.quantity } },
                create: { itemId: BigInt(dto.finishedProductId), qtyOnHand: dto.quantity },
            });
            return this.transform(productionDay);
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.fromDate)
            where.productionDate = { ...where.productionDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.productionDate = { ...where.productionDate, lte: new Date(query.toDate) };
        if (query.search) {
            where.finishedProduct = {
                itemName: { contains: query.search, mode: 'insensitive' }
            };
        }
        const [days, total] = await Promise.all([
            this.prisma.productionDay.findMany({
                where, skip, take: limit,
                include: {
                    finishedProduct: { include: { unit: true } },
                    creator: true
                },
                orderBy: { productionDate: 'desc' },
            }),
            this.prisma.productionDay.count({ where }),
        ]);
        return {
            data: days.map(d => this.transform(d)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const day = await this.prisma.productionDay.findUnique({
            where: { productionDayId: id },
            include: {
                finishedProduct: { include: { unit: true } },
                creator: true
            },
        });
        if (!day)
            throw new common_1.NotFoundException('Production day not found');
        return this.transform(day);
    }
    async update(id, dto, userId) {
        const day = await this.findOne(id);
        if (day.isClosed) {
            throw new common_1.BadRequestException('Cannot edit closed production day. Please reopen it first.');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const prodDate = new Date(day.productionDate);
        prodDate.setHours(0, 0, 0, 0);
        if (prodDate.getTime() !== today.getTime()) {
            throw new common_1.BadRequestException('Can only edit production for current day');
        }
        return this.prisma.$transaction(async (tx) => {
            if (dto.quantity && dto.quantity !== day.quantity) {
                const diff = dto.quantity - day.quantity;
                await tx.stockMovement.create({
                    data: {
                        movementType: client_1.MovementType.PRODUCTION_ADJUSTMENT,
                        itemId: BigInt(day.finishedProductId),
                        qtyIn: diff > 0 ? diff : 0,
                        qtyOut: diff < 0 ? Math.abs(diff) : 0,
                        refTable: 'production_days',
                        refId: id,
                        createdBy: BigInt(userId),
                    },
                });
                await tx.stockBalance.update({
                    where: { itemId: BigInt(day.finishedProductId) },
                    data: { qtyOnHand: { increment: diff } },
                });
            }
            const updated = await tx.productionDay.update({
                where: { productionDayId: id },
                data: {
                    quantity: dto.quantity,
                    scrapQuantity: dto.scrapQuantity,
                    notes: dto.notes,
                },
                include: {
                    finishedProduct: { include: { unit: true } },
                    creator: true
                },
            });
            return this.transform(updated);
        });
    }
    async closeDay(id, userId) {
        const day = await this.findOne(id);
        if (day.isClosed) {
            throw new common_1.BadRequestException('Production day is already closed');
        }
        const updated = await this.prisma.productionDay.update({
            where: { productionDayId: id },
            data: {
                isClosed: true,
                closedAt: new Date(),
                closedBy: BigInt(userId),
            },
            include: {
                finishedProduct: { include: { unit: true } },
                creator: true
            },
        });
        return this.transform(updated);
    }
    async reopenDay(id, userId, reason) {
        const day = await this.findOne(id);
        if (!day.isClosed) {
            throw new common_1.BadRequestException('Production day is already open');
        }
        const updated = await this.prisma.productionDay.update({
            where: { productionDayId: id },
            data: {
                isClosed: false,
                closedAt: null,
                closedBy: null,
                reopenReason: reason,
                reopenedBy: BigInt(userId),
                reopenedAt: new Date(),
            },
            include: {
                finishedProduct: { include: { unit: true } },
                creator: true
            },
        });
        return this.transform(updated);
    }
    transform(day) {
        return {
            ...day,
            productionDayId: day.productionDayId.toString(),
            finishedProductId: day.finishedProductId?.toString(),
            createdBy: day.createdBy?.toString(),
            closedBy: day.closedBy?.toString(),
            reopenedBy: day.reopenedBy?.toString(),
            finishedProduct: day.finishedProduct ? {
                ...day.finishedProduct,
                itemId: day.finishedProduct.itemId.toString(),
                unit: day.finishedProduct.unit ? {
                    ...day.finishedProduct.unit,
                    unitId: day.finishedProduct.unit.unitId.toString(),
                } : undefined,
            } : undefined,
            creator: day.creator ? {
                ...day.creator,
                userId: day.creator.userId.toString(),
            } : undefined,
        };
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map