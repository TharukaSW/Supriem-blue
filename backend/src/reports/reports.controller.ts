import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get dashboard summary' })
    getDashboard() {
        return this.reportsService.getDashboardSummary();
    }

    @Get('sales')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get sales report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getSalesReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
        return this.reportsService.getSalesReport(fromDate, toDate);
    }

    @Get('purchases')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get purchases report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getPurchasesReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
        return this.reportsService.getPurchasesReport(fromDate, toDate);
    }

    @Get('production')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get production report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getProductionReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
        return this.reportsService.getProductionReport(fromDate, toDate);
    }

    @Get('stock')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get stock on hand report' })
    getStockReport() {
        return this.reportsService.getStockReport();
    }

    @Get('expenses')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get expenses report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getExpenseReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
        return this.reportsService.getExpenseReport(fromDate, toDate);
    }

    @Get('profit')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get profit report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getProfitReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
        return this.reportsService.getProfitReport(fromDate, toDate);
    }

    @Get('attendance')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get attendance & OT report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getAttendanceReport(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
        return this.reportsService.getAttendanceReport(fromDate, toDate);
    }
}
