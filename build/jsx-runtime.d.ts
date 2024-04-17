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
        type HTMLAttributes<T> = Signallable<T & Partial<GlobalEventHandlers>> & {
            slot?: string | Signal<string>;
            style?: string | Partial<CSSStyleDeclaration> | Signal<string | Partial<CSSStyleDeclaration>>;
        };
        type _VenaIntrinsicElements = {
            [Element in keyof HTMLElementTagNameMap]: Partial<Omit<HTMLElementTagNameMap[Element], 'style'>>;
        };
        interface VenaIntrinsicElements extends _VenaIntrinsicElements {
        }
        type IntrinsicElements = {
            [Element in keyof VenaIntrinsicElements]: HTMLAttributes<VenaIntrinsicElements[Element]>;
        };
        type Element = ComponentDefinition;
    }
}
