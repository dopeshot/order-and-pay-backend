import { Injectable, Logger } from '@nestjs/common';
import { Schema } from 'mongoose';
import * as QRCode from 'qrcode';
import { TableDocument } from '../tables/entities/table.entity';
import { TablesService } from '../tables/tables.service';
@Injectable()
export class QrCodesService {
    private readonly logger = new Logger(QrCodesService.name);
    constructor(private readonly tablesService: TablesService) {}

    async getQRCode(
        id: Schema.Types.ObjectId
    ): Promise<{ qrcode: string; tableURL: string; tableNumber: string }> {
        const table: TableDocument = await this.tablesService.findOne(id);
        const url =
            process.env.FRONTEND_URL + '/menu?table=' + table.tableNumber;

        const qr = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H' });
        this.logger.debug(`Generated QR Code for table ${table.tableNumber}`);
        return { qrcode: qr, tableURL: url, tableNumber: table.tableNumber };
    }
}
