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
exports.MastersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const masters_service_1 = require("./masters.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let MastersController = class MastersController {
    mastersService;
    constructor(mastersService) {
        this.mastersService = mastersService;
    }
    createUnit(dto) {
        return this.mastersService.createUnit(dto);
    }
    findAllUnits() {
        return this.mastersService.findAllUnits();
    }
    findOneUnit(id) {
        return this.mastersService.findOneUnit(Number(id));
    }
    updateUnit(id, dto) {
        return this.mastersService.updateUnit(Number(id), dto);
    }
    deleteUnit(id) {
        return this.mastersService.deleteUnit(Number(id));
    }
    createCategory(dto) {
        return this.mastersService.createCategory(dto);
    }
    findAllCategories() {
        return this.mastersService.findAllCategories();
    }
    findOneCategory(id) {
        return this.mastersService.findOneCategory(Number(id));
    }
    updateCategory(id, dto) {
        return this.mastersService.updateCategory(Number(id), dto);
    }
    deleteCategory(id) {
        return this.mastersService.deleteCategory(Number(id));
    }
    createItem(dto) {
        return this.mastersService.createItem(dto);
    }
    findAllItems(query) {
        return this.mastersService.findAllItems(query);
    }
    findOneItem(id) {
        return this.mastersService.findOneItem(BigInt(id));
    }
    updateItem(id, dto) {
        return this.mastersService.updateItem(BigInt(id), dto);
    }
    deleteItem(id) {
        return this.mastersService.deleteItem(BigInt(id));
    }
    createSupplier(dto, user) {
        return this.mastersService.createSupplier(dto, user.userId);
    }
    findAllSuppliers(query) {
        return this.mastersService.findAllSuppliers(query);
    }
    findOneSupplier(id, includePrices) {
        return this.mastersService.findOneSupplier(BigInt(id), includePrices === 'true');
    }
    updateSupplier(id, dto, user) {
        return this.mastersService.updateSupplier(BigInt(id), dto, user.userId);
    }
    deactivateSupplier(id, dto, user) {
        return this.mastersService.deactivateSupplier(BigInt(id), dto, user.userId);
    }
    deleteSupplier(id) {
        return this.mastersService.deleteSupplier(BigInt(id));
    }
    createCustomer(dto, user) {
        return this.mastersService.createCustomer(dto, user.userId);
    }
    findAllCustomers(query) {
        return this.mastersService.findAllCustomers(query);
    }
    findOneCustomer(id, includePrices) {
        return this.mastersService.findOneCustomer(BigInt(id), includePrices === 'true');
    }
    updateCustomer(id, dto, user) {
        return this.mastersService.updateCustomer(BigInt(id), dto, user.userId);
    }
    deactivateCustomer(id, dto, user) {
        return this.mastersService.deactivateCustomer(BigInt(id), dto, user.userId);
    }
    deleteCustomer(id) {
        return this.mastersService.deleteCustomer(BigInt(id));
    }
    createSupplierItemPrice(supplierId, dto, user) {
        return this.mastersService.createSupplierItemPrice(BigInt(supplierId), dto, user.userId);
    }
    findSupplierItemPrices(supplierId, query) {
        return this.mastersService.findSupplierItemPrices(BigInt(supplierId), query);
    }
    getSupplierActivePrice(supplierId, itemId, asOfDate) {
        const date = asOfDate ? new Date(asOfDate) : undefined;
        return this.mastersService.getSupplierActivePrice(BigInt(supplierId), BigInt(itemId), date);
    }
    updateSupplierItemPrice(supplierId, priceId, dto, user) {
        return this.mastersService.updateSupplierItemPrice(BigInt(supplierId), BigInt(priceId), dto, user.userId);
    }
    deactivateSupplierItemPrice(supplierId, priceId, dto, user) {
        return this.mastersService.deactivateSupplierItemPrice(BigInt(supplierId), BigInt(priceId), dto, user.userId);
    }
    createCustomerItemPrice(customerId, dto, user) {
        return this.mastersService.createCustomerItemPrice(BigInt(customerId), dto, user.userId);
    }
    findCustomerItemPrices(customerId, query) {
        return this.mastersService.findCustomerItemPrices(BigInt(customerId), query);
    }
    getCustomerActivePrice(customerId, itemId, asOfDate) {
        const date = asOfDate ? new Date(asOfDate) : undefined;
        return this.mastersService.getCustomerActivePrice(BigInt(customerId), BigInt(itemId), date);
    }
    updateCustomerItemPrice(customerId, priceId, dto, user) {
        return this.mastersService.updateCustomerItemPrice(BigInt(customerId), BigInt(priceId), dto, user.userId);
    }
    deactivateCustomerItemPrice(customerId, priceId, dto, user) {
        return this.mastersService.deactivateCustomerItemPrice(BigInt(customerId), BigInt(priceId), dto, user.userId);
    }
};
exports.MastersController = MastersController;
__decorate([
    (0, common_1.Post)('units'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a unit' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUnitDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Get)('units'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all units' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findAllUnits", null);
__decorate([
    (0, common_1.Get)('units/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get unit by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findOneUnit", null);
__decorate([
    (0, common_1.Put)('units/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update unit' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUnitDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateUnit", null);
__decorate([
    (0, common_1.Delete)('units/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete unit' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deleteUnit", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get category by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findOneCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create an item' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateItemDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all items with pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ItemQueryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findAllItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get item by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findOneItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update item' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateItemDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate item' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Post)('suppliers'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a supplier' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSupplierDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all suppliers with pagination and optional price lists' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SupplierQueryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findAllSuppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier by ID with optional price lists' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'includePrices', required: false, type: 'boolean' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includePrices')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findOneSupplier", null);
__decorate([
    (0, common_1.Patch)('suppliers/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update supplier' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSupplierDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Patch)('suppliers/:id/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate supplier (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DeactivateSupplierDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deactivateSupplier", null);
__decorate([
    (0, common_1.Delete)('suppliers/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate supplier (deprecated - use PATCH /suppliers/:id/deactivate)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deleteSupplier", null);
__decorate([
    (0, common_1.Post)('customers'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a customer' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Get)('customers'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers with pagination and optional price lists' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CustomerQueryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findAllCustomers", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer by ID with optional price lists' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'includePrices', required: false, type: 'boolean' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includePrices')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findOneCustomer", null);
__decorate([
    (0, common_1.Patch)('customers/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Patch)('customers/:id/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate customer (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DeactivateCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deactivateCustomer", null);
__decorate([
    (0, common_1.Delete)('customers/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate customer (deprecated - use PATCH /customers/:id/deactivate)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deleteCustomer", null);
__decorate([
    (0, common_1.Post)('suppliers/:supplierId/prices'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new price for supplier item' }),
    (0, swagger_1.ApiParam)({ name: 'supplierId', type: 'string' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateSupplierItemPriceDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createSupplierItemPrice", null);
__decorate([
    (0, common_1.Get)('suppliers/:supplierId/prices'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier price list with filters' }),
    (0, swagger_1.ApiParam)({ name: 'supplierId', type: 'string' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SupplierPriceQueryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findSupplierItemPrices", null);
__decorate([
    (0, common_1.Get)('suppliers/:supplierId/prices/active/:itemId'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get active price for supplier + item combination' }),
    (0, swagger_1.ApiParam)({ name: 'supplierId', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'asOfDate', required: false, description: 'Date for price lookup (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getSupplierActivePrice", null);
__decorate([
    (0, common_1.Patch)('suppliers/:supplierId/prices/:priceId'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update supplier item price' }),
    (0, swagger_1.ApiParam)({ name: 'supplierId', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'priceId', type: 'string' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Param)('priceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateSupplierItemPriceDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateSupplierItemPrice", null);
__decorate([
    (0, common_1.Patch)('suppliers/:supplierId/prices/:priceId/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate supplier item price' }),
    (0, swagger_1.ApiParam)({ name: 'supplierId', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'priceId', type: 'string' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Param)('priceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.DeactivateSupplierPriceDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deactivateSupplierItemPrice", null);
__decorate([
    (0, common_1.Post)('customers/:customerId/prices'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new price for customer item' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: 'string' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateCustomerItemPriceDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "createCustomerItemPrice", null);
__decorate([
    (0, common_1.Get)('customers/:customerId/prices'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer price list with filters' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: 'string' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CustomerPriceQueryDto]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "findCustomerItemPrices", null);
__decorate([
    (0, common_1.Get)('customers/:customerId/prices/active/:itemId'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get active price for customer + item combination' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'asOfDate', required: false, description: 'Date for price lookup (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "getCustomerActivePrice", null);
__decorate([
    (0, common_1.Patch)('customers/:customerId/prices/:priceId'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer item price' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'priceId', type: 'string' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('priceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateCustomerItemPriceDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "updateCustomerItemPrice", null);
__decorate([
    (0, common_1.Patch)('customers/:customerId/prices/:priceId/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate customer item price' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'priceId', type: 'string' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('priceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.DeactivateCustomerPriceDto, Object]),
    __metadata("design:returntype", void 0)
], MastersController.prototype, "deactivateCustomerItemPrice", null);
exports.MastersController = MastersController = __decorate([
    (0, swagger_1.ApiTags)('Masters'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('masters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [masters_service_1.MastersService])
], MastersController);
//# sourceMappingURL=masters.controller.js.map