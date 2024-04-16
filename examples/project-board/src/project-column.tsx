import { registerComponent } from "vena";

declare global {
	namespace JSX {
		interface IntrinsicElements {
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
        }

        .container {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          border-radius: 0.5rem;
          background-color: var(--token-color-gutter, #d9d9d9);
          box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
        }
        
        ::slotted([slot=title]) {
        	font-weight: bold;
        }
        
        ::slotted([slot=card]:not(div)) {
        	color: red;
        }
      `}</style>
			<div className="container">
				<slot name="title"/>
				<slot name="card" />
			</div>
		</>
	);
});
