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
        const existing = await this.prisma.productionDay.findUnique({
            where: { productionDate: new Date(dto.productionDate) },
        });
        if (existing)
            throw new common_1.ConflictException('Production record already exists for this date');
        return this.prisma.$transaction(async (tx) => {
            const productionDay = await tx.productionDay.create({
                data: {
                    productionDate: new Date(dto.productionDate),
                    notes: dto.notes,
                    recordedBy: BigInt(userId),
                    lines: {
                        create: dto.lines.map(l => ({
                            itemId: BigInt(l.itemId),
                            qtyProduced: l.qtyProduced,
                            scrapQty: l.scrapQty || 0,
                        })),
                    },
                },
                include: { lines: { include: { item: true } }, recorder: true },
            });
            for (const line of dto.lines) {
                await tx.stockMovement.create({
                    data: {
                        movementType: client_1.MovementType.PRODUCTION_OUTPUT,
                        itemId: BigInt(line.itemId),
                        qtyIn: line.qtyProduced,
                        qtyOut: 0,
                        refTable: 'production_days',
                        refId: productionDay.productionDayId,
                        createdBy: BigInt(userId),
                    },
                });
                await tx.stockBalance.upsert({
                    where: { itemId: BigInt(line.itemId) },
                    update: { qtyOnHand: { increment: line.qtyProduced } },
                    create: { itemId: BigInt(line.itemId), qtyOnHand: line.qtyProduced },
                });
            }
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
        const [days, total] = await Promise.all([
            this.prisma.productionDay.findMany({
                where, skip, take: limit,
                include: { lines: { include: { item: true } }, recorder: true },
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
            include: { lines: { include: { item: { include: { unit: true } } } }, recorder: true },
        });
        if (!day)
            throw new common_1.NotFoundException('Production day not found');
        return this.transform(day);
    }
    async update(id, dto) {
        await this.findOne(id);
        const updated = await this.prisma.productionDay.update({
            where: { productionDayId: id },
            data: { notes: dto.notes },
            include: { lines: { include: { item: true } }, recorder: true },
        });
        return this.transform(updated);
    }
    transform(day) {
        return {
            ...day,
            productionDayId: day.productionDayId.toString(),
            recordedBy: day.recordedBy?.toString(),
            lines: day.lines?.map((l) => ({
                ...l,
                productionLineId: l.productionLineId.toString(),
                productionDayId: l.productionDayId.toString(),
                itemId: l.itemId.toString(),
                item: l.item ? { ...l.item, itemId: l.item.itemId.toString() } : undefined,
            })),
        };
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionService);
//# sourceMappingURL=production.service.js.map