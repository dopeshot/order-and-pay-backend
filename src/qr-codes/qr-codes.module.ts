import { Module } from '@nestjs/common';
import { TablesModule } from '../tables/tables.module';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';

@Module({
    controllers: [QrCodesController],
    providers: [QrCodesService],
    imports: [TablesModule]
})
export class QrCodesModule {}
