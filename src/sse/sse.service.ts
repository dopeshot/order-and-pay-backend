import { Injectable, MessageEvent } from '@nestjs/common';
import { EventEmitter } from 'events';
import { fromEvent, merge, Observable, Subject } from 'rxjs';

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
        console.log(type);
        this.emitter.emit(type, { data });
    }
}
