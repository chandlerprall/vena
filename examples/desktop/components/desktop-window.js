import { registerComponent, Signal } from '@venajs/core';

export const DesktopWindowContext = Symbol('DesktopWindowContext');

registerComponent('desktop-window', ({ element, render, context }) => {
  const lastCursorPosition = { x: 0, y: 0 };
  const onTitleMouseDown = ({ clientX, clientY }) => {
    lastCursorPosition.x = clientX;
    lastCursorPosition.y = clientY;
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };
  const onWindowMouseUp = (e) => {
    onWindowMouseMove(e);
    window.removeEventListener('mousemove', onWindowMouseMove, { capture: false });
    window.removeEventListener('mouseup', onWindowMouseUp);
  };
  const onWindowMouseMove = ({ clientX, clientY }) => {
    const deltaX = clientX - lastCursorPosition.x;
    const deltaY = clientY - lastCursorPosition.y;
    element.style.left = `${element.offsetLeft + deltaX}px`;
    element.style.top = `${element.offsetTop + deltaY}px`;
    lastCursorPosition.x = clientX;
    lastCursorPosition.y = clientY;
  };

  element.addEventListener('mousedown', () => element.focus());

  const title = new Signal('untitled window');
  context[DesktopWindowContext] = { title };

  render`
<style>
:host {
	position: absolute;
	height: inherit;
	width: inherit;
  box-sizing: border-box;
  border: 1px solid var(--token-color-border);
  display: flex;
  flex-direction: column;
}

dialog {
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
}

#titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
	background-color: var(--token-color-system);
	height: var(--desktop-window-titlebar-height, 25px);
	box-sizing: border-box;
	border-bottom: 1px solid var(--token-color-border);
	
	cursor: default;
	
	#close {
		border: 0;
		cursor: pointer;
	}
}

#content {
	background-color: var(--token-color-system);
	height: calc(100% - 25px);
  overflow: auto;
}
</style>

<dialog id="dialog" open>
	<div id="titlebar" onMouseDown=${onTitleMouseDown}>
		<span>
			<slot name="icon"></slot>
			<slot name="title">${title}</slot>
		</span>
		<button id="close" onClick=${() => element.close()}>ⓧ</button>
	</div>
	<div id="content"><slot></slot></div>
</dialog>
	`;
}, {
  getElementClass: ComponentClass => class DesktopWindow extends ComponentClass {
    focus() {
      this.emit('focus');
    }

    close() {
      this.emit('close');
    }
  },
});
