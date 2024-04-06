import { registerComponent, Signal } from 'vena';

registerComponent('color-picker', ({ render, refs, attributes, element }) => {
  const initialvalue = attributes.initialvalue?.value || '#000000';
  const initialHsl = hexToHSL(initialvalue);

  const hue = new Signal(initialHsl.h);
  const saturation = new Signal(initialHsl.s);
  const lightness = new Signal(initialHsl.l);

  const updateHue = (nextHue) => {
    hue.value = nextHue;
  };

  const updateSaturation = (nextSaturation) => {
    saturation.value = nextSaturation;
  };

  const updateLightness = (nextLightness) => {
    lightness.value = nextLightness;
  };

  Signal.with(hue, saturation, lightness).on(([h, s, l]) => {
    element.emit('color', HSLToHex(h, s, l));
  });

  const getValuesFromClickEvent = (e) => {
    const nextSaturation = e.offsetX / e.target.clientWidth * 100;
    const nextLightness = 100 - (e.offsetY / e.target.clientHeight * 100);
    saturation.value = nextSaturation.toFixed(2);
    lightness.value = nextLightness.toFixed(2);
  };

  render`
<style>
.colorpicker {
	width: 250px;
}

.colorBox {
	position: relative;
	width: 100%;
	aspect-ratio: 1;
	background-color: blue;
}

.saturationBg {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(to right, #fff 0%, #fff0 100%)
}
.lightnessBg {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(to bottom, #0000 0%, #000 100%)
}
#colorIndicator {
	position: absolute;
	width: 6px;
	height: 6px;
	border: 2px solid #fffa;
	background-color: transparent;
	border-radius: 50%;
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.values {
	input[type=range] {
		overflow: hidden;
		display: block;
		width: 100%;
	}

	.hueSlider {
		-webkit-appearance: none;
	}
	.hueSlider::-webkit-slider-runnable-track {
		color: blue;
		background: linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%);
		height: 10px;
	}
}

#result {
	font-family: monospace;
	position: relative;
	height: 20px;

	#colorResult {
		display: inline-block;
		position: absolute;
		right: 0;
		height: 100%;
		aspect-ratio: 1;
	}
}
</style>

<div class="colorpicker">
  <section
    class="colorBox"
    style=${hue.as(hue => ({ backgroundColor: `hsl(${hue}, 100%, 50%)` }))}
    onClick=${getValuesFromClickEvent}
  >
    <div class="saturationBg"></div>
    <div class="lightnessBg"></div>
    <div id="colorIndicator"
      style=${Signal.with(saturation, lightness).as(([saturation, lightness]) => ({
        left: `${saturation}%`,
        top: `${100 - lightness}%`,
      }))}
    ></div>
  </section>
  <section class="values">
    <input type="range" min="0" max="360" class="hueSlider" value=${hue} onChange=${(e) => updateHue(parseFloat(e.target.value))} />
    <input type="range" min="0" max="100" class="saturationSlider" value=${saturation} onChange=${(e) => updateSaturation(parseFloat(e.target.value))} />
    <input type="range" min="0" max="100" class="lightnessSlider" value=${lightness} onChange=${(e) => updateLightness(parseFloat(e.target.value))} />
  </section>
  <section id="result">
    (${hue}, ${saturation}%, ${lightness}%)
    <div
      id="colorResult"
      style=${Signal.with(hue, saturation, lightness).as(([hue, saturation, lightness]) => 
        ({ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` })
      )}
    ></div>
  </section>
</div>
	`;
});

// https://css-tricks.com/converting-color-spaces-in-javascript/
function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

function HSLToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60) % 2 - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}
