import * as THREE from "three";
import {
  POOKALAM,
  pookalamStage,
  FLOWER_NEIGHBOURS,
  flowerNeighbourPosition,
} from "./onam.js";
export function buildOnamView({
  group,
  cylinder,
  m,
  terrainHeight,
  human,
  mesh,
}) {
  const root = group(
    "Neighbourhood flower carpet",
    POOKALAM.x,
    terrainHeight(POOKALAM.x, POOKALAM.z) + 0.08,
    POOKALAM.z,
  );
  const flowers = new THREE.InstancedMesh(cylinder, m.white, 200);
  const accent = new THREE.InstancedMesh(cylinder, m.gold, 12);
  root.add(flowers, accent);
  const transform = new THREE.Object3D();
  const palette = ["#e8b62d", "#f5e5bd", "#db6c30", "#a73e59", "#679249"];
  for (let ring = 0; ring < 10; ring++) {
    for (let petal = 0; petal < 20; petal++) {
      const angle = (petal * Math.PI) / 10 + ring * 0.12;
      const radius = 0.15 + ring * 0.17;
      transform.position.set(
        Math.sin(angle) * radius,
        ring * 0.001,
        Math.cos(angle) * radius,
      );
      transform.scale.set(0.13, 0.025, 0.13);
      transform.updateMatrix();
      const index = ring * 20 + petal;
      flowers.setMatrixAt(index, transform.matrix);
      flowers.setColorAt(
        index,
        new THREE.Color(palette[ring % palette.length]),
      );
    }
  }
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    transform.position.set(Math.sin(angle) * 2, 0.015, Math.cos(angle) * 2);
    transform.scale.set(0.15, 0.035, 0.15);
    transform.updateMatrix();
    accent.setMatrixAt(i, transform.matrix);
  }
  flowers.computeBoundingSphere();
  flowers.count = 20;
  accent.visible = false;
  const actors = FLOWER_NEIGHBOURS.map((definition) =>
    human(definition.name, m[definition.color]),
  );
  // Flower trays mark the work area without occupying the lane.
  for (const [x, z] of [
    [-7.8, 49.5],
    [-4.5, 46.2],
  ]) {
    const tray = group("Flower tray", x, terrainHeight(x, z), z);
    mesh(tray, cylinder, m.wood, 0, 0.15, 0, 0.38, 0.18, 0.38);
    mesh(tray, cylinder, m.gold, 0, 0.25, 0, 0.32, 0.035, 0.32);
  }
  return {
    animated: [root, ...actors.map((a) => a.person)],
    update(life, dt) {
      actors.forEach((actor, i) => {
        const neighbour = life.onam.neighbours[i];
        const position = flowerNeighbourPosition(
          neighbour,
          FLOWER_NEIGHBOURS[i],
        );
        const blend = actor.person.userData.placed ? 1 - Math.exp(-18 * dt) : 1;
        actor.person.userData.placed = true;
        actor.person.position.x +=
          (position.x - actor.person.position.x) * blend;
        actor.person.position.z +=
          (position.z - actor.person.position.z) * blend;
        actor.person.position.y = terrainHeight(
          actor.person.position.x,
          actor.person.position.z,
        );
        const turn = Math.atan2(
          Math.sin(neighbour.heading - actor.person.rotation.y),
          Math.cos(neighbour.heading - actor.person.rotation.y),
        );
        actor.person.rotation.y += turn * blend;
        const work = neighbour.mode === "arranging";
        actor.person.rotation.x = work
          ? -0.25 - Math.sin(life.clock * 1.2 + i) * 0.12
          : 0;
        actor.limbs.forEach((limb, j) => {
          limb.rotation.x =
            neighbour.mode === "walking"
              ? Math.sin(life.clock * 6 + i) * (j % 2 ? 0.35 : -0.35)
              : work && j >= 2
                ? -0.55 + Math.sin(life.clock * 1.2 + i + j) * 0.25
                : neighbour.mode === "visiting" && j === 2
                  ? Math.sin(life.clock * 0.9 + i) * 0.18
                  : 0;
        });
      });
      flowers.count = pookalamStage(life) * 20;
      accent.visible = !!life.onam?.helped;
    },
  };
}
