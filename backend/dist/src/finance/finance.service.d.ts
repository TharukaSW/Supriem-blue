import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, CreatePaymentDto, PaymentQueryDto, TransactionQueryDto } from './dto';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    createExpense(dto: CreateExpenseDto, userId: string): Promise<any>;
    findAllExpenses(query: ExpenseQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneExpense(id: bigint): Promise<any>;
    updateExpense(id: bigint, dto: UpdateExpenseDto): Promise<any>;
    createPayment(dto: CreatePaymentDto, userId: string): Promise<any>;
    findAllPayments(query: PaymentQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAllTransactions(query: TransactionQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProfitReport(fromDate?: string, toDate?: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        profit: number;
    }>;
    private generateExpenseNo;
    private generatePaymentNo;
    private transformExpense;
    private transformPayment;
    private transformTransaction;
}
