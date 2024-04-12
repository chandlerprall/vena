import { Mesh, Quaternion, Vector3, MeshBasicMaterial } from 'three';
import { registerComponent } from 'vena';
import { GraphContext } from '../context.js';

registerComponent('three-mesh', ({ render, attributes, context }) => {
  const mesh = new Mesh(
    undefined,
    new MeshBasicMaterial({ color: 0xff0000 })
  );
  mesh.castShadow = mesh.receiveShadow = true;

  attributes.position.on(position => mesh.position.copy(position ?? new Vector3()));
  attributes.quaternion.on(rotation => {
    mesh.quaternion.copy(rotation ?? new Quaternion(0, 0, 0, 1));
  });

  context[GraphContext].add(mesh);
  context[GraphContext] = mesh;

  render`<slot></slot>`;
});