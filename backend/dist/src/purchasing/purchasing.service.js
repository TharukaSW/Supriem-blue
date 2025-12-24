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
const client_1 = require("@prisma/client");
let PurchasingService = class PurchasingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const purchaseNo = await this.generatePurchaseNo();
        const itemIds = dto.lines.map((l) => BigInt(l.itemId));
        const items = await this.prisma.item.findMany({
            where: { itemId: { in: itemIds } },
        });
        const nonRawItems = items.filter((i) => i.itemType !== client_1.ItemType.RAW);
        if (nonRawItems.length > 0) {
            throw new common_1.BadRequestException(`Items must be RAW type: ${nonRawItems.map((i) => i.itemName).join(', ')}`);
        }
        const user = await this.prisma.user.findUnique({
            where: { userId },
            include: { role: true },
        });
        const linesData = await Promise.all(dto.lines.map(async (line) => {
            const lineTotal = line.qty * (line.unitPrice || 0);
            let priceSource = 'SUPPLIER_PRICE';
            let overrideReason = null;
            let overriddenBy = null;
            const supplierPrice = await this.getLatestSupplierPrice(BigInt(dto.supplierId), BigInt(line.itemId));
            if (supplierPrice &&
                Math.abs(Number(supplierPrice.unitPrice) - (line.unitPrice || 0)) > 0.01) {
                if (user?.role?.roleName !== client_1.RoleName.ADMIN &&
                    user?.role?.roleName !== client_1.RoleName.MANAGER) {
                    throw new common_1.ForbiddenException('Only ADMIN or MANAGER can override prices');
                }
                priceSource = 'MANUAL_OVERRIDE';
                overrideReason = line.overrideReason || 'Manual price adjustment';
                overriddenBy = userId;
            }
            return {
                item: { connect: { itemId: BigInt(line.itemId) } },
                qty: line.qty,
                unitPrice: line.unitPrice || 0,
                lineTotal,
                priceSource,
                overrideReason,
                overriddenBy,
            };
        }));
        const subtotal = linesData.reduce((sum, l) => sum + Number(l.lineTotal), 0);
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
                status: client_1.DocStatus.DRAFT,
                createdBy: userId,
                lines: {
                    create: linesData,
                },
            },
            include: {
                supplier: true,
                lines: {
                    include: {
                        item: true,
                    },
                },
            },
        });
        return purchase;
    }
    async findAll(params) {
        const { search, status, supplierId, from, to, page = 1, limit = 20 } = params;
        const where = {};
        if (search) {
            where.OR = [
                { purchaseNo: { contains: search, mode: 'insensitive' } },
                { supplier: { supplierName: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (supplierId) {
            where.supplierId = supplierId;
        }
        if (from || to) {
            where.purchaseDate = {};
            if (from)
                where.purchaseDate.gte = from;
            if (to)
                where.purchaseDate.lte = to;
        }
        const [data, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where,
                include: {
                    supplier: true,
                    lines: {
                        include: {
                            item: true,
                        },
                    },
                },
                orderBy: { purchaseDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const purchase = await this.prisma.purchaseOrder.findUnique({
            where: { purchaseId: id },
            include: {
                supplier: true,
                lines: {
                    include: {
                        item: true,
                    },
                },
                invoices: true,
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException(`Purchase order #${id} not found`);
        }
        return purchase;
    }
    async update(id, dto, userId) {
        const purchase = await this.findOne(id);
        if (purchase.status !== client_1.DocStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only update DRAFT purchase orders');
        }
        let linesData;
        let subtotal;
        let total;
        if (dto.lines && dto.lines.length > 0) {
            const itemIds = dto.lines.map((l) => BigInt(l.itemId));
            const items = await this.prisma.item.findMany({
                where: { itemId: { in: itemIds } },
            });
            const nonRawItems = items.filter((i) => i.itemType !== client_1.ItemType.RAW);
            if (nonRawItems.length > 0) {
                throw new common_1.BadRequestException(`Items must be RAW type: ${nonRawItems.map((i) => i.itemName).join(', ')}`);
            }
            const user = await this.prisma.user.findUnique({
                where: { userId },
                include: { role: true },
            });
            linesData = await Promise.all(dto.lines.map(async (line) => {
                const lineTotal = line.qty * (line.unitPrice || 0);
                let priceSource = 'SUPPLIER_PRICE';
                let overrideReason = null;
                let overriddenBy = null;
                const supplierPrice = await this.getLatestSupplierPrice(purchase.supplierId, BigInt(line.itemId));
                if (supplierPrice &&
                    Math.abs(Number(supplierPrice.unitPrice) - (line.unitPrice || 0)) > 0.01) {
                    if (user?.role?.roleName !== client_1.RoleName.ADMIN &&
                        user?.role?.roleName !== client_1.RoleName.MANAGER) {
                        throw new common_1.ForbiddenException('Only ADMIN or MANAGER can override prices');
                    }
                    priceSource = 'MANUAL_OVERRIDE';
                    overrideReason = line.overrideReason || 'Manual price adjustment';
                    overriddenBy = userId;
                }
                return {
                    item: { connect: { itemId: BigInt(line.itemId) } },
                    qty: line.qty,
                    unitPrice: line.unitPrice || 0,
                    lineTotal,
                    priceSource,
                    overrideReason,
                    overriddenBy,
                };
            }));
            subtotal = linesData.reduce((sum, l) => sum + Number(l.lineTotal), 0);
            const discount = dto.discount ?? purchase.discount;
            const tax = dto.tax ?? purchase.tax;
            total = subtotal - Number(discount) + Number(tax);
        }
        const updated = await this.prisma.purchaseOrder.update({
            where: { purchaseId: id },
            data: {
                supplierId: dto.supplierId ? BigInt(dto.supplierId) : undefined,
                purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
                notes: dto.notes,
                discount: dto.discount,
                tax: dto.tax,
                subtotal: subtotal,
                total: total,
                updatedBy: userId,
                lines: linesData
                    ? {
                        deleteMany: {},
                        create: linesData,
                    }
                    : undefined,
            },
            include: {
                supplier: true,
                lines: {
                    include: {
                        item: true,
                    },
                },
            },
        });
        return updated;
    }
    async confirm(id, userId) {
        const purchase = await this.findOne(id);
        if (purchase.status !== client_1.DocStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only confirm DRAFT purchase orders');
        }
        if (purchase.lines.length === 0) {
            throw new common_1.BadRequestException('Cannot confirm purchase order without lines');
        }
        const updated = await this.prisma.purchaseOrder.update({
            where: { purchaseId: id },
            data: {
                status: client_1.DocStatus.CONFIRMED,
                confirmedAt: new Date(),
                confirmedBy: userId,
                updatedBy: userId,
            },
            include: {
                supplier: true,
                lines: {
                    include: {
                        item: true,
                    },
                },
            },
        });
        return updated;
    }
    async receive(id, userId) {
        const purchase = await this.findOne(id);
        if (purchase.status !== client_1.DocStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Can only receive CONFIRMED purchase orders');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const invoiceNo = await this.generateInvoiceNo(tx);
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNo,
                    invoiceType: client_1.InvoiceType.PURCHASE,
                    invoiceDate: new Date(),
                    supplierId: purchase.supplierId,
                    purchaseId: purchase.purchaseId,
                    subtotal: purchase.subtotal,
                    discount: purchase.discount,
                    tax: purchase.tax,
                    total: purchase.total,
                    status: client_1.DocStatus.ISSUED,
                    printTemplate: 'DOT_MATRIX',
                    matchStatus: client_1.MatchStatus.PENDING,
                    createdBy: userId,
                    lines: {
                        create: purchase.lines.map((line) => ({
                            itemId: line.itemId,
                            description: line.item.itemName,
                            qty: line.qty,
                            unitPrice: line.unitPrice,
                            lineTotal: line.lineTotal,
                        })),
                    },
                },
            });
            const stockMovements = await Promise.all(purchase.lines.map(async (line) => {
                const movement = await tx.stockMovement.create({
                    data: {
                        movementType: client_1.MovementType.PURCHASE_RECEIPT,
                        movementDate: new Date(),
                        itemId: line.itemId,
                        qtyIn: line.qty,
                        qtyOut: 0,
                        unitCost: line.unitPrice,
                        refTable: 'purchase_orders',
                        refId: purchase.purchaseId,
                        purchaseId: purchase.purchaseId,
                        createdBy: userId,
                    },
                });
                const existing = await tx.stockBalance.findUnique({
                    where: { itemId: line.itemId },
                });
                if (existing) {
                    await tx.stockBalance.update({
                        where: { itemId: line.itemId },
                        data: {
                            qtyOnHand: Number(existing.qtyOnHand) + Number(line.qty),
                        },
                    });
                }
                else {
                    await tx.stockBalance.create({
                        data: {
                            itemId: line.itemId,
                            qtyOnHand: line.qty,
                        },
                    });
                }
                return movement;
            }));
            const updatedPO = await tx.purchaseOrder.update({
                where: { purchaseId: id },
                data: {
                    status: client_1.DocStatus.RECEIVED,
                    receivedAt: new Date(),
                    receivedBy: userId,
                },
                include: {
                    supplier: true,
                    lines: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
            return {
                purchaseOrder: updatedPO,
                invoice,
                stockMovements,
            };
        });
        return result;
    }
    async cancel(id, dto, userId) {
        const purchase = await this.findOne(id);
        if (purchase.status === client_1.DocStatus.CANCELLED) {
            throw new common_1.BadRequestException('Purchase order is already cancelled');
        }
        if (purchase.status === client_1.DocStatus.RECEIVED) {
            throw new common_1.BadRequestException('Cannot cancel received purchase orders');
        }
        const updated = await this.prisma.purchaseOrder.update({
            where: { purchaseId: id },
            data: {
                status: client_1.DocStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelledBy: userId,
                cancelReason: dto.cancelReason,
            },
            include: {
                supplier: true,
                lines: {
                    include: {
                        item: true,
                    },
                },
            },
        });
        return updated;
    }
    async findAllInvoices(params) {
        const { search, matchStatus, status, from, to, page = 1, limit = 20 } = params;
        const where = {
            invoiceType: client_1.InvoiceType.PURCHASE,
        };
        if (search) {
            where.OR = [
                { invoiceNo: { contains: search, mode: 'insensitive' } },
                { vendorInvoiceNo: { contains: search, mode: 'insensitive' } },
                { supplier: { supplierName: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (matchStatus) {
            where.matchStatus = matchStatus;
        }
        if (status) {
            where.status = status;
        }
        if (from || to) {
            where.invoiceDate = {};
            if (from)
                where.invoiceDate.gte = from;
            if (to)
                where.invoiceDate.lte = to;
        }
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: {
                    supplier: true,
                    purchaseOrder: true,
                    lines: {
                        include: {
                            item: true,
                        },
                    },
                    payments: true,
                },
                orderBy: { invoiceDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOneInvoice(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { invoiceId: id },
            include: {
                supplier: true,
                purchaseOrder: {
                    include: {
                        lines: {
                            include: {
                                item: true,
                            },
                        },
                    },
                },
                lines: {
                    include: {
                        item: true,
                    },
                },
                payments: true,
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice #${id} not found`);
        }
        if (invoice.invoiceType !== client_1.InvoiceType.PURCHASE) {
            throw new common_1.BadRequestException('Not a purchase invoice');
        }
        return invoice;
    }
    async matchInvoice(id, dto, userId) {
        const invoice = await this.findOneInvoice(id);
        const systemTotal = Number(invoice.total);
        const vendorTotal = dto.vendorInvoiceTotal;
        const mismatchAmount = Math.abs(systemTotal - vendorTotal);
        const matchStatus = mismatchAmount < 0.01 ? client_1.MatchStatus.MATCHED : client_1.MatchStatus.MISMATCHED;
        const updated = await this.prisma.invoice.update({
            where: { invoiceId: id },
            data: {
                vendorInvoiceNo: dto.vendorInvoiceNo,
                vendorInvoiceTotal: vendorTotal,
                vendorInvoiceDate: dto.vendorInvoiceDate
                    ? new Date(dto.vendorInvoiceDate)
                    : null,
                matchStatus,
                mismatchAmount,
                matchCheckedBy: userId,
                matchCheckedAt: new Date(),
            },
            include: {
                supplier: true,
                lines: {
                    include: {
                        item: true,
                    },
                },
                payments: true,
            },
        });
        return updated;
    }
    async createPayment(invoiceId, dto, userId) {
        const invoice = await this.findOneInvoice(invoiceId);
        if (invoice.status === client_1.DocStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot add payment to cancelled invoice');
        }
        const existingPayments = await this.prisma.payment.findMany({
            where: { invoiceId },
        });
        const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0) + dto.amount;
        if (totalPaid > Number(invoice.total) + 0.01) {
            throw new common_1.BadRequestException(`Payment amount exceeds invoice total. Max: ${Number(invoice.total) - existingPayments.reduce((sum, p) => sum + Number(p.amount), 0)}`);
        }
        const paymentNo = await this.generatePaymentNo();
        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    paymentNo,
                    invoiceId,
                    paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
                    amount: dto.amount,
                    method: dto.method || client_1.PayMethod.CASH,
                    referenceNo: dto.referenceNo,
                    notes: dto.notes,
                    receivedBy: userId,
                },
            });
            const newTotalPaid = totalPaid;
            if (newTotalPaid >= Number(invoice.total) - 0.01) {
                await tx.invoice.update({
                    where: { invoiceId },
                    data: {
                        status: client_1.DocStatus.PAID,
                    },
                });
            }
            return payment;
        });
        return result;
    }
    async findPaymentsByInvoice(invoiceId) {
        const invoice = await this.findOneInvoice(invoiceId);
        const payments = await this.prisma.payment.findMany({
            where: { invoiceId },
            include: {
                receiver: {
                    select: {
                        userId: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { paymentDate: 'desc' },
        });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const balance = Number(invoice.total) - totalPaid;
        return {
            invoice,
            payments,
            totalPaid,
            balance,
        };
    }
    async findAllPayments(params) {
        const { from, to, page = 1, limit = 20 } = params;
        const where = {
            invoice: {
                invoiceType: client_1.InvoiceType.PURCHASE,
            },
        };
        if (from || to) {
            where.paymentDate = {};
            if (from)
                where.paymentDate.gte = from;
            if (to)
                where.paymentDate.lte = to;
        }
        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    invoice: {
                        include: {
                            supplier: true,
                        },
                    },
                    receiver: {
                        select: {
                            userId: true,
                            fullName: true,
                        },
                    },
                },
                orderBy: { paymentDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getLatestSupplierPrice(supplierId, itemId, asOfDate) {
        const targetDate = asOfDate || new Date();
        const price = await this.prisma.supplierItemPrice.findFirst({
            where: {
                supplierId,
                itemId,
                isActive: true,
                effectiveFrom: {
                    lte: targetDate,
                },
                OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
            },
            orderBy: {
                effectiveFrom: 'desc',
            },
        });
        return price;
    }
    async getSupplierActivePrice(supplierId, itemId, asOfDate) {
        const price = await this.getLatestSupplierPrice(BigInt(supplierId), BigInt(itemId), asOfDate ? new Date(asOfDate) : undefined);
        if (!price) {
            throw new common_1.NotFoundException(`No active price found for supplier ${supplierId} and item ${itemId}`);
        }
        return price;
    }
    async generatePurchaseNo() {
        const year = new Date().getFullYear();
        const lastPO = await this.prisma.purchaseOrder.findFirst({
            where: {
                purchaseNo: {
                    startsWith: `PO-${year}-`,
                },
            },
            orderBy: { purchaseNo: 'desc' },
        });
        let seq = 1;
        if (lastPO) {
            const parts = lastPO.purchaseNo.split('-');
            seq = parseInt(parts[2]) + 1;
        }
        return `PO-${year}-${seq.toString().padStart(4, '0')}`;
    }
    async generateInvoiceNo(tx) {
        const prisma = tx || this.prisma;
        const year = new Date().getFullYear();
        const lastInv = await prisma.invoice.findFirst({
            where: {
                invoiceNo: {
                    startsWith: `PINV-${year}-`,
                },
            },
            orderBy: { invoiceNo: 'desc' },
        });
        let seq = 1;
        if (lastInv) {
            const parts = lastInv.invoiceNo.split('-');
            seq = parseInt(parts[2]) + 1;
        }
        return `PINV-${year}-${seq.toString().padStart(4, '0')}`;
    }
    async generatePaymentNo() {
        const year = new Date().getFullYear();
        const lastPay = await this.prisma.payment.findFirst({
            where: {
                paymentNo: {
                    startsWith: `PAY-${year}-`,
                },
            },
            orderBy: { paymentNo: 'desc' },
        });
        let seq = 1;
        if (lastPay) {
            const parts = lastPay.paymentNo.split('-');
            seq = parseInt(parts[2]) + 1;
        }
        return `PAY-${year}-${seq.toString().padStart(4, '0')}`;
    }
};
exports.PurchasingService = PurchasingService;
exports.PurchasingService = PurchasingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasingService);
//# sourceMappingURL=purchasing.service.js.map