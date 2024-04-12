import { BoxGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry, DodecahedronGeometry, IcosahedronGeometry, LatheGeometry, OctahedronGeometry, PlaneGeometry, PolyhedronGeometry, RingGeometry, SphereGeometry, TetrahedronGeometry, TorusGeometry, TorusKnotGeometry, TubeGeometry } from 'three';
import { registerComponent, ALL_ATTRIBUTES } from 'vena';
import { GraphContext } from './context.js';
import { applyValue } from './utils.js';
[
  { name: 'three-geometry-box', constructor: BoxGeometry },
  { name: 'three-geometry-capsule', constructor: CapsuleGeometry },
  { name: 'three-geometry-cone', constructor: ConeGeometry },
  { name: 'three-geometry-cylinder', constructor: CylinderGeometry },
  { name: 'three-geometry-dodecahedron', constructor: DodecahedronGeometry },
  { name: 'three-geometry-icosahedron', constructor: IcosahedronGeometry },
  { name: 'three-geometry-lathe', constructor: LatheGeometry },
  { name: 'three-geometry-octahedron', constructor: OctahedronGeometry },
  { name: 'three-geometry-plane', constructor: PlaneGeometry },
  { name: 'three-geometry-polyhedron', constructor: PolyhedronGeometry },
  { name: 'three-geometry-ring', constructor: RingGeometry },
  { name: 'three-geometry-sphere', constructor: SphereGeometry },
  { name: 'three-geometry-tetrahedron', constructor: TetrahedronGeometry },
  { name: 'three-geometry-torus', constructor: TorusGeometry },
  { name: 'three-geometry-torusknot', constructor: TorusKnotGeometry },
  { name: 'three-geometry-tube', constructor: TubeGeometry },
].forEach(({ name, constructor }) => {
  registerComponent(name, ({ render, attributes, context }) => {
    const geometry = constructor.fromJSON(attributes[ALL_ATTRIBUTES].value);

    context[GraphContext].geometry = geometry;
    context[GraphContext] = geometry;

    render`<slot></slot>`;
  });
});
