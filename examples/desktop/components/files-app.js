import { registerComponent } from 'vena';
import { openFile } from '../filemanager.js';

registerComponent('files-app', ({ render, element, attributes }) => {

  render`
<style>
file-explorer {
	height: 100%;
}
</style>
<file-explorer
	initialpath=${attributes?.initialpath || '/'}
	onfile-explorer-dblclick-file=${({ detail: file }) => openFile(file)}
></file-explorer>
	`;
});
