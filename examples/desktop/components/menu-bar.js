import { registerComponent } from 'vena';

registerComponent('menu-bar', ({ render }) => {

	render`
<style>
:host {
	height: inherit;
	display: flex;
	margin: 0;
	padding: 0;
}

::slotted(*) {
	border: 0;
}
::slotted(button:hover) {
	filter: brightness(1.05);
}

::slotted(popover-menu) {
	height: 100%;
}
</style>

<slot></slot>
	`;
});
