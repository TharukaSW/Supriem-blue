import { PrismaService } from '../prisma/prisma.service';
import { MastersService } from '../masters/masters.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, ConfirmPurchaseOrderDto, PurchaseQueryDto } from './dto';
export declare class PurchasingService {
    private prisma;
    private mastersService;
    constructor(prisma: PrismaService, mastersService: MastersService);
    create(dto: CreatePurchaseOrderDto, userId: string): Promise<any>;
    findAll(query: PurchaseQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: bigint): Promise<any>;
    update(id: bigint, dto: UpdatePurchaseOrderDto): Promise<any>;
    confirm(id: bigint, dto: ConfirmPurchaseOrderDto, userId: string): Promise<{
        message: string;
        invoiceId: string;
    }>;
    cancel(id: bigint): Promise<{
        message: string;
    }>;
    private generatePurchaseNo;
    private generateInvoiceNo;
    private transform;
}
