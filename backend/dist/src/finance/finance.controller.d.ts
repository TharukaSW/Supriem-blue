import { FinanceService } from './finance.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, CreatePaymentDto, PaymentQueryDto, TransactionQueryDto } from './dto';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    createExpense(dto: CreateExpenseDto, user: any): Promise<any>;
    findAllExpenses(query: ExpenseQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneExpense(id: string): Promise<any>;
    updateExpense(id: string, dto: UpdateExpenseDto): Promise<any>;
    createPayment(dto: CreatePaymentDto, user: any): Promise<any>;
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
}
