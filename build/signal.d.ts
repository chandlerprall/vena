declare const SignalSource: unique symbol;
declare const SignalArray: unique symbol;
type SignalArrayType<T = Array<Signal<unknown>>> = T & {
    [SignalArray]: true;
};
type FromSignals<T> = T extends [Signal<infer Head>, ...infer Tail] ? [Head, ...FromSignals<Tail>] : T extends [Signal<infer Last>] ? [Last] : [];
export declare class Signal<T = any> {
    #private;
    static from<T extends Signal[]>(...signals: T): Signal<FromSignals<T>>;
    static signalValueArray<T extends Signal[]>(...signals: T): SignalArrayType<FromSignals<T>>;
    [SignalSource]: undefined | Signal | SignalArrayType;
    constructor(valueOrSignal?: T | Signal<T>, transform?: (value: unknown) => T);
    disconnectFromSource(): void;
    get dirty(): boolean;
    set dirty(isDirty: boolean);
    get value(): T;
    set value(valueOrSignal: T);
    on(listener: Signal | ((value: T) => void)): void;
    off(listener: Signal | ((value: T) => void)): void;
    map(transform: (value: unknown) => T): Signal<T>;
    toString(): string | undefined;
}
export declare function afterUpdates(fn: () => void): Promise<void>;
export {};