import { registerComponent } from "vena";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"project-column": {
				title: string;
			};
		}
	}
}

export default registerComponent("project-column", ({ render }) => {
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
          background-color: var(--token-color-gutter);
          box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
        }

        ::slotted(:not(div)) {
          color: red;
        }
      `}</style>
			<div className="container">
				<slot name="card" />
			</div>
		</>
	);
});
