import { ComponentDefinition } from "./runtime.js";
import { Signal } from "./signal";
export declare const Fragment: unique symbol;
export declare function jsx(tagName: keyof JSXInternal.IntrinsicElements | typeof Fragment, { children, ...attributes }: Record<string, any>): ComponentDefinition;
export declare function jsxs(tagName: keyof JSXInternal.IntrinsicElements | typeof Fragment, attributes: Record<string, any>): ComponentDefinition;
declare namespace JSXInternal {
    type Signallable<T> = {
        [key in keyof T]: T[key] | Signal<T[key]>;
    };
    type HTMLAttributes<T> = Signallable<Partial<Omit<T, "children">> & Partial<GlobalEventHandlers>>;
    type IntrinsicElements = {
        [Element in keyof HTMLElementTagNameMap]: HTMLAttributes<HTMLElementTagNameMap[Element]>;
    };
}
export declare namespace JSX {
    export import IntrinsicElements = JSXInternal.IntrinsicElements;
    type Element = ComponentDefinition;
}
export {};
