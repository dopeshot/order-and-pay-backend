import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SSEHelper } from '../../test/helpers/sseWatcher.helper';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';

describe('SSE functionality', () => {
    let sseService: SseService;
    let sseController: SseController;

    beforeEach(async () => {
        sseService = new SseService();
        sseController = new SseController(sseService);
        // Disable Logger
        Logger.overrideLogger(['log', 'warn', 'debug', 'verbose']);
    });

    describe('get Observable', () => {
        it('should return an object', () => {
            const sseObject = sseService.subscribe('test');

            expect(sseObject).not.toBeNull();
        });
    });

    describe('should send data', () => {
        it('data should be received', async () => {
            const sseObject = sseService.subscribe('test');

            const helper = new SSEHelper(sseObject);

            // Trigger event
            await sseService.emit('test', {});

            expect(helper.calls).toBe(1);
        });
    });

    describe('order endpoint should be defined', () => {
        it('should return an observable', async () => {
            const res = await sseController.orderSSE();
            expect(res).toBeInstanceOf(Observable);
        });
    });
});
