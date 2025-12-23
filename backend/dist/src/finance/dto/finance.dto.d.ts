import { PayMethod, TxType } from '@prisma/client';
export declare class CreateExpenseDto {
    expenseDate?: string;
    category: string;
    description?: string;
    amount: number;
    method?: PayMethod;
    paidTo?: string;
    supplierId?: string;
}
export declare class UpdateExpenseDto {
    category?: string;
    description?: string;
    amount?: number;
    method?: PayMethod;
    paidTo?: string;
}
export declare class ExpenseQueryDto {
    page?: number;
    limit?: number;
    category?: string;
    fromDate?: string;
    toDate?: string;
}
export declare class CreatePaymentDto {
    invoiceId: string;
    paymentDate?: string;
    amount: number;
    method?: PayMethod;
    referenceNo?: string;
    notes?: string;
}
export declare class PaymentQueryDto {
    page?: number;
    limit?: number;
    invoiceId?: string;
    fromDate?: string;
    toDate?: string;
}
export declare class TransactionQueryDto {
    page?: number;
    limit?: number;
    txType?: TxType;
    fromDate?: string;
    toDate?: string;
}
