import { AmbientLight, DirectionalLight, HemisphereLight, PointLight, RectAreaLight, SpotLight } from 'three';
import { registerComponent, ALL_ATTRIBUTES } from '@venajs/core';
import { GraphContext } from './context.js';
import { applyValue } from './utils.js';

[
  { name: 'three-light-ambient', constructor: AmbientLight },
  { name: 'three-light-direction', constructor: DirectionalLight },
  { name: 'three-light-hemisphere', constructor: HemisphereLight },
  { name: 'three-light-point', constructor: PointLight },
  { name: 'three-light-rectarea', constructor: RectAreaLight },
  { name: 'three-light-spot', constructor: SpotLight },
].forEach(({ name, constructor }) => {
  registerComponent(name, ({ render, attributes, context }) => {
    const light = new constructor();

    if (light.shadow) {
      light.castShadow = true;
      light.shadow.camera.top = 100;
      light.shadow.camera.bottom = -100;
      light.shadow.camera.left = -100;
      light.shadow.camera.right = 100;
      light.shadow.camera.near = 1;
      light.shadow.camera.far = 30;
      light.shadow.bias = 0.0001;
    }

    function applyAttributes(attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        applyValue(light, key, attrs[key]);
      }
    }

    attributes[ALL_ATTRIBUTES].on(applyAttributes);
    applyAttributes(attributes[ALL_ATTRIBUTES].value);

    context[GraphContext].add(light);
    context[GraphContext] = light;

    render`<slot></slot>`;
  });
});
