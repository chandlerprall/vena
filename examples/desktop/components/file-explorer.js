import { registerComponent, element, Signal } from 'vena';
import { LiveView } from '../filemanager.js';

registerComponent('file-explorer', ({ render, element: me, attributes }) => {
  const liveView = me.liveView = new LiveView(attributes.initialpath?.value || '/');

  me.addEventListener('click', () => me.emit('select-file', null));

  const crumbs = liveView.path.map(path => {
    const crumbs = [];
    const parts = path.split('/');
    for (const part of parts) {
      crumbs.push(element`
				<button class="crumb" onClick=${() => liveView.navigate(parts.slice(0, parts.indexOf(part) + 1).join('/'))}>
					${part || '/'}
				</button>
			`);
    }
    return crumbs;
  });

  const directories = liveView.directories.map(directories => {
    const directoriesList = [];
    const sortedDirectories = [...directories].sort((a, b) => a.name.localeCompare(b.name));
    for (const directory of sortedDirectories) {
      directoriesList.push(element`
				<button
				  class="item directory"
          onDblclick=${() => {
            const result = me.emit('dblclick-directory', directory);
            if (result) {
              liveView.navigate(`${liveView.path}/${directory.name}`)
            }
          }}
        >
					<span class="icon">📁</span>
					<span class="name">${directory.name}</span>
				</button>
			`);
    }
    return directoriesList;
  });

  const files = Signal.from(attributes.filter, liveView.files).map(([filterAttribute, files]) => {
    const filters = filterAttribute ?? [];

    const filesList = [];
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
    for (const file of sortedFiles) {
      let matchesFilters = filters.length === 0;
      for (let i = 0; i < filters.length; i++) {
        if (file.name.endsWith(filters[i])) {
          matchesFilters = true;
          break;
        }
      }

      const buttonElement = element`
				<button
					class="item file"
					disabled=${!matchesFilters}
					onClick=${(e) => {
            e.stopImmediatePropagation();
            me.emit('select-file', file)
          }}
					onDblclick=${() => me.emit('dblclick-file', file)}
				>
					<span class="icon">${file.icon}</span>
					<span class="name">${file.name}</span>
				</button>
			`;
      filesList.push(buttonElement);
    }
    return filesList;
  });

  render`
<style>
:host {
	display: flex;
	flex-direction: column;
  height: 100%;
  width: 100%;
}

#breadcrumbs {
	flex-basis: var(--menubar-height, 25px);
	background-color: var(--token-color-system);
	display: flex;
	justify-items: flex-start;
	align-items: center;
	
	.crumb {
		height: 100%;
		border: 0;
		background-color: var(--token-color-system);
		
		&:active {
			filter: brightness(1.03);
		}
		&:hover {
			filter: brightness(1.05);
		}
		&:active {
			filter: brightness(0.95);
		}
	}
}

#container {
	display: flex;
	flex-wrap: wrap;
	flex-basis: 100%;
	justify-content: flex-start;
	align-content: flex-start;
	background-color: var(--token-color-background);
	overflow-y: scroll;
	border-style: inset;
	
	.item {
		display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: space-evenly;
	  
		background-color: transparent;
		border: 0;
		width: 100px;
		height: 100px;
		
		.icon {
			font-size: 32px;
			line-height: 32px;
		}
		
		.name {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 100%;
		}

    &:disabled {
      color: color-mix(in srgb, var(--token-color-foreground) 40%, transparent);  
    }

    &:not(:disabled) {
      &:hover, &:focus {
        background-color: color-mix(in srgb, var(--token-color-background) 80%, transparent);
      }
      
      &:focus {
        background-color: color-mix(in srgb, var(--token-color-highlight) 80%, transparent);
      }
    }
	}
	
	&:not(.list) .item {
		&:hover, &:focus {
			border: 1px solid var(--token-color-border);
			
			.name {
				all: unset;
				z-index: 1;
			}
		}
	}
	
	&.list {
		overflow-y: scroll;
		flex-direction: row;
		
		.item {
			width: 100%;
			height: unset;
			flex-direction: row;
			gap: 5px;
			
			.icon {
				font-size: unset;
				line-height: unset;
			}
			
			.name {
				text-align: start;
				
			}
		}
	}
	
	&.desktop {
		border-width: 0;
		background-color: transparent;
	}
}

#breadcrumbs:has(+ #container.desktop) {
	display: none;
}
</style>
<menu-bar id="breadcrumbs">${crumbs}</menu-bar>
<section id="container" class=${attributes.view ?? ''}>
	${directories}
	${files}
</section>
	`;
}, {
  getElementClass: ComponentClass => class FileExplorer extends ComponentClass {
    disconnectedCallback() {
      this.liveView.close();
    }
  }
});
