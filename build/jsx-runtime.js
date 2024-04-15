import { ComponentDefinition, processPart, ElementName, ElementIs } from "./runtime.js";
export const Fragment = Symbol("Fragment");
export function jsx(tagName, { children, ...attributes }) {
    const childs = (children = Array.isArray(children) ? children : [children]);
    const hydrations = [];
    const attributeKeys = Object.keys(attributes);
    const parts = [];
    for (let i = 0; i < attributeKeys.length; i++) {
        let name = attributeKeys[i];
        if (name === "className") {
            name = "class";
        }
        else if (name === "htmlFor") {
            name = "for";
        }
        const value = attributes[name];
        const attribute = {
            name,
            type: name.startsWith("on") ? "handler" : "attribute",
            asValue: (value) => `"${value}"`,
        };
        const part = processPart(value, attribute, hydrations);
        parts.push(`${name}=${part}`);
    }
    let startTag = "";
    let endTag = "";
    if (tagName === Fragment) {
        startTag = "";
        endTag = "";
    }
    else {
        const tagElement = customElements.get(tagName);
        if (tagElement && tagElement.hasOwnProperty(ElementName)) {
            tagName = tagElement[ElementName];
            if (tagElement.hasOwnProperty(ElementIs)) {
                const elementIs = tagElement[ElementIs];
                tagName = `${tagName} is="${elementIs}"`; // 🤫
            }
        }
        startTag = `<${tagName} ${parts.join(" ")}>`;
        endTag = `</${tagName}>`;
    }
    return new ComponentDefinition(`${startTag}${childs
        .filter((child) => !!child)
        .map((child) => {
        if (child instanceof ComponentDefinition) {
            hydrations.push(...child.hydrations);
            return child.html;
        }
        else {
            return processPart(child, null, hydrations);
        }
    })
        .join("")}${endTag}`, hydrations);
}
export function jsxs(tagName, attributes) {
    return jsx(tagName, attributes);
}
//# sourceMappingURL=jsx-runtime.js.map