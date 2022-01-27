import { Controller, Get, Sse, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENVGuard } from '../auth/strategies/env/environment.guard';
import { SseService } from './sse.service';

@Controller('subscribable')
@ApiTags('sse')
export class SseController {
    constructor(private readonly sseService: SseService) {}

    @Sse('orders')
    @ApiOperation({ summary: 'SSE endpoints for orders' })
    adminSSE() {
        return this.sseService.subscribe('order');
    }

    @Get('test')
    @ApiOperation({ summary: 'testing endpoint for dev only' })
    @UseGuards(ENVGuard)
    sendSse() {
        return this.sseService.emit('order', {
            data: 'sse me harder',
            type: 'test'
        });
    }
}
