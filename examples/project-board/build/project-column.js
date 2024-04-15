import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "vena/jsx-runtime";
import { registerComponent } from "vena";
export default registerComponent("project-column", ({ render }) => {
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
          background-color: var(--token-color-gutter);
          box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
        }

        ::slotted(:not(div)) {
          color: red;
        }
      ` }), _jsx("div", { className: "container", children: _jsx("slot", { name: "card" }) })] }));
});
//# sourceMappingURL=project-column.js.map