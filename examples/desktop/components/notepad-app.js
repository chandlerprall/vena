import { registerComponent, Signal } from 'vena';
import { openFileDialog, openSaveDialog, writeFile } from '../filemanager.js';
import { DesktopWindowContext } from './desktop-window.js';

const direction = window.direction = new Signal();

registerComponent('notepad-app', ({ render, refs, attributes, context }) => {
  const updateTitle = (filePath) => {
    if (filePath) {
      context[DesktopWindowContext].title.value = `Notepad - ${filePath}`;
    } else {
      context[DesktopWindowContext].title.value = 'Notepad';
    }
  };
  updateTitle(attributes.file.value?.path);

  render`
<style>
:host {
	display: flex;
	flex-direction: column;
  height: 100%;
  width: 100%;
}
textarea {
  flex-basis: 100%;
  box-sizing: border-box;
  resize: none;
}

menu-bar {
	flex-basis: var(--menubar-height, 25px);
}

.menuButton {
	border: 0;
	height: 100%;
	
	&:hover {
		filter: brightness(1.05);
	}
}
</style>

<menu-bar>
	<popover-menu direction=${direction}>
		<button class="menuButton">File</button>
		
		<button slot="menu" onClick=${() => refs.content.value = ''}>New</button>
		<button slot="menu" onClick=${async () => {
    const file = await openFileDialog({ filter: ['.txt', '.md'] });
    if (file) {
      refs.content.value = file.content;
      updateTitle(file.path);
    }
  }}>Open</button>
		<button slot="menu" onClick=${() => {
    openSaveDialog().then(filepath => {
      if (filepath) {
        const hasAcceptableExtension = ['.txt', '.md'].some(ext => filepath.endsWith(ext));
        const finalFilepath = hasAcceptableExtension ? filepath : `${filepath}.txt`;
        writeFile(finalFilepath, refs.content.value);
        updateTitle(finalFilepath);
      }
    });
  }}>Save</button>
	</popover-menu>
</menu-bar>
<textarea id="content"></textarea>`;

  refs.content.value = attributes.file.value?.content || '';
  refs.content.focus();
});
