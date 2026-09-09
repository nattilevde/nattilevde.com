import { PADDY_PEOPLE } from "./paddy-data.js";
export function buildPaddyView({
  group,
  block,
  mesh,
  beam,
  roof,
  sign,
  ground,
  human,
  instance,
  box,
  sphere,
  cylinder,
  m,
  terrainHeight,
  material,
}) {
  const paddyWater = material("#6f9471", { roughness: 0.38 });
  ground("Paddy village lane", 215, 381, 108, 114, m.path, 0.075, 2);
  ground("Laterite loop connection", 214, 223, 108, 123, m.path, 0.08, 2);
  ground("Homes footpath", 250, 325, 83, 87, m.path, 0.065, 2);
  for (const x of [255, 271, 300, 319])
    ground("Lane approach", x - 1, x + 1, 85, 111, m.path, 0.07, 2);
  // Terrain-following channels and bunds keep the irrigation legible from the lane.
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++) {
      const x = 243 + col * 24,
        z = 129 + row * 24;
      ground("Wet paddy plot", x, x + 21, z, z + 21, paddyWater, 0.03, 2);
      ground(
        "Raised field bund",
        x - 1.2,
        x + 22,
        z - 1.2,
        z + 0.5,
        m.earth,
        0.1,
        2,
      );
      ground(
        "Irrigation channel",
        x + 21,
        x + 23,
        z,
        z + 22,
        m.glass,
        0.035,
        2,
      );
      for (let a = 2; a < 20; a += 1)
        for (let b = 2; b < 20; b += 1) {
          const px = x + a,
            pz = z + b,
            h = terrainHeight(px, pz);
          instance(
            box,
            (col + row) % 2 ? m.gold : m.tea,
            px,
            h + 0.35,
            pz,
            0.07,
            0.65,
            0.07,
            0,
            0,
            0.12,
          );
          instance(
            box,
            m.tea,
            px + 0.13,
            h + 0.28,
            pz,
            0.05,
            0.5,
            0.05,
            0,
            0,
            -0.25,
          );
        }
    }
  const board = group("Paddy lane turn", 229, terrainHeight(229, 112), 112);
  sign(board, "PADDY LANE", "HOMES • FIELDS • PRODUCE", 0, 2, 0, 4.5);
  const court = group("Children's courtyard", 287, terrainHeight(287, 93), 93);
  ground("Courtyard earth", 278, 297, 87, 100, m.sand, 0.075, 2);
  // Low rails make the vehicle boundary visible; foot approaches remain open.
  for (let x = 278; x <= 297; x += 2)
    block(court, m.wood, x - 287, 0.5, 8, 0.12, 1, 0.12);
  beam(court, m.wood, [-9, 0.75, 8], [10, 0.75, 8], 0.045);
  for (const x of [-9, 10])
    beam(court, m.wood, [x, 0.65, -6], [x, 0.65, 8], 0.045);
  const market = group(
    "Paddy lane produce stall",
    312,
    terrainHeight(312, 99),
    99,
  );
  roof(market, 0, 2.6, 0, 10, 7, 0.9);
  for (const x of [-4, 4]) block(market, m.wood, x, 1.3, 2, 0.18, 2.6, 0.18);
  block(market, m.wood, 0, 0.85, 1, 6, 0.15, 1.2);
  sign(
    market,
    "TODAY'S PRODUCE",
    "A SMALL NEIGHBOURHOOD STALL",
    0,
    2.5,
    3.55,
    6,
  );
  const produce = group("Produce baskets", 312, terrainHeight(312, 99), 99);
  const fruit = Array.from({ length: 12 }, (_, i) =>
    mesh(
      produce,
      sphere,
      i % 2 ? m.gold : m.olive,
      -2.5 + (i % 6),
      1.06,
      0.7 + Math.floor(i / 6) * 0.5,
      0.2,
      0.17,
      0.22,
    ),
  );
  for (const x of [260, 285, 311]) {
    const yard = group("Shaded home veranda", x, terrainHeight(x, 82), 82);
    roof(yard, 0, 2.6, 0, 10, 5, 0.55);
    for (const side of [-1, 1])
      block(yard, m.wood, side * 4, 1.3, 1.5, 0.13, 2.6, 0.13);
    block(yard, m.wood, -3, 0.55, 0, 1.5, 0.12, 0.55);
    for (let i = 0; i < 3; i++) {
      mesh(yard, cylinder, m.roof, 3 + i * 0.45, 0.25, -0.5, 0.18, 0.45, 0.18);
      mesh(yard, sphere, m.leaf, 3 + i * 0.45, 0.65, -0.5, 0.3, 0.4, 0.3);
    }
  }
  ground("Market parking", 332, 377, 117, 133, m.earth, 0.075, 2);
  for (let x = 337; x < 376; x += 7)
    ground("Parking bay line", x, x + 0.12, 120, 131, m.cream, 0.09, 2);
  ground("Market footway", 330, 377, 99, 107, m.sand, 0.08, 2);
  const parking = group("Jeep parking", 332, terrainHeight(332, 130), 130);
  sign(parking, "PARK HERE", "MARKET JUNCTION", 0, 2, 0, 3.5);
  const shutters = [];
  for (const [x, title, id] of [
    [343, "LANE BAKERY", "baker"],
    [363, "CYCLE REPAIRS", "repairer"],
  ]) {
    const shop = group(title, x, terrainHeight(x, 94), 94);
    block(shop, m.cream, 0, 1.5, 0, 10, 3, 6);
    roof(shop, 0, 3, 0, 12, 9, 1.2);
    block(shop, m.darkWood, 0, 1.2, 3.06, 6, 2.3, 0.12);
    sign(shop, title, "PADDY LANE", 0, 2.85, 4.6, 7);
    const shutter = group(`${title} shutter`, x, terrainHeight(x, 94), 94);
    block(shutter, m.teal, 0, 1.2, 3.15, 6, 2.3, 0.15);
    shutters.push({ id, shutter });
    block(shop, m.wood, -3.8, 0.65, 5, 1.2, 0.13, 1);
    for (let i = 0; i < 4; i++)
      mesh(
        shop,
        sphere,
        id === "baker" ? m.gold : m.black,
        -4.2 + i * 0.3,
        0.86,
        5,
        0.14,
        0.12,
        0.14,
      );
  }
  const van = group("Market delivery van");
  block(van, m.teal, 0, 0.9, 0, 3.5, 1.1, 1.8);
  block(van, m.cream, 0.8, 1.7, 0, 1.6, 0.9, 1.8);
  for (const x of [-1.1, 1.1])
    for (const z of [-0.9, 0.9])
      mesh(van, sphere, m.black, x, 0.4, z, 0.4, 0.4, 0.2);
  for (let i = 0; i < 3; i++)
    block(van, m.wood, -1 + i * 0.5, 1.6, 0, 0.4, 0.4, 1.4);
  for (const x of [246, 270, 295, 320]) {
    const yard = group("Garden boundary", x, terrainHeight(x, 68), 68);
    for (let i = 0; i < 9; i++)
      block(yard, m.laterite, i * 0.6, 0.35, 0, 0.58, 0.7, 0.45);
    beam(yard, m.rope, [0, 2, 1], [4.8, 2, 1], 0.025);
    for (let i = 0; i < 3; i++)
      block(
        yard,
        [m.cream, m.rose, m.teal][i],
        1 + i * 1.2,
        1.6,
        1,
        0.7,
        0.8,
        0.04,
      );
  }
  for (let x = 242; x < 315; x += 3) {
    for (const z of [126, 177]) {
      const h = terrainHeight(x, z);
      for (let k = 0; k < 3; k++)
        instance(
          box,
          m.olive,
          x + k * 0.2,
          h + 0.22,
          z,
          0.05,
          0.44,
          0.06,
          0,
          0,
          k * 0.2,
        );
      if (x % 2 === 0)
        instance(sphere, m.lotus, x, h + 0.46, z, 0.09, 0.06, 0.09);
    }
  }
  const actors = PADDY_PEOPLE.map((d) => {
    const a = human(d.name, m[d.color], m.trousers);
    if (d.kind === "child") a.person.scale.setScalar(0.62);
    return a;
  });
  const ball = group("Courtyard ball");
  mesh(ball, sphere, m.orange, 0, 0.15, 0, 0.15, 0.15, 0.15);
  return {
    animated: [
      van,
      ...shutters.map((s) => s.shutter),
      produce,
      ball,
      ...actors.map((a) => a.person),
    ],
    update(life, dt) {
      const s = life.paddy;
      van.position.set(
        s.delivery.x,
        terrainHeight(s.delivery.x, s.delivery.z),
        s.delivery.z,
      );
      shutters.forEach(({ id, shutter }) => {
        shutter.visible = !s.people.some(
          (p) => p.id === id && p.mode === "shop",
        );
      });
      s.people.forEach((p, i) => {
        const a = actors[i],
          t = a.person.userData.placed ? 1 - Math.exp(-18 * dt) : 1;
        a.person.userData.placed = true;
        a.person.position.x += (p.x - a.person.position.x) * t;
        a.person.position.z += (p.z - a.person.position.z) * t;
        a.person.position.y = terrainHeight(
          a.person.position.x,
          a.person.position.z,
        );
        a.person.rotation.y = p.heading;
        a.limbs.forEach((limb, j) => {
          limb.rotation.x = p.moving
            ? Math.sin(life.clock * 6) * (j % 2 ? -0.4 : 0.4)
            : 0;
          if (p.mode === "farm" && j > 1)
            limb.rotation.x = 0.7 + Math.sin(life.clock * 2) * 0.15;
        });
      });
      const kids = s.people.filter((p) => p.mode === "child");
      ball.visible = kids.length >= 2;
      if (ball.visible) {
        const phase = life.clock / 3,
          a = kids[Math.floor(phase) % kids.length],
          b = kids[(Math.floor(phase) + 1) % kids.length],
          t = phase % 1;
        const x = a.x + (b.x - a.x) * t,
          z = a.z + (b.z - a.z) * t;
        ball.position.set(x, terrainHeight(x, z) + 0.03, z);
      }
      const open = s.people.some((p) => p.mode === "market");
      fruit.forEach((f, i) => (f.visible = open && i < s.stock));
    },
  };
}
