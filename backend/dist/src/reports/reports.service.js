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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const luxon_1 = require("luxon");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesReport(fromDate, toDate) {
        const dateFilter = this.getDateFilter(fromDate, toDate);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                invoiceType: client_1.InvoiceType.SALES,
                ...(dateFilter ? { invoiceDate: dateFilter } : {}),
            },
            include: { customer: true },
        });
        const totalSales = invoices.reduce((sum, i) => sum + Number(i.total), 0);
        const totalPaid = invoices.filter(i => i.status === client_1.DocStatus.PAID).reduce((sum, i) => sum + Number(i.total), 0);
        return {
            period: { fromDate, toDate },
            summary: { totalSales, totalPaid, outstanding: totalSales - totalPaid, invoiceCount: invoices.length },
            invoices: invoices.map(i => ({
                invoiceId: i.invoiceId.toString(),
                invoiceNo: i.invoiceNo,
                date: i.invoiceDate,
                customer: i.customer?.customerName,
                total: Number(i.total),
                status: i.status,
            })),
        };
    }
    async getPurchasesReport(fromDate, toDate) {
        const dateFilter = this.getDateFilter(fromDate, toDate);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                invoiceType: client_1.InvoiceType.PURCHASE,
                ...(dateFilter ? { invoiceDate: dateFilter } : {}),
            },
            include: { supplier: true },
        });
        const totalPurchases = invoices.reduce((sum, i) => sum + Number(i.total), 0);
        return {
            period: { fromDate, toDate },
            summary: { totalPurchases, invoiceCount: invoices.length },
            invoices: invoices.map(i => ({
                invoiceId: i.invoiceId.toString(),
                invoiceNo: i.invoiceNo,
                date: i.invoiceDate,
                supplier: i.supplier?.supplierName,
                total: Number(i.total),
                matchStatus: i.matchStatus,
            })),
        };
    }
    async getProductionReport(fromDate, toDate) {
        const dateFilter = this.getDateFilter(fromDate, toDate, 'productionDate');
        const productionDays = await this.prisma.productionDay.findMany({
            where: dateFilter ? { productionDate: dateFilter } : {},
            include: { lines: { include: { item: true } } },
            orderBy: { productionDate: 'desc' },
        });
        const summary = {};
        let totalProduced = 0;
        let totalScrap = 0;
        for (const day of productionDays) {
            for (const line of day.lines) {
                const itemName = line.item.itemName;
                summary[itemName] = (summary[itemName] || 0) + Number(line.qtyProduced);
                totalProduced += Number(line.qtyProduced);
                totalScrap += Number(line.scrapQty);
            }
        }
        return {
            period: { fromDate, toDate },
            summary: { totalProduced, totalScrap, productionDays: productionDays.length },
            byProduct: Object.entries(summary).map(([item, qty]) => ({ item, qty })),
            daily: productionDays.map(d => ({
                date: d.productionDate,
                lines: d.lines.map(l => ({
                    item: l.item.itemName,
                    produced: Number(l.qtyProduced),
                    scrap: Number(l.scrapQty),
                })),
            })),
        };
    }
    async getStockReport() {
        const balances = await this.prisma.stockBalance.findMany({
            include: { item: { include: { unit: true, category: true } } },
            orderBy: { item: { itemName: 'asc' } },
        });
        return balances.map(b => ({
            itemId: b.itemId.toString(),
            itemCode: b.item.itemCode,
            itemName: b.item.itemName,
            itemType: b.item.itemType,
            category: b.item.category?.categoryName,
            unit: b.item.unit?.symbol || b.item.unit?.unitName,
            qtyOnHand: Number(b.qtyOnHand),
            lastUpdated: b.updatedAt,
        }));
    }
    async getExpenseReport(fromDate, toDate) {
        const dateFilter = this.getDateFilter(fromDate, toDate, 'expenseDate');
        const expenses = await this.prisma.expense.findMany({
            where: dateFilter ? { expenseDate: dateFilter } : {},
            include: { supplier: true },
            orderBy: { expenseDate: 'desc' },
        });
        const byCategory = {};
        let totalExpenses = 0;
        for (const exp of expenses) {
            byCategory[exp.category] = (byCategory[exp.category] || 0) + Number(exp.amount);
            totalExpenses += Number(exp.amount);
        }
        return {
            period: { fromDate, toDate },
            summary: { totalExpenses, expenseCount: expenses.length },
            byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
            expenses: expenses.map(e => ({
                expenseId: e.expenseId.toString(),
                expenseNo: e.expenseNo,
                date: e.expenseDate,
                category: e.category,
                description: e.description,
                amount: Number(e.amount),
                method: e.method,
            })),
        };
    }
    async getProfitReport(fromDate, toDate) {
        const dateFilter = this.getDateFilter(fromDate, toDate, 'txDate');
        const income = await this.prisma.cashTransaction.aggregate({
            where: { txType: client_1.TxType.INCOME, ...(dateFilter ? { txDate: dateFilter } : {}) },
            _sum: { amountIn: true },
        });
        const expenses = await this.prisma.cashTransaction.aggregate({
            where: { txType: client_1.TxType.EXPENSE, ...(dateFilter ? { txDate: dateFilter } : {}) },
            _sum: { amountOut: true },
        });
        const totalIncome = Number(income._sum.amountIn) || 0;
        const totalExpenses = Number(expenses._sum.amountOut) || 0;
        const profit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
        return {
            period: { fromDate, toDate },
            totalIncome,
            totalExpenses,
            profit,
            profitMargin: Math.round(profitMargin * 100) / 100,
        };
    }
    async getAttendanceReport(fromDate, toDate) {
        const dateFilter = this.getDateFilter(fromDate, toDate, 'workDate');
        const attendance = await this.prisma.attendanceDaily.findMany({
            where: dateFilter ? { workDate: dateFilter } : {},
            include: { user: { select: { userId: true, userCode: true, fullName: true } } },
            orderBy: [{ workDate: 'desc' }, { user: { fullName: 'asc' } }],
        });
        const byEmployee = {};
        for (const a of attendance) {
            const key = a.user.userId.toString();
            if (!byEmployee[key]) {
                byEmployee[key] = { totalDays: 0, totalHours: 0, totalOtHours: 0 };
            }
            byEmployee[key].totalDays += 1;
            byEmployee[key].totalHours += Number(a.systemHours);
            byEmployee[key].totalOtHours += Number(a.manualOtHours || a.systemOtHours);
        }
        const employees = await this.prisma.user.findMany({
            where: { userId: { in: Object.keys(byEmployee).map(k => BigInt(k)) } },
            select: { userId: true, userCode: true, fullName: true },
        });
        const employeeMap = new Map(employees.map(e => [e.userId.toString(), e]));
        return {
            period: { fromDate, toDate },
            summary: {
                totalRecords: attendance.length,
                totalRegularHours: Object.values(byEmployee).reduce((sum, e) => sum + Math.min(e.totalHours, e.totalDays * 8), 0),
                totalOtHours: Object.values(byEmployee).reduce((sum, e) => sum + e.totalOtHours, 0),
            },
            byEmployee: Object.entries(byEmployee).map(([userId, data]) => ({
                userId,
                userCode: employeeMap.get(userId)?.userCode,
                fullName: employeeMap.get(userId)?.fullName,
                ...data,
            })),
        };
    }
    async getDashboardSummary() {
        const now = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const startOfMonth = now.startOf('month').toJSDate();
        const endOfMonth = now.endOf('month').toJSDate();
        const [salesThisMonth, purchasesThisMonth, expensesThisMonth, pendingOrders, lowStockItems, todayAttendance,] = await Promise.all([
            this.prisma.invoice.aggregate({
                where: { invoiceType: client_1.InvoiceType.SALES, invoiceDate: { gte: startOfMonth, lte: endOfMonth } },
                _sum: { total: true },
                _count: true,
            }),
            this.prisma.invoice.aggregate({
                where: { invoiceType: client_1.InvoiceType.PURCHASE, invoiceDate: { gte: startOfMonth, lte: endOfMonth } },
                _sum: { total: true },
                _count: true,
            }),
            this.prisma.expense.aggregate({
                where: { expenseDate: { gte: startOfMonth, lte: endOfMonth } },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.salesOrder.count({ where: { status: client_1.DocStatus.DRAFT } }),
            this.prisma.stockBalance.count({ where: { qtyOnHand: { lt: 10 } } }),
            this.prisma.attendanceDaily.count({ where: { workDate: now.startOf('day').toJSDate() } }),
        ]);
        return {
            period: { month: now.toFormat('MMMM yyyy') },
            sales: {
                total: Number(salesThisMonth._sum.total) || 0,
                count: salesThisMonth._count,
            },
            purchases: {
                total: Number(purchasesThisMonth._sum.total) || 0,
                count: purchasesThisMonth._count,
            },
            expenses: {
                total: Number(expensesThisMonth._sum.amount) || 0,
                count: expensesThisMonth._count,
            },
            pendingOrders,
            lowStockItems,
            todayAttendance,
            profit: (Number(salesThisMonth._sum.total) || 0) - (Number(purchasesThisMonth._sum.total) || 0) - (Number(expensesThisMonth._sum.amount) || 0),
        };
    }
    getDateFilter(fromDate, toDate, field = 'date') {
        if (!fromDate && !toDate)
            return null;
        const filter = {};
        if (fromDate)
            filter.gte = new Date(fromDate);
        if (toDate)
            filter.lte = new Date(toDate);
        return filter;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map