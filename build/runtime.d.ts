export declare class ConnectedNode<ValueType = unknown> {
    #private;
    static getNode(value: any): HTMLElement | Text;
    constructor(value?: ValueType);
    set value(newValue: ValueType);
    connect(targetElement: Element, { replace }?: {
        replace?: boolean;
    }): this;
    disconnect(): this;
}
export declare class ContainedNodeArray extends Array {
    connectedElement: ParentNode | null;
    connect(element: Element, { replace }?: {
        replace?: boolean;
    }): void;
    disconnect(): void;
    push(...nodes: Node[]): number;
    slice(): never[];
    splice(start: number, deleteCount: number, ...items: Node[]): any[];
    unshift(): number;
    pop(): void;
}
type FromSignals<T> = T extends [Signal<infer Head>, ...infer Tail] ? [Head, ...FromSignals<Tail>] : T extends [Signal<infer Last>] ? [Last] : [];
export declare class Signal<ValueType = unknown> {
    #private;
    static with<T extends Signal[]>(...signals: T): Signal<FromSignals<T>>;
    constructor(value?: ValueType);
    get value(): ValueType;
    set value(newValue: ValueType);
    on(callback: (value: ValueType) => void): void;
    off(callback: (value: ValueType) => void): void;
    as<NewValueType>(callback: (value: ValueType) => NewValueType): Signal<NewValueType>;
    with<OtherSignalType>(otherSignal: Signal<OtherSignalType>): Signal<[ValueType, OtherSignalType]>;
    connect(element: Element, options?: {
        replace?: boolean;
    }): void;
    disconnect(): void;
    toString(): string | undefined;
}
export declare const html: (args_0: TemplateStringsArray, ...args_1: any[]) => ContainedNodeArray;
export declare const element: (args_0: TemplateStringsArray, ...args_1: any[]) => HTMLElement;
type StringWithHyphen = `${string}-${string}`;
type ComponentDefinitionFn = (options: {
    element: HTMLElement;
    render: (strings: TemplateStringsArray, ...rest: any[]) => void;
    refs: Record<string, Element>;
    attributes: Record<string, any>;
    context: Record<string, unknown>;
}) => void;
interface ComponentDefinitionOptions {
    getBaseClass?: () => typeof HTMLElement;
    getElementClass?: (ComponentClass: typeof HTMLElement) => typeof HTMLElement;
    elementRegistryOptions?: ElementDefinitionOptions;
}
export declare function registerComponent(name: StringWithHyphen, componentDefinition: ComponentDefinitionFn, options?: ComponentDefinitionOptions): void;
export {};
