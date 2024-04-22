import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "vena/jsx-runtime";
import { registerComponent } from "vena";
export const ProjectBoardContext = Symbol("ProjectBoardContext");
export default registerComponent("project-board", ({ render, context, state }) => {
    const { isDragging } = state({ isDragging: false });
    context[ProjectBoardContext] = {
        isDragging,
    };
    render(_jsxs(_Fragment, { children: [_jsx("style", { children: `
			slot[name=column] {
			  display: flex;
			  gap: calc(var(--token-spacing-base-unit, 8px) * 4);
			}
		  ` }), _jsx("slot", { name: "column" })] }));
});
//# sourceMappingURL=project-board.js.map