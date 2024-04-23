import { jsx as _jsx, jsxs as _jsxs } from "vena/jsx-runtime";
import 'vena/live';
import { element, ProxySignal } from 'vena';
// @ts-expect-error
import { marked } from 'https://esm.run/marked@12.0.2';
import ProjectBoard from './project-board.js';
import ProjectColumn from './project-column.js';
import ProjectCard from './project-card.js';
const bucketNames = new ProxySignal(['backlog', 'in-progress', 'complete']);
const cards = new ProxySignal(new Set());
const cardToBucketMap = new ProxySignal(new Map());
const unsortedBucket = Symbol('unsorted');
const bucketToCardsMap = ProxySignal.from(([bucketNames, cards, cardToBucketMap]) => {
    const bucketToCardsMap = new Map();
    bucketToCardsMap.set(unsortedBucket, new Set());
    for (const bucket of bucketNames) {
        bucketToCardsMap.set(bucket, new Set());
    }
    for (const card of cards) {
        const bucket = cardToBucketMap.get(card);
        if (bucket) {
            bucketToCardsMap.get(bucket).add(card);
        }
        else {
            bucketToCardsMap.get(unsortedBucket).add(card);
        }
    }
    return bucketToCardsMap;
}, bucketNames, cards, cardToBucketMap);
function bucketCard(card, bucket) {
    cardToBucketMap.delete(card);
    if (bucket) {
        cardToBucketMap.set(card, bucket);
    }
}
function addCard(card) {
    cards.add(card);
    return card;
}
bucketCard(addCard({ id: '1', body: 'Test _one_' }), 'backlog');
bucketCard(addCard({ id: '2', body: 'Test _two_' }), 'backlog');
bucketCard(addCard({ id: '3', body: 'Test _three_' }), 'backlog');
bucketCard(addCard({ id: '4', body: 'Test _four_' }), 'in-progress');
bucketCard(addCard({ id: '5', body: 'Test _five_' }), 'complete');
function handleCardDrop(e) {
    const cardId = e.detail.id;
    const bucketName = e.currentTarget.getAttribute('data-bucket') ?? undefined;
    const card = Array.from(cards).find((card) => card.id === cardId);
    if (card) {
        bucketCard(card, bucketName);
    }
}
document.body.append(element(_jsxs(ProjectBoard, { children: [_jsxs(ProjectColumn, { "onproject-column-dropzone-card-drop": handleCardDrop, slot: "column", children: [_jsx("span", { slot: "title", children: "unsorted" }), bucketToCardsMap.map((bucketToCardsMap) => {
                    const cards = bucketToCardsMap.get(unsortedBucket);
                    return (cards ? Array.from(cards) : []).map((card) => {
                        return element(_jsx(ProjectCard, { dragdata: { id: card.id }, slot: "card", children: marked(card.body) }));
                    });
                }), _jsx("project-column-dropzone", { slot: "card" })] }), bucketNames.map((bucketNames) => bucketNames.map((bucketName) => element(_jsxs(ProjectColumn, { "data-bucket": bucketName, "onproject-column-dropzone-card-drop": handleCardDrop, slot: "column", children: [_jsx("span", { slot: "title", children: bucketName }), bucketToCardsMap.map((bucketToCardsMap) => {
                    const cards = bucketToCardsMap.get(bucketName);
                    return (cards ? Array.from(cards) : []).map((card) => {
                        return element(_jsx(ProjectCard, { dragdata: { id: card.id }, slot: "card", children: marked(card.body) }));
                    });
                }), _jsx("project-column-dropzone", { slot: "card" })] }))))] })));
document.body.append(element(_jsxs("form", { method: "dialog", style: "margin-top: 10px; padding: 5px; width: 400px; box-sizing: border-box; background-color: var(--token-color-shaded);", onsubmit: (e) => {
        const form = e.target;
        const cardData = Object.fromEntries(new FormData(form).entries());
        cardData.id = (cards.size + 1).toString();
        form.reset();
        addCard(cardData);
    }, children: [_jsx("textarea", { name: "body", style: { width: '100%', height: '100px', boxSizing: 'border-box' } }), _jsx("button", { children: "add card" })] })));
//# sourceMappingURL=app.js.map