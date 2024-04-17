import 'vena/live';
import { element, Signal } from 'vena';
import ProjectBoard, { Card } from './project-board.js';

const cards = new Signal<Card[]>([]);

function addCard({ body }: Card) {
  cards.value = [...cards.value, { body }];
}

document.body.append(element(
  <ProjectBoard cards={cards}/>
));

document.body.append(element(
  <form
    method="dialog"
    style="margin-top: 10px; padding: 5px; width: 400px; box-sizing: border-box; background-color: var(--token-color-shaded);"
    onsubmit={(e) => {
      const data = Object.fromEntries(new Map(new FormData(e.target as HTMLFormElement)).entries());
      console.log(data);
      //addCard();
    }}
  >
    <textarea name="body" style={{ width: '100%', height: '100px', boxSizing: 'border-box' }}/>
    <button>go</button>
  </form>
));