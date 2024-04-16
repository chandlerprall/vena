import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "vena/jsx-runtime";
import { registerComponent } from "vena";
export default registerComponent("project-column", ({ render, attributes }) => {
    render(_jsxs(_Fragment, { children: [_jsx("style", { children: `
        :host {
          width: 100%;
          height: 100%;
        }

        .container {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          border-radius: 0.5rem;
          background-color: var(--token-color-gutter, #d9d9d9);
          box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
        }
        
        ::slotted([slot=title]) {
        	font-weight: bold;
        }
        
        ::slotted([slot=card]:not(div)) {
        	color: red;
        }
      ` }), _jsxs("div", { className: "container", children: [_jsx("slot", { name: "title" }), _jsx("slot", { name: "card" })] })] }));
});
//# sourceMappingURL=project-column.js.map