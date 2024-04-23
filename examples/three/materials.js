import {
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
} from 'three';
import { registerComponent, ALL_ATTRIBUTES } from 'vena';
import { GraphContext } from './context.js';

[
  { name: 'three-material-basic', constructor: MeshBasicMaterial },
  { name: 'three-material-lambert', constructor: MeshLambertMaterial },
  { name: 'three-material-normal', constructor: MeshNormalMaterial },
  { name: 'three-material-phong', constructor: MeshPhongMaterial },
  { name: 'three-material-physical', constructor: MeshPhysicalMaterial },
  { name: 'three-material-standard', constructor: MeshStandardMaterial },
  { name: 'three-material-toon', constructor: MeshToonMaterial },
].forEach(({ name, constructor }) => {
  registerComponent(name, ({ render, attributes, context }) => {
    const material = new constructor(Object.fromEntries(
      Object.entries(attributes[ALL_ATTRIBUTES].value)
        .map(([key, value]) => [key, value === 'true' || value === 'false' ? value === 'true' : value]),
    ));

    attributes[ALL_ATTRIBUTES].on((attrs) => {
      material.setValues(attrs);
    });

    context[GraphContext].material = material;
    context[GraphContext] = material;

    render`<slot></slot>`;
  });
});
