import { Observable } from 'rxjs';

export class SSEHelper {
    public calls: number = 0;
    sseObservable: Observable<any>;

    constructor(sse: Observable<any>) {
        this.sseObservable = sse;
        this.sseObservable.subscribe(this.callback.bind(this));
    }

    public reset() {
        this.calls = 0;
    }

    private callback() {
        this.calls++;
    }
}
