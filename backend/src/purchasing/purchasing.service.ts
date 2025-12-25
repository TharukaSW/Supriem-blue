import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CancelPurchaseOrderDto,
  MatchInvoiceDto,
  CreatePaymentDto,
} from './dto';
import {
  DocStatus,
  MovementType,
  InvoiceType,
  MatchStatus,
  ItemType,
  RoleName,
  PayMethod,
} from '@prisma/client';

@Injectable()
export class PurchasingService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreatePurchaseOrderDto, userId: bigint) {
    const purchaseNo = await this.generatePurchaseNo();

    // Validate items are RAW type
    const itemIds = dto.lines.map((l) => BigInt(l.itemId));
    const items = await this.prisma.item.findMany({
      where: { itemId: { in: itemIds } },
    });

    const nonRawItems = items.filter((i) => i.itemType !== ItemType.RAW);
    if (nonRawItems.length > 0) {
      throw new BadRequestException(
        `Items must be RAW type: ${nonRawItems.map((i) => i.itemName).join(', ')}`,
      );
    }

    // Get user for permission check
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: { role: true },
    });

    // Calculate lines
    const linesData = await Promise.all(
      dto.lines.map(async (line) => {
        const lineTotal = line.qty * (line.unitPrice || 0);

        // Check if price override
        let priceSource = 'SUPPLIER_PRICE';
        let overrideReason: string | null = null;
        let overriddenBy: bigint | null = null;

        // Get latest supplier price
        const supplierPrice = await this.getLatestSupplierPrice(
          BigInt(dto.supplierId),
          BigInt(line.itemId),
        );

        if (
          supplierPrice &&
          Math.abs(Number(supplierPrice.unitPrice) - (line.unitPrice || 0)) > 0.01
        ) {
          // Price is different from supplier price - manual override
          if (
            user?.role?.roleName !== RoleName.ADMIN &&
            user?.role?.roleName !== RoleName.MANAGER
          ) {
            throw new ForbiddenException(
              'Only ADMIN or MANAGER can override prices',
            );
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
      }),
    );

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
        status: DocStatus.DRAFT,
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

  async findAll(params: {
    search?: string;
    status?: DocStatus;
    supplierId?: bigint;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const { search, status, supplierId, from, to, page = 1, limit = 20 } = params;

    const where: any = {};

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
      if (from) where.purchaseDate.gte = from;
      if (to) where.purchaseDate.lte = to;
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

  async findOne(id: bigint) {
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
      throw new NotFoundException(`Purchase order #${id} not found`);
    }

    return purchase;
  }

  async update(id: bigint, dto: UpdatePurchaseOrderDto, userId: bigint) {
    const purchase = await this.findOne(id);

    if (purchase.status !== DocStatus.DRAFT) {
      throw new BadRequestException('Can only update DRAFT purchase orders');
    }

    // If lines are provided, validate and recalculate
    let linesData: any[] | undefined;
    let subtotal: number | undefined;
    let total: number | undefined;

    if (dto.lines && dto.lines.length > 0) {
      // Validate items are RAW type
      const itemIds = dto.lines.map((l) => BigInt(l.itemId));
      const items = await this.prisma.item.findMany({
        where: { itemId: { in: itemIds } },
      });

      const nonRawItems = items.filter((i) => i.itemType !== ItemType.RAW);
      if (nonRawItems.length > 0) {
        throw new BadRequestException(
          `Items must be RAW type: ${nonRawItems.map((i) => i.itemName).join(', ')}`,
        );
      }

      // Get user for permission check
      const user = await this.prisma.user.findUnique({
        where: { userId },
        include: { role: true },
      });

      linesData = await Promise.all(
        dto.lines.map(async (line) => {
          const lineTotal = line.qty * (line.unitPrice || 0);

          let priceSource = 'SUPPLIER_PRICE';
          let overrideReason: string | null = null;
          let overriddenBy: bigint | null = null;

          const supplierPrice = await this.getLatestSupplierPrice(
            purchase.supplierId,
            BigInt(line.itemId),
          );

          if (
            supplierPrice &&
            Math.abs(Number(supplierPrice.unitPrice) - (line.unitPrice || 0)) > 0.01
          ) {
            if (
              user?.role?.roleName !== RoleName.ADMIN &&
              user?.role?.roleName !== RoleName.MANAGER
            ) {
              throw new ForbiddenException(
                'Only ADMIN or MANAGER can override prices',
              );
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
        }),
      );

      subtotal = linesData.reduce((sum, l) => sum + Number(l.lineTotal), 0);
      const discount = dto.discount ?? purchase.discount;
      const tax = dto.tax ?? purchase.tax;
      total = subtotal! - Number(discount) + Number(tax);
    }

    // Delete old lines and create new ones if lines are provided
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
      } as any,
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

  async confirm(id: bigint, userId: bigint) {
    const purchase = await this.findOne(id);

    if (purchase.status !== DocStatus.DRAFT) {
      throw new BadRequestException('Can only confirm DRAFT purchase orders');
    }

    if (purchase.lines.length === 0) {
      throw new BadRequestException('Cannot confirm purchase order without lines');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { purchaseId: id },
      data: {
        status: DocStatus.CONFIRMED,
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

  async receive(id: bigint, userId: bigint) {
    const purchase = await this.findOne(id);

    if (purchase.status !== DocStatus.CONFIRMED) {
      throw new BadRequestException('Can only receive CONFIRMED purchase orders');
    }

    // Use transaction to create invoice, invoice lines, stock movements, and update PO
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Generate invoice number
      const invoiceNo = await this.generateInvoiceNo(tx);

      // 2. Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo,
          invoiceType: InvoiceType.PURCHASE,
          invoiceDate: new Date(),
          supplierId: purchase.supplierId,
          purchaseId: purchase.purchaseId,
          subtotal: purchase.subtotal,
          discount: purchase.discount,
          tax: purchase.tax,
          total: purchase.total,
          status: DocStatus.ISSUED,
          printTemplate: 'DOT_MATRIX',
          matchStatus: MatchStatus.PENDING,
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

      // 3. Create stock movements for each RAW item
      const stockMovements = await Promise.all(
        purchase.lines.map(async (line) => {
          const movement = await tx.stockMovement.create({
            data: {
              movementType: MovementType.PURCHASE_RECEIPT,
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

          // Update stock balance
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
          } else {
            await tx.stockBalance.create({
              data: {
                itemId: line.itemId,
                qtyOnHand: line.qty,
              },
            });
          }

          return movement;
        }),
      );

      // 4. Update purchase order status
      const updatedPO = await tx.purchaseOrder.update({
        where: { purchaseId: id },
        data: {
          status: DocStatus.RECEIVED,
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

  async cancel(id: bigint, dto: CancelPurchaseOrderDto, userId: bigint) {
    const purchase = await this.findOne(id);

    if (purchase.status === DocStatus.CANCELLED) {
      throw new BadRequestException('Purchase order is already cancelled');
    }

    if (purchase.status === DocStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel received purchase orders');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { purchaseId: id },
      data: {
        status: DocStatus.CANCELLED,
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

  // Invoice operations
  async findAllInvoices(params: {
    search?: string;
    matchStatus?: MatchStatus;
    status?: DocStatus;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const { search, matchStatus, status, from, to, page = 1, limit = 20 } = params;

    const where: any = {
      invoiceType: InvoiceType.PURCHASE,
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
      if (from) where.invoiceDate.gte = from;
      if (to) where.invoiceDate.lte = to;
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

  async findOneInvoice(id: bigint) {
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
      throw new NotFoundException(`Invoice #${id} not found`);
    }

    if (invoice.invoiceType !== InvoiceType.PURCHASE) {
      throw new BadRequestException('Not a purchase invoice');
    }

    return invoice;
  }

  async matchInvoice(id: bigint, dto: MatchInvoiceDto, userId: bigint) {
    const invoice = await this.findOneInvoice(id);

    const systemTotal = Number(invoice.total);
    const vendorTotal = dto.vendorInvoiceTotal;
    const mismatchAmount = Math.abs(systemTotal - vendorTotal);

    const matchStatus =
      mismatchAmount < 0.01 ? MatchStatus.MATCHED : MatchStatus.MISMATCHED;

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

  // Payment operations
  async createPayment(invoiceId: bigint, dto: CreatePaymentDto, userId: bigint) {
    const invoice = await this.findOneInvoice(invoiceId);

    if (invoice.status === DocStatus.CANCELLED) {
      throw new BadRequestException('Cannot add payment to cancelled invoice');
    }

    // Calculate total paid
    const existingPayments = await this.prisma.payment.findMany({
      where: { invoiceId },
    });

    const totalPaid =
      existingPayments.reduce((sum, p) => sum + Number(p.amount), 0) + dto.amount;

    if (totalPaid > Number(invoice.total) + 0.01) {
      throw new BadRequestException(
        `Payment amount exceeds invoice total. Max: ${Number(invoice.total) - existingPayments.reduce((sum, p) => sum + Number(p.amount), 0)}`,
      );
    }

    const paymentNo = await this.generatePaymentNo();

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNo,
          invoiceId,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          amount: dto.amount,
          method: (dto.method as PayMethod) || PayMethod.CASH,
          referenceNo: dto.referenceNo,
          notes: dto.notes,
          receivedBy: userId,
        },
      });

      // Update invoice status if fully paid
      const newTotalPaid = totalPaid;
      if (newTotalPaid >= Number(invoice.total) - 0.01) {
        await tx.invoice.update({
          where: { invoiceId },
          data: {
            status: DocStatus.PAID,
          },
        });
      }

      return payment;
    });

    return result;
  }

  async findPaymentsByInvoice(invoiceId: bigint) {
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

  async findAllPayments(params: {
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const { from, to, page = 1, limit = 20 } = params;

    const where: any = {
      invoice: {
        invoiceType: InvoiceType.PURCHASE,
      },
    };

    if (from || to) {
      where.paymentDate = {};
      if (from) where.paymentDate.gte = from;
      if (to) where.paymentDate.lte = to;
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

  // Helper: Get active supplier price
  async getLatestSupplierPrice(supplierId: bigint, itemId: bigint, asOfDate?: Date) {
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

  async getSupplierActivePrice(supplierId: string, itemId: string, asOfDate?: string) {
    const price = await this.getLatestSupplierPrice(
      BigInt(supplierId),
      BigInt(itemId),
      asOfDate ? new Date(asOfDate) : undefined,
    );

    if (!price) {
      throw new NotFoundException(
        `No active price found for supplier ${supplierId} and item ${itemId}`,
      );
    }

    return price;
  }

  // Helper: Generate numbers
  private async generatePurchaseNo(): Promise<string> {
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

  private async generateInvoiceNo(tx?: any): Promise<string> {
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

  private async generatePaymentNo(): Promise<string> {
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
}
