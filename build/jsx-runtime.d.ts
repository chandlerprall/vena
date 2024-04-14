import { ComponentDefinition } from './runtime.js';
export declare const Fragment: unique symbol;
export declare function jsx(tagName: string | typeof Fragment, { children, ...attributes }: Record<string, any>): ComponentDefinition;
export declare const jsxs: typeof jsx;
