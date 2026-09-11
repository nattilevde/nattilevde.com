import * as THREE from "three";

// Reuse persistent surface wetness; rain scheduling and driving grip are unchanged.
export function groundDampness(weather) {
  const value = Number(weather?.wetness ?? weather?.rain ?? 0);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}
export const PUDDLE_PATCHES = [
  [1.8, 44, 0.7, 1.8],
  [-1.4, 18, 0.8, 1.2],
  [3.4, -44, 0.65, 1.6],
  [57.7, 78, 0.55, 1.4],
  [235, 110, 1.5, 0.65],
  [282, 112, 1.2, 0.7],
  [321, 109, 1.4, 0.6],
  [341, 124, 1.6, 0.9],
  [365, 128, 1.2, 0.85],
  [252, 128.6, 2.2, 0.32],
  [278, 152.6, 2, 0.32],
  [300, 128.6, 2, 0.32],
];
export function buildWetGround({
  group,
  material,
  ownGeometry,
  terrainHeight,
}) {
  const root = group("Rainwater in lane and field hollows");
  const positions = [];
  for (const [x, z, rx, rz] of PUDDLE_PATCHES) {
    for (let i = 0; i < 20; i++) {
      const point = (j) => {
        const angle = (j / 20) * Math.PI * 2;
        const edge = 1 + Math.sin(angle * 3 + x) * 0.13;
        const px = x + Math.sin(angle) * rx * edge;
        const pz = z + Math.cos(angle) * rz * edge;
        return [px, terrainHeight(px, pz) + 0.125, pz];
      };
      positions.push(
        x,
        terrainHeight(x, z) + 0.125,
        z,
        ...point(i),
        ...point(i + 1),
      );
    }
  }
  const geometry = ownGeometry(new THREE.BufferGeometry());
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.computeVertexNormals();
  const surface = material("#647f79", {
    roughness: 0.22,
    metalness: 0.18,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  root.add(new THREE.Mesh(geometry, surface));
  return {
    animated: [root],
    update(weather) {
      const damp = groundDampness(weather);
      surface.opacity = Math.max(0, damp - 0.12) * 0.62;
      root.visible = surface.opacity > 0.005;
    },
  };
}
