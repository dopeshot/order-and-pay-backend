import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { fromEvent, Observable } from 'rxjs';
import { Order } from '../orders/entities/order.entity';
import { OrderEventType } from './enums/events.enum';

@Injectable()
export class SseService {
    private readonly emitter: EventEmitter;

    constructor() {
        // Inject some Service here and everything about SSE will stop to work.
        this.emitter = new EventEmitter();
    }

    subscribe(event: string): Observable<unknown> {
        // see here https://stackoverflow.com/questions/67202527/can-we-use-server-sent-events-in-nestjs-without-using-interval
        return fromEvent(this.emitter, event);
    }

    async emit(event, data) {
        this.emitter.emit(event, { data });
    }

    async emitOrderEvent(type: OrderEventType, payload: Order) {
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
