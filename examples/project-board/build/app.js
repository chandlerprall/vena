import { jsx as _jsx, jsxs as _jsxs } from "vena/jsx-runtime";
import 'vena/live';
import { element, Signal } from 'vena';
import ProjectBoard from './project-board.js';
const cards = new Signal([]);
function addCard({ body }) {
    cards.value = [...cards.value, { body }];
}
document.body.append(element(_jsx(ProjectBoard, { cards: cards })));
document.body.append(element(_jsxs("form", { method: "dialog", style: "margin-top: 10px; padding: 5px; width: 400px; box-sizing: border-box; background-color: var(--token-color-shaded);", onsubmit: (e) => {
        const data = Object.fromEntries(new Map(new FormData(e.target)).entries());
        console.log(data);
        //addCard();
    }, children: [_jsx("textarea", { name: "body", style: { width: '100%', height: '100px', boxSizing: 'border-box' } }), _jsx("button", { children: "go" })] })));
//# sourceMappingURL=app.js.map