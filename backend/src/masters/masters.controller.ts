import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MastersService } from './masters.service';
import {
    CreateUnitDto, UpdateUnitDto,
    CreateCategoryDto, UpdateCategoryDto,
    CreateItemDto, UpdateItemDto, ItemQueryDto,
    CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto, DeactivateSupplierDto,
    CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto, DeactivateCustomerDto,
    CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto, SupplierPriceQueryDto, DeactivateSupplierPriceDto,
    CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto, CustomerPriceQueryDto, DeactivateCustomerPriceDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Masters')
@ApiBearerAuth()
@Controller('masters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MastersController {
    constructor(private readonly mastersService: MastersService) { }

    // ========== UNITS ==========
    @Post('units')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create a unit' })
    createUnit(@Body() dto: CreateUnitDto) {
        return this.mastersService.createUnit(dto);
    }

    @Get('units')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all units' })
    findAllUnits() {
        return this.mastersService.findAllUnits();
    }

    @Get('units/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get unit by ID' })
    findOneUnit(@Param('id') id: string) {
        return this.mastersService.findOneUnit(Number(id));
    }

    @Put('units/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update unit' })
    updateUnit(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
        return this.mastersService.updateUnit(Number(id), dto);
    }

    @Delete('units/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Delete unit' })
    deleteUnit(@Param('id') id: string) {
        return this.mastersService.deleteUnit(Number(id));
    }

    // ========== CATEGORIES ==========
    @Post('categories')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create a category' })
    createCategory(@Body() dto: CreateCategoryDto) {
        return this.mastersService.createCategory(dto);
    }

    @Get('categories')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all categories' })
    findAllCategories() {
        return this.mastersService.findAllCategories();
    }

    @Get('categories/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get category by ID' })
    findOneCategory(@Param('id') id: string) {
        return this.mastersService.findOneCategory(Number(id));
    }

    @Put('categories/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update category' })
    updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.mastersService.updateCategory(Number(id), dto);
    }

    @Delete('categories/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Delete category' })
    deleteCategory(@Param('id') id: string) {
        return this.mastersService.deleteCategory(Number(id));
    }

    // ========== ITEMS ==========
    @Post('items')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create an item' })
    createItem(@Body() dto: CreateItemDto) {
        return this.mastersService.createItem(dto);
    }

    @Get('items')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all items with pagination' })
    findAllItems(@Query() query: ItemQueryDto) {
        return this.mastersService.findAllItems(query);
    }

    @Get('items/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get item by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOneItem(@Param('id') id: string) {
        return this.mastersService.findOneItem(BigInt(id));
    }

    @Put('items/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update item' })
    @ApiParam({ name: 'id', type: 'string' })
    updateItem(@Param('id') id: string, @Body() dto: UpdateItemDto) {
        return this.mastersService.updateItem(BigInt(id), dto);
    }

    @Delete('items/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Deactivate item' })
    @ApiParam({ name: 'id', type: 'string' })
    deleteItem(@Param('id') id: string) {
        return this.mastersService.deleteItem(BigInt(id));
    }

    // ========== SUPPLIERS ==========
    @Post('suppliers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create a supplier' })
    createSupplier(
        @Body() dto: CreateSupplierDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.createSupplier(dto, user.userId);
    }

    @Get('suppliers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all suppliers with pagination and optional price lists' })
    findAllSuppliers(@Query() query: SupplierQueryDto) {
        return this.mastersService.findAllSuppliers(query);
    }

    @Get('suppliers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get supplier by ID with optional price lists' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiQuery({ name: 'includePrices', required: false, type: 'boolean' })
    findOneSupplier(
        @Param('id') id: string,
        @Query('includePrices') includePrices?: string,
    ) {
        return this.mastersService.findOneSupplier(
            BigInt(id),
            includePrices === 'true',
        );
    }

    @Patch('suppliers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update supplier' })
    @ApiParam({ name: 'id', type: 'string' })
    updateSupplier(
        @Param('id') id: string,
        @Body() dto: UpdateSupplierDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.updateSupplier(BigInt(id), dto, user.userId);
    }

    @Patch('suppliers/:id/deactivate')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Deactivate supplier (soft delete)' })
    @ApiParam({ name: 'id', type: 'string' })
    deactivateSupplier(
        @Param('id') id: string,
        @Body() dto: DeactivateSupplierDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.deactivateSupplier(BigInt(id), dto, user.userId);
    }

    @Delete('suppliers/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Deactivate supplier (deprecated - use PATCH /suppliers/:id/deactivate)' })
    @ApiParam({ name: 'id', type: 'string' })
    deleteSupplier(@Param('id') id: string) {
        return this.mastersService.deleteSupplier(BigInt(id));
    }

    // ========== CUSTOMERS ==========
    @Post('customers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create a customer' })
    createCustomer(
        @Body() dto: CreateCustomerDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.createCustomer(dto, user.userId);
    }

    @Get('customers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all customers with pagination and optional price lists' })
    findAllCustomers(@Query() query: CustomerQueryDto) {
        return this.mastersService.findAllCustomers(query);
    }

    @Get('customers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get customer by ID with optional price lists' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiQuery({ name: 'includePrices', required: false, type: 'boolean' })
    findOneCustomer(
        @Param('id') id: string,
        @Query('includePrices') includePrices?: string,
    ) {
        return this.mastersService.findOneCustomer(
            BigInt(id),
            includePrices === 'true',
        );
    }

    @Patch('customers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update customer' })
    @ApiParam({ name: 'id', type: 'string' })
    updateCustomer(
        @Param('id') id: string,
        @Body() dto: UpdateCustomerDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.updateCustomer(BigInt(id), dto, user.userId);
    }

    @Patch('customers/:id/deactivate')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Deactivate customer (soft delete)' })
    @ApiParam({ name: 'id', type: 'string' })
    deactivateCustomer(
        @Param('id') id: string,
        @Body() dto: DeactivateCustomerDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.deactivateCustomer(BigInt(id), dto, user.userId);
    }

    @Delete('customers/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Deactivate customer (deprecated - use PATCH /customers/:id/deactivate)' })
    @ApiParam({ name: 'id', type: 'string' })
    deleteCustomer(@Param('id') id: string) {
        return this.mastersService.deleteCustomer(BigInt(id));
    }

    // ========== SUPPLIER ITEM PRICES ==========
    @Post('suppliers/:supplierId/prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Add a new price for supplier item' })
    @ApiParam({ name: 'supplierId', type: 'string' })
    createSupplierItemPrice(
        @Param('supplierId') supplierId: string,
        @Body() dto: CreateSupplierItemPriceDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.createSupplierItemPrice(
            BigInt(supplierId),
            dto,
            user.userId,
        );
    }

    @Get('suppliers/:supplierId/prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get supplier price list with filters' })
    @ApiParam({ name: 'supplierId', type: 'string' })
    findSupplierItemPrices(
        @Param('supplierId') supplierId: string,
        @Query() query: SupplierPriceQueryDto,
    ) {
        return this.mastersService.findSupplierItemPrices(BigInt(supplierId), query);
    }

    @Get('suppliers/:supplierId/prices/active/:itemId')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get active price for supplier + item combination' })
    @ApiParam({ name: 'supplierId', type: 'string' })
    @ApiParam({ name: 'itemId', type: 'string' })
    @ApiQuery({ name: 'asOfDate', required: false, description: 'Date for price lookup (YYYY-MM-DD)' })
    getSupplierActivePrice(
        @Param('supplierId') supplierId: string,
        @Param('itemId') itemId: string,
        @Query('asOfDate') asOfDate?: string,
    ) {
        const date = asOfDate ? new Date(asOfDate) : undefined;
        return this.mastersService.getSupplierActivePrice(
            BigInt(supplierId),
            BigInt(itemId),
            date,
        );
    }

    @Patch('suppliers/:supplierId/prices/:priceId')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update supplier item price' })
    @ApiParam({ name: 'supplierId', type: 'string' })
    @ApiParam({ name: 'priceId', type: 'string' })
    updateSupplierItemPrice(
        @Param('supplierId') supplierId: string,
        @Param('priceId') priceId: string,
        @Body() dto: UpdateSupplierItemPriceDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.updateSupplierItemPrice(
            BigInt(supplierId),
            BigInt(priceId),
            dto,
            user.userId,
        );
    }

    @Patch('suppliers/:supplierId/prices/:priceId/deactivate')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Deactivate supplier item price' })
    @ApiParam({ name: 'supplierId', type: 'string' })
    @ApiParam({ name: 'priceId', type: 'string' })
    deactivateSupplierItemPrice(
        @Param('supplierId') supplierId: string,
        @Param('priceId') priceId: string,
        @Body() dto: DeactivateSupplierPriceDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.deactivateSupplierItemPrice(
            BigInt(supplierId),
            BigInt(priceId),
            dto,
            user.userId,
        );
    }

    // ========== CUSTOMER ITEM PRICES ==========
    @Post('customers/:customerId/prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Add a new price for customer item' })
    @ApiParam({ name: 'customerId', type: 'string' })
    createCustomerItemPrice(
        @Param('customerId') customerId: string,
        @Body() dto: CreateCustomerItemPriceDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.createCustomerItemPrice(
            BigInt(customerId),
            dto,
            user.userId,
        );
    }

    @Get('customers/:customerId/prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get customer price list with filters' })
    @ApiParam({ name: 'customerId', type: 'string' })
    findCustomerItemPrices(
        @Param('customerId') customerId: string,
        @Query() query: CustomerPriceQueryDto,
    ) {
        return this.mastersService.findCustomerItemPrices(BigInt(customerId), query);
    }

    @Get('customers/:customerId/prices/active/:itemId')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get active price for customer + item combination' })
    @ApiParam({ name: 'customerId', type: 'string' })
    @ApiParam({ name: 'itemId', type: 'string' })
    @ApiQuery({ name: 'asOfDate', required: false, description: 'Date for price lookup (YYYY-MM-DD)' })
    getCustomerActivePrice(
        @Param('customerId') customerId: string,
        @Param('itemId') itemId: string,
        @Query('asOfDate') asOfDate?: string,
    ) {
        const date = asOfDate ? new Date(asOfDate) : undefined;
        return this.mastersService.getCustomerActivePrice(
            BigInt(customerId),
            BigInt(itemId),
            date,
        );
    }

    @Patch('customers/:customerId/prices/:priceId')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update customer item price' })
    @ApiParam({ name: 'customerId', type: 'string' })
    @ApiParam({ name: 'priceId', type: 'string' })
    updateCustomerItemPrice(
        @Param('customerId') customerId: string,
        @Param('priceId') priceId: string,
        @Body() dto: UpdateCustomerItemPriceDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.updateCustomerItemPrice(
            BigInt(customerId),
            BigInt(priceId),
            dto,
            user.userId,
        );
    }

    @Patch('customers/:customerId/prices/:priceId/deactivate')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Deactivate customer item price' })
    @ApiParam({ name: 'customerId', type: 'string' })
    @ApiParam({ name: 'priceId', type: 'string' })
    deactivateCustomerItemPrice(
        @Param('customerId') customerId: string,
        @Param('priceId') priceId: string,
        @Body() dto: DeactivateCustomerPriceDto,
        @CurrentUser() user: any,
    ) {
        return this.mastersService.deactivateCustomerItemPrice(
            BigInt(customerId),
            BigInt(priceId),
            dto,
            user.userId,
        );
    }
}
