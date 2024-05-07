import { WebGLRenderer, Scene, PCFShadowMap } from 'three';
import { registerComponent } from '@venajs/core';
import { GraphContext } from '../context.js';

registerComponent('three-stage', ({ render, attributes, context }) => {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.aspectRatio = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();

  context[GraphContext] = scene;

  render`
    ${renderer.domElement}
    <slot></slot>
  `;

  setInterval(() => {
    renderer.render(scene, attributes.camera.value);
  }, 1000 / 60);
});