import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MastersModule } from './masters/masters.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { SalesModule } from './sales/sales.module';
import { ProductionModule } from './production/production.module';
import { FinanceModule } from './finance/finance.module';
import { AttendanceModule } from './attendance/attendance.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MastersModule,
    PurchasingModule,
    SalesModule,
    ProductionModule,
    FinanceModule,
    AttendanceModule,
    InvoicesModule,
    ReportsModule,
  ],
})
export class AppModule { }
