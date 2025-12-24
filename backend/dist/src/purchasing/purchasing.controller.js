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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = exports.PurchaseInvoicesController = exports.PurchasingController = void 0;
const common_1 = require("@nestjs/common");
const purchasing_service_1 = require("./purchasing.service");
const pdf_service_1 = require("./pdf.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PurchasingController = class PurchasingController {
    purchasingService;
    constructor(purchasingService) {
        this.purchasingService = purchasingService;
    }
    async create(dto, req) {
        return this.purchasingService.create(dto, BigInt(req.user.userId));
    }
    async findAll(search, status, supplierId, from, to, page, limit) {
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
    async findOne(id) {
        return this.purchasingService.findOne(BigInt(id));
    }
    async update(id, dto, req) {
        return this.purchasingService.update(BigInt(id), dto, BigInt(req.user.userId));
    }
    async confirm(id, req) {
        return this.purchasingService.confirm(BigInt(id), BigInt(req.user.userId));
    }
    async receive(id, req) {
        return this.purchasingService.receive(BigInt(id), BigInt(req.user.userId));
    }
    async cancel(id, dto, req) {
        return this.purchasingService.cancel(BigInt(id), dto, BigInt(req.user.userId));
    }
    async getSupplierActivePrice(supplierId, itemId, asOfDate) {
        return this.purchasingService.getSupplierActivePrice(supplierId, itemId, asOfDate);
    }
};
exports.PurchasingController = PurchasingController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create new purchase order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Purchase order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePurchaseOrderDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase orders with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.DocStatus }),
    (0, swagger_1.ApiQuery)({ name: 'supplierId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('supplierId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase order by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase order (DRAFT only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePurchaseOrderDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm purchase order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Purchase order confirmed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/receive'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Receive purchase order (creates invoice + stock movements)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Purchase order received, invoice and stock movements created',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "receive", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CancelPurchaseOrderDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('suppliers/:supplierId/items/:itemId/active-price'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get active supplier price for item' }),
    (0, swagger_1.ApiQuery)({ name: 'asOfDate', required: false, type: String }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PurchasingController.prototype, "getSupplierActivePrice", null);
exports.PurchasingController = PurchasingController = __decorate([
    (0, swagger_1.ApiTags)('Purchasing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('purchases'),
    __metadata("design:paramtypes", [purchasing_service_1.PurchasingService])
], PurchasingController);
let PurchaseInvoicesController = class PurchaseInvoicesController {
    purchasingService;
    pdfService;
    constructor(purchasingService, pdfService) {
        this.purchasingService = purchasingService;
        this.pdfService = pdfService;
    }
    async findAll(search, matchStatus, status, from, to, page, limit) {
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
    async findOne(id) {
        return this.purchasingService.findOneInvoice(BigInt(id));
    }
    async downloadPdf(id, template = 'DOT_MATRIX', res) {
        const invoice = await this.purchasingService.findOneInvoice(BigInt(id));
        let content;
        let contentType;
        let filename;
        if (template === 'A4') {
            content = this.pdfService.generateA4Invoice(invoice);
            contentType = 'text/html';
            filename = `invoice-${invoice.invoiceNo}.html`;
        }
        else {
            content = this.pdfService.generateDotMatrixInvoice(invoice);
            contentType = 'text/plain';
            filename = `invoice-${invoice.invoiceNo}.txt`;
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(content);
    }
    async match(id, dto, req) {
        return this.purchasingService.matchInvoice(BigInt(id), dto, BigInt(req.user.userId));
    }
    async createPayment(id, dto, req) {
        return this.purchasingService.createPayment(BigInt(id), dto, BigInt(req.user.userId));
    }
    async getPayments(id) {
        return this.purchasingService.findPaymentsByInvoice(BigInt(id));
    }
};
exports.PurchaseInvoicesController = PurchaseInvoicesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase invoices with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'matchStatus', required: false, enum: client_1.MatchStatus }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.DocStatus }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('matchStatus')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PurchaseInvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase invoice by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseInvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Download invoice PDF' }),
    (0, swagger_1.ApiQuery)({
        name: 'template',
        required: false,
        enum: ['DOT_MATRIX', 'A4'],
        description: 'PDF template type',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('template')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PurchaseInvoicesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Patch)(':id/match'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Match supplier invoice with system invoice' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice matched' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.MatchInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseInvoicesController.prototype, "match", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment for purchase invoice' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment created successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseInvoicesController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments for purchase invoice' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseInvoicesController.prototype, "getPayments", null);
exports.PurchaseInvoicesController = PurchaseInvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('purchase-invoices'),
    __metadata("design:paramtypes", [purchasing_service_1.PurchasingService,
        pdf_service_1.PdfService])
], PurchaseInvoicesController);
let PaymentsController = class PaymentsController {
    purchasingService;
    constructor(purchasingService) {
        this.purchasingService = purchasingService;
    }
    async findAll(from, to, page, limit) {
        return this.purchasingService.findAllPayments({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase payments' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [purchasing_service_1.PurchasingService])
], PaymentsController);
//# sourceMappingURL=purchasing.controller.js.map