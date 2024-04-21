import 'vena/live';
import { element, Signal, SignalProxy } from 'vena';
import ProjectBoard, { Card } from './project-board.js';
import ProjectColumn from './project-column.js';
import ProjectCard from './project-card.js';

const map = new SignalProxy(new Map<string, number>());
map.on(v => console.log(v));
map.set('a', 1);
map.set('b', 1);

map.on(v => console.log(v));

const bucketNames = ['backlog', 'in-progress', 'complete'] as const;
type BucketName = typeof bucketNames[number];

const buckets = new Signal(bucketNames);
const cards = new Signal(new Set<Card>());
const cardToBucketMap = new Signal(new Map<Card, BucketName>);

const bucketToCardsMap = Signal.from(buckets, cards, cardToBucketMap).map(([buckets, cards, cardToBucketMap]) => {
  const bucketToCardsMap = new Map<BucketName, Set<Card>>();

  for (const bucket of buckets) {
    bucketToCardsMap.set(bucket, new Set());
  }

  for (const card of cards) {
    const bucket = cardToBucketMap.get(card);
    if (bucket) {
      bucketToCardsMap.get(bucket)!.add(card);
    }
  }

  return bucketToCardsMap;
});

function bucketCard(card: Card, bucket: BucketName) {
  if (bucket) {
    cardToBucketMap.value.set(card, bucket);
    cardToBucketMap.value = cardToBucketMap.value;
  }
}

function addCard(card: Card) {
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

document.body.append(element(
  <ProjectBoard>
    <ProjectColumn slot="column">
      <span slot="title">Backlog</span>
      <ProjectCard slot="card">Test</ProjectCard>
      <ProjectCard slot="card">Test</ProjectCard>
      <ProjectCard slot="card">Test</ProjectCard>
    </ProjectColumn>
    <ProjectColumn slot="column">
      <span slot="title">In Progress</span>
      <ProjectCard slot="card">Test</ProjectCard>
    </ProjectColumn>
    <ProjectColumn slot="column">
      <span slot="title">Complete</span>
    </ProjectColumn>
  </ProjectBoard>
));

document.body.append(element(
  <form
    method="dialog"
    style="margin-top: 10px; padding: 5px; width: 400px; box-sizing: border-box; background-color: var(--token-color-shaded);"
    onsubmit={(e) => {
      const cardData = Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()) as any as Card;
      addCard(cardData);
    }}
  >
    <textarea name="body" style={{ width: '100%', height: '100px', boxSizing: 'border-box' }}/>
    <button>add card</button>
  </form>
));