import { Signal } from "./signal.js";
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
export declare const html: (args_0: TemplateStringsArray, ...args_1: any[]) => ContainedNodeArray;
export declare const ALL_ATTRIBUTES: unique symbol;
export declare const element: (args_0: TemplateStringsArray, ...args_1: any[]) => HTMLElement;
type StringWithHyphen = `${string}-${string}`;
type ComponentState = <T>(initialState: T) => {
    [key in keyof T]: Signal<T[key]>;
};
type ComponentDefinitionFn = (options: {
    element: HTMLElement;
    render: (strings: TemplateStringsArray, ...rest: any[]) => void;
    refs: Record<string, Element>;
    attributes: Record<string, any>;
    context: Record<string, unknown>;
    state: ComponentState;
}) => void;
interface ComponentDefinitionOptions {
    getBaseClass?: () => typeof HTMLElement;
    getElementClass?: (ComponentClass: typeof HTMLElement) => typeof HTMLElement;
    elementRegistryOptions?: ElementDefinitionOptions;
}
export declare function registerComponent(name: StringWithHyphen, componentDefinition: ComponentDefinitionFn, options?: ComponentDefinitionOptions): void;
export {};
