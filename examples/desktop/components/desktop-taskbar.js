import { registerComponent } from 'vena';

registerComponent('desktop-taskbar', ({ render }) => {
	render`
<style>	
:host {
	display: flex;
	justify-content: center;
	align-content: center;
	flex-wrap: wrap;
	position: fixed;
	bottom: 0;
	width: 100%;
	height: inherit;
	background-color: var(--token-color-system);
	border-top: 1px solid var(--token-color-border);
}
::slotted(button) {
  padding: 0;
	margin: 0;
	height: 100%;
	min-height: inherit;
	aspect-ratio: 1;
	border: 0;
}
::slotted(button.active) {
	filter: brightness(1.03);
}
::slotted(button:hover) {
	filter: brightness(1.05);
}
::slotted(button:active) {
	filter: brightness(0.95);
}
</style>

<slot></slot>
	`;
});
