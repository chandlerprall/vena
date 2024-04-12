import { Signal } from "./signal.js";
export class ConnectedNode {
    static getNode(value) {
        if (value instanceof HTMLElement) {
            return value;
        }
        return new Text(value);
    }
    #anchor = document.createComment("ConnectedNode anchor");
    #value = undefined;
    #valueNodes = [];
    constructor(value) {
        this.#value = value;
    }
    set value(newValue) {
        this.#value = newValue;
        this.#inject();
    }
    #removeValueNodes() {
        while (this.#valueNodes.length) {
            this.#valueNodes.pop()?.remove();
        }
    }
    #inject() {
        if (this.#anchor.parentNode == null)
            return;
        this.#removeValueNodes();
        const values = Array.isArray(this.#value) ? this.#value : [this.#value];
        let afterNode = this.#anchor;
        for (let i = 0; i < values.length; i++) {
            const valueNode = ConnectedNode.getNode(values[i]);
            this.#valueNodes.push(valueNode);
        }
        afterNode.after(...this.#valueNodes);
    }
    connect(targetElement, { replace } = {}) {
        this.disconnect();
        if (replace === true) {
            targetElement.replaceWith(this.#anchor);
        }
        else {
            targetElement.append(this.#anchor);
        }
        this.#inject();
        return this;
    }
    disconnect() {
        if (this.#anchor.parentNode != null) {
            this.#removeValueNodes();
            this.#anchor.remove();
        }
        return this;
    }
}
export class ContainedNodeArray extends Array {
    connectedElement = null;
    connect(element, { replace } = {}) {
        this.disconnect();
        if (replace) {
            this.connectedElement = element.parentNode;
        }
        else {
            this.connectedElement = element;
        }
        if (replace) {
            element.after(...this);
            element.remove();
        }
        else {
            this.connectedElement?.append(...this);
        }
        // @TODO: watch for changes to `length`
    }
    disconnect() {
        for (let i = 0; i < this.length; i++) {
            const node = this[i];
            node.remove();
        }
    }
    push(...nodes) {
        const result = super.push(...nodes);
        this.connectedElement?.append(...nodes);
        return result;
    }
    slice() {
        throw new Error("unimplemented");
        return [];
    }
    splice(start, deleteCount, ...items) {
        const removedElements = super.splice(start, deleteCount, ...items);
        if (this.connectedElement) {
            for (let i = 0; i < removedElements.length; i++) {
                this.connectedElement.removeChild(removedElements[i]);
            }
            // @TODO: if this ContainedNodeArray is empty and the connectedElement has other children,
            // this can insert element in the wrong place
            if (this.connectedElement.children.length === 0 || start === 0) {
                this.connectedElement.append(...items);
            }
            else {
                this[start - 1].after(...items);
            }
        }
        return removedElements;
    }
    unshift() {
        throw new Error("unimplemented");
        return 0;
    }
    pop() {
        throw new Error("unimplemented");
    }
}
const domParser = new window.DOMParser();
export const html = (...args) => {
    const { html, hydrate } = render(...args);
    const document = domParser.parseFromString(html, "text/html");
    hydrate(document.body);
    // @ts-ignore
    return new ContainedNodeArray(...document.body.childNodes);
};
let _id = 0;
const uniqueId = () => {
    return `_unique_id_${_id++}`;
};
function processPart(part, attribute, hydrations) {
    if (part instanceof Signal) {
        const id = uniqueId();
        if (attribute) {
            if (attribute.type === "handler") {
                hydrations.push({ type: "handler", part, id, eventName: attribute.name });
            }
            else {
                magicBagOfHolding[id] = part;
                hydrations.push({ type: "attribute", attribute, part, id });
            }
            return attribute.asValue(id);
        }
        else {
            hydrations.push({ type: "dom", part, id });
            return `<data id="${id}"></data>`;
        }
    }
    else if (part && typeof part === "object" && ATTRIBUTE_MAP in part) {
        const id = uniqueId();
        hydrations.push({ type: "attributemap", part: part, id });
        return `data-attribute-map=${id}`;
    }
    else if (part instanceof ContainedNodeArray) {
        const id = uniqueId();
        hydrations.push({ type: "dom", part, id });
        return `<data id="${id}"></data>`;
    }
    else if (part instanceof Function) {
        if (attribute) {
            const id = uniqueId();
            if (attribute?.type === "handler") {
                hydrations.push({ type: "handler", part: part, id, eventName: attribute.name });
            }
            else {
                magicBagOfHolding[id] = part;
                hydrations.push({ type: "attribute", attribute, part, id });
            }
            return attribute.asValue(id);
        }
        return `${part}`;
    }
    else if (part instanceof HTMLElement) {
        const id = uniqueId();
        magicBagOfHolding[id] = part;
        hydrations.push({ type: "element", part, id });
        return `<data id="${id}"></data>`;
    }
    else if (Array.isArray(part)) {
        if (attribute) {
            const id = uniqueId();
            magicBagOfHolding[id] = part;
            hydrations.push({ type: "attribute", attribute, part, id });
            return attribute.asValue(id);
        }
        else {
            return part.map((part) => processPart(part, attribute, hydrations)).join("");
        }
    }
    else if (attribute) {
        if (typeof part === "boolean" || part === "true" || part === "false" || part == null) {
            const id = uniqueId();
            hydrations.push({ type: "booleanattribute", attribute, part, id });
            return attribute.asValue(id);
        }
        else if (typeof part === "object" || Array.isArray(part)) {
            const id = uniqueId();
            magicBagOfHolding[id] = part;
            hydrations.push({ type: "attribute", attribute, part, id });
            return attribute.asValue(id);
        }
        return attribute.asValue(`${part}`);
    }
    return typeof part === "string" ? part : `${part}`;
}
class ComponentDefinition {
    html;
    hydrate;
    constructor(html, hydrate) {
        this.html = html;
        this.hydrate = hydrate;
    }
}
function getAttributeForExpression(prevString) {
    const isQuoted = prevString.at(-1) === '"' && prevString.at(-2) === "=";
    if (!isQuoted && prevString.at(-1) !== "=")
        return null;
    let attribute = "";
    for (let i = prevString.length - (isQuoted ? 3 : 2); i >= 0; i--) {
        const char = prevString.at(i);
        if (char && char.match(/\S/)) {
            attribute = char + attribute;
        }
        else {
            break;
        }
    }
    return {
        name: attribute,
        type: attribute.startsWith("on") ? "handler" : "attribute",
        asValue: (value) => (isQuoted ? value : `"${value}"`),
    };
}
const ATTRIBUTE_MAP = Symbol("attribute map");
const definedElements = new Map();
const liveElements = new Map();
const magicBagOfHolding = {};
// @ts-ignore
window.magicBagOfHolding = magicBagOfHolding;
const collectValue = (id) => {
    const value = magicBagOfHolding[id];
    delete magicBagOfHolding[id];
    return value;
};
const render = (strings = [""], ...rest) => {
    const hydrations = [];
    const allParts = [...strings];
    for (let i = 0; i < rest.length; i++) {
        const attribute = getAttributeForExpression(strings[i]);
        const part = processPart(rest[i], attribute, hydrations);
        allParts.splice(i * 2 + 1, 0, part);
    }
    const lines = allParts.join("").split(/[\r\n]+/g);
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
    }
    const html = lines.join("\n");
    const hydrate = (owningElement) => {
        // @TODO: the fallbacks to owningElement to handle when handler is on the top-level node from element``,
        //  this means we're not 100% tied to the IDs
        for (const hydration of hydrations) {
            const { type } = hydration;
            if (type === "dom") {
                const { id, part } = hydration;
                const dataNode = owningElement.shadowRoot?.querySelector(`[id="${id}"]`) ?? owningElement.querySelector(`[id="${id}"]`) ?? owningElement;
                if (part instanceof ContainedNodeArray) {
                    part.connect(dataNode, { replace: true });
                }
                else {
                    const connectedNode = new ConnectedNode(part.value);
                    part.on(nextValue => connectedNode.value = nextValue);
                    connectedNode.connect(dataNode, { replace: true });
                }
            }
            else if (type === "element") {
                const { id, part } = hydration;
                const dataNode = owningElement.shadowRoot?.querySelector(`[id="${id}"]`) ?? owningElement.querySelector(`[id="${id}"]`) ?? owningElement;
                dataNode.before(part);
                dataNode.remove();
            }
            else if (type === "attribute") {
                const { id, attribute, part } = hydration;
                const element = owningElement.shadowRoot?.querySelector(`[${attribute.name}="${id}"]`) ?? owningElement.querySelector(`[${attribute.name}="${id}"]`) ?? owningElement;
                const elementTagLower = element.tagName.toLowerCase();
                if (attribute.name === "style") {
                    element.removeAttribute("style");
                    function applyStyleObject(element, style) {
                        if (style != null && typeof style === "object") {
                            for (const key in style) {
                                element.style[key] = style[key];
                            }
                        }
                        else {
                            console.error("style attribute must be an object or Signal, received:", style);
                        }
                    }
                    if (part instanceof Signal) {
                        // @TODO: un-apply previous styles from this signal
                        part.on((nextValue) => {
                            applyStyleObject(element, nextValue);
                        });
                        applyStyleObject(element, part.value);
                    }
                    else {
                        applyStyleObject(element, part);
                    }
                }
                else if (definedElements.has(elementTagLower)) {
                    // element came from us and already has the attribute set to the id
                }
                else {
                    // we are in charge of managing the attribute value
                    if (part instanceof Signal) {
                        const updateAttribute = () => {
                            if ((element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement) && attribute.name === "value") {
                                element.value = part.value;
                            }
                            else {
                                if (part.value === false || part.value == null) {
                                    element.removeAttribute(attribute.name);
                                }
                                else {
                                    element.setAttribute(attribute.name, part.value);
                                }
                            }
                        };
                        part.on(updateAttribute);
                        updateAttribute();
                        // if this element could be a custom element, when it's defined we may yield control of the attribute to the component itself
                        if (elementTagLower.indexOf("-") !== -1) {
                            customElements.whenDefined(elementTagLower).then(() => {
                                if (definedElements.has(elementTagLower) === false)
                                    return; // don't swap out if we don't control the element
                                part.off(updateAttribute);
                                element.setAttribute(attribute.name, hydration.id);
                            });
                        }
                    }
                    else {
                        element.setAttribute(attribute.name, `${part}`);
                        // if this element could be a custom element, when it's defined we may yield control of the attribute to the component itself
                        if (elementTagLower.indexOf("-") !== -1) {
                            customElements.whenDefined(elementTagLower).then(() => {
                                if (definedElements.has(elementTagLower) === false)
                                    return; // don't swap out if we don't control the element
                                element.setAttribute(attribute.name, hydration.id);
                            });
                        }
                    }
                }
            }
            else if (type === "booleanattribute") {
                const { id, attribute, part } = hydration;
                const element = owningElement.shadowRoot?.querySelector(`[${attribute.name}="${id}"]`) ?? owningElement.querySelector(`[${attribute.name}="${id}"]`) ?? owningElement;
                if (!part) {
                    element.removeAttribute(attribute.name);
                }
                else {
                    element.setAttribute(attribute.name, "");
                }
            }
            else if (type === "attributemap") {
                // @TODO: garbage collection
                const { part: { [ATTRIBUTE_MAP]: publisher, ...part }, id, } = hydration;
                const updateAttributes = () => {
                    for (const attributeName in part) {
                        const targetElement = owningElement.shadowRoot?.querySelector(`[data-attribute-map="${id}"]`) ?? owningElement.querySelector(`[data-attribute-map="${id}"]`) ?? owningElement;
                        if (typeof part[attributeName].value === "string") {
                            targetElement.setAttribute(attributeName, part[attributeName].value);
                        }
                        else {
                            // @TODO: is this encounterable?
                            console.error(`unimplemented case for attribute ${attributeName} in attributemap::updateAttributes`);
                        }
                    }
                };
                updateAttributes();
                publisher.on(() => updateAttributes());
            }
            else if (type === "handler") {
                const { id, eventName, part } = hydration;
                const listenerEvent = eventName.replace(/^on/, "").toLowerCase();
                const targetElement = owningElement.shadowRoot?.querySelector(`[${eventName}="${id}"]`) ?? owningElement.querySelector(`[${eventName}="${id}"]`) ?? owningElement;
                targetElement.removeAttribute(eventName);
                if (part instanceof Signal) {
                    let currentListener = part.value;
                    if (currentListener) {
                        targetElement.addEventListener(listenerEvent, currentListener);
                    }
                    part.on((nextListener) => {
                        targetElement.removeEventListener(listenerEvent, currentListener);
                        if (nextListener) {
                            targetElement.addEventListener(listenerEvent, nextListener);
                        }
                        currentListener = nextListener;
                    });
                }
                else {
                    targetElement.addEventListener(listenerEvent, part);
                }
            }
        }
    };
    return new ComponentDefinition(html, hydrate);
};
export const element = (...args) => {
    const { html, hydrate } = render(...args);
    const parsingNode = document.createElement("div");
    parsingNode.innerHTML = html;
    const element = parsingNode.firstElementChild;
    parsingNode.innerHTML = "";
    hydrate(element);
    return element;
};
// https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#elements_you_can_attach_a_shadow_to
const tagNamesThatSupportShadowRoot = new Set(["ARTICLE", "ASIDE", "BLOCKQUOTE", "BODY", "DIV", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "MAIN", "NAV", "P", "SECTION", "SPAN"]);
const elementToContextMap = new WeakMap();
const getElementContext = (element) => {
    let elementContext;
    if (elementToContextMap.has(element)) {
        elementContext = elementToContextMap.get(element);
    }
    else {
        elementContext = {};
        elementToContextMap.set(element, elementContext);
    }
    return elementContext;
};
export function registerComponent(name, componentDefinition, options = {}) {
    if (definedElements.has(name)) {
        definedElements.set(name, componentDefinition);
        const elements = Array.from(liveElements.get(name));
        console.log("updating", name);
        for (let i = 0; i < elements.length; i++) {
            elements[i].initialize();
        }
        return;
    }
    const { getBaseClass, getElementClass, elementRegistryOptions } = options;
    definedElements.set(name, componentDefinition);
    liveElements.set(name, new Set());
    const BaseClass = getBaseClass?.() ?? HTMLElement;
    const ComponentClass = class extends BaseClass {
        attributeValues = new Proxy({ [ATTRIBUTE_MAP]: new Signal(0) }, {
            set: (target, key, value) => {
                this.attributeValues[key].value = value;
                target[ATTRIBUTE_MAP].value++;
                return true;
            },
            get: (target, key) => {
                if (key in target === false) {
                    target[key] = new Signal();
                }
                return target[key];
            },
        });
        refs = {};
        constructor() {
            super();
            liveElements.get(name).add(this);
            for (const attributeName of this.getAttributeNames()) {
                if (attributeName.startsWith("on"))
                    continue;
                const attributeValue = this.getAttribute(attributeName);
                this.#attachAttribute(attributeName, attributeValue);
            }
            const mutationObserver = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                    const mutation = mutations[i];
                    if (mutation.type !== "attributes")
                        continue;
                    const { attributeName } = mutation;
                    if (attributeName) {
                        const value = this.getAttribute(attributeName);
                        this.#attachAttribute(attributeName, value);
                    }
                }
            });
            mutationObserver.observe(this, { attributes: true, attributeOldValue: true });
            // only autonomous custom elements & a short list of native elements support shadow roots
            if (tagNamesThatSupportShadowRoot.has(this.tagName) || this.tagName.includes("-")) {
                this.attachShadow({
                    mode: "open",
                });
            }
            else {
                // a shadow root, so we need to catch the error and fallback to using the element itself
                Object.defineProperty(this, "shadowRoot", { value: this });
            }
            // this.initialize();
        }
        connectedCallback() {
            this.initialize();
        }
        disconnectedCallback() {
            liveElements.get(name).delete(this);
        }
        #attachAttribute(attributeName, value) {
            if (!this.attributeValues.hasOwnProperty(attributeName)) {
                this.attributeValues[attributeName] = new Signal();
            }
            if (value?.match(/^_unique_id_\d+/)) {
                // @TODO: garbage collection (call off on component disconnectedCallback?)
                const data = collectValue(value);
                if (data instanceof Signal) {
                    data.on((nextValue) => {
                        this.attributeValues[attributeName] = nextValue;
                    });
                    this.attributeValues[attributeName].on((nextValue) => {
                        data.value = nextValue;
                    });
                    this.attributeValues[attributeName].value = data.value;
                }
                else {
                    this.attributeValues[attributeName].value = data;
                }
            }
            else {
                this.attributeValues[attributeName].value = value;
            }
        }
        state = {};
        initialize() {
            const element = this;
            const componentDefinition = definedElements.get(name);
            const context = new Proxy({}, {
                get(target, key) {
                    let currentElement = element.parentElement;
                    while (currentElement) {
                        const elementContext = getElementContext(currentElement);
                        if (elementContext[key] !== undefined) {
                            return elementContext[key];
                        }
                        currentElement = currentElement.parentElement;
                    }
                },
                set(target, key, value) {
                    getElementContext(element)[key] = value;
                    return true;
                },
            });
            const componentState = this.state;
            const stateFn = (initialState) => {
                for (const key in initialState) {
                    if (componentState.hasOwnProperty(key) === false) {
                        componentState[key] = new Signal(initialState[key]);
                    }
                }
                return componentState;
            };
            const state = new Proxy(stateFn, {
                get(target, key) {
                    if (target.hasOwnProperty(key)) {
                        return componentState[key];
                    }
                    const signal = new Signal();
                    componentState[key] = signal;
                    return signal;
                },
                set(target, key, value) {
                    const state = componentState[key];
                    state.value = value;
                    return true;
                },
            });
            // @TODO: alert component definition on unmount
            componentDefinition({
                element: this,
                render: (...args) => {
                    const { html, hydrate } = render(...args);
                    (this.shadowRoot ?? this).innerHTML = html;
                    hydrate(this);
                    // bind elements to refs
                    // @TODO: this doesn't catch dom changes, should we use a mutation observer
                    const elementsWithIds = (this.shadowRoot ?? this).querySelectorAll("[id]");
                    for (let i = 0; i < elementsWithIds.length; i++) {
                        const element = elementsWithIds[i];
                        const id = element.id;
                        this.refs[id] = element;
                    }
                },
                refs: this.refs,
                attributes: this.attributeValues,
                context,
                // @ts-expect-error
                state,
            });
        }
        emit(eventName, detail) {
            return this.dispatchEvent(new CustomEvent(`${name}-${eventName}`, {
                composed: true,
                bubbles: true,
                cancelable: true,
                detail,
            }));
        }
    };
    Object.defineProperty(ComponentClass, "name", { value: name });
    const elementClass = getElementClass?.(ComponentClass) ?? ComponentClass;
    customElements.define(name, elementClass, elementRegistryOptions);
}
//# sourceMappingURL=runtime.js.map