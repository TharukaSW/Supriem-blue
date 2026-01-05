import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto, SalesQueryDto, CreateDispatchDto, DispatchQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    // ========== ORDERS ==========
    @Post('orders')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create sales order' })
    createOrder(@Body() dto: CreateSalesOrderDto, @CurrentUser() user: any) {
        return this.salesService.createOrder(dto, user.userId);
    }

    @Get('orders')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all sales orders' })
    findAllOrders(@Query() query: SalesQueryDto) {
        return this.salesService.findAllOrders(query);
    }

    @Get('orders/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get sales order by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOneOrder(@Param('id') id: string) {
        return this.salesService.findOneOrder(BigInt(id));
    }

    @Put('orders/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update sales order' })
    @ApiParam({ name: 'id', type: 'string' })
    updateOrder(@Param('id') id: string, @Body() dto: UpdateSalesOrderDto) {
        return this.salesService.updateOrder(BigInt(id), dto);
    }

    @Post('orders/:id/confirm')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Confirm sales order' })
    @ApiParam({ name: 'id', type: 'string' })
    confirmOrder(@Param('id') id: string, @CurrentUser() user: any) {
        return this.salesService.confirmOrder(BigInt(id), user.userId);
    }

    @Post('orders/:id/cancel')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Cancel sales order' })
    @ApiParam({ name: 'id', type: 'string' })
    cancelOrder(@Param('id') id: string) {
        return this.salesService.cancelOrder(BigInt(id));
    }

    // ========== DISPATCH ==========
    @Post('dispatches')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create dispatch' })
    createDispatch(@Body() dto: CreateDispatchDto, @CurrentUser() user: any) {
        return this.salesService.createDispatch(dto, user.userId);
    }

    @Get('dispatches')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all dispatches' })
    findAllDispatches(@Query() query: DispatchQueryDto) {
        return this.salesService.findAllDispatches(query);
    }

    @Get('dispatches/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get dispatch by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOneDispatch(@Param('id') id: string) {
        return this.salesService.findOneDispatch(BigInt(id));
    }

    @Post('dispatches/:id/deliver')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Mark dispatch as delivered' })
    @ApiParam({ name: 'id', type: 'string' })
    markDelivered(@Param('id') id: string) {
        return this.salesService.markDelivered(BigInt(id));
    }
}
