import { FOREST_TREES } from "./forest-layout.js";
import * as THREE from "three";
import { HIGHLAND_ROADS } from "./highland-data.js";
export function buildHighlandView({
  group,
  block,
  ground,
  sign,
  roundTree,
  instance,
  sphere,
  m,
  terrainHeight,
}) {
  const samples = HIGHLAND_ROADS.flatMap((r) =>
    new THREE.CatmullRomCurve3(
      r.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      "catmullrom",
      0.12,
    ).getSpacedPoints(220),
  );
  const clear = (x, z) =>
    !samples.some((p) => Math.hypot(p.x - x, p.z - z) < 10) &&
    Math.hypot(x - 731, z - 136) > 35;
  // Reuse instanced foliage: denser woodland along the climb, open at the ridge.
  for (let x = 405; x < 744; x += 14)
    for (let z = -25; z < 205; z += 15) {
      const px = x + Math.sin(x * 1.7 + z) * 4,
        pz = z + Math.cos(z * 1.3 + x) * 4;
      if (clear(px, pz)) roundTree(px, pz, 0.8 + (Math.sin(x + z) + 1) * 0.22);
    }
  for (const { x: px, z: pz, size } of FOREST_TREES) {
    roundTree(px, pz, size);
    instance(
      sphere,
      m.olive,
      px + 2,
      terrainHeight(px + 2, pz) + 0.4,
      pz,
      1.2,
      0.65,
      1.3,
    );
  }
  ground("Forest stopping place", 481, 492, -113, -104, m.laterite, 0.09, 1);
  // A shaded pause facing the canopy, leaving the road-side entry clear.
  const bench = group(
    "Forest viewing bench",
    490,
    terrainHeight(490, -107),
    -107,
  );
  block(bench, m.wood, 0, 0.55, 0, 0.7, 0.16, 3);
  block(bench, m.wood, 0.3, 0.95, 0, 0.12, 0.75, 3);
  for (const z of [-1.1, 1.1])
    block(bench, m.darkWood, 0, 0.25, z, 0.5, 0.5, 0.15);
  const stopping = group(
    "Forest stopping marker",
    490,
    terrainHeight(490, -111),
    -111,
  );
  sign(
    stopping,
    "FOREST PAUSE",
    "PARK • LISTEN • LOOK UP",
    0,
    1.8,
    0,
    3,
    Math.PI / 2,
  );
  const forestSign = group("Forest turning", 487, terrainHeight(487, 39), 39);
  sign(forestSign, "FOREST CHURAM", "BENDS AHEAD • TAKE IT SLOW", 0, 2, 0, 4);
  // Contour-like cultivated bands beside the estate branch.
  for (let x = 474; x <= 520; x += 4)
    for (let z = 12; z <= 74; z += 7) {
      if (!clear(x, z)) continue;
      instance(sphere, m.tea, x, terrainHeight(x, z) + 0.5, z, 1.7, 0.8, 2.1);
    }
  ground("Ridge parking clearing", 720, 742, 125, 145, m.laterite, 0.09, 1);
  const board = group("Hill road turning", 393, terrainHeight(393, 119), 119);
  block(board, m.wood, 0, 1.1, 0, 0.16, 2.2, 0.16);
  sign(board, "HIGH RANGE ROAD", "ESTATE TRACK / RIDGE VIEW", 0, 2.1, 0.1, 5);
  const ridge = group("Ridge marker", 739, terrainHeight(739, 130), 130);
  sign(ridge, "THE LONG VIEW", "PARK AND TAKE A BREATH", 0, 2, 0, 4);
  // Low markers follow the actual curve and stay outside the driving surface.
  for (const road of HIGHLAND_ROADS.filter((r) =>
    ["ridge-climb", "forest-churam"].includes(r.id),
  )) {
    const c = new THREE.CatmullRomCurve3(
      road.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      "catmullrom",
      0.12,
    );
    for (let i = 12; i < 100; i += 3) {
      const p = c.getPointAt(i / 100),
        t = c.getTangentAt(i / 100);
      for (const side of [-1, 1]) {
        const x = p.x - t.z * 5 * side,
          z = p.z + t.x * 5 * side;
        const post = group("Hill edge reflector", x, terrainHeight(x, z), z);
        block(post, m.white, 0, 0.35, 0, 0.22, 0.7, 0.22);
        block(post, m.lamp, 0, 0.68, 0, 0.26, 0.1, 0.26);
      }
    }
  }
}
