import { PurchasingService } from './purchasing.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, ConfirmPurchaseOrderDto, PurchaseQueryDto } from './dto';
export declare class PurchasingController {
    private readonly purchasingService;
    constructor(purchasingService: PurchasingService);
    create(dto: CreatePurchaseOrderDto, user: any): Promise<any>;
    findAll(query: PurchaseQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdatePurchaseOrderDto): Promise<any>;
    confirm(id: string, dto: ConfirmPurchaseOrderDto, user: any): Promise<{
        message: string;
        invoiceId: string;
    }>;
    cancel(id: string): Promise<{
        message: string;
    }>;
}
