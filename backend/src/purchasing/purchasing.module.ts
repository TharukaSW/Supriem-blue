import { Module } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { PdfService } from './pdf.service';
import {
  PurchasingController,
  PurchaseInvoicesController,
  PaymentsController,
} from './purchasing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    PurchasingController,
    PurchaseInvoicesController,
    PaymentsController,
  ],
  providers: [PurchasingService, PdfService],
  exports: [PurchasingService],
})
export class PurchasingModule {}
