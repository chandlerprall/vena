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
    #propagation;
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
    on(listener, immediate = false) {
        this.#listeners.push(listener);
        if (immediate && !(listener instanceof Signal)) {
            listener(this.value);
        }
    }
    off(listener) {
        this.#listeners = this.#listeners.filter((l) => l !== listener);
    }
    offAll() {
        this.#listeners = [];
    }
    #propagate() {
        if (this.#listeners.length === 0)
            return;
        for (const listener of this.#listeners) {
            if (listener instanceof Signal) {
                listener.dirty = true;
            }
        }
        if (this.#isPropagating) {
            console.warn('Signal loop detected in signal', this);
        }
        if (!this.#propagation) {
            queueMicrotask(() => this.#propagation?.());
        }
        const currentListeners = [...this.#listeners];
        this.#propagation = () => {
            this.#isPropagating = true;
            for (const listener of currentListeners) {
                if (!(listener instanceof Signal)) {
                    listener(this.value);
                }
            }
            afterUpdates(() => {
                this.#propagation = undefined;
                this.#isPropagating = false;
            });
        };
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
    return new Promise((resolve) => queueMicrotask(resolve));
}
// @ts-expect-error
class _ProxySignal extends Signal {
    static from(transform, ...signals) {
        // @ts-expect-error
        return new _ProxySignal(Signal.signalValueArray(...signals), transform);
    }
    #signal;
    #isUpdating = false;
    constructor(base, transform) {
        super(base, transform);
        this.#signal = new Signal(base, transform);
        const _this = this;
        // @ts-expect-error
        return new Proxy(base, {
            get(target, prop, receiver) {
                if (prop === 'on' || prop === 'off' || prop === 'map' || prop === 'toString') {
                    return _this.#signal[prop].bind(_this.#signal);
                }
                else if (prop === 'value' || prop === 'dirty') {
                    return _this.#signal[prop];
                }
                _this.#queueUpdate();
                const value = _this.#signal.value[prop];
                // const value = target[prop as keyof typeof target];
                if (typeof value === 'function') {
                    return value.bind(_this.#signal.value);
                }
                return value;
            },
            set(target, prop, value, receiver) {
                if (prop === 'value' || prop === 'dirty') {
                    // @ts-expect-error
                    _this.#signal[prop] = value;
                    return true;
                }
                _this.#queueUpdate();
                _this.#signal.value[prop] = value;
                return true;
            },
            getPrototypeOf(target) {
                return Signal.prototype;
            },
        });
    }
    #queueUpdate() {
        if (this.#isUpdating)
            return;
        this.#isUpdating = true;
        this.#signal.dirty = true;
        afterUpdates(() => {
            this.#isUpdating = false;
        });
    }
}
// @ts-expect-error
export const ProxySignal = _ProxySignal;
//# sourceMappingURL=signal.js.map