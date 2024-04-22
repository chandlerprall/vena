declare const SignalSource: unique symbol;
declare const SignalArray: unique symbol;
type SignalArrayType<T = Array<Signal<unknown>>> = T & {
    [SignalArray]: true;
};
type FromSignals<T> = T extends [Signal<infer Head>, ...infer Tail] ? [Head, ...FromSignals<Tail>] : T extends [Signal<infer Last>] ? [Last] : [];
export declare class Signal<T = any> {
    #private;
    static from<T extends Array<Signal>>(...signals: T): Signal<FromSignals<T>>;
    static signalValueArray<T extends Signal[]>(...signals: T): SignalArrayType<FromSignals<T>>;
    [SignalSource]: undefined | Signal | SignalArrayType;
    constructor(valueOrSignal?: T | Signal<T>, transform?: (value: any) => T);
    disconnectFromSource(): void;
    get dirty(): boolean;
    set dirty(isDirty: boolean);
    get value(): T;
    set value(valueOrSignal: T);
    on(listener: Signal | ((value: T) => void), immediate?: boolean): void;
    off(listener: Signal | ((value: T) => void)): void;
    map<O>(transform: (value: T) => O): Signal<O>;
    toString(): string | undefined;
}
export declare function afterUpdates(fn?: () => void): Promise<void>;
declare class _ProxySignal<T extends object> extends Signal<T> {
    #private;
    static from<T extends Array<Signal>, O extends object>(transform: (values: FromSignals<T>) => O, ...signals: T): _ProxySignal<O>;
    constructor(base: T, transform?: (value: any) => T);
}
type ProxySignalProperties = 'on' | 'off' | 'map' | 'toString' | 'value' | 'dirty';
export declare const ProxySignal: {
    new <T extends object>(base: T): Signal<T> & Omit<T, ProxySignalProperties>;
    from<T extends Array<Signal>, O extends object>(transform: (values: FromSignals<T>) => O, ...signals: T): _ProxySignal<O>;
};
export {};
