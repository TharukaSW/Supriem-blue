import { PrismaService } from '../prisma/prisma.service';
import { MastersService } from '../masters/masters.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto, SalesQueryDto, CreateDispatchDto, DispatchQueryDto } from './dto';
export declare class SalesService {
    private prisma;
    private mastersService;
    constructor(prisma: PrismaService, mastersService: MastersService);
    createOrder(dto: CreateSalesOrderDto, userId: string): Promise<any>;
    findAllOrders(query: SalesQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneOrder(id: bigint): Promise<any>;
    updateOrder(id: bigint, dto: UpdateSalesOrderDto): Promise<any>;
    confirmOrder(id: bigint, userId: string): Promise<{
        message: string;
        invoiceId: string;
    }>;
    cancelOrder(id: bigint): Promise<{
        message: string;
    }>;
    createDispatch(dto: CreateDispatchDto, userId: string): Promise<any>;
    findAllDispatches(query: DispatchQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneDispatch(id: bigint): Promise<any>;
    markDelivered(id: bigint): Promise<{
        message: string;
    }>;
    private generateOrderNo;
    private generateInvoiceNo;
    private generateDispatchNo;
    private transformOrder;
    private transformDispatch;
}
