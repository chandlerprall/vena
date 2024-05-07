import '@venajs/live';
import { element, ProxySignal } from '@venajs/core';
// @ts-expect-error
import { marked } from 'https://esm.run/marked@12.0.2';
import ProjectBoard, { Card } from './project-board.js';
import ProjectColumn from './project-column.js';
import ProjectCard from './project-card.js';

const bucketNames = new ProxySignal(['backlog', 'in-progress', 'complete'] as const);
type BucketName = (typeof bucketNames)[number];

const cards = new ProxySignal(new Set<Card>());
const cardToBucketMap = new ProxySignal(new Map<Card, BucketName>());

const unsortedBucket = Symbol('unsorted');
const bucketToCardsMap = ProxySignal.from(
  ([bucketNames, cards, cardToBucketMap]) => {
    const bucketToCardsMap = new Map<BucketName | typeof unsortedBucket, Set<Card>>();

    bucketToCardsMap.set(unsortedBucket, new Set());
    for (const bucket of bucketNames) {
      bucketToCardsMap.set(bucket, new Set());
    }

    for (const card of cards) {
      const bucket = cardToBucketMap.get(card);
      if (bucket) {
        bucketToCardsMap.get(bucket)!.add(card);
      } else {
        bucketToCardsMap.get(unsortedBucket)!.add(card);
      }
    }

    return bucketToCardsMap;
  },
  bucketNames,
  cards,
  cardToBucketMap,
);

function bucketCard(card: Card, bucket?: BucketName) {
  cardToBucketMap.delete(card);
  if (bucket) {
    cardToBucketMap.set(card, bucket);
  }
}

function addCard(card: Card) {
  cards.add(card);
  return card;
}

bucketCard(addCard({ id: '1', body: 'Test _one_' }), 'backlog');
bucketCard(addCard({ id: '2', body: 'Test _two_' }), 'backlog');
bucketCard(addCard({ id: '3', body: 'Test _three_' }), 'backlog');

bucketCard(addCard({ id: '4', body: 'Test _four_' }), 'in-progress');

bucketCard(addCard({ id: '5', body: 'Test _five_' }), 'complete');

function handleCardDrop(e: CustomEvent) {
  const cardId = e.detail.id;
  const bucketName = (e.currentTarget as HTMLElement).getAttribute('data-bucket') ?? undefined;

  const card = Array.from(cards).find((card) => card.id === cardId);

  if (card) {
    bucketCard(card, bucketName as BucketName);
  }
}

document.body.append(
  element(
    <ProjectBoard>
      <ProjectColumn onproject-column-dropzone-card-drop={handleCardDrop} slot="column">
        <span slot="title">unsorted</span>
        {bucketToCardsMap.map((bucketToCardsMap) => {
          const cards = bucketToCardsMap.get(unsortedBucket);
          return (cards ? Array.from(cards) : []).map((card) => {
            return element(
              <ProjectCard dragdata={{ id: card.id }} slot="card">
                {marked(card.body)}
              </ProjectCard>,
            );
          });
        })}
        <project-column-dropzone slot="card"/>
      </ProjectColumn>
      {bucketNames.map((bucketNames) =>
        bucketNames.map((bucketName) =>
          element(
            <ProjectColumn data-bucket={bucketName} onproject-column-dropzone-card-drop={handleCardDrop} slot="column">
              <span slot="title">{bucketName}</span>
              {bucketToCardsMap.map((bucketToCardsMap) => {
                const cards = bucketToCardsMap.get(bucketName);
                return (cards ? Array.from(cards) : []).map((card) => {
                  return element(
                    <ProjectCard dragdata={{ id: card.id }} slot="card">
                      {marked(card.body)}
                    </ProjectCard>,
                  );
                });
              })}
              <project-column-dropzone slot="card"/>
            </ProjectColumn>,
          ),
        ),
      )}
    </ProjectBoard>,
  ),
);

document.body.append(
  element(
    <form
      method="dialog"
      style="margin-top: 10px; padding: 5px; width: 400px; box-sizing: border-box; background-color: var(--token-color-shaded);"
      onsubmit={(e) => {
        const form = e.target as HTMLFormElement;
        const cardData = Object.fromEntries(new FormData(form).entries()) as any as Card;
        cardData.id = (cards.size + 1).toString();
        form.reset();
        addCard(cardData);
      }}
    >
      <textarea name="body" style={{ width: '100%', height: '100px', boxSizing: 'border-box' }}/>
      <button>add card</button>
    </form>,
  ),
);
