export class DispatchQueue<T> {
    private _queue: T[];
    private _isProcessing: boolean;
    private _receiver: (item: T) => Promise<void>;

    constructor(receiver: (item: T) => Promise<void>) {
        this._queue = [];
        this._isProcessing = false;
        this._receiver = receiver;
    }

    get length() {
        return this._queue.length;
    }

    get isProcessing() {
        return this._isProcessing;
    }

    push(item: T) {
        this._queue.push(item);
        this._receive();
    }

    clear() {
        this._queue.length = 0;
    }

    async waitForIdle(): Promise<void> {
        // Keep waiting until processing is done AND queue is empty
        // Use a small delay to avoid busy waiting
        while (this._isProcessing || this._queue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 5));
        }
        // One more check after a short delay to catch any race conditions
        await new Promise((resolve) => setTimeout(resolve, 10));
    }

    private async _receive() {
        if (this._isProcessing) {
            // Skip if one is already executing.
            return;
        }

        this._isProcessing = true;
        let item;
        while ((item = this._queue.shift())) {
            await this._receiver(item);
        }
        this._isProcessing = false;
    }
}
