import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { fromEvent } from 'rxjs';
import { OrderEventType } from './enums/events.enum';
import { OrderSSEPayload } from './payloads/order.payload';

@Injectable()
export class SseService {
    private readonly emitter: EventEmitter;

    constructor() {
        // Inject some Service here and everything about SSE will stop to work.
        this.emitter = new EventEmitter();
    }

    subscribe(event: string) {
        // see here https://stackoverflow.com/questions/67202527/can-we-use-server-sent-events-in-nestjs-without-using-interval
        return fromEvent(this.emitter, event);
    }

    async emitTest(type, data) {
        this.emitter.emit(type, { data });
    }

    async emitOrderEvent(type: OrderEventType, payload: OrderSSEPayload) {
        this.emitter.emit(type, payload);
    }
}
