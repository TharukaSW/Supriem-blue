"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const luxon_1 = require("luxon");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createExpense(dto, userId) {
        const expenseNo = await this.generateExpenseNo();
        const expense = await this.prisma.expense.create({
            data: {
                expenseNo,
                expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
                category: dto.category,
                description: dto.description,
                amount: dto.amount,
                method: dto.method || client_1.PayMethod.CASH,
                paidTo: dto.paidTo,
                supplierId: dto.supplierId ? BigInt(dto.supplierId) : null,
                createdBy: BigInt(userId),
            },
            include: { supplier: true, creator: true },
        });
        await this.prisma.cashTransaction.create({
            data: {
                txType: client_1.TxType.EXPENSE,
                sourceModule: 'EXPENSE',
                refTable: 'expenses',
                refId: expense.expenseId,
                amountIn: 0,
                amountOut: dto.amount,
                method: dto.method || client_1.PayMethod.CASH,
                note: `Expense: ${dto.category} - ${dto.description || ''}`,
                createdBy: BigInt(userId),
            },
        });
        return this.transformExpense(expense);
    }
    async findAllExpenses(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.category)
            where.category = { contains: query.category, mode: 'insensitive' };
        if (query.fromDate)
            where.expenseDate = { ...where.expenseDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.expenseDate = { ...where.expenseDate, lte: new Date(query.toDate) };
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
    async findOneExpense(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { expenseId: id },
            include: { supplier: true, creator: true },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        return this.transformExpense(expense);
    }
    async updateExpense(id, dto) {
        await this.findOneExpense(id);
        const updated = await this.prisma.expense.update({
            where: { expenseId: id },
            data: dto,
            include: { supplier: true, creator: true },
        });
        return this.transformExpense(updated);
    }
    async createPayment(dto, userId) {
        const paymentNo = await this.generatePaymentNo();
        const invoice = await this.prisma.invoice.findUnique({
            where: { invoiceId: BigInt(dto.invoiceId) },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const payment = await this.prisma.payment.create({
            data: {
                paymentNo,
                invoiceId: BigInt(dto.invoiceId),
                paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
                amount: dto.amount,
                method: dto.method || client_1.PayMethod.CASH,
                referenceNo: dto.referenceNo,
                notes: dto.notes,
                receivedBy: BigInt(userId),
            },
            include: { invoice: true, receiver: true },
        });
        const totalPaid = await this.prisma.payment.aggregate({
            where: { invoiceId: BigInt(dto.invoiceId) },
            _sum: { amount: true },
        });
        if (Number(totalPaid._sum.amount) >= Number(invoice.total)) {
            await this.prisma.invoice.update({
                where: { invoiceId: BigInt(dto.invoiceId) },
                data: { status: client_1.DocStatus.PAID },
            });
        }
        const txType = invoice.invoiceType === 'SALES' ? client_1.TxType.INCOME : client_1.TxType.EXPENSE;
        await this.prisma.cashTransaction.create({
            data: {
                txType,
                sourceModule: 'PAYMENT',
                refTable: 'payments',
                refId: payment.paymentId,
                amountIn: invoice.invoiceType === 'SALES' ? dto.amount : 0,
                amountOut: invoice.invoiceType === 'PURCHASE' ? dto.amount : 0,
                method: dto.method || client_1.PayMethod.CASH,
                note: `Payment for invoice ${invoice.invoiceNo}`,
                createdBy: BigInt(userId),
            },
        });
        return this.transformPayment(payment);
    }
    async findAllPayments(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.invoiceId)
            where.invoiceId = BigInt(query.invoiceId);
        if (query.fromDate)
            where.paymentDate = { ...where.paymentDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.paymentDate = { ...where.paymentDate, lte: new Date(query.toDate) };
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
    async findAllTransactions(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.txType)
            where.txType = query.txType;
        if (query.fromDate)
            where.txDate = { ...where.txDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.txDate = { ...where.txDate, lte: new Date(query.toDate) };
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
    async getProfitReport(fromDate, toDate) {
        const dateFilter = {};
        if (fromDate)
            dateFilter.gte = new Date(fromDate);
        if (toDate)
            dateFilter.lte = new Date(toDate);
        const income = await this.prisma.cashTransaction.aggregate({
            where: {
                txType: client_1.TxType.INCOME,
                ...(fromDate || toDate ? { txDate: dateFilter } : {}),
            },
            _sum: { amountIn: true },
        });
        const expenses = await this.prisma.cashTransaction.aggregate({
            where: {
                txType: client_1.TxType.EXPENSE,
                ...(fromDate || toDate ? { txDate: dateFilter } : {}),
            },
            _sum: { amountOut: true },
        });
        const totalIncome = Number(income._sum.amountIn) || 0;
        const totalExpenses = Number(expenses._sum.amountOut) || 0;
        const profit = totalIncome - totalExpenses;
        return { totalIncome, totalExpenses, profit };
    }
    async generateExpenseNo() {
        const today = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const prefix = `EXP${today.toFormat('yyyyMMdd')}`;
        const last = await this.prisma.expense.findFirst({
            where: { expenseNo: { startsWith: prefix } },
            orderBy: { expenseNo: 'desc' },
        });
        let seq = 1;
        if (last)
            seq = parseInt(last.expenseNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }
    async generatePaymentNo() {
        const today = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const prefix = `PAY${today.toFormat('yyyyMMdd')}`;
        const last = await this.prisma.payment.findFirst({
            where: { paymentNo: { startsWith: prefix } },
            orderBy: { paymentNo: 'desc' },
        });
        let seq = 1;
        if (last)
            seq = parseInt(last.paymentNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }
    transformExpense(expense) {
        return {
            ...expense,
            expenseId: expense.expenseId.toString(),
            supplierId: expense.supplierId?.toString(),
            createdBy: expense.createdBy?.toString(),
        };
    }
    transformPayment(payment) {
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
    transformTransaction(tx) {
        return {
            ...tx,
            txId: tx.txId.toString(),
            refId: tx.refId?.toString(),
            createdBy: tx.createdBy?.toString(),
        };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map