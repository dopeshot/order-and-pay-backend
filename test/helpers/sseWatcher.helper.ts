import { Observable } from 'rxjs';

export class SSEHelper {
    public calls: number = 0;
    public messages = [];
    sseObservable: Observable<any>;

    constructor(sse: Observable<any>) {
        this.sseObservable = sse;
        this.sseObservable.subscribe(this.callback.bind(this));
    }

    public reset() {
        this.calls = 0;
        this.messages = [];
    }

    private callback(data) {
        this.messages.push(data);
        this.calls++;
    }
}
