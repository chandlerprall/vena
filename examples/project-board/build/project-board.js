import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "vena/jsx-runtime";
import { registerComponent } from "vena";
import ProjectColumn from "./project-column.js";
export default registerComponent("project-board", ({ render }) => {
    render(_jsxs(_Fragment, { children: [_jsx("style", { children: `
			:host {
			  display: flex;
			  gap: calc(var(--token-spacing-base-unit, 8px) * 4);
			}
		  ` }), _jsxs(ProjectColumn, { children: [_jsx("span", { slot: "title", children: "Backlog" }), _jsx("span", { slot: "card", children: "Test" })] }), _jsxs(ProjectColumn, { children: [_jsx("span", { slot: "title", children: "In Progress" }), _jsx("span", { slot: "card", children: "Test" })] }), _jsxs(ProjectColumn, { children: [_jsx("span", { slot: "title", children: "Complete" }), _jsx("span", { slot: "card", children: "Test" })] })] }));
});
//# sourceMappingURL=project-board.js.map