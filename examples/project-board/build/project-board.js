import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "vena/jsx-runtime";
import { registerComponent } from "vena";
export default registerComponent("project-board", ({ render }) => {
    render(_jsxs(_Fragment, { children: [_jsx("style", { children: `
			slot[name=column] {
			  display: flex;
			  gap: calc(var(--token-spacing-base-unit, 8px) * 4);
			}
		  ` }), _jsx("slot", { name: "column" })] }));
});
//# sourceMappingURL=project-board.js.map