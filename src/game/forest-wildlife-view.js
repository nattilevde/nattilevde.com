export function buildForestWildlifeView({
  group,
  mesh,
  sphere,
  m,
  terrainHeight,
  block,
}) {
  const deer = Array.from({ length: 3 }, (_, i) => {
    const root = group("Forest deer");
    mesh(root, sphere, m.wood, 0, 0.95, 0, 0.4, 0.45, 0.8);
    const head = group("Deer head");
    root.add(head);
    head.position.set(0, 1.4, -0.65);
    mesh(head, sphere, m.wood, 0, 0, 0, 0.23, 0.32, 0.35);
    for (const side of [-1, 1])
      mesh(head, sphere, m.wood, side * 0.2, 0.28, 0, 0.12, 0.23, 0.07);
    mesh(head, sphere, m.black, 0, 0, -0.29, 0.13, 0.12, 0.11);
    for (const side of [-1, 1]) {
      mesh(head, sphere, m.black, side * 0.19, 0.06, -0.13, 0.045, 0.055, 0.04);
      mesh(head, sphere, m.cream, side * 0.2, 0.27, -0.035, 0.065, 0.15, 0.025);
    }
    mesh(root, sphere, m.cream, 0, 0.79, 0.1, 0.29, 0.19, 0.58);
    const tail = mesh(root, sphere, m.wood, 0, 1.02, 0.76, 0.09, 0.12, 0.26);
    const legs = [];
    for (const x of [-0.25, 0.25])
      for (const z of [-0.5, 0.5]) {
        const leg = group("Deer leg");
        root.add(leg);
        leg.position.set(x, 0.8, z);
        mesh(leg, sphere, m.wood, 0, -0.35, 0, 0.08, 0.45, 0.09);
        legs.push(leg);
      }
    root.scale.setScalar(i === 2 ? 0.75 : 1);
    return { root, head, legs, tail };
  });
  const squirrels = [
    [506, -119],
    [528, -62],
  ].map(([x, z]) => {
    const tree = group("Canopy squirrel tree", x, terrainHeight(x, z), z);
    mesh(tree, sphere, m.trunk, 0, 2.7, 0, 0.32, 3, 0.32);
    block(tree, m.wood, 1.2, 4.3, 0, 3, 0.16, 0.2);
    mesh(tree, sphere, m.leaf, 0, 6.2, 0, 2.4, 1.8, 2.3);
    mesh(tree, sphere, m.olive, -1.2, 5.3, 0, 1.7, 1.3, 1.6);
    const animal = group("Canopy squirrel");
    tree.add(animal);
    mesh(animal, sphere, m.darkWood, 0, 0.22, 0, 0.45, 0.24, 0.22);
    mesh(animal, sphere, m.cream, 0.2, 0.12, 0, 0.24, 0.12, 0.17);
    mesh(animal, sphere, m.wood, 0.42, 0.35, 0, 0.2, 0.19, 0.18);
    for (const side of [-1, 1]) {
      mesh(animal, sphere, m.black, 0.51, 0.4, side * 0.13, 0.035, 0.04, 0.035);
      mesh(animal, sphere, m.wood, 0.34, 0.53, side * 0.11, 0.07, 0.11, 0.06);
    }
    const tail = mesh(
      animal,
      sphere,
      m.darkWood,
      -0.5,
      0.46,
      0,
      0.65,
      0.25,
      0.2,
    );
    tail.rotation.z = -0.5;
    return { tree, animal, tail, x, z, reach: null };
  });
  return {
    animated: [...deer.map((d) => d.root), ...squirrels.map((s) => s.tree)],
    update(life, dt, player = {}) {
      squirrels.forEach((s, i) => {
        const hour = (life.clock / 120) % 24;
        const disturbed =
          Math.hypot((player.x ?? 0) - s.x, (player.z ?? 0) - s.z) < 18 ||
          (Math.abs(life.jeep.speed) > 3 &&
            Math.hypot(life.jeep.x - s.x, life.jeep.z - s.z) < 28);
        const tucked =
          disturbed || hour < 6 || hour > 18 || life.weather.rain > 0.4;
        const target = tucked
          ? -0.65
          : 1.1 + Math.sin(life.clock * 0.3 + i) * 0.45;
        s.reach =
          s.reach === null
            ? target
            : s.reach + (target - s.reach) * (1 - Math.exp(-dt * 2));
        s.animal.position.set(s.reach, 4.4, 0);
        s.animal.rotation.y = tucked ? Math.PI : 0;
        s.tail.rotation.z = -0.5 + Math.sin(life.clock * 1.5 + i) * 0.08;
      });
      life.forestWildlife.forEach((p, i) => {
        const d = deer[i],
          blend = d.root.userData.placed ? 1 - Math.exp(-16 * dt) : 1;
        d.root.userData.placed = true;
        d.root.position.x += (p.x - d.root.position.x) * blend;
        d.root.position.z += (p.z - d.root.position.z) * blend;
        d.root.position.y = terrainHeight(d.root.position.x, d.root.position.z);
        const angle = p.heading - d.root.rotation.y;
        d.root.rotation.y +=
          Math.atan2(Math.sin(angle), Math.cos(angle)) * blend;
        d.tail.rotation.y =
          p.mode === "alert" ? Math.sin(life.clock * 5 + i) * 0.35 : 0;
        d.head.rotation.x =
          p.mode === "grazing"
            ? 0.7 + Math.sin(life.clock * 1.5 + i) * 0.12
            : 0;
        d.legs.forEach(
          (leg, j) =>
            (leg.rotation.x = ["walking", "retreating"].includes(p.mode)
              ? Math.sin(life.clock * (p.mode === "retreating" ? 10 : 4) + i) *
                (j % 2 ? 0.4 : -0.4)
              : 0),
        );
      });
    },
  };
}
