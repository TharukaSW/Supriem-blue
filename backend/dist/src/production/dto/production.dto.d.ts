export declare class ProductionLineDto {
    itemId: string;
    qtyProduced: number;
    scrapQty?: number;
}
export declare class CreateProductionDayDto {
    productionDate: string;
    notes?: string;
    lines: ProductionLineDto[];
}
export declare class UpdateProductionDayDto {
    notes?: string;
}
export declare class ProductionQueryDto {
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
}
