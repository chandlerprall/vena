import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "vena/jsx-runtime";
import { registerComponent } from "vena";
import ProjectColumn from "./project-column.js";
export default registerComponent("project-board", ({ render }) => {
    render(_jsxs(_Fragment, { children: [_jsx("style", { children: `
        .columns {
          display: flex;
        }
      ` }), _jsx("section", { className: "columns", children: _jsx(ProjectColumn, { title: "asdf", children: _jsx("span", { slot: "card", children: "Test" }) }) })] }));
});
//# sourceMappingURL=project-board.js.map