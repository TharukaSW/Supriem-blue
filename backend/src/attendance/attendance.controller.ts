import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
    AttendanceInOutDto, UpdateManualOtDto, AttendanceQueryDto,
    CreateSalaryRangeDto, UpdateSalaryRangeDto, UpdateEmployeeProfileDto,
    CreateSalaryPaymentDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Attendance & HR')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    // ========== ATTENDANCE ==========
    @Post('clock-in')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Clock in for employee' })
    clockIn(@Body() dto: AttendanceInOutDto, @CurrentUser() user: any) {
        return this.attendanceService.clockIn(dto, user.userId);
    }

    @Post('clock-out')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Clock out for employee' })
    clockOut(@Body() dto: AttendanceInOutDto, @CurrentUser() user: any) {
        return this.attendanceService.clockOut(dto, user.userId);
    }

    @Put(':id/manual-ot')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update manual OT hours' })
    @ApiParam({ name: 'id', type: 'string' })
    updateManualOt(@Param('id') id: string, @Body() dto: UpdateManualOtDto) {
        return this.attendanceService.updateManualOt(BigInt(id), dto);
    }

    @Get()
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all attendance records' })
    findAll(@Query() query: AttendanceQueryDto) {
        return this.attendanceService.findAllAttendance(query);
    }

    @Get('search')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Search employees for attendance' })
    @ApiQuery({ name: 'q', required: true })
    searchEmployees(@Query('q') q: string) {
        return this.attendanceService.searchEmployees(q);
    }

    // ========== SALARY RANGES ==========
    @Post('salary-ranges')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Create salary range' })
    createSalaryRange(@Body() dto: CreateSalaryRangeDto) {
        return this.attendanceService.createSalaryRange(dto);
    }

    @Get('salary-ranges')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all salary ranges' })
    findAllSalaryRanges() {
        return this.attendanceService.findAllSalaryRanges();
    }

    @Put('salary-ranges/:id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Update salary range' })
    @ApiParam({ name: 'id', type: 'string' })
    updateSalaryRange(@Param('id') id: string, @Body() dto: UpdateSalaryRangeDto) {
        return this.attendanceService.updateSalaryRange(BigInt(id), dto);
    }

    // ========== EMPLOYEE PROFILE ==========
    @Get('employees/:id/profile')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get employee profile with attendance summary' })
    @ApiParam({ name: 'id', type: 'string' })
    getEmployeeProfile(@Param('id') id: string) {
        return this.attendanceService.getEmployeeProfile(BigInt(id));
    }

    @Put('employees/:id/profile')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Update employee profile' })
    @ApiParam({ name: 'id', type: 'string' })
    updateEmployeeProfile(@Param('id') id: string, @Body() dto: UpdateEmployeeProfileDto) {
        return this.attendanceService.updateEmployeeProfile(BigInt(id), dto);
    }

    // ========== SALARY PAYMENTS ==========
    @Post('salary-payments')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Create salary payment' })
    createSalaryPayment(@Body() dto: CreateSalaryPaymentDto, @CurrentUser() user: any) {
        return this.attendanceService.createSalaryPayment(dto, user.userId);
    }
}
