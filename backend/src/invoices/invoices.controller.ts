import { Controller, Get, Put, Param, Query, Res, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { InvoiceQueryDto, UpdateInvoiceMatchDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all invoices' })
    findAll(@Query() query: InvoiceQueryDto) {
        return this.invoicesService.findAll(query);
    }

    @Get(':id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get invoice by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(BigInt(id));
    }

    @Put(':id/match')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update vendor invoice matching' })
    @ApiParam({ name: 'id', type: 'string' })
    updateMatch(@Param('id') id: string, @Body() dto: UpdateInvoiceMatchDto, @CurrentUser() user: any) {
        return this.invoicesService.updateMatch(BigInt(id), dto, user.userId);
    }

    @Get(':id/pdf')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Download invoice PDF' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiQuery({ name: 'template', required: false, enum: ['DOT_MATRIX', 'A4'] })
    async downloadPdf(
        @Param('id') id: string,
        @Query('template') template: 'DOT_MATRIX' | 'A4' = 'DOT_MATRIX',
        @Res() res: Response,
    ) {
        const pdfBuffer = await this.invoicesService.generatePdf(BigInt(id), template);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }
}
