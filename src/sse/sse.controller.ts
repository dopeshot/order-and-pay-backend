import {
    Body,
    Controller,
    Get,
    Param,
    Query,
    Req,
    Sse,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENVGuard } from 'src/auth/strategies/env/environment.guard';
import { SseService } from './sse.service';

@Controller('subscribable')
@ApiTags('sse')
export class SseController {
    constructor(private readonly sseService: SseService) {}

    @Sse('admin')
    @ApiOperation({ summary: 'SSE endpoints for admins' })
    adminSSE(@Param('eventlist') eventlist: string[]) {
        return this.sseService.subscribe('not done yet');
    }

    @Sse('client')
    @ApiOperation({ summary: 'SSE endpoints for clients' })
    clientSSE(@Query('order') order: string) {
        console.log('subscribung to ', order);
        return this.sseService.subscribe(order);
    }

    @Get('test')
    @ApiOperation({ summary: 'testing endpoint for dev only' })
    @UseGuards(ENVGuard)
    sendSse() {
        return this.sseService.emitTest('test', {
            data: 'sse me harder',
            type: 'test'
        });
    }
}
