import { Controller, Get, Param, Query, Sse, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENVGuard } from '../auth/strategies/env/environment.guard';
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
        return this.sseService.subscribe(order);
    }

    @Get('test')
    @ApiOperation({ summary: 'testing endpoint for dev only' })
    @UseGuards(ENVGuard)
    sendSse() {
        return this.sseService.emitTest('not done yet', {
            data: 'sse me harder',
            type: 'test'
        });
    }
}
