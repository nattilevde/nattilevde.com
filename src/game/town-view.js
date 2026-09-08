import { TOWN_BUILDINGS, TOWN_PEOPLE } from "./town-data.js";
export function buildTownView({
  group,
  block,
  mesh,
  roof,
  sign,
  ground,
  human,
  palm,
  roundTree,
  sphere,
  cylinder,
  m,
  terrainHeight,
}) {
  ground("Harbour walking edge", -79, -72, -343, -188, m.sand, 0.07, 2);
  ground("Town parking", 5, 27, -384, -365, m.earth, 0.075, 2);
  for (let x = 8; x < 27; x += 6)
    ground("Town parking line", x, x + 0.12, -382, -368, m.cream, 0.09, 2);
  const park = group("Town parking board", 7, terrainHeight(7, -365), -365);
  sign(park, "TOWN PARKING", "HARBOUR QUARTER", 0, 2, 0, 4);
  const shelter = group(
    "Harbour roadside shelter",
    10,
    terrainHeight(10, -177),
    -177,
  );
  roof(shelter, 0, 2.8, 0, 7, 7, 0.8);
  for (const x of [-2.5, 2.5])
    block(shelter, m.wood, x, 1.4, 2.5, 0.15, 2.8, 0.15);
  block(shelter, m.wood, 0, 0.6, 0, 4, 0.13, 0.8);
  sign(shelter, "HARBOUR ROAD", "PADDY LANE → EAST", 0, 2.4, 3, 5.5);
  const shopNames = [
    "GENERAL STORES",
    "BAKERY",
    "CLOTH & THREAD",
    "BOAT SUPPLIES",
    "HARDWARE",
    "FRUIT & VEG",
  ];
  TOWN_BUILDINGS.forEach((b, i) => {
    const yard = group("Town frontage", b.x, terrainHeight(b.x, b.z), b.z);
    if (b.floors === 2)
      for (const side of [-1, 1])
        for (const z of [-3, 3])
          block(
            yard,
            m.darkWood,
            side * (b.w / 2 + 0.04),
            4.4,
            z,
            0.12,
            1.25,
            1.4,
          );
    if (i < 15) {
      const side = b.x < 0 ? 1 : -1,
        front = side * (b.w / 2 + 1.1);
      if (i % 3 !== 0)
        sign(
          yard,
          shopNames[i % 6],
          "KADAL HARBOUR QUARTER",
          front,
          2.3,
          0,
          4,
          (side * Math.PI) / 2,
        );
      for (const z of [-4, 4]) {
        mesh(yard, cylinder, m.roof, front, 0.3, z, 0.25, 0.6, 0.25);
        mesh(yard, sphere, m.leaf, front, 0.85, z, 0.5, 0.5, 0.5);
      }
    } else {
      palm(b.x + 8, b.z - 8, 0.75);
      roundTree(b.x - 7, b.z + 6, 0.8);
    }
  });
  for (let z = -330; z <= -200; z += 26) {
    const at = group("Boat work shelter", -76, terrainHeight(-76, z), z);
    block(at, m.wood, 0, 0.4, 0, 3.5, 0.15, 3);
    for (let i = 0; i < 3; i++)
      block(at, m.rope, -0.9 + i * 0.8, 0.65, 0, 0.65, 0.4, 1.3);
    palm(-72, z + 9, 0.9);
  }
  const boats = [];
  for (let i = 0; i < 4; i++) {
    const boat = group(
      "Moored coastal boat",
      -90 - (i % 2) * 3,
      -0.05,
      -226 - i * 28,
    );
    mesh(boat, sphere, i % 2 ? m.teal : m.wood, 0, 0, 0, 1.3, 0.48, 4);
    block(boat, m.cream, 0, 0.24, 0, 1.7, 0.1, 5.8);
    for (const z of [-1.5, 1.5])
      block(boat, m.wood, 0, 0.45, z, 1.8, 0.12, 0.4);
    boats.push(boat);
  }
  for (const [x, z] of [
    [-54, -180],
    [-53, -359],
    [145, -177],
    [154, -107],
    [144, -14],
  ])
    palm(x, z, 1);
  const actors = TOWN_PEOPLE.map((d) => human(d.name, m[d.color], m.trousers));
  return {
    animated: [...boats, ...actors.map((a) => a.person)],
    update(life, dt) {
      boats.forEach((b, i) => {
        b.position.y = -0.05 + Math.sin(life.clock * 0.8 + i) * 0.025;
        b.rotation.z = Math.sin(life.clock * 0.6 + i) * 0.02;
      });
      life.town.people.forEach((p, i) => {
        const a = actors[i],
          blend = a.person.userData.placed ? 1 - Math.exp(-18 * dt) : 1;
        a.person.userData.placed = true;
        a.person.position.x += (p.x - a.person.position.x) * blend;
        a.person.position.z += (p.z - a.person.position.z) * blend;
        a.person.position.y = terrainHeight(
          a.person.position.x,
          a.person.position.z,
        );
        a.person.rotation.y = p.heading;
        a.limbs.forEach((limb, j) => {
          limb.rotation.x = p.moving
            ? Math.sin(life.clock * 6) * (j % 2 ? -0.4 : 0.4)
            : p.mode === "harbour" && j > 1
              ? 0.7 + Math.sin(life.clock * 2) * 0.2
              : 0;
        });
      });
    },
  };
}
