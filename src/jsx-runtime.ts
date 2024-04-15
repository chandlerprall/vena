import { Attribute, Hydration, ComponentDefinition, processPart } from "./runtime.js";
import { Signal } from "./signal";

export const Fragment = Symbol("Fragment");

export function jsx(tagName: keyof JSX.IntrinsicElements | typeof Fragment, { children, ...attributes }: Record<string, any>): ComponentDefinition {
	const childs: any[] = (children = Array.isArray(children) ? children : [children]);

	const hydrations: Hydration[] = [];

	const attributeKeys = Object.keys(attributes);
	const parts: string[] = [];
	for (let i = 0; i < attributeKeys.length; i++) {
		let name = attributeKeys[i];
		if (name === "className") {
			name = "class";
		} else if (name === "htmlFor") {
			name = "for";
		}

		const value = attributes[name];

		const attribute: Attribute = {
			name,
			type: name.startsWith("on") ? "handler" : "attribute",
			asValue: (value: string) => `"${value}"`,
		};
		const part = processPart(value, attribute, hydrations);
		parts.push(`${name}=${part}`);
	}

	let startTag = "";
	let endTag = "";

	if (tagName === Fragment) {
		startTag = "";
		endTag = "";
	} else {
		startTag = `<${tagName} ${parts.join(" ")}>`;
		endTag = `</${tagName}>`;
	}

	return new ComponentDefinition(
		`${startTag}${childs
			.filter((child) => !!child)
			.map((child) => {
				if (child instanceof ComponentDefinition) {
					hydrations.push(...child.hydrations);
					return child.html;
				} else {
					return processPart(child, null, hydrations);
				}
			})
			.join("")}${endTag}`,
		hydrations
	);
}

export function jsxs(tagName: keyof JSX.IntrinsicElements | typeof Fragment, attributes: Record<string, any>): ComponentDefinition {
	return jsx(tagName, attributes);
}

declare global {
	namespace JSX {
		type Signallable<T> = {
			[key in keyof T]: T[key] | Signal<T[key]>;
		};
		type HTMLAttributes<T> = Signallable<Partial<Omit<T, "children">> & Partial<GlobalEventHandlers>>;

		export type MappedIntrinsicElements = {
			[Element in keyof HTMLElementTagNameMap]: HTMLAttributes<HTMLElementTagNameMap[Element]>;
		};
		export interface IntrinsicElements extends MappedIntrinsicElements {}

		export type Element = ComponentDefinition;
	}
}
