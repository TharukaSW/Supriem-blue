import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDayDto, UpdateProductionDayDto, ProductionQueryDto } from './dto';
export declare class ProductionService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProductionDayDto, userId: string): Promise<any>;
    findAll(query: ProductionQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: bigint): Promise<any>;
    update(id: bigint, dto: UpdateProductionDayDto): Promise<any>;
    private transform;
}
