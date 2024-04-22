const SignalSource = Symbol('SignalSource');
const SignalArray = Symbol('SignalArray');

type SignalArrayType<T = Array<Signal<unknown>>> = T & { [SignalArray]: true }
type SignalValueType = Signal<unknown> | SignalArrayType;
function isSignalArray(value: unknown): value is SignalArrayType {
  return Array.isArray(value) && SignalArray in value;
}

function isSignalValue(value: unknown): value is SignalValueType {
  return value instanceof Signal || isSignalArray(value);
}


type FromSignals<T> = T extends [Signal<infer Head>, ...infer Tail] ? [Head, ...FromSignals<Tail>] : T extends [Signal<infer Last>] ? [Last] : [];
export class Signal<T = any> {
  static from<T extends Array<Signal>>(...signals: T): Signal<FromSignals<T>> {
    // @ts-expect-error
    return new Signal(Signal.signalValueArray(...signals));
  }

  static signalValueArray<T extends Signal[]>(...signals: T): SignalArrayType<FromSignals<T>> {
    // @ts-expect-error
    signals[SignalArray] = true;
    // @ts-expect-error
    return signals;
  }

  [SignalSource]: undefined | Signal | SignalArrayType;
  // @ts-expect-error TS doesn't approve of the indirection
  #value: T;
  #transform: undefined | ((value: unknown) => T);

  #dirty = false;
  #listeners: Array<Signal | ((value: T) => void)> = [];
  #propagation: Function | undefined;
  #isPropagating = false;

  constructor(valueOrSignal?: T | Signal<T>, transform?: (value: any) => T) {
    this.#transform = transform;

    if (isSignalValue(valueOrSignal)) {
      this.value = valueOrSignal;
    } else {
      this.#updateValue(valueOrSignal as T);
    }
  }

  disconnectFromSource() {
    if (this[SignalSource]) {
      if (isSignalArray(this[SignalSource])) {
        for (const signal of this[SignalSource]) {
          signal.off(this);
        }
      } else {
        this[SignalSource].off(this);
      }
      this[SignalSource] = undefined;
    }
  }

  #updateValue(value: T) {
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
      } else {
        value = this[SignalSource].value;
      }
      this.#updateValue(value as T);
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
      } else {
        valueOrSignal.on(this);
      }
    } else {
      this.#updateValue(valueOrSignal);
    }
    this.#propagate();
  }

  on(listener: Signal | ((value: T) => void), immediate = false) {
    this.#listeners.push(listener);
    if (immediate && !(listener instanceof Signal)) {
      listener(this.value);
    }
  }

  off(listener: Signal | ((value: T) => void)) {
    this.#listeners = this.#listeners.filter(l => l !== listener);
  }

  #propagate() {
    if (this.#listeners.length === 0) return;
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

  map<O>(transform: (value: T) => O) {
    return new Signal<O>(this as any as O, transform);
  }

  toString() {
    return this.#value?.toString();
  }
}

export function afterUpdates(fn?: () => void) {
  if (fn) queueMicrotask(fn);
  return new Promise<void>(resolve => queueMicrotask(resolve));
}

// @ts-expect-error
class _ProxySignal<T extends object> extends Signal<T> {
  static from<T extends Array<Signal>, O extends object>(transform: (values: FromSignals<T>) => O, ...signals: T): _ProxySignal<O> {
    // @ts-expect-error
    return new _ProxySignal(Signal.signalValueArray(...signals), transform);
  };

  #signal: Signal<T>;
  #isUpdating = false;

  constructor(base: T, transform?: (value: any) => T) {
    super(base, transform);

    this.#signal = new Signal(base, transform);
    const _this = this;

    // @ts-expect-error
    return new Proxy(
      base,
      {
        get(target, prop: string | ProxySignalProperties, receiver) {
          if (prop === 'on' || prop === 'off' || prop === 'map' || prop === 'toString') {
            return _this.#signal[prop].bind(_this.#signal);
          } else if (prop === 'value' || prop === 'dirty') {
            return _this.#signal[prop];
          }

          _this.#queueUpdate();
          const value = target[prop as keyof typeof target];
          if (typeof value === 'function') {
            return value.bind(target);
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
          target[prop as keyof T] = value;
          return true;
        },
        getPrototypeOf(target: T) {
          return Signal.prototype;
        }
      }
    )
  }

  #queueUpdate() {
    if (this.#isUpdating) return;
    this.#isUpdating = true;
    this.#signal.value = this.#signal.value;

    afterUpdates(() => {
      this.#isUpdating = false;
    });
  }
}

type ProxySignalProperties = 'on' | 'off' | 'map' | 'toString' | 'value' | 'dirty';
// @ts-expect-error
export const ProxySignal: {
  new <T extends object>(base: T): Signal<T> & Omit<T, ProxySignalProperties>;
  from<T extends Array<Signal>, O extends object>(transform: (values: FromSignals<T>) => O, ...signals: T): _ProxySignal<O>;
} = _ProxySignal;