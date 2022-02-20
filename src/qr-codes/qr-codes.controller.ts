import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { QrCodesService } from './qr-codes.service';

@ApiTags('qr-codes')
@Controller('qr-codes')
export class QrCodesController {
    constructor(private readonly qrService: QrCodesService) {}

    @Get(':id')
    @ApiOperation({ summary: 'Endpoint to get the QR code for a table' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The qr code has been generated and rendered'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No table with this Id'
    })
    async getQRCode(@Param() { id }: MongoIdDto, @Res() res: Response) {
        return res.render('qr-code', await this.qrService.getQRCode(id));
    }
}
