import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { InvoiceQueryDto, UpdateInvoiceMatchDto } from './dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(query: InvoiceQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<any>;
    updateMatch(id: string, dto: UpdateInvoiceMatchDto, user: any): Promise<any>;
    downloadPdf(id: string, template: "DOT_MATRIX" | "A4" | undefined, res: Response): Promise<void>;
}
