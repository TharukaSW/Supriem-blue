import { ProductionService } from './production.service';
import { CreateProductionDayDto, UpdateProductionDayDto, ProductionQueryDto } from './dto';
export declare class ProductionController {
    private readonly productionService;
    constructor(productionService: ProductionService);
    create(dto: CreateProductionDayDto, user: any): Promise<any>;
    findAll(query: ProductionQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateProductionDayDto, user: any): Promise<any>;
    closeDay(id: string, user: any): Promise<any>;
    reopenDay(id: string, reason: string, user: any): Promise<any>;
}
