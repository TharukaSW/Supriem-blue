import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { CreateProductionDayDto, UpdateProductionDayDto, ProductionQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Production')
@ApiBearerAuth()
@Controller('production')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductionController {
    constructor(private readonly productionService: ProductionService) { }

    @Post()
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create production day' })
    create(@Body() dto: CreateProductionDayDto, @CurrentUser() user: any) {
        return this.productionService.create(dto, user.userId);
    }

    @Get()
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get all production days' })
    findAll(@Query() query: ProductionQueryDto) {
        return this.productionService.findAll(query);
    }

    @Get(':id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Get production day by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOne(@Param('id') id: string) {
        return this.productionService.findOne(BigInt(id));
    }

    @Put(':id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update production day' })
    @ApiParam({ name: 'id', type: 'string' })
    update(@Param('id') id: string, @Body() dto: UpdateProductionDayDto) {
        return this.productionService.update(BigInt(id), dto);
    }
}
