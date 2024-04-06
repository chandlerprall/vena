import { registerComponent, element, Signal } from 'vena';
import { windows, taskbarButtons, launchWindow } from '../windowmanager.js'
import { modals as fileModals, openFile } from '../filemanager.js';

registerComponent('desktop-app', ({ render }) => {
  render`
<style>
#desktop {
	padding: 0;
	margin: 0;
	width: 100%;
	height: 100%;
	background-image: url("./images/background.jpg");
	background-size: cover;
	background-position: center;
}

file-explorer {
	width: 100%;
	height: 100%;
}

#windows {
	z-index: 1;
}

#taskbar {
	z-index: 2;
	height: 40px;
	
	popover-menu {
		height: 100%;
	}
}

.taskbarButton {
	padding: 0;
	margin: 0;
	height: 100%;
	min-height: inherit;
	aspect-ratio: 1;
	border: 0;
	
	&:hover {
		filter: brightness(1.05);
	}
	&:active {
		filter: brightness(0.95);
	}
}

#modals {
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  &:not(:empty) {
    pointer-events: all;
    background-color: color-mix(in srgb, var(--token-color-system) 80%, transparent);  
  }
  
}
</style>

<main id="desktop">
	<file-explorer
		view="desktop"
		initialpath="/desktop"
		onfile-explorer-dblclick-file=${({ detail: file }) => openFile(file)}
		onfile-explorer-dblclick-directory=${(e) => {
      e.preventDefault();
      launchFiles(e.detail.path);
    }}
	></file-explorer>
	<section id="windows">${windows}</section>
	<desktop-taskbar id="taskbar">
		<popover-menu direction="up">
			<button class="taskbarButton">❇️</button>
			
			<button slot="menu" onClick=${() => launchNotepad()}>📝 Notepad</button>
			<button slot="menu" onClick=${() => launchCalculator()}>🧮 Calculator</button>
			<button slot="menu" onClick=${() => launchFiles()}>🗂️ Files</button>
			<button slot="menu" onClick=${() => launchSettings()}>⚙️ Settings</button>
		</popover-menu>
		${taskbarButtons}
	</desktop-taskbar>
	<section id="modals">${fileModals}</section>
</main>
	`;
});

export function launchCalculator() {
  launchWindow(element`
		<desktop-window style=${{ aspectRatio: '400 / 387' }}>
			<span slot="icon">🧮</span>
			<span slot="title">Calc</span>
			<calculator-app></calculator-app>
		</desktop-window>
	`, { width: 'auto' });
}
export function launchNotepad(file) {
  launchWindow(element`
		<desktop-window>
			<span slot="icon">📝</span>
			<notepad-app file=${file}></notepad-app>
		</desktop-window>
	`);
}

export function launchFiles(path = '/') {
  launchWindow(element`
		<desktop-window>
			<span slot="icon">🗂️</span>
			<span slot="title">Files</span>
			<files-app initialpath=${path}></files-app>
		</desktop-window>
	`);
}

export function launchSettings() {
  launchWindow(element`
		<desktop-window>
			<span slot="icon">⚙️</span>
			<span slot="title">Settings</span>
			<settings-app></settings-app>
		</desktop-window>
	`);
}

export function launchMarkdown(file) {
  launchWindow(element`
    <desktop-window>
      <span slot="icon">📜</span>
      <span slot="title">Markdown viewer</span>
      <markdown-app file=${file}}></markdown-app>
    </desktop-window>
  `);
}
