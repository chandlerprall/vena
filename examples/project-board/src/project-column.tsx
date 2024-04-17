import { registerComponent } from "vena";

declare global {
	namespace JSX {
		interface VenaIntrinsicElements {
			"project-column": {

			};
		}
	}
}

export default registerComponent("project-column", ({ render, attributes }) => {
	render(
		<>
			<style>{`
        :host {
          width: 100%;
          height: 100%;
          
          display: flex;
          flex-direction: column;
          padding: calc(var(--token-spacing-base-unit, 8px) * 0.5);
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
					border-bottom-left-radius: calc(var(--token-spacing-base-unit, 8px) * 1);
					border-bottom-right-radius: calc(var(--token-spacing-base-unit, 8px) * 1);
        }
        
        ::slotted([slot=title]) {
        	font-weight: bold;
        }
        
        ::slotted([slot=card]:not(div)) {
        	
        }
      `}</style>

			<slot name="title"/>
			<slot className="cards" name="card"/>
		</>
	);
});
