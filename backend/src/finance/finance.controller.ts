import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, CreatePaymentDto, PaymentQueryDto, TransactionQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    // ========== EXPENSES ==========
    @Post('expenses')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create expense' })
    createExpense(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
        return this.financeService.createExpense(dto, user.userId);
    }

    @Get('expenses')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all expenses' })
    findAllExpenses(@Query() query: ExpenseQueryDto) {
        return this.financeService.findAllExpenses(query);
    }

    @Get('expenses/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get expense by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOneExpense(@Param('id') id: string) {
        return this.financeService.findOneExpense(BigInt(id));
    }

    @Put('expenses/:id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update expense' })
    @ApiParam({ name: 'id', type: 'string' })
    updateExpense(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
        return this.financeService.updateExpense(BigInt(id), dto);
    }

    // ========== PAYMENTS ==========
    @Post('payments')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create payment' })
    createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
        return this.financeService.createPayment(dto, user.userId);
    }

    @Get('payments')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all payments' })
    findAllPayments(@Query() query: PaymentQueryDto) {
        return this.financeService.findAllPayments(query);
    }

    // ========== TRANSACTIONS ==========
    @Get('transactions')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all cash transactions' })
    findAllTransactions(@Query() query: TransactionQueryDto) {
        return this.financeService.findAllTransactions(query);
    }

    // ========== PROFIT ==========
    @Get('profit')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get profit report' })
    @ApiQuery({ name: 'fromDate', required: false })
    @ApiQuery({ name: 'toDate', required: false })
    getProfitReport(
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ) {
        return this.financeService.getProfitReport(fromDate, toDate);
    }
}
