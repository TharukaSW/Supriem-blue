import { SalesService } from './sales.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto, SalesQueryDto, CreateDispatchDto, DispatchQueryDto } from './dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    createOrder(dto: CreateSalesOrderDto, user: any): Promise<any>;
    findAllOrders(query: SalesQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneOrder(id: string): Promise<any>;
    updateOrder(id: string, dto: UpdateSalesOrderDto): Promise<any>;
    confirmOrder(id: string, user: any): Promise<{
        message: string;
        invoiceId: string;
    }>;
    cancelOrder(id: string): Promise<{
        message: string;
    }>;
    createDispatch(dto: CreateDispatchDto, user: any): Promise<any>;
    findAllDispatches(query: DispatchQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneDispatch(id: string): Promise<any>;
    markDelivered(id: string): Promise<{
        message: string;
    }>;
}
