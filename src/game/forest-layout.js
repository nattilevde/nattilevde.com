import * as THREE from "three";
import { HIGHLAND_ROADS } from "./highland-data.js";
// One layout feeds rendering and wildlife navigation.
const samples = HIGHLAND_ROADS.flatMap((r) =>
  new THREE.CatmullRomCurve3(
    r.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    "catmullrom",
    0.12,
  ).getSpacedPoints(220),
);
export const FOREST_TREES = [];
for (let x = 410; x < 535; x += 11)
  for (let z = -165; z < 8; z += 12) {
    const px = x + Math.sin(z + x) * 2,
      pz = z + Math.cos(x) * 2;
    if (
      samples.some((p) => Math.hypot(p.x - px, p.z - pz) < 10) ||
      Math.hypot(px - 486, pz + 109) < 12
    )
      continue;
    FOREST_TREES.push({ x: px, z: pz, size: 1.1 + Math.sin(x * z) * 0.2 });
  }
const trunks = [
  ...FOREST_TREES,
  { x: 506, z: -119, size: 1 },
  { x: 528, z: -62, size: 1 },
];
export function clearForestStep(ax, az, bx, bz) {
  const dx = bx - ax,
    dz = bz - az,
    length = dx * dx + dz * dz;
  return trunks.every((tree) => {
    const t = length
      ? Math.max(
          0,
          Math.min(1, ((tree.x - ax) * dx + (tree.z - az) * dz) / length),
        )
      : 0;
    return (
      Math.hypot(tree.x - ax - t * dx, tree.z - az - t * dz) >
      0.9 + tree.size * 0.35
    );
  });
}
