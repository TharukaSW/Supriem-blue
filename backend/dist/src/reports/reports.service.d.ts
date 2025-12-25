import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSalesReport(fromDate?: string, toDate?: string): Promise<{
        period: {
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        summary: {
            totalSales: number;
            totalPaid: number;
            outstanding: number;
            invoiceCount: number;
        };
        invoices: {
            invoiceId: string;
            invoiceNo: string;
            date: Date;
            customer: string | undefined;
            total: number;
            status: import(".prisma/client").$Enums.DocStatus;
        }[];
    }>;
    getPurchasesReport(fromDate?: string, toDate?: string): Promise<{
        period: {
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        summary: {
            totalPurchases: number;
            invoiceCount: number;
        };
        invoices: {
            invoiceId: string;
            invoiceNo: string;
            date: Date;
            supplier: string | undefined;
            total: number;
            matchStatus: import(".prisma/client").$Enums.MatchStatus;
        }[];
    }>;
    getProductionReport(fromDate?: string, toDate?: string): Promise<{
        period: {
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        summary: {
            totalProduced: number;
            totalScrap: number;
            productionDays: number;
        };
        byProduct: {
            item: string;
            qty: number;
        }[];
        daily: {
            date: Date;
            product: string;
            unit: string;
            produced: number;
            scrap: number;
            notes: string | null;
        }[];
    }>;
    getStockReport(): Promise<{
        itemId: string;
        itemCode: string;
        itemName: string;
        itemType: import(".prisma/client").$Enums.ItemType;
        category: string | undefined;
        unit: string | undefined;
        qtyOnHand: number;
        lastUpdated: Date;
    }[]>;
    getExpenseReport(fromDate?: string, toDate?: string): Promise<{
        period: {
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        summary: {
            totalExpenses: number;
            expenseCount: number;
        };
        byCategory: {
            category: string;
            amount: number;
        }[];
        expenses: {
            expenseId: string;
            expenseNo: string;
            date: Date;
            category: string;
            description: string | null;
            amount: number;
            method: import(".prisma/client").$Enums.PayMethod;
        }[];
    }>;
    getProfitReport(fromDate?: string, toDate?: string): Promise<{
        period: {
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        totalIncome: number;
        totalExpenses: number;
        profit: number;
        profitMargin: number;
    }>;
    getAttendanceReport(fromDate?: string, toDate?: string): Promise<{
        period: {
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        summary: {
            totalRecords: number;
            totalRegularHours: number;
            totalOtHours: number;
        };
        byEmployee: {
            totalDays: number;
            totalHours: number;
            totalOtHours: number;
            userId: string;
            userCode: string | undefined;
            fullName: string | undefined;
        }[];
    }>;
    getDashboardSummary(): Promise<{
        period: {
            month: string;
        };
        sales: {
            total: number;
            count: number;
        };
        purchases: {
            total: number;
            count: number;
        };
        expenses: {
            total: number;
            count: number;
        };
        pendingOrders: number;
        lowStockItems: number;
        todayAttendance: number;
        profit: number;
    }>;
    private getDateFilter;
}
