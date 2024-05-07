import { registerComponent } from '@venajs/core';
import { ProjectBoardContext } from './project-board.js';

declare global {
  namespace Vena {
    interface Elements {
      'project-card': {
        dragdata: any;
      };
    }
  }
}

export default registerComponent('project-card', ({ render, attributes, refs, context }) => {
  const { isDragging } = context[ProjectBoardContext];

  render(
    <>
      <style>{`
        .card {
          display: block;
          padding: var(--token-spacing-base-unit);
          border-radius: 0.5rem;
          background-color: var(--token-color-shaded, #f0e4fc);
          transform: translateY(0px);
          box-shadow: 0 0 var(--token-spacing-base-unit) rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.1s, background-color 0.1s, transform 0.1s;
          
          background-color: color-mix(in srgb, var(--token-color-shaded, #f0e4fc), rgb(255, 255, 255) 50%);
          
          &:not(:has(.content:hover)) {
            cursor: grab;
            
            &:active {
              cursor: grabbing;
              box-shadow: 0px 3px var(--token-spacing-base-unit) rgba(0, 0, 0, 0.3);
              transform: translateY(-2px);
            }
          }
          
          &:hover {
            background-color: color-mix(in srgb, var(--token-color-shaded, #f0e4fc), rgb(255, 255, 255) 70%);
            box-shadow: 0 0px var(--token-spacing-base-unit) rgba(0, 0, 0, 0.2);
          }
        }
        
        .content {
          font-size: var(--token-font-size-down);
        }
        
        ::slotted(*) {
          margin: 0;
        }
      `}</style>
      <div
        id="card"
        className="card"
        draggable
        ondragstart={e => {
          (e.target as HTMLElement).classList.add('dragging');
        }}
        ondragend={e => {
          (e.target as HTMLElement).classList.remove('dragging');
        }}
      >
        <code>
          <slot className="content"/>
        </code>
      </div>
    </>,
  );

  refs.card.addEventListener('dragstart', (e) => {
    const { dataTransfer } = e as any as DragEvent;
    if (dataTransfer) {
      dataTransfer.effectAllowed = 'move';
      dataTransfer.setData('application/json', JSON.stringify(attributes.dragdata.value));
      setTimeout(() => {
        isDragging.value = true;
      });
    }
  });

  refs.card.addEventListener('dragend', () => {
    isDragging.value = false;
  });
});
