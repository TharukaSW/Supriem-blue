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
exports.PurchasingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const masters_service_1 = require("../masters/masters.service");
const client_1 = require("@prisma/client");
const luxon_1 = require("luxon");
let PurchasingService = class PurchasingService {
    prisma;
    mastersService;
    constructor(prisma, mastersService) {
        this.prisma = prisma;
        this.mastersService = mastersService;
    }
    async create(dto, userId) {
        const purchaseNo = await this.generatePurchaseNo();
        const linesData = await Promise.all(dto.lines.map(async (line) => {
            let unitPrice = line.unitPrice;
            if (!unitPrice) {
                const price = await this.mastersService.getLatestSupplierPrice(BigInt(dto.supplierId), BigInt(line.itemId));
                unitPrice = price ? Number(price.unitPrice) : 0;
            }
            return {
                itemId: BigInt(line.itemId),
                qty: line.qty,
                unitPrice,
                lineTotal: line.qty * unitPrice,
            };
        }));
        const subtotal = linesData.reduce((sum, l) => sum + l.lineTotal, 0);
        const discount = dto.discount || 0;
        const tax = dto.tax || 0;
        const total = subtotal - discount + tax;
        const purchase = await this.prisma.purchaseOrder.create({
            data: {
                purchaseNo,
                supplierId: BigInt(dto.supplierId),
                purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
                notes: dto.notes,
                subtotal,
                discount,
                tax,
                total,
                createdBy: BigInt(userId),
                lines: {
                    create: linesData,
                },
            },
            include: {
                supplier: true,
                lines: { include: { item: true } },
                creator: true,
            },
        });
        return this.transform(purchase);
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { purchaseNo: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.status)
            where.status = query.status;
        if (query.supplierId)
            where.supplierId = BigInt(query.supplierId);
        if (query.fromDate)
            where.purchaseDate = { ...where.purchaseDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.purchaseDate = { ...where.purchaseDate, lte: new Date(query.toDate) };
        const [orders, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where,
                skip,
                take: limit,
                include: { supplier: true, lines: { include: { item: true } }, creator: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);
        return {
            data: orders.map(o => this.transform(o)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const order = await this.prisma.purchaseOrder.findUnique({
            where: { purchaseId: id },
            include: {
                supplier: true,
                lines: { include: { item: { include: { unit: true } } } },
                creator: true,
                invoices: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Purchase order not found');
        return this.transform(order);
    }
    async update(id, dto) {
        const order = await this.prisma.purchaseOrder.findUnique({ where: { purchaseId: id } });
        if (!order)
            throw new common_1.NotFoundException('Purchase order not found');
        if (order.status !== client_1.DocStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot update confirmed order');
        }
        const updated = await this.prisma.purchaseOrder.update({
            where: { purchaseId: id },
            data: {
                notes: dto.notes,
                discount: dto.discount,
                tax: dto.tax,
                total: Number(order.subtotal) - (dto.discount || 0) + (dto.tax || 0),
            },
            include: { supplier: true, lines: { include: { item: true } }, creator: true },
        });
        return this.transform(updated);
    }
    async confirm(id, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.purchaseOrder.findUnique({
                where: { purchaseId: id },
                include: { lines: { include: { item: true } }, supplier: true },
            });
            if (!order)
                throw new common_1.NotFoundException('Purchase order not found');
            if (order.status !== client_1.DocStatus.DRAFT) {
                throw new common_1.BadRequestException('Order already confirmed');
            }
            await tx.purchaseOrder.update({
                where: { purchaseId: id },
                data: { status: client_1.DocStatus.CONFIRMED },
            });
            const invoiceNo = await this.generateInvoiceNo(tx);
            let matchStatus = client_1.MatchStatus.PENDING;
            let mismatchAmount = 0;
            if (dto.vendorInvoiceTotal !== undefined) {
                const systemTotal = Number(order.total);
                if (Math.abs(dto.vendorInvoiceTotal - systemTotal) < 0.01) {
                    matchStatus = client_1.MatchStatus.MATCHED;
                }
                else {
                    matchStatus = client_1.MatchStatus.MISMATCHED;
                    mismatchAmount = dto.vendorInvoiceTotal - systemTotal;
                }
            }
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNo,
                    invoiceType: client_1.InvoiceType.PURCHASE,
                    invoiceDate: new Date(),
                    supplierId: order.supplierId,
                    purchaseId: order.purchaseId,
                    subtotal: order.subtotal,
                    discount: order.discount,
                    tax: order.tax,
                    total: order.total,
                    vendorInvoiceNo: dto.vendorInvoiceNo,
                    vendorInvoiceDate: dto.vendorInvoiceDate ? new Date(dto.vendorInvoiceDate) : null,
                    vendorInvoiceTotal: dto.vendorInvoiceTotal,
                    matchStatus,
                    mismatchAmount,
                    matchCheckedBy: BigInt(userId),
                    matchCheckedAt: new Date(),
                    createdBy: BigInt(userId),
                    lines: {
                        create: order.lines.map(l => ({
                            itemId: l.itemId,
                            description: l.item.itemName,
                            qty: l.qty,
                            unitPrice: l.unitPrice,
                            lineTotal: l.lineTotal,
                        })),
                    },
                },
            });
            for (const line of order.lines) {
                await tx.stockMovement.create({
                    data: {
                        movementType: client_1.MovementType.PURCHASE_RECEIPT,
                        itemId: line.itemId,
                        qtyIn: line.qty,
                        qtyOut: 0,
                        unitCost: line.unitPrice,
                        refTable: 'purchase_orders',
                        refId: order.purchaseId,
                        createdBy: BigInt(userId),
                    },
                });
                await tx.stockBalance.upsert({
                    where: { itemId: line.itemId },
                    update: {
                        qtyOnHand: { increment: line.qty },
                    },
                    create: {
                        itemId: line.itemId,
                        qtyOnHand: line.qty,
                    },
                });
            }
            return { message: 'Purchase order confirmed', invoiceId: invoice.invoiceId.toString() };
        });
    }
    async cancel(id) {
        const order = await this.prisma.purchaseOrder.findUnique({ where: { purchaseId: id } });
        if (!order)
            throw new common_1.NotFoundException('Purchase order not found');
        if (order.status !== client_1.DocStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot cancel confirmed order');
        }
        await this.prisma.purchaseOrder.update({
            where: { purchaseId: id },
            data: { status: client_1.DocStatus.CANCELLED },
        });
        return { message: 'Purchase order cancelled' };
    }
    async generatePurchaseNo() {
        const today = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const prefix = `PO${today.toFormat('yyyyMMdd')}`;
        const lastOrder = await this.prisma.purchaseOrder.findFirst({
            where: { purchaseNo: { startsWith: prefix } },
            orderBy: { purchaseNo: 'desc' },
        });
        let seq = 1;
        if (lastOrder) {
            seq = parseInt(lastOrder.purchaseNo.slice(-4), 10) + 1;
        }
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }
    async generateInvoiceNo(tx) {
        const today = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const prefix = `INV${today.toFormat('yyyyMMdd')}`;
        const lastInvoice = await tx.invoice.findFirst({
            where: { invoiceNo: { startsWith: prefix } },
            orderBy: { invoiceNo: 'desc' },
        });
        let seq = 1;
        if (lastInvoice) {
            seq = parseInt(lastInvoice.invoiceNo.slice(-4), 10) + 1;
        }
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }
    transform(order) {
        return {
            ...order,
            purchaseId: order.purchaseId.toString(),
            supplierId: order.supplierId.toString(),
            createdBy: order.createdBy?.toString(),
            supplier: order.supplier ? { ...order.supplier, supplierId: order.supplier.supplierId.toString() } : undefined,
            lines: order.lines?.map((l) => ({
                ...l,
                purchaseLineId: l.purchaseLineId.toString(),
                purchaseId: l.purchaseId.toString(),
                itemId: l.itemId.toString(),
                item: l.item ? { ...l.item, itemId: l.item.itemId.toString() } : undefined,
            })),
            invoices: order.invoices?.map((i) => ({
                ...i,
                invoiceId: i.invoiceId.toString(),
            })),
        };
    }
};
exports.PurchasingService = PurchasingService;
exports.PurchasingService = PurchasingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        masters_service_1.MastersService])
], PurchasingService);
//# sourceMappingURL=purchasing.service.js.map