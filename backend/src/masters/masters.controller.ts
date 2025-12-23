import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MastersService } from './masters.service';
import {
    CreateUnitDto, UpdateUnitDto,
    CreateCategoryDto, UpdateCategoryDto,
    CreateItemDto, UpdateItemDto, ItemQueryDto,
    CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto,
    CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto,
    CreateSupplierItemPriceDto, UpdateSupplierItemPriceDto,
    CreateCustomerItemPriceDto, UpdateCustomerItemPriceDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
    createSupplier(@Body() dto: CreateSupplierDto) {
        return this.mastersService.createSupplier(dto);
    }

    @Get('suppliers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all suppliers with pagination' })
    findAllSuppliers(@Query() query: SupplierQueryDto) {
        return this.mastersService.findAllSuppliers(query);
    }

    @Get('suppliers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get supplier by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOneSupplier(@Param('id') id: string) {
        return this.mastersService.findOneSupplier(BigInt(id));
    }

    @Put('suppliers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update supplier' })
    @ApiParam({ name: 'id', type: 'string' })
    updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        return this.mastersService.updateSupplier(BigInt(id), dto);
    }

    @Delete('suppliers/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Deactivate supplier' })
    @ApiParam({ name: 'id', type: 'string' })
    deleteSupplier(@Param('id') id: string) {
        return this.mastersService.deleteSupplier(BigInt(id));
    }

    // ========== CUSTOMERS ==========
    @Post('customers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create a customer' })
    createCustomer(@Body() dto: CreateCustomerDto) {
        return this.mastersService.createCustomer(dto);
    }

    @Get('customers')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all customers with pagination' })
    findAllCustomers(@Query() query: CustomerQueryDto) {
        return this.mastersService.findAllCustomers(query);
    }

    @Get('customers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get customer by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOneCustomer(@Param('id') id: string) {
        return this.mastersService.findOneCustomer(BigInt(id));
    }

    @Put('customers/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update customer' })
    @ApiParam({ name: 'id', type: 'string' })
    updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.mastersService.updateCustomer(BigInt(id), dto);
    }

    @Delete('customers/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Deactivate customer' })
    @ApiParam({ name: 'id', type: 'string' })
    deleteCustomer(@Param('id') id: string) {
        return this.mastersService.deleteCustomer(BigInt(id));
    }

    // ========== SUPPLIER ITEM PRICES ==========
    @Post('supplier-prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create supplier item price' })
    createSupplierItemPrice(@Body() dto: CreateSupplierItemPriceDto) {
        return this.mastersService.createSupplierItemPrice(dto);
    }

    @Get('supplier-prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get supplier item prices' })
    @ApiQuery({ name: 'supplierId', required: false })
    @ApiQuery({ name: 'itemId', required: false })
    findSupplierItemPrices(
        @Query('supplierId') supplierId?: string,
        @Query('itemId') itemId?: string,
    ) {
        return this.mastersService.findSupplierItemPrices(supplierId, itemId);
    }

    @Put('supplier-prices/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update supplier item price' })
    @ApiParam({ name: 'id', type: 'string' })
    updateSupplierItemPrice(@Param('id') id: string, @Body() dto: UpdateSupplierItemPriceDto) {
        return this.mastersService.updateSupplierItemPrice(BigInt(id), dto);
    }

    // ========== CUSTOMER ITEM PRICES ==========
    @Post('customer-prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create customer item price' })
    createCustomerItemPrice(@Body() dto: CreateCustomerItemPriceDto) {
        return this.mastersService.createCustomerItemPrice(dto);
    }

    @Get('customer-prices')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get customer item prices' })
    @ApiQuery({ name: 'customerId', required: false })
    @ApiQuery({ name: 'itemId', required: false })
    findCustomerItemPrices(
        @Query('customerId') customerId?: string,
        @Query('itemId') itemId?: string,
    ) {
        return this.mastersService.findCustomerItemPrices(customerId, itemId);
    }

    @Put('customer-prices/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update customer item price' })
    @ApiParam({ name: 'id', type: 'string' })
    updateCustomerItemPrice(@Param('id') id: string, @Body() dto: UpdateCustomerItemPriceDto) {
        return this.mastersService.updateCustomerItemPrice(BigInt(id), dto);
    }
}
