import { Vector3 } from 'three';

export function applyValue(obj, param, value) {
  if (obj[param] instanceof Vector3) {
    obj[param].copy(value);
  } else {
    obj[param] = value;
  }
}