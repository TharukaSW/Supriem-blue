import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MastersModule } from '../masters/masters.module';

@Module({
    imports: [MastersModule],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
