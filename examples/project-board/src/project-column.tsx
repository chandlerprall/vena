import { registerComponent } from '@venajs/core';
import { ProjectBoardContext } from './project-board.js';

declare global {
  namespace Vena {
    interface Elements {
      'project-column': {};
      'project-column-dropzone': {};
    }
  }
}

registerComponent('project-column-dropzone', ({ render, context, emit }) => {
  const { isDragging } = context[ProjectBoardContext];

  render`
  <style>
  :host {
    width: calc(100% - var(--token-spacing-base-unit, 8px) * 2);
    align-self: center;
  }
  
  div {
    display: flex;
    justify-content: center;
    align-items: center;

    background-color: color-mix(in srgb, var(--token-color-foreground), var(--token-color-background) 80%);
    border-radius: var(--token-spacing-base-unit, 8px);
    box-sizing: border-box;
    margin: var(--token-spacing-base-unit, 8px) 0;
    padding: border-radius: var(--token-spacing-base-unit, 8px);
    overflow: hidden;
    border: 0 dashed var(--token-color-border, #f0e4fc);

    height: 0;
    transition: border-width, height 0.2s;
  }

  div.isdragging {
    border-width: 5px;
    height: 25px;
  }
  </style>

  <div
    class=${isDragging.map((isDragging) => (isDragging ? 'isdragging' : undefined))}
    ondragenter=${(e: DragEvent) => {
      if (e.dataTransfer) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    }}
    ondragover=${(e: DragEvent) => {
      if (e.dataTransfer) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    }}
    ondrop=${(e: DragEvent) => {
      if (e.dataTransfer) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          emit('card-drop', data);
        } catch (e) {}
      }
    }}
  >move here</div>
  `;
});

export default registerComponent('project-column', ({ render }) => {
  render(
    <>
      <style>{`
        :host {
          --project-column-padding: calc(var(--token-spacing-base-unit, 8px) * 0.5);

          width: 100%;
          height: 100%;
          
          display: flex;
          flex-direction: column;
          padding: var(----project-column-padding);
          padding-top: 0;
          border-radius: calc(var(--token-spacing-base-unit, 8px) * 1);
          background-color: var(--token-color-shaded, #f0e4fc);
          border: 1px solid var(--token-color-border, #f0e4fc);
        }
        
        .cards {
					display: flex;
					flex-direction: column;
					gap: var(--token-spacing-base-unit, 8px);
					min-height: calc(var(--token-spacing-base-unit, 8px) * 4);
					padding: calc(var(--token-spacing-base-unit, 8px) * 0.5);
					
					box-shadow: 3px 3px 2px -3px rgba(0, 0, 0, 0.25) inset;
					
					border-radius: calc(var(--token-spacing-base-unit, 8px) * 1);
        }
        
        ::slotted([slot=title]) {
        	font-weight: bold;
          text-transform: capitalize;
          background-color: color-mix(in srgb, var(--token-color-shaded, #f0e4fc), rgb(255, 255, 255) 70%);
          padding: 5px;
          width: 100%;
          margin-left: calc((-1* var(--project-column-padding)) + calc(var(--token-spacing-base-unit, 8px) * 0.5));
          box-sizing: border-box;
          text-align: center;

          border-top-left-radius: calc(var(--token-spacing-base-unit, 8px) * 1);
          border-top-right-radius: calc(var(--token-spacing-base-unit, 8px) * 1);
        }
      `}</style>

      <slot name="title"/>

      <slot className="cards" name="card"></slot>
    </>,
  );
});
