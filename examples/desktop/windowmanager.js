import { html, element } from '@venajs/core';

export const windows = html();
export const taskbarButtons = html();

export const launchWindow = (windowElement, options = {}) => {
  if (windowElement.nodeName !== 'DESKTOP-WINDOW') {
    throw new Error(`launchWindow called with element that isn't a desktop-window`);
    return;
  }

  windowElement.style.width = options.width || '640px';
  windowElement.style.height = options.height || '480px';
  windowElement.style.top = `${Math.max(window.innerHeight / 2 - 240, 0)}px`;
  windowElement.style.left = `${Math.max(window.innerWidth / 2 - 320, 0)}px`;

  windows.push(windowElement);

  const iconElement = windowElement.querySelector('[slot=icon]')?.cloneNode(true);
  const myTaskbarButton = element`<button onclick=${() => windowElement.focus()}>${iconElement}</button>`;
  taskbarButtons.push(myTaskbarButton);

  windowElement.addEventListener('desktop-window-focus', () => {
    const currentZIndex = parseInt(windowElement.style.zIndex || windows.length, 10);

    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];
      const windowZIndex = parseInt(window.style.zIndex || windows.length, 10);
      if (windowZIndex >= currentZIndex) {
        window.style.zIndex = windowZIndex - 1;
      }
    }

    windowElement.style.zIndex = windows.length;

    for (let i = 0; i < taskbarButtons.length; i++) {
      const taskbarButton = taskbarButtons[i];
      if (taskbarButton === myTaskbarButton) {
        taskbarButton.classList.add('active');
      } else {
        taskbarButton.classList.remove('active');
      }
    }
  });

  windowElement.addEventListener('desktop-window-close', () => {
    const currentZIndex = parseInt(windowElement.style.zIndex || windows.length, 10);

    let myIndex;
    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];
      if (window === windowElement) {
        myIndex = i;
      } else {
        const windowZIndex = parseInt(window.style.zIndex || windows.length, 10);
        if (windowZIndex > currentZIndex) {
          window.style.zIndex = windowZIndex - 1;
        }
      }
    }
    windows.splice(myIndex, 1);

    const taskbarButtonIndex = taskbarButtons.indexOf(myTaskbarButton);
    taskbarButtons.splice(taskbarButtonIndex, 1);
  });

  windowElement.focus();

  return windowElement;
};
