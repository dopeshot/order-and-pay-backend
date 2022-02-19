import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { fromEvent, Observable } from 'rxjs';
import { readableOrder } from '../orders/responses/readable-order.response';
import { OrderEventType } from './enums/events.enum';

@Injectable()
export class SseService {
    private readonly logger = new Logger(SseService.name);
    private readonly emitter: EventEmitter;

    constructor() {
        // Inject some Service here and everything about SSE will stop to work.
        this.emitter = new EventEmitter();
    }

    subscribe(event: string): Observable<unknown> {
        // See here https://stackoverflow.com/questions/67202527/can-we-use-server-sent-events-in-nestjs-without-using-interval
        this.logger.debug(`New subscription to ${event}`);
        return fromEvent(this.emitter, event);
    }

    async emit(event, data) {
        this.logger.debug(`New event sent`);
        this.emitter.emit(event, { data });
    }

    async emitOrderEvent(type: OrderEventType, payload: readableOrder) {
        const data = {
            payload: {
                ...payload,
                tableId: payload.tableId.toString(),
                _id: payload._id.toString()
            },
            type: type
        };
        this.emitter.emit('order', { data });
    }
}
