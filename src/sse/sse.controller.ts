import { Controller, Get, Sse, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENVGuard } from '../shared/guards/environment.guard';
import { SseService } from './sse.service';

@Controller('subscribable')
@ApiTags('sse')
export class SseController {
    constructor(private readonly sseService: SseService) {}

    @Sse('orders')
    @ApiOperation({ summary: 'SSE endpoints for orders' })
    orderSSE() {
        return this.sseService.subscribe('order');
    }

    @Get('test')
    @ApiOperation({ summary: 'Testing endpoint for dev only' })
    @UseGuards(ENVGuard)
    // Testing endpoint for dev only
    /* istanbul ignore next */
    testSse() {
        return this.sseService.emit('order', {
            data: 'sse me harder',
            type: 'test'
        });
    }
}
