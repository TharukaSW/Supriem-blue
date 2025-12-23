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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const masters_service_1 = require("../masters/masters.service");
const client_1 = require("@prisma/client");
const luxon_1 = require("luxon");
let SalesService = class SalesService {
    prisma;
    mastersService;
    constructor(prisma, mastersService) {
        this.prisma = prisma;
        this.mastersService = mastersService;
    }
    async createOrder(dto, userId) {
        const orderNo = await this.generateOrderNo();
        const linesData = await Promise.all(dto.lines.map(async (line) => {
            let unitPrice = line.unitPrice;
            if (!unitPrice) {
                const price = await this.mastersService.getLatestCustomerPrice(BigInt(dto.customerId), BigInt(line.itemId));
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
        const order = await this.prisma.salesOrder.create({
            data: {
                orderNo,
                customerId: BigInt(dto.customerId),
                orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
                notes: dto.notes,
                subtotal,
                discount,
                tax,
                total,
                createdBy: BigInt(userId),
                lines: { create: linesData },
            },
            include: { customer: true, lines: { include: { item: true } }, creator: true },
        });
        return this.transformOrder(order);
    }
    async findAllOrders(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [{ orderNo: { contains: query.search, mode: 'insensitive' } }];
        }
        if (query.status)
            where.status = query.status;
        if (query.customerId)
            where.customerId = BigInt(query.customerId);
        if (query.fromDate)
            where.orderDate = { ...where.orderDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.orderDate = { ...where.orderDate, lte: new Date(query.toDate) };
        const [orders, total] = await Promise.all([
            this.prisma.salesOrder.findMany({
                where, skip, take: limit,
                include: { customer: true, lines: { include: { item: true } }, creator: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.salesOrder.count({ where }),
        ]);
        return {
            data: orders.map(o => this.transformOrder(o)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOneOrder(id) {
        const order = await this.prisma.salesOrder.findUnique({
            where: { salesOrderId: id },
            include: { customer: true, lines: { include: { item: { include: { unit: true } } } }, creator: true, dispatches: true, invoices: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Sales order not found');
        return this.transformOrder(order);
    }
    async updateOrder(id, dto) {
        const order = await this.prisma.salesOrder.findUnique({ where: { salesOrderId: id } });
        if (!order)
            throw new common_1.NotFoundException('Sales order not found');
        if (order.status !== client_1.DocStatus.DRAFT)
            throw new common_1.BadRequestException('Cannot update confirmed order');
        const updated = await this.prisma.salesOrder.update({
            where: { salesOrderId: id },
            data: { notes: dto.notes, discount: dto.discount, tax: dto.tax, total: Number(order.subtotal) - (dto.discount || 0) + (dto.tax || 0) },
            include: { customer: true, lines: { include: { item: true } }, creator: true },
        });
        return this.transformOrder(updated);
    }
    async confirmOrder(id, userId) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findUnique({
                where: { salesOrderId: id },
                include: { lines: { include: { item: true } }, customer: true },
            });
            if (!order)
                throw new common_1.NotFoundException('Sales order not found');
            if (order.status !== client_1.DocStatus.DRAFT)
                throw new common_1.BadRequestException('Order already confirmed');
            await tx.salesOrder.update({ where: { salesOrderId: id }, data: { status: client_1.DocStatus.CONFIRMED } });
            const invoiceNo = await this.generateInvoiceNo(tx);
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNo,
                    invoiceType: client_1.InvoiceType.SALES,
                    invoiceDate: new Date(),
                    customerId: order.customerId,
                    salesOrderId: order.salesOrderId,
                    subtotal: order.subtotal,
                    discount: order.discount,
                    tax: order.tax,
                    total: order.total,
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
            return { message: 'Sales order confirmed', invoiceId: invoice.invoiceId.toString() };
        });
    }
    async cancelOrder(id) {
        const order = await this.prisma.salesOrder.findUnique({ where: { salesOrderId: id } });
        if (!order)
            throw new common_1.NotFoundException('Sales order not found');
        if (order.status !== client_1.DocStatus.DRAFT)
            throw new common_1.BadRequestException('Cannot cancel confirmed order');
        await this.prisma.salesOrder.update({ where: { salesOrderId: id }, data: { status: client_1.DocStatus.CANCELLED } });
        return { message: 'Sales order cancelled' };
    }
    async createDispatch(dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findUnique({
                where: { salesOrderId: BigInt(dto.salesOrderId) },
                include: { lines: true },
            });
            if (!order)
                throw new common_1.NotFoundException('Sales order not found');
            if (order.status !== client_1.DocStatus.CONFIRMED)
                throw new common_1.BadRequestException('Order must be confirmed before dispatch');
            const dispatchNo = await this.generateDispatchNo(tx);
            const dispatch = await tx.dispatch.create({
                data: {
                    dispatchNo,
                    salesOrderId: BigInt(dto.salesOrderId),
                    vehicleNo: dto.vehicleNo,
                    driverName: dto.driverName,
                    remarks: dto.remarks,
                    createdBy: BigInt(userId),
                },
                include: { salesOrder: { include: { customer: true } } },
            });
            await tx.salesOrder.update({ where: { salesOrderId: BigInt(dto.salesOrderId) }, data: { status: client_1.DocStatus.DISPATCHED } });
            for (const line of order.lines) {
                await tx.stockMovement.create({
                    data: {
                        movementType: client_1.MovementType.SALES_DISPATCH,
                        itemId: line.itemId,
                        qtyIn: 0,
                        qtyOut: line.qty,
                        unitCost: line.unitPrice,
                        refTable: 'dispatches',
                        refId: dispatch.dispatchId,
                        createdBy: BigInt(userId),
                    },
                });
                await tx.stockBalance.upsert({
                    where: { itemId: line.itemId },
                    update: { qtyOnHand: { decrement: line.qty } },
                    create: { itemId: line.itemId, qtyOnHand: 0 },
                });
            }
            return this.transformDispatch(dispatch);
        });
    }
    async findAllDispatches(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.fromDate)
            where.dispatchDate = { ...where.dispatchDate, gte: new Date(query.fromDate) };
        if (query.toDate)
            where.dispatchDate = { ...where.dispatchDate, lte: new Date(query.toDate) };
        const [dispatches, total] = await Promise.all([
            this.prisma.dispatch.findMany({
                where, skip, take: limit,
                include: { salesOrder: { include: { customer: true } }, creator: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.dispatch.count({ where }),
        ]);
        return {
            data: dispatches.map(d => this.transformDispatch(d)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOneDispatch(id) {
        const dispatch = await this.prisma.dispatch.findUnique({
            where: { dispatchId: id },
            include: { salesOrder: { include: { customer: true, lines: { include: { item: true } } } }, creator: true },
        });
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        return this.transformDispatch(dispatch);
    }
    async markDelivered(id) {
        const dispatch = await this.prisma.dispatch.findUnique({ where: { dispatchId: id } });
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        await this.prisma.dispatch.update({ where: { dispatchId: id }, data: { status: client_1.DocStatus.DELIVERED } });
        await this.prisma.salesOrder.update({ where: { salesOrderId: dispatch.salesOrderId }, data: { status: client_1.DocStatus.DELIVERED } });
        return { message: 'Dispatch marked as delivered' };
    }
    async generateOrderNo() {
        const today = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const prefix = `SO${today.toFormat('yyyyMMdd')}`;
        const lastOrder = await this.prisma.salesOrder.findFirst({
            where: { orderNo: { startsWith: prefix } },
            orderBy: { orderNo: 'desc' },
        });
        let seq = 1;
        if (lastOrder)
            seq = parseInt(lastOrder.orderNo.slice(-4), 10) + 1;
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
        if (lastInvoice)
            seq = parseInt(lastInvoice.invoiceNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }
    async generateDispatchNo(tx) {
        const today = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const prefix = `DSP${today.toFormat('yyyyMMdd')}`;
        const last = await tx.dispatch.findFirst({
            where: { dispatchNo: { startsWith: prefix } },
            orderBy: { dispatchNo: 'desc' },
        });
        let seq = 1;
        if (last)
            seq = parseInt(last.dispatchNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }
    transformOrder(order) {
        return {
            ...order,
            salesOrderId: order.salesOrderId.toString(),
            customerId: order.customerId.toString(),
            createdBy: order.createdBy?.toString(),
            customer: order.customer ? { ...order.customer, customerId: order.customer.customerId.toString() } : undefined,
            lines: order.lines?.map((l) => ({
                ...l,
                salesOrderLineId: l.salesOrderLineId.toString(),
                salesOrderId: l.salesOrderId.toString(),
                itemId: l.itemId.toString(),
                item: l.item ? { ...l.item, itemId: l.item.itemId.toString() } : undefined,
            })),
            dispatches: order.dispatches?.map((d) => this.transformDispatch(d)),
            invoices: order.invoices?.map((i) => ({ ...i, invoiceId: i.invoiceId.toString() })),
        };
    }
    transformDispatch(dispatch) {
        return {
            ...dispatch,
            dispatchId: dispatch.dispatchId.toString(),
            salesOrderId: dispatch.salesOrderId.toString(),
            createdBy: dispatch.createdBy?.toString(),
            salesOrder: dispatch.salesOrder ? this.transformOrder(dispatch.salesOrder) : undefined,
        };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        masters_service_1.MastersService])
], SalesService);
//# sourceMappingURL=sales.service.js.map