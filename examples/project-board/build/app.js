import { jsx as _jsx, jsxs as _jsxs } from "vena/jsx-runtime";
import 'vena/live';
import { element, Signal, SignalProxy } from 'vena';
import ProjectBoard from './project-board.js';
import ProjectColumn from './project-column.js';
import ProjectCard from './project-card.js';
const map = new SignalProxy(new Map());
map.on(v => console.log(v));
map.set('a', 1);
map.set('b', 1);
map.on(v => console.log(v));
const bucketNames = ['backlog', 'in-progress', 'complete'];
const buckets = new Signal(bucketNames);
const cards = new Signal(new Set());
const cardToBucketMap = new Signal(new Map);
const bucketToCardsMap = Signal.from(buckets, cards, cardToBucketMap).map(([buckets, cards, cardToBucketMap]) => {
    const bucketToCardsMap = new Map();
    for (const bucket of buckets) {
        bucketToCardsMap.set(bucket, new Set());
    }
    for (const card of cards) {
        const bucket = cardToBucketMap.get(card);
        if (bucket) {
            bucketToCardsMap.get(bucket).add(card);
        }
    }
    return bucketToCardsMap;
});
function bucketCard(card, bucket) {
    if (bucket) {
        cardToBucketMap.value.set(card, bucket);
        cardToBucketMap.value = cardToBucketMap.value;
    }
}
function addCard(card) {
    cards.value.add(card);
    return card;
}
bucketToCardsMap.on(map => {
    console.log('bucketToCardsMap', map);
});
bucketCard(addCard({ id: '1', body: 'Test' }), 'backlog');
bucketCard(addCard({ id: '2', body: 'Test' }), 'backlog');
bucketCard(addCard({ id: '3', body: 'Test' }), 'backlog');
bucketCard(addCard({ id: '4', body: 'Test' }), 'in-progress');
bucketCard(addCard({ id: '5', body: 'Test' }), 'complete');
addCard({ id: '6', body: 'Test' });
addCard({ id: '7', body: 'Test' });
document.body.append(element(_jsxs(ProjectBoard, { children: [_jsxs(ProjectColumn, { slot: "column", children: [_jsx("span", { slot: "title", children: "Backlog" }), _jsx(ProjectCard, { slot: "card", children: "Test" }), _jsx(ProjectCard, { slot: "card", children: "Test" }), _jsx(ProjectCard, { slot: "card", children: "Test" })] }), _jsxs(ProjectColumn, { slot: "column", children: [_jsx("span", { slot: "title", children: "In Progress" }), _jsx(ProjectCard, { slot: "card", children: "Test" })] }), _jsx(ProjectColumn, { slot: "column", children: _jsx("span", { slot: "title", children: "Complete" }) })] })));
document.body.append(element(_jsxs("form", { method: "dialog", style: "margin-top: 10px; padding: 5px; width: 400px; box-sizing: border-box; background-color: var(--token-color-shaded);", onsubmit: (e) => {
        const cardData = Object.fromEntries(new FormData(e.target).entries());
        addCard(cardData);
    }, children: [_jsx("textarea", { name: "body", style: { width: '100%', height: '100px', boxSizing: 'border-box' } }), _jsx("button", { children: "add card" })] })));
//# sourceMappingURL=app.js.map