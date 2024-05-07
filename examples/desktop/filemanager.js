import { html, element, Signal } from '@venajs/core';
import * as Pad from './components/desktop-app.js';

const liveViews = [];

class File {
  name = null;
  directory = null;
  content = null;
  icon = null;

  constructor(name, content, icon) {
    this.name = name;
    this.content = content;
    this.icon = this.#getIcon(icon);
  }

  #getIcon(icon) {
    if (icon) {
      return icon;
    } else if (this.name.endsWith('.md')) {
      return '📜';
    } else {
      return '📄';
    }
  }

  get path() {
    return `${this.directory.path}/${this.name}`;
  }
}

class Directory {
  name = null;
  parent = null;

  directories = [];
  files = [];

  constructor(name) {
    this.name = name;
  }

  addDirectory(directory) {
    directory.parent = this;
    this.directories.push(directory);
    return directory;
  }

  addFile(file) {
    file.directory = this;
    this.files.push(file);
    return file;
  }

  get path() {
    if (this.parent) {
      return `${this.parent.path}/${this.name}`;
    } else {
      return '';
    }
  }
}

const root = new Directory('');
root.addFile(new File('ipsum.txt', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'));

const desktop = root.addDirectory(new Directory('desktop'));
const readme = desktop.addFile(new File('README.md', 'content is loading, please close and re-open'));
fetch('./README.md').then(r => r.text()).then(content => {
  readme.content = content;
}).catch(e => {
  console.error(e);
  readme.content = 'Failed to load README.md; check the console for details.';
});

const desktopApps = desktop.addDirectory(new Directory('Apps'));
desktopApps.addFile(new File('Calculator.app', null, '🧮'));
desktopApps.addFile(new File('Notepad.app', null, '📝'));
desktopApps.addFile(new File('Files.app', null, '🗂️'));
desktopApps.addFile(new File('Settings.app', null, '⚙️'));

export const modals = html();

export const openFileDialog = ({ filter }) => {
  return new Promise(resolve => {
    const closeDialog = (result) => {
      const dialogIdx = modals.indexOf(dialog);
      modals.splice(dialogIdx, 1);
      resolve(result);
    };

    const selectedFile = new Signal(null);

    const dialog = element`
			<modal-dialog
        onfile-explorer-select-file=${({ detail: file }) => selectedFile.value = file}
        onfile-explorer-dblclick-file=${({ detail: file }) => closeDialog(file)}
        style=${{ width: '300px' }}
      >
				<style>
					.filemanager-fileexplorer {
						height: 200px;
					}
				</style>
				<strong>Select file</strong>
				
				<file-explorer class="filemanager-fileexplorer" view="list" filter=${filter}></file-explorer>
				
				<button slot="buttons" onclick=${() => closeDialog(null)}>Close</button>
				<button slot="buttons"
					disabled=${selectedFile.map(file => !file)}
					onclick=${() => closeDialog(selectedFile.value)}
				>Open</button>
			</modal-dialog>
		`;

    modals.push(dialog);
  });
};

export const openSaveDialog = () => {
  return new Promise(resolve => {
    const closeDialog = (result) => {
      const dialogIdx = modals.indexOf(dialog);
      modals.splice(dialogIdx, 1);
      resolve(result);
    };

    const filename = new Signal('');

    const dialog = element`
			<modal-dialog
        style=${{ width: '300px' }}
        onfile-explorer-select-file=${({ detail: file }) => {
      if (file) {
        filename.value = file.name;
      }
    }}
      >
				<style>
					.filemanager-fileexplorer {
						height: 200px;
					}
					
					.filemanager-filename {
						border: 1px solid var(--token-color-border);
						height: 1.5em;
					}
				</style>
				<strong>Save file</strong>
				
				<file-explorer class="filemanager-fileexplorer" view="list"></file-explorer>
				<input
					class="filemanager-filename"
					placeholder="filename"
					value=${filename}
					onkeyup=${e => {
      filename.value = e.target.value;
    }}
				/>
				
				<button slot="buttons" onclick=${() => closeDialog(null)}>Cancel</button>
				<button slot="buttons" disabled=${filename.map(filename => !filename)} onclick=${() => {
      closeDialog(`${dialog.querySelector('file-explorer').liveView.path}/${filename.value}`);
    }}>Save</button>
			</modal-dialog>
		`;
    modals.push(dialog);
  });
};

export class LiveView {
  path = new Signal(null);
  directories = new Signal([]);
  files = new Signal([]);

  constructor(path) {
    this.path.value = path === '/' ? '' : path;
    liveViews.push(this);
    this.refresh();
  }

  close() {
    const idx = liveViews.indexOf(this);
    liveViews.splice(idx, 1);
  }

  refresh() {
    const parts = this.path.value.split('/');
    parts.shift(); // remove root
    let directory = root;
    while (parts.length) {
      const part = parts.shift();
      if (part === '..') {
        directory = directory.parent;
      } else if (part !== '.') {
        directory = directory.directories.find(d => d.name === part);
      }
    }

    if (!directory) {
      this.directories.value = [];
      this.files.value = [];
    } else {
      this.directories.value = [...directory.directories];
      this.files.value = [...directory.files];
    }
  }

  navigate(path) {
    this.path.value = path;
    this.refresh();
  }
}

export function openFile(file) {
  // mime types? Where we're going, we don't need mime types
  if (file.name.endsWith('.txt')) {
    Pad.launchNotepad(file);
  } else if (file.name.endsWith('.md')) {
    Pad.launchMarkdown(file);
  } else if (file.name.endsWith('.app')) {
    Pad[`launch${file.name.replace('.app', '')}`]();
  }
}

export function writeFile(file, content) {
  const parts = file.split('/');
  parts.shift(); // remove root
  const filename = parts.pop(); // remove filename
  let directory = root;
  for (const part of parts) {
    if (part === '..') {
      directory = directory.parent;
    } else {
      directory = directory.directories.find(d => d.name === part);
    }
  }

  const existingFile = directory.files.find(f => f.name === filename);
  if (existingFile) {
    existingFile.content = content;
  } else {
    directory.addFile(new File(filename, content));
    for (const view of liveViews) {
      view.refresh();
    }
  }
}
