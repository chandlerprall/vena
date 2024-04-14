import { jsx as _jsx, jsxs as _jsxs } from "vena/jsx-runtime";
import { registerComponent } from 'vena';
registerComponent('jsx-app', ({ render, attributes, state }) => {
    const { count } = state({ count: 0 });
    render(_jsxs("div", { children: [_jsx("h1", { children: "Counter" }), _jsx("button", { onclick: () => count.value--, children: "-" }), _jsxs("span", { children: ["\u00A0", count, "\u00A0"] }), _jsx("button", { onclick: () => count.value++, children: "+" })] }));
});
//# sourceMappingURL=jsx-app.js.map