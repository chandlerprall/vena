import { registerComponent, Signal, element } from 'vena';

const background = new Signal('#ffffff');
const highlight = new Signal('#a9c2ea');
const system = new Signal('#f0f0f0');
const border = new Signal('#e0e0e0');

const settingsMap = {
  background,
  highlight,
  system,
  border,
};

const settingtoPropertyMap = {
  background: '--token-color-background',
  highlight: '--token-color-highlight',
  system: '--token-color-system',
  border: '--token-color-border',
};

registerComponent('settings-app', ({ render, refs }) => {
  const selectedColor = new Signal(null);

  Object.entries(settingsMap).forEach(([setting, signal]) => {
    signal.on(newColor => {
      document.body.style.setProperty(settingtoPropertyMap[setting], newColor);
    });
  });

  render`
<style>
:host {
	display: flex;
	height: 100%;
}

#swatches {
	flex-basis: fit-content;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  height: 100%;
  width: 300px;
  align-content: flex-start;
  
  background-color: var(--token-color-background);
  padding-top: 25px;
  box-sizing: border-box;
  
  button {
		border: 0;
		width: 70%;
		border-radius: 15px;
		padding: 5px 50px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		flex-direction: row-reverse;
		align-items: center;
		gap: 15px;
		
		.swatch {
			display: inline-block;
			width: 20px;
			aspect-ratio: 1;
			border-radius: 5px;
			background-color: currentColor;
		}
		span:not(.swatch) {
			color: var(--token-color-foreground);
		}
		
		&:hover {
			filter: brightness(1.05);
		}
		&:active {
			filter: brightness(1.03);
		}
	}
}

#picker {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  padding-top: 15px;
  background-color: var(--token-color-background);
}
</style>

<div id="swatches">
	<button onClick=${() => selectedColor.value = 'background'} style=${background.as(color => ({ color }))}>
		<span class="swatch"></span>
		<span>background</span>
	</button>
	
	<button id="highlight" onClick=${() => selectedColor.value = 'highlight'} style=${highlight.as(color => ({ color }))}>
		<span class="swatch"></span>
		<span>highlight</span>
	</button>
	
	<button id="system" onClick=${() => selectedColor.value = 'system'} style=${system.as(color => ({ color }))}>
		<span class="swatch"></span>
		<span>system</span>
	</button>
	
	<button id="border" onClick=${() => selectedColor.value = 'border'} style=${border.as(color => ({ color }))}>
		<span class="swatch"></span>
		<span>border</span>
	</button>
</div>

<div id="picker">${selectedColor.as(selectedColor => {
    if (!selectedColor) return '';
    const currentHex = settingsMap[selectedColor];
    return element`
			<color-picker
				initialvalue=${currentHex}
				oncolor-picker-color=${({ detail }) => {
        currentHex.value = detail;
      }}
			></color-picker>`;
  })}</div>
	`;
});
