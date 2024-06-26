import { Signal } from './signal';
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
export declare function processPart(part: unknown, attribute: Attribute | null, hydrations: Hydration[]): string;
export declare class ComponentDefinition {
    html: string;
    hydrations: Hydration[];
    constructor(html: string, hydrations: Hydration[]);
}
export interface Attribute {
    name: string;
    type: 'handler' | 'attribute';
    asValue: (value: string) => string;
}
export declare const ALL_ATTRIBUTES: unique symbol;
interface DOMHydration {
    type: 'dom';
    id: string;
    part: Signal | ContainedNodeArray;
}
interface AttributeHydration {
    type: 'attribute';
    id: string;
    part: unknown;
    attribute: Attribute;
}
interface BooleanAttributeHydration {
    type: 'booleanattribute';
    id: string;
    part: boolean | 'true' | 'false' | null | undefined;
    attribute: Attribute;
}
type AttributeMapPart = {
    [ALL_ATTRIBUTES]: Signal<Record<string, unknown>>;
    [key: string]: any;
};
interface AttributeMapHydration {
    type: 'attributemap';
    id: string;
    part: AttributeMapPart;
}
interface HandlerHydration {
    type: 'handler';
    id: string;
    part: EventListener | Signal<EventListener | null | undefined>;
    eventName: string;
}
interface ElementHydration {
    type: 'element';
    id: string;
    part: HTMLElement;
}
export type Hydration = DOMHydration | AttributeHydration | BooleanAttributeHydration | AttributeMapHydration | HandlerHydration | ElementHydration;
export declare function hydrate(owningElement: HTMLElement, hydrations: Hydration[]): void;
export declare const element: (args_0: TemplateStringsArray | ComponentDefinition, ...args_1: any[]) => HTMLElement;
declare global {
    namespace Vena {
        interface Context {
        }
        interface Elements {
        }
    }
}
type ComponentState = <T>(initialState: T) => {
    [key in keyof T]: Signal<T[key]>;
};
type ComponentDefinitionFn<T extends keyof Vena.Elements> = (options: {
    element: HTMLElement;
    render: (strings: TemplateStringsArray | ComponentDefinition, ...rest: any[]) => void;
    refs: Record<string, Element>;
    attributes: {
        [key in keyof Vena.Elements[T]]: Signal<Vena.Elements[T]>;
    };
    context: {
        [key in keyof Vena.Context]: Vena.Context[key];
    };
    state: ComponentState;
    emit: (eventName: string, detail: unknown) => boolean;
}) => void;
interface ComponentDefinitionOptions {
    getBaseClass?: () => typeof HTMLElement;
    getElementClass?: (ComponentClass: typeof HTMLElement) => typeof HTMLElement;
    elementRegistryOptions?: ElementDefinitionOptions;
}
export declare const ElementName: unique symbol;
export declare const ElementIs: unique symbol;
export declare function registerComponent<T extends keyof Vena.Elements>(name: T, componentDefinition: ComponentDefinitionFn<T>, options?: ComponentDefinitionOptions): T;
export {};
