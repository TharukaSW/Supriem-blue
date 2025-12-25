export declare class CreateProductionDayDto {
    productionDate: string;
    finishedProductId: string;
    quantity: number;
    scrapQuantity?: number;
    notes?: string;
}
export declare class UpdateProductionDayDto {
    quantity?: number;
    scrapQuantity?: number;
    notes?: string;
}
export declare class ProductionQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
}
