import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDayDto, UpdateProductionDayDto, ProductionQueryDto } from './dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class ProductionService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductionDayDto, userId: string) {
        // Check if date already has production record for this product
        const existing = await this.prisma.productionDay.findFirst({
            where: {
                productionDate: new Date(dto.productionDate),
                finishedProductId: BigInt(dto.finishedProductId),
            },
        });
        if (existing) throw new ConflictException('Production record already exists for this product on this date');

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

            // Create stock movement for production output
            await tx.stockMovement.create({
                data: {
                    movementType: MovementType.PRODUCTION_OUTPUT,
                    itemId: BigInt(dto.finishedProductId),
                    qtyIn: dto.quantity,
                    qtyOut: 0,
                    refTable: 'production_days',
                    refId: productionDay.productionDayId,
                    createdBy: BigInt(userId),
                },
            });

            // Update stock balance
            await tx.stockBalance.upsert({
                where: { itemId: BigInt(dto.finishedProductId) },
                update: { qtyOnHand: { increment: dto.quantity } },
                create: { itemId: BigInt(dto.finishedProductId), qtyOnHand: dto.quantity },
            });

            return this.transform(productionDay);
        });
    }

    async findAll(query: ProductionQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.fromDate) where.productionDate = { ...where.productionDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.productionDate = { ...where.productionDate, lte: new Date(query.toDate) };
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

    async findOne(id: bigint) {
        const day = await this.prisma.productionDay.findUnique({
            where: { productionDayId: id },
            include: {
                finishedProduct: { include: { unit: true } },
                creator: true
            },
        });
        if (!day) throw new NotFoundException('Production day not found');
        return this.transform(day);
    }

    async update(id: bigint, dto: UpdateProductionDayDto, userId: string) {
        const day = await this.findOne(id);
        
        // Check if day is closed
        if (day.isClosed) {
            throw new BadRequestException('Cannot edit closed production day. Please reopen it first.');
        }

        // Only allow same-day edits
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const prodDate = new Date(day.productionDate);
        prodDate.setHours(0, 0, 0, 0);
        
        if (prodDate.getTime() !== today.getTime()) {
            throw new BadRequestException('Can only edit production for current day');
        }

        return this.prisma.$transaction(async (tx) => {
            // If quantity changed, adjust stock
            if (dto.quantity && dto.quantity !== day.quantity) {
                const diff = dto.quantity - day.quantity;
                
                await tx.stockMovement.create({
                    data: {
                        movementType: MovementType.PRODUCTION_ADJUSTMENT,
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

    async closeDay(id: bigint, userId: string) {
        const day = await this.findOne(id);
        
        if (day.isClosed) {
            throw new BadRequestException('Production day is already closed');
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

    async reopenDay(id: bigint, userId: string, reason: string) {
        const day = await this.findOne(id);
        
        if (!day.isClosed) {
            throw new BadRequestException('Production day is already open');
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

    private transform(day: any) {
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
}
