import { Quaternion, Vector3 } from 'three';
import { GLTFLoader } from "../lib/GLTFLoader.js";
import { registerComponent } from 'vena';
import { GraphContext } from '../context.js';

const loader = new GLTFLoader();

registerComponent('three-gltf', ({ render, attributes, context }) => {
  loader.load(
    attributes.src.value,
    gltf => {
      const obj = gltf.scene;
      obj.traverse(obj => {
        obj.castShadow = obj.receiveShadow = true;
      });

      attributes.position.on(position => obj.position.copy(position ?? new Vector3()), true);
      attributes.quaternion.on(rotation => obj.quaternion.copy(rotation ?? new Quaternion(0, 0, 0, 1)), true);

      context[GraphContext].add(obj);
      context[GraphContext] = obj;
    }
  );

  // context[GraphContext] = mesh;

  render`<slot></slot>`;
});