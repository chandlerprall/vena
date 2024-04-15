import { ComponentDefinition } from './runtime.js';
export declare const Fragment: unique symbol;
export declare function jsx(tagName: keyof JSXInternal.IntrinsicElements | typeof Fragment, { children, ...attributes }: Record<string, any>): ComponentDefinition;
export declare function jsxs(tagName: keyof JSXInternal.IntrinsicElements | typeof Fragment, attributes: Record<string, any>): ComponentDefinition;
declare namespace JSXInternal {
    type HTMLAttributes<T> = Partial<Omit<T, 'children'>> & Partial<GlobalEventHandlers>;
    type IntrinsicElements = {
        [Element in keyof HTMLElementTagNameMap]: HTMLAttributes<HTMLElementTagNameMap[Element]>;
    };
}
export declare namespace JSX {
    export import IntrinsicElements = JSXInternal.IntrinsicElements;
    type Element = ComponentDefinition;
}
export {};
