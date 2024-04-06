import { registerComponent } from 'vena';

registerComponent('modal-dialog', ({ render, element }) => {
	render`
<style>
:host {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	
	display: flex;
	flex-direction: column;
	padding: 10px;
	background-color: var(--token-color-system);
	border: 1px outset var(--token-color-border);
}

#buttons {
	display: flex;
	align-items: flex-end;
}
</style>

<slot></slot>
<section id="buttons">
	<slot name="buttons"></slot>
</section>
	`;
});
