const SignalSource = Symbol('SignalSource');
const SignalArray = Symbol('SignalArray');
function isSignalArray(value) {
    return Array.isArray(value) && SignalArray in value;
}
function isSignalValue(value) {
    return value instanceof Signal || isSignalArray(value);
}
export class Signal {
    static from(...signals) {
        // @ts-expect-error
        return new Signal(Signal.signalValueArray(...signals));
    }
    static signalValueArray(...signals) {
        // @ts-expect-error
        signals[SignalArray] = true;
        // @ts-expect-error
        return signals;
    }
    [SignalSource];
    // @ts-expect-error TS doesn't approve of the indirection
    #value;
    #transform;
    #dirty = false;
    #listeners = [];
    #isPropagating = false;
    constructor(valueOrSignal, transform) {
        this.#transform = transform;
        if (isSignalValue(valueOrSignal)) {
            this.value = valueOrSignal;
        }
        else {
            this.#updateValue(valueOrSignal);
        }
    }
    disconnectFromSource() {
        if (this[SignalSource]) {
            if (isSignalArray(this[SignalSource])) {
                for (const signal of this[SignalSource]) {
                    signal.off(this);
                }
            }
            else {
                this[SignalSource].off(this);
            }
            this[SignalSource] = undefined;
        }
    }
    #updateValue(value) {
        this.#value = this.#transform ? this.#transform(value) : value;
    }
    get dirty() {
        return this.#dirty;
    }
    set dirty(isDirty) {
        this.#dirty = isDirty;
        if (isDirty) {
            this.#propagate();
        }
    }
    get value() {
        if (this.#dirty && isSignalValue(this[SignalSource])) {
            let value;
            if (Array.isArray(this[SignalSource])) {
                value = [];
                for (const signal of this[SignalSource]) {
                    value.push(signal.value);
                }
            }
            else {
                value = this[SignalSource].value;
            }
            this.#updateValue(value);
            this.#dirty = false;
        }
        return this.#value;
    }
    set value(valueOrSignal) {
        this.disconnectFromSource();
        if (isSignalValue(valueOrSignal)) {
            this[SignalSource] = valueOrSignal;
            this.#dirty = true;
            if (Array.isArray(valueOrSignal)) {
                for (const signal of valueOrSignal) {
                    signal.on(this);
                }
            }
            else {
                valueOrSignal.on(this);
            }
        }
        else {
            this.#updateValue(valueOrSignal);
        }
        this.#propagate();
    }
    on(listener) {
        this.#listeners.push(listener);
    }
    off(listener) {
        this.#listeners = this.#listeners.filter(l => l !== listener);
    }
    #propagate() {
        if (this.#listeners.length === 0)
            return;
        for (const listener of this.#listeners) {
            if (listener instanceof Signal) {
                listener.dirty = true;
            }
        }
        if (!this.#isPropagating) {
            this.#isPropagating = true;
            queueMicrotask(() => {
                for (const listener of this.#listeners) {
                    if (listener instanceof Signal === false) {
                        listener(this.value);
                    }
                }
                afterUpdates(() => {
                    this.#isPropagating = false;
                });
            });
        }
    }
    map(transform) {
        return new Signal(this, transform);
    }
    toString() {
        return this.#value?.toString();
    }
}
export function afterUpdates(fn) {
    if (fn)
        queueMicrotask(fn);
    return new Promise(resolve => queueMicrotask(resolve));
}
//# sourceMappingURL=signal.js.map