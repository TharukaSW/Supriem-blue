import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PurchasingService } from './purchasing.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, ConfirmPurchaseOrderDto, PurchaseQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Purchasing')
@ApiBearerAuth()
@Controller('purchasing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasingController {
    constructor(private readonly purchasingService: PurchasingService) { }

    @Post('orders')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create purchase order' })
    create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
        return this.purchasingService.create(dto, user.userId);
    }

    @Get('orders')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all purchase orders' })
    findAll(@Query() query: PurchaseQueryDto) {
        return this.purchasingService.findAll(query);
    }

    @Get('orders/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get purchase order by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOne(@Param('id') id: string) {
        return this.purchasingService.findOne(BigInt(id));
    }

    @Put('orders/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update purchase order' })
    @ApiParam({ name: 'id', type: 'string' })
    update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
        return this.purchasingService.update(BigInt(id), dto);
    }

    @Post('orders/:id/confirm')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Confirm purchase order and generate invoice' })
    @ApiParam({ name: 'id', type: 'string' })
    confirm(@Param('id') id: string, @Body() dto: ConfirmPurchaseOrderDto, @CurrentUser() user: any) {
        return this.purchasingService.confirm(BigInt(id), dto, user.userId);
    }

    @Post('orders/:id/cancel')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Cancel purchase order' })
    @ApiParam({ name: 'id', type: 'string' })
    cancel(@Param('id') id: string) {
        return this.purchasingService.cancel(BigInt(id));
    }
}
