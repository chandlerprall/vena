import { Signal, registerComponent } from 'vena';

export const ProjectBoardContext = Symbol('ProjectBoardContext');

export interface Card {
  id: string;
  body: string;
}

declare global {
  namespace Vena {
    interface Elements {
      'project-board': {
        cards?: Card[];
      };
    }
  }

  namespace Vena {
    interface Context {
      [ProjectBoardContext]: { isDragging: Signal<boolean> };
    }
  }
}

export default registerComponent('project-board', ({ render, context, state }) => {
  const { isDragging } = state({ isDragging: false });

  context[ProjectBoardContext] = {
    isDragging,
  };

  render(
    <>
      <style>{`
			slot[name=column] {
			  display: flex;
			  gap: calc(var(--token-spacing-base-unit, 8px) * 4);
			}
		  `}</style>

      <slot name="column"></slot>
    </>,
  );
});
