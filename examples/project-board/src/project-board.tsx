import {registerComponent} from "vena";

export interface Card {
  id: string;
  body: string;
}

declare global {
  namespace JSX {
    interface VenaIntrinsicElements {
      "project-board": {
        cards?: Card[];
      };
    }
  }
}

export default registerComponent("project-board", ({render}) => {
  render(
    <>
      <style>{`
			slot[name=column] {
			  display: flex;
			  gap: calc(var(--token-spacing-base-unit, 8px) * 4);
			}
		  `}</style>

      <slot name="column"></slot>
    </>
  );
});
