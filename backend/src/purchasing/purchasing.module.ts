import { Module } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { PurchasingController } from './purchasing.controller';
import { MastersModule } from '../masters/masters.module';

@Module({
    imports: [MastersModule],
    controllers: [PurchasingController],
    providers: [PurchasingService],
    exports: [PurchasingService],
})
export class PurchasingModule { }
