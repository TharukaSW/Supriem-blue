import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PurchasingService } from './purchasing.service';
import { PdfService } from './pdf.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CancelPurchaseOrderDto,
  MatchInvoiceDto,
  CreatePaymentDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName, DocStatus, MatchStatus } from '@prisma/client';

@ApiTags('Purchasing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) { }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  async create(@Body() dto: CreatePurchaseOrderDto, @Request() req) {
    return this.purchasingService.create(dto, BigInt(req.user.userId));
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
  @ApiOperation({ summary: 'Get all purchase orders with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: DocStatus })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: DocStatus,
    @Query('supplierId') supplierId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.purchasingService.findAll({
      search,
      status,
      supplierId: supplierId ? BigInt(supplierId) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async findOne(@Param('id') id: string) {
    return this.purchasingService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update purchase order (DRAFT only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @Request() req,
  ) {
    return this.purchasingService.update(BigInt(id), dto, BigInt(req.user.userId));
  }

  @Patch(':id/confirm')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Confirm purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order confirmed' })
  async confirm(@Param('id') id: string, @Request() req) {
    return this.purchasingService.confirm(BigInt(id), BigInt(req.user.userId));
  }

  @Patch(':id/receive')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({
    summary:
      'Receive purchase order (creates invoice + stock movements)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Purchase order received, invoice and stock movements created',
  })
  async receive(@Param('id') id: string, @Request() req) {
    return this.purchasingService.receive(BigInt(id), BigInt(req.user.userId));
  }

  @Patch(':id/cancel')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Cancel purchase order' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelPurchaseOrderDto,
    @Request() req,
  ) {
    return this.purchasingService.cancel(BigInt(id), dto, BigInt(req.user.userId));
  }

  @Get('suppliers/:supplierId/items/:itemId/active-price')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get active supplier price for item' })
  @ApiQuery({ name: 'asOfDate', required: false, type: String })
  async getSupplierActivePrice(
    @Param('supplierId') supplierId: string,
    @Param('itemId') itemId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.purchasingService.getSupplierActivePrice(
      supplierId,
      itemId,
      asOfDate,
    );
  }
}

@ApiTags('Purchase Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-invoices')
export class PurchaseInvoicesController {
  constructor(
    private readonly purchasingService: PurchasingService,
    private readonly pdfService: PdfService,
  ) { }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all purchase invoices with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'matchStatus', required: false, enum: MatchStatus })
  @ApiQuery({ name: 'status', required: false, enum: DocStatus })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('search') search?: string,
    @Query('matchStatus') matchStatus?: MatchStatus,
    @Query('status') status?: DocStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.purchasingService.findAllInvoices({
      search,
      matchStatus,
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get purchase invoice by ID' })
  async findOne(@Param('id') id: string) {
    return this.purchasingService.findOneInvoice(BigInt(id));
  }

  @Get(':id/pdf')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiQuery({
    name: 'template',
    required: false,
    enum: ['DOT_MATRIX', 'A4'],
    description: 'PDF template type',
  })
  async downloadPdf(
    @Param('id') id: string,
    @Query('template') template: string = 'DOT_MATRIX',
    @Res() res: Response,
  ) {
    const invoice = await this.purchasingService.findOneInvoice(BigInt(id));

    let content: string;
    let contentType: string;
    let filename: string;

    if (template === 'A4') {
      content = this.pdfService.generateA4Invoice(invoice as any);
      contentType = 'text/html';
      filename = `invoice-${invoice.invoiceNo}.html`;
    } else {
      // DOT_MATRIX - plain text
      content = this.pdfService.generateDotMatrixInvoice(invoice as any);
      contentType = 'text/plain';
      filename = `invoice-${invoice.invoiceNo}.txt`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Patch(':id/match')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Match supplier invoice with system invoice' })
  @ApiResponse({ status: 200, description: 'Invoice matched' })
  async match(
    @Param('id') id: string,
    @Body() dto: MatchInvoiceDto,
    @Request() req,
  ) {
    return this.purchasingService.matchInvoice(
      BigInt(id),
      dto,
      BigInt(req.user.userId),
    );
  }

  @Post(':id/payments')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create payment for purchase invoice' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async createPayment(
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
    @Request() req,
  ) {
    return this.purchasingService.createPayment(
      BigInt(id),
      dto,
      BigInt(req.user.userId),
    );
  }

  @Get(':id/payments')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all payments for purchase invoice' })
  async getPayments(@Param('id') id: string) {
    return this.purchasingService.findPaymentsByInvoice(BigInt(id));
  }
}

@ApiTags('Purchase Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly purchasingService: PurchasingService) { }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all purchase payments' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.purchasingService.findAllPayments({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
