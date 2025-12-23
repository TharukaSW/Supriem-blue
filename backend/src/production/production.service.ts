import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDayDto, UpdateProductionDayDto, ProductionQueryDto } from './dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class ProductionService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductionDayDto, userId: string) {
        const existing = await this.prisma.productionDay.findUnique({
            where: { productionDate: new Date(dto.productionDate) },
        });
        if (existing) throw new ConflictException('Production record already exists for this date');

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

            // Create stock movements for production output
            for (const line of dto.lines) {
                await tx.stockMovement.create({
                    data: {
                        movementType: MovementType.PRODUCTION_OUTPUT,
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

    async findAll(query: ProductionQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.fromDate) where.productionDate = { ...where.productionDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.productionDate = { ...where.productionDate, lte: new Date(query.toDate) };

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

    async findOne(id: bigint) {
        const day = await this.prisma.productionDay.findUnique({
            where: { productionDayId: id },
            include: { lines: { include: { item: { include: { unit: true } } } }, recorder: true },
        });
        if (!day) throw new NotFoundException('Production day not found');
        return this.transform(day);
    }

    async update(id: bigint, dto: UpdateProductionDayDto) {
        await this.findOne(id);
        const updated = await this.prisma.productionDay.update({
            where: { productionDayId: id },
            data: { notes: dto.notes },
            include: { lines: { include: { item: true } }, recorder: true },
        });
        return this.transform(updated);
    }

    private transform(day: any) {
        return {
            ...day,
            productionDayId: day.productionDayId.toString(),
            recordedBy: day.recordedBy?.toString(),
            lines: day.lines?.map((l: any) => ({
                ...l,
                productionLineId: l.productionLineId.toString(),
                productionDayId: l.productionDayId.toString(),
                itemId: l.itemId.toString(),
                item: l.item ? { ...l.item, itemId: l.item.itemId.toString() } : undefined,
            })),
        };
    }
}
