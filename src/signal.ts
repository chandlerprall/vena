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
  static from<T extends Signal[]>(...signals: T): Signal<FromSignals<T>> {
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
  #isPropagating = false;

  constructor(valueOrSignal?: T | Signal<T>, transform?: (value: unknown) => T) {
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

  on(listener: Signal | ((value: T) => void)){
    this.#listeners.push(listener);
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

  map(transform: (value: unknown) => T) {
    return new Signal(this, transform);
  }

  toString() {
    return this.#value?.toString();
  }
}

export function afterUpdates(fn: () => void) {
  if (fn) queueMicrotask(fn);
  return new Promise<void>(resolve => queueMicrotask(resolve));
}