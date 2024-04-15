import { ComponentDefinition } from "./runtime.js";
import { Signal } from "./signal";
export declare const Fragment: unique symbol;
export declare function jsx(tagName: keyof JSX.IntrinsicElements | typeof Fragment, { children, ...attributes }: Record<string, any>): ComponentDefinition;
export declare function jsxs(tagName: keyof JSX.IntrinsicElements | typeof Fragment, attributes: Record<string, any>): ComponentDefinition;
declare global {
    namespace JSX {
        type Signallable<T> = {
            [key in keyof T]: T[key] | Signal<T[key]>;
        };
        type HTMLAttributes<T> = Signallable<Partial<Omit<T, "children">> & Partial<GlobalEventHandlers>>;
        type MappedIntrinsicElements = {
            [Element in keyof HTMLElementTagNameMap]: HTMLAttributes<HTMLElementTagNameMap[Element]>;
        };
        interface IntrinsicElements extends MappedIntrinsicElements {
        }
        type Element = ComponentDefinition;
    }
}
