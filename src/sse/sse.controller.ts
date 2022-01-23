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
import { ENVGuard } from 'src/auth/strategies/env/environment.guard';
import { SseService } from './sse.service';

@Controller('subscribable')
export class SseController {
    constructor(private readonly sseService: SseService) {}

    @Sse('admin')
    adminSSE(@Param('eventlist') eventlist: string[]) {
        return this.sseService.subscribe('not done yet');
    }

    @Sse('client')
    clientSSE(@Query('order') order: string) {
        console.log('subscribung to ', order);
        return this.sseService.subscribe(order);
    }

    @Get('test')
    @UseGuards(ENVGuard)
    sendSse() {
        return this.sseService.emitTest('test', {
            data: 'sse me harder',
            type: 'test'
        });
    }

    @Get('order')
    @UseGuards(ENVGuard)
    orderTest() {
        return this.sseService.emitTest('aaaaaaaaaaaaaaaaaaaaaaaa', {
            data: 'this is a order',
            type: 'test'
        });
    }
}
