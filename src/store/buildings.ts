import { Box3, Vector3 } from 'three';

export const PLAYER_RADIUS = 2;

// Pre-expanded building AABB colliders (expanded by PLAYER_RADIUS)
export const buildingColliders: Box3[] = [];

export function registerBuilding(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
) {
  const box = new Box3(
    new Vector3(x - w / 2, y - h / 2, z - d / 2),
    new Vector3(x + w / 2, y + h / 2, z + d / 2),
  );
  box.expandByScalar(PLAYER_RADIUS);
  buildingColliders.push(box);
}
