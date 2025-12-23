import { PrismaService } from '../prisma/prisma.service';
import { InvoiceQueryDto, UpdateInvoiceMatchDto } from './dto';
export declare class InvoicesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: InvoiceQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: bigint): Promise<any>;
    updateMatch(id: bigint, dto: UpdateInvoiceMatchDto, userId: string): Promise<any>;
    generatePdf(id: bigint, template?: 'DOT_MATRIX' | 'A4'): Promise<Buffer<ArrayBufferLike>>;
    private getDotMatrixTemplate;
    private getA4Template;
    private transform;
}
