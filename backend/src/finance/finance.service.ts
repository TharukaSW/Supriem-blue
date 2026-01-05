import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, CreatePaymentDto, PaymentQueryDto, TransactionQueryDto } from './dto';
import { TxType, PayMethod, DocStatus } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    // ========== EXPENSES ==========
    async createExpense(dto: CreateExpenseDto, userId: string) {
        const expenseNo = await this.generateExpenseNo();

        const expense = await this.prisma.expense.create({
            data: {
                expenseNo,
                expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
                category: dto.category,
                description: dto.description,
                amount: dto.amount,
                method: dto.method || PayMethod.CASH,
                paidTo: dto.paidTo,
                supplierId: dto.supplierId ? BigInt(dto.supplierId) : null,
                createdBy: BigInt(userId),
            },
            include: { supplier: true, creator: true },
        });

        // Create cash transaction
        await this.prisma.cashTransaction.create({
            data: {
                txType: TxType.EXPENSE,
                sourceModule: 'EXPENSE',
                refTable: 'expenses',
                refId: expense.expenseId,
                amountIn: 0,
                amountOut: dto.amount,
                method: dto.method || PayMethod.CASH,
                note: `Expense: ${dto.category} - ${dto.description || ''}`,
                createdBy: BigInt(userId),
            },
        });

        return this.transformExpense(expense);
    }

    async findAllExpenses(query: ExpenseQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.category) where.category = { contains: query.category, mode: 'insensitive' };
        if (query.fromDate) where.expenseDate = { ...where.expenseDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.expenseDate = { ...where.expenseDate, lte: new Date(query.toDate) };

        const [expenses, total] = await Promise.all([
            this.prisma.expense.findMany({
                where, skip, take: limit,
                include: { supplier: true, creator: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.expense.count({ where }),
        ]);

        return {
            data: expenses.map(e => this.transformExpense(e)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOneExpense(id: bigint) {
        const expense = await this.prisma.expense.findUnique({
            where: { expenseId: id },
            include: { supplier: true, creator: true },
        });
        if (!expense) throw new NotFoundException('Expense not found');
        return this.transformExpense(expense);
    }

    async updateExpense(id: bigint, dto: UpdateExpenseDto) {
        await this.findOneExpense(id);
        const updated = await this.prisma.expense.update({
            where: { expenseId: id },
            data: dto,
            include: { supplier: true, creator: true },
        });
        return this.transformExpense(updated);
    }

    // ========== PAYMENTS ==========
    async createPayment(dto: CreatePaymentDto, userId: string) {
        const paymentNo = await this.generatePaymentNo();

        const invoice = await this.prisma.invoice.findUnique({
            where: { invoiceId: BigInt(dto.invoiceId) },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');

        const payment = await this.prisma.payment.create({
            data: {
                paymentNo,
                invoiceId: BigInt(dto.invoiceId),
                paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
                amount: dto.amount,
                method: dto.method || PayMethod.CASH,
                referenceNo: dto.referenceNo,
                notes: dto.notes,
                receivedBy: BigInt(userId),
            },
            include: { invoice: true, receiver: true },
        });

        // Check if invoice is fully paid
        const totalPaid = await this.prisma.payment.aggregate({
            where: { invoiceId: BigInt(dto.invoiceId) },
            _sum: { amount: true },
        });

        if (Number(totalPaid._sum.amount) >= Number(invoice.total)) {
            await this.prisma.invoice.update({
                where: { invoiceId: BigInt(dto.invoiceId) },
                data: { status: DocStatus.PAID },
            });
        }

        // Create cash transaction
        const txType = invoice.invoiceType === 'SALES' ? TxType.INCOME : TxType.EXPENSE;
        await this.prisma.cashTransaction.create({
            data: {
                txType,
                sourceModule: 'PAYMENT',
                refTable: 'payments',
                refId: payment.paymentId,
                amountIn: invoice.invoiceType === 'SALES' ? dto.amount : 0,
                amountOut: invoice.invoiceType === 'PURCHASE' ? dto.amount : 0,
                method: dto.method || PayMethod.CASH,
                note: `Payment for invoice ${invoice.invoiceNo}`,
                createdBy: BigInt(userId),
            },
        });

        return this.transformPayment(payment);
    }

    async findAllPayments(query: PaymentQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.invoiceId) where.invoiceId = BigInt(query.invoiceId);
        if (query.fromDate) where.paymentDate = { ...where.paymentDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.paymentDate = { ...where.paymentDate, lte: new Date(query.toDate) };

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where, skip, take: limit,
                include: { invoice: true, receiver: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where }),
        ]);

        return {
            data: payments.map(p => this.transformPayment(p)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ========== TRANSACTIONS ==========
    async findAllTransactions(query: TransactionQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.txType) where.txType = query.txType;
        if (query.fromDate) where.txDate = { ...where.txDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.txDate = { ...where.txDate, lte: new Date(query.toDate) };

        const [transactions, total] = await Promise.all([
            this.prisma.cashTransaction.findMany({
                where, skip, take: limit,
                include: { creator: true },
                orderBy: { txDate: 'desc' },
            }),
            this.prisma.cashTransaction.count({ where }),
        ]);

        return {
            data: transactions.map(t => this.transformTransaction(t)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ========== PROFIT ==========
    async getProfitReport(fromDate?: string, toDate?: string) {
        const dateFilter: any = {};
        if (fromDate) dateFilter.gte = new Date(fromDate);
        if (toDate) dateFilter.lte = new Date(toDate);

        const income = await this.prisma.cashTransaction.aggregate({
            where: {
                txType: TxType.INCOME,
                ...(fromDate || toDate ? { txDate: dateFilter } : {}),
            },
            _sum: { amountIn: true },
        });

        const expenses = await this.prisma.cashTransaction.aggregate({
            where: {
                txType: TxType.EXPENSE,
                ...(fromDate || toDate ? { txDate: dateFilter } : {}),
            },
            _sum: { amountOut: true },
        });

        const totalIncome = Number(income._sum.amountIn) || 0;
        const totalExpenses = Number(expenses._sum.amountOut) || 0;
        const profit = totalIncome - totalExpenses;

        return { totalIncome, totalExpenses, profit };
    }

    private async generateExpenseNo(): Promise<string> {
        const today = DateTime.now().setZone('Asia/Colombo');
        const prefix = `EXP${today.toFormat('yyyyMMdd')}`;
        const last = await this.prisma.expense.findFirst({
            where: { expenseNo: { startsWith: prefix } },
            orderBy: { expenseNo: 'desc' },
        });
        let seq = 1;
        if (last) seq = parseInt(last.expenseNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }

    private async generatePaymentNo(): Promise<string> {
        const today = DateTime.now().setZone('Asia/Colombo');
        const prefix = `PAY${today.toFormat('yyyyMMdd')}`;
        const last = await this.prisma.payment.findFirst({
            where: { paymentNo: { startsWith: prefix } },
            orderBy: { paymentNo: 'desc' },
        });
        let seq = 1;
        if (last) seq = parseInt(last.paymentNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }

    private transformExpense(expense: any) {
        return {
            ...expense,
            expenseId: expense.expenseId.toString(),
            supplierId: expense.supplierId?.toString(),
            createdBy: expense.createdBy?.toString(),
        };
    }

    private transformPayment(payment: any) {
        return {
            ...payment,
            paymentId: payment.paymentId.toString(),
            invoiceId: payment.invoiceId.toString(),
            receivedBy: payment.receivedBy?.toString(),
            invoice: payment.invoice ? {
                ...payment.invoice,
                invoiceId: payment.invoice.invoiceId.toString(),
            } : undefined,
        };
    }

    private transformTransaction(tx: any) {
        return {
            ...tx,
            txId: tx.txId.toString(),
            refId: tx.refId?.toString(),
            createdBy: tx.createdBy?.toString(),
        };
    }
}
