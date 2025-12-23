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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const luxon_1 = require("luxon");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [{ invoiceNo: { contains: query.search, mode: 'insensitive' } }];
        }
        if (query.invoiceType)
            where.invoiceType = query.invoiceType;
        if (query.status)
            where.status = query.status;
        if (query.matchStatus)
            where.matchStatus = query.matchStatus;
        if (query.customerId)
            where.customerId = BigInt(query.customerId);
        if (query.supplierId)
            where.supplierId = BigInt(query.supplierId);
        if (query.fromDate)
            where.invoiceDate = { ...where.invoiceDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.invoiceDate = { ...where.invoiceDate, lte: new Date(query.toDate) };
        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where, skip, take: limit,
                include: { customer: true, supplier: true, creator: true, payments: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return {
            data: invoices.map(i => this.transform(i)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { invoiceId: id },
            include: {
                customer: true,
                supplier: true,
                salesOrder: true,
                purchaseOrder: true,
                lines: { include: { item: { include: { unit: true } } } },
                payments: true,
                creator: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return this.transform(invoice);
    }
    async updateMatch(id, dto, userId) {
        const invoice = await this.prisma.invoice.findUnique({ where: { invoiceId: id } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        let matchStatus = client_1.MatchStatus.PENDING;
        let mismatchAmount = 0;
        const systemTotal = Number(invoice.total);
        if (Math.abs(dto.vendorInvoiceTotal - systemTotal) < 0.01) {
            matchStatus = client_1.MatchStatus.MATCHED;
        }
        else {
            matchStatus = client_1.MatchStatus.MISMATCHED;
            mismatchAmount = dto.vendorInvoiceTotal - systemTotal;
        }
        const updated = await this.prisma.invoice.update({
            where: { invoiceId: id },
            data: {
                vendorInvoiceNo: dto.vendorInvoiceNo,
                vendorInvoiceDate: dto.vendorInvoiceDate ? new Date(dto.vendorInvoiceDate) : null,
                vendorInvoiceTotal: dto.vendorInvoiceTotal,
                matchStatus,
                mismatchAmount,
                matchCheckedBy: BigInt(userId),
                matchCheckedAt: new Date(),
            },
            include: { customer: true, supplier: true, lines: true },
        });
        return this.transform(updated);
    }
    async generatePdf(id, template = 'DOT_MATRIX') {
        const invoice = await this.findOne(id);
        const PdfPrinter = require('pdfmake');
        const fonts = {
            Courier: {
                normal: 'Courier',
                bold: 'Courier-Bold',
            },
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
            },
        };
        const printer = new PdfPrinter(fonts);
        let docDefinition;
        if (template === 'DOT_MATRIX') {
            docDefinition = this.getDotMatrixTemplate(invoice);
        }
        else {
            docDefinition = this.getA4Template(invoice);
        }
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        return new Promise((resolve, reject) => {
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
        });
    }
    getDotMatrixTemplate(invoice) {
        const now = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const lines = invoice.lines || [];
        const tableBody = [
            ['Item', 'Qty', 'Price', 'Total'],
            ...lines.map((l) => [
                l.description || l.item?.itemName || '-',
                Number(l.qty).toFixed(2),
                Number(l.unitPrice).toFixed(2),
                Number(l.lineTotal).toFixed(2),
            ]),
        ];
        return {
            defaultStyle: { font: 'Courier', fontSize: 10 },
            pageSize: { width: 595, height: 842 },
            pageMargins: [40, 40, 40, 40],
            content: [
                { text: 'SUPREME BLUE', style: 'header', alignment: 'center' },
                { text: 'Water Bottling Factory', alignment: 'center', margin: [0, 0, 0, 10] },
                { text: '----------------------------------------', alignment: 'center' },
                { text: `Invoice: ${invoice.invoiceNo}`, margin: [0, 10, 0, 0] },
                { text: `Date: ${luxon_1.DateTime.fromJSDate(new Date(invoice.invoiceDate)).toFormat('yyyy-MM-dd')}` },
                { text: `Type: ${invoice.invoiceType}` },
                invoice.customer ? { text: `Customer: ${invoice.customer.customerName}` } : {},
                invoice.supplier ? { text: `Supplier: ${invoice.supplier.supplierName}` } : {},
                { text: '----------------------------------------', margin: [0, 10, 0, 10] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 50, 60, 70],
                        body: tableBody,
                    },
                    layout: 'noBorders',
                },
                { text: '----------------------------------------', margin: [0, 10, 0, 10] },
                { text: `Subtotal: LKR ${Number(invoice.subtotal).toFixed(2)}`, alignment: 'right' },
                { text: `Discount: LKR ${Number(invoice.discount).toFixed(2)}`, alignment: 'right' },
                { text: `Tax: LKR ${Number(invoice.tax).toFixed(2)}`, alignment: 'right' },
                { text: `TOTAL: LKR ${Number(invoice.total).toFixed(2)}`, alignment: 'right', bold: true },
                { text: '----------------------------------------', margin: [0, 10, 0, 10] },
                { text: 'Thank you for your business!', alignment: 'center' },
                { text: `Printed: ${now.toFormat('yyyy-MM-dd HH:mm')}`, alignment: 'center', fontSize: 8 },
            ],
            styles: {
                header: { fontSize: 14, bold: true },
            },
        };
    }
    getA4Template(invoice) {
        const now = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const lines = invoice.lines || [];
        const tableBody = [
            [
                { text: '#', bold: true },
                { text: 'Item', bold: true },
                { text: 'Qty', bold: true, alignment: 'right' },
                { text: 'Unit Price', bold: true, alignment: 'right' },
                { text: 'Total', bold: true, alignment: 'right' },
            ],
            ...lines.map((l, i) => [
                { text: (i + 1).toString() },
                { text: l.description || l.item?.itemName || '-' },
                { text: Number(l.qty).toFixed(2), alignment: 'right' },
                { text: `LKR ${Number(l.unitPrice).toFixed(2)}`, alignment: 'right' },
                { text: `LKR ${Number(l.lineTotal).toFixed(2)}`, alignment: 'right' },
            ]),
        ];
        return {
            defaultStyle: { font: 'Roboto', fontSize: 10 },
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: [
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'SUPREME BLUE', style: 'companyName' },
                                { text: 'Water Bottling Factory', style: 'companySubtitle' },
                                { text: 'Colombo, Sri Lanka', fontSize: 9, color: '#666' },
                            ],
                        },
                        {
                            width: 'auto',
                            stack: [
                                { text: 'INVOICE', style: 'invoiceTitle' },
                                { text: `No: ${invoice.invoiceNo}`, alignment: 'right' },
                                { text: `Date: ${luxon_1.DateTime.fromJSDate(new Date(invoice.invoiceDate)).toFormat('yyyy-MM-dd')}`, alignment: 'right' },
                            ],
                        },
                    ],
                },
                { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: '#0066cc' }] },
                { text: '', margin: [0, 20] },
                {
                    columns: [
                        {
                            width: '50%',
                            stack: [
                                { text: invoice.invoiceType === 'SALES' ? 'Bill To:' : 'From:', bold: true },
                                { text: invoice.customer?.customerName || invoice.supplier?.supplierName || '-' },
                                { text: invoice.customer?.address || invoice.supplier?.address || '', fontSize: 9, color: '#666' },
                            ],
                        },
                        {
                            width: '50%',
                            stack: [
                                { text: 'Invoice Details:', bold: true },
                                { text: `Type: ${invoice.invoiceType}` },
                                { text: `Status: ${invoice.status}` },
                                invoice.dueDate ? { text: `Due: ${luxon_1.DateTime.fromJSDate(new Date(invoice.dueDate)).toFormat('yyyy-MM-dd')}` } : {},
                            ],
                        },
                    ],
                },
                { text: '', margin: [0, 20] },
                {
                    table: {
                        headerRows: 1,
                        widths: [30, '*', 60, 80, 80],
                        body: tableBody,
                    },
                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0,
                        hLineColor: () => '#ddd',
                        fillColor: (rowIndex) => (rowIndex === 0 ? '#f5f5f5' : null),
                    },
                },
                { text: '', margin: [0, 20] },
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 200,
                            table: {
                                widths: ['*', 'auto'],
                                body: [
                                    ['Subtotal:', { text: `LKR ${Number(invoice.subtotal).toFixed(2)}`, alignment: 'right' }],
                                    ['Discount:', { text: `LKR ${Number(invoice.discount).toFixed(2)}`, alignment: 'right' }],
                                    ['Tax:', { text: `LKR ${Number(invoice.tax).toFixed(2)}`, alignment: 'right' }],
                                    [{ text: 'TOTAL:', bold: true }, { text: `LKR ${Number(invoice.total).toFixed(2)}`, alignment: 'right', bold: true }],
                                ],
                            },
                            layout: 'noBorders',
                        },
                    ],
                },
                { text: '', margin: [0, 40] },
                { text: 'Thank you for your business!', alignment: 'center', italics: true, color: '#666' },
            ],
            styles: {
                companyName: { fontSize: 20, bold: true, color: '#0066cc' },
                companySubtitle: { fontSize: 12, color: '#666' },
                invoiceTitle: { fontSize: 24, bold: true, alignment: 'right', color: '#0066cc' },
            },
            footer: (currentPage, pageCount) => ({
                text: `Page ${currentPage} of ${pageCount} | Generated: ${now.toFormat('yyyy-MM-dd HH:mm')}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 20],
            }),
        };
    }
    transform(invoice) {
        return {
            ...invoice,
            invoiceId: invoice.invoiceId.toString(),
            customerId: invoice.customerId?.toString(),
            supplierId: invoice.supplierId?.toString(),
            salesOrderId: invoice.salesOrderId?.toString(),
            purchaseId: invoice.purchaseId?.toString(),
            createdBy: invoice.createdBy?.toString(),
            matchCheckedBy: invoice.matchCheckedBy?.toString(),
            customer: invoice.customer ? { ...invoice.customer, customerId: invoice.customer.customerId.toString() } : undefined,
            supplier: invoice.supplier ? { ...invoice.supplier, supplierId: invoice.supplier.supplierId.toString() } : undefined,
            lines: invoice.lines?.map((l) => ({
                ...l,
                invoiceLineId: l.invoiceLineId.toString(),
                invoiceId: l.invoiceId.toString(),
                itemId: l.itemId?.toString(),
                item: l.item ? { ...l.item, itemId: l.item.itemId.toString() } : undefined,
            })),
            payments: invoice.payments?.map((p) => ({
                ...p,
                paymentId: p.paymentId.toString(),
                invoiceId: p.invoiceId.toString(),
            })),
        };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map