import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MastersService } from '../masters/masters.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto, SalesQueryDto, CreateDispatchDto, UpdateDispatchDto, DispatchQueryDto } from './dto';
import { DocStatus, MovementType, InvoiceType } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class SalesService {
    constructor(
        private prisma: PrismaService,
        private mastersService: MastersService,
    ) { }

    // ========== SALES ORDERS ==========
    async createOrder(dto: CreateSalesOrderDto, userId: string) {
        const orderNo = await this.generateOrderNo();

        const linesData = await Promise.all(
            dto.lines.map(async (line) => {
                let unitPrice = line.unitPrice;
                if (!unitPrice) {
                    const price = await this.mastersService.getLatestCustomerPrice(
                        BigInt(dto.customerId),
                        BigInt(line.itemId),
                    );
                    unitPrice = price ? Number(price.unitPrice) : 0;
                }
                return {
                    itemId: BigInt(line.itemId),
                    qty: line.qty,
                    unitPrice,
                    lineTotal: line.qty * unitPrice,
                };
            }),
        );

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

    async findAllOrders(query: SalesQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [{ orderNo: { contains: query.search, mode: 'insensitive' } }];
        }
        if (query.status) where.status = query.status;
        if (query.customerId) where.customerId = BigInt(query.customerId);
        if (query.fromDate) where.orderDate = { ...where.orderDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.orderDate = { ...where.orderDate, lte: new Date(query.toDate) };

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

    async findOneOrder(id: bigint) {
        const order = await this.prisma.salesOrder.findUnique({
            where: { salesOrderId: id },
            include: { customer: true, lines: { include: { item: { include: { unit: true } } } }, creator: true, dispatches: true, invoices: true },
        });
        if (!order) throw new NotFoundException('Sales order not found');
        return this.transformOrder(order);
    }

    async updateOrder(id: bigint, dto: UpdateSalesOrderDto) {
        const order = await this.prisma.salesOrder.findUnique({ where: { salesOrderId: id } });
        if (!order) throw new NotFoundException('Sales order not found');
        if (order.status !== DocStatus.DRAFT) throw new BadRequestException('Cannot update confirmed order');

        const updated = await this.prisma.salesOrder.update({
            where: { salesOrderId: id },
            data: { notes: dto.notes, discount: dto.discount, tax: dto.tax, total: Number(order.subtotal) - (dto.discount || 0) + (dto.tax || 0) },
            include: { customer: true, lines: { include: { item: true } }, creator: true },
        });

        return this.transformOrder(updated);
    }

    async confirmOrder(id: bigint, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findUnique({
                where: { salesOrderId: id },
                include: { lines: { include: { item: true } }, customer: true },
            });

            if (!order) throw new NotFoundException('Sales order not found');
            if (order.status !== DocStatus.DRAFT) throw new BadRequestException('Order already confirmed');

            await tx.salesOrder.update({ where: { salesOrderId: id }, data: { status: DocStatus.CONFIRMED } });

            // Create invoice
            const invoiceNo = await this.generateInvoiceNo(tx);
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNo,
                    invoiceType: InvoiceType.SALES,
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

            // Create stock movements and update stock balance (reduce inventory)
            for (const line of order.lines) {
                await tx.stockMovement.create({
                    data: {
                        movementType: MovementType.SALES_DISPATCH,
                        itemId: line.itemId,
                        qtyIn: 0,
                        qtyOut: line.qty,
                        unitCost: line.unitPrice,
                        refTable: 'sales_orders',
                        refId: order.salesOrderId,
                        createdBy: BigInt(userId),
                    },
                });

                await tx.stockBalance.upsert({
                    where: { itemId: line.itemId },
                    update: { qtyOnHand: { decrement: line.qty } },
                    create: { itemId: line.itemId, qtyOnHand: 0 },
                });
            }

            return { message: 'Sales order confirmed', invoiceId: invoice.invoiceId.toString() };
        }, {
            maxWait: 10000, // 10 seconds max wait to acquire connection
            timeout: 30000, // 30 seconds timeout for the transaction
        });
    }

    async cancelOrder(id: bigint) {
        const order = await this.prisma.salesOrder.findUnique({ where: { salesOrderId: id } });
        if (!order) throw new NotFoundException('Sales order not found');
        if (order.status !== DocStatus.DRAFT) throw new BadRequestException('Cannot cancel confirmed order');

        await this.prisma.salesOrder.update({ where: { salesOrderId: id }, data: { status: DocStatus.CANCELLED } });
        return { message: 'Sales order cancelled' };
    }

    // ========== DISPATCH ==========
    async createDispatch(dto: CreateDispatchDto, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findUnique({
                where: { salesOrderId: BigInt(dto.salesOrderId) },
                include: { lines: true },
            });

            if (!order) throw new NotFoundException('Sales order not found');
            if (order.status !== DocStatus.CONFIRMED) throw new BadRequestException('Order must be confirmed before dispatch');

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

            // Update order status
            await tx.salesOrder.update({ where: { salesOrderId: BigInt(dto.salesOrderId) }, data: { status: DocStatus.DISPATCHED } });

            // Stock already reduced during confirmOrder - no need to update again

            return this.transformDispatch(dispatch);
        }, {
            maxWait: 10000,
            timeout: 30000,
        });
    }

    async findAllDispatches(query: DispatchQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.fromDate) where.dispatchDate = { ...where.dispatchDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.dispatchDate = { ...where.dispatchDate, lte: new Date(query.toDate) };

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

    async findOneDispatch(id: bigint) {
        const dispatch = await this.prisma.dispatch.findUnique({
            where: { dispatchId: id },
            include: { salesOrder: { include: { customer: true, lines: { include: { item: true } } } }, creator: true },
        });
        if (!dispatch) throw new NotFoundException('Dispatch not found');
        return this.transformDispatch(dispatch);
    }

    async markDelivered(id: bigint) {
        const dispatch = await this.prisma.dispatch.findUnique({ where: { dispatchId: id } });
        if (!dispatch) throw new NotFoundException('Dispatch not found');

        await this.prisma.dispatch.update({ where: { dispatchId: id }, data: { status: DocStatus.DELIVERED } });
        await this.prisma.salesOrder.update({ where: { salesOrderId: dispatch.salesOrderId }, data: { status: DocStatus.DELIVERED } });

        return { message: 'Dispatch marked as delivered' };
    }

    private async generateOrderNo(): Promise<string> {
        const today = DateTime.now().setZone('Asia/Colombo');
        const prefix = `SO${today.toFormat('yyyyMMdd')}`;
        const lastOrder = await this.prisma.salesOrder.findFirst({
            where: { orderNo: { startsWith: prefix } },
            orderBy: { orderNo: 'desc' },
        });
        let seq = 1;
        if (lastOrder) seq = parseInt(lastOrder.orderNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }

    private async generateInvoiceNo(tx: any): Promise<string> {
        const today = DateTime.now().setZone('Asia/Colombo');
        const prefix = `INV${today.toFormat('yyyyMMdd')}`;
        const lastInvoice = await tx.invoice.findFirst({
            where: { invoiceNo: { startsWith: prefix } },
            orderBy: { invoiceNo: 'desc' },
        });
        let seq = 1;
        if (lastInvoice) seq = parseInt(lastInvoice.invoiceNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }

    private async generateDispatchNo(tx: any): Promise<string> {
        const today = DateTime.now().setZone('Asia/Colombo');
        const prefix = `DSP${today.toFormat('yyyyMMdd')}`;
        const last = await tx.dispatch.findFirst({
            where: { dispatchNo: { startsWith: prefix } },
            orderBy: { dispatchNo: 'desc' },
        });
        let seq = 1;
        if (last) seq = parseInt(last.dispatchNo.slice(-4), 10) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    }

    private transformOrder(order: any) {
        return {
            ...order,
            salesOrderId: order.salesOrderId.toString(),
            customerId: order.customerId.toString(),
            createdBy: order.createdBy?.toString(),
            customer: order.customer ? { ...order.customer, customerId: order.customer.customerId.toString() } : undefined,
            lines: order.lines?.map((l: any) => ({
                ...l,
                salesOrderLineId: l.salesOrderLineId.toString(),
                salesOrderId: l.salesOrderId.toString(),
                itemId: l.itemId.toString(),
                item: l.item ? { ...l.item, itemId: l.item.itemId.toString() } : undefined,
            })),
            dispatches: order.dispatches?.map((d: any) => this.transformDispatch(d)),
            invoices: order.invoices?.map((i: any) => ({ ...i, invoiceId: i.invoiceId.toString() })),
        };
    }

    private transformDispatch(dispatch: any) {
        return {
            ...dispatch,
            dispatchId: dispatch.dispatchId.toString(),
            salesOrderId: dispatch.salesOrderId.toString(),
            createdBy: dispatch.createdBy?.toString(),
            salesOrder: dispatch.salesOrder ? this.transformOrder(dispatch.salesOrder) : undefined,
        };
    }
}
