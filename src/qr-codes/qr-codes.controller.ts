import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Res,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { QrCodesService } from './qr-codes.service';

@ApiTags('qr-codes')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('qr-codes')
export class QrCodesController {
    constructor(private readonly qrService: QrCodesService) {}

    @Get(':id')
    async getQRCode(@Param() { id }: MongoIdDto, @Res() res: Response) {
        return res.render('qr-code', await this.qrService.getQRCode(id));
    }
}
