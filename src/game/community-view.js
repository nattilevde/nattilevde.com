import { SPECTATORS, spectatorPosition } from "./sevens-spectators.js";
import * as THREE from "three";
import { FAITH_SPACES, COMMUNITY_PEOPLE, SEVENS } from "./community-data.js";
import { communityBall } from "./community.js";
export function buildCommunityView({
  group,
  block,
  mesh,
  beam,
  roof,
  sign,
  ground,
  human,
  m,
  sphere,
  cylinder,
  terrainHeight,
}) {
  for (const p of FAITH_SPACES) {
    const place = group(p.name, p.x, terrainHeight(p.x, p.z), p.z);
    block(place, m.earth, 0, -0.5, 0, 10.5, 1.5, 12.5);
    block(place, p.id === "mosque" ? m.white : m.cream, 0, 2, 0, 10, 4, 12);
    roof(place, 0, 4, 0, 12, 14, p.id === "church" ? 3.5 : 2);
    block(place, m.darkWood, 5.03, 1.5, 0, 0.1, 3, 1.6);
    for (const z of [-4, 4]) block(place, m.darkWood, 5.04, 2, z, 0.1, 1.4, 1);
    roof(place, 6.4, 2.8, 0, 3.5, 11, 0.65);
    for (const z of [-4.5, 4.5])
      block(place, m.wood, 7.7, 1.4, z, 0.18, 2.8, 0.18);
    if (p.id === "church") {
      block(place, m.white, 3, 7.6, 0, 0.25, 2, 0.25);
      block(place, m.white, 3, 7.8, 0, 0.25, 0.22, 1.3);
    } else if (p.id === "mosque") {
      mesh(place, cylinder, m.gold, 0, 6.4, 0, 0.07, 0.9, 0.07);
      mesh(place, sphere, m.gold, 0, 6.95, 0, 0.18, 0.18, 0.18);
    } else {
      mesh(place, cylinder, m.gold, 6.5, 0.9, -4, 0.09, 1.8, 0.09);
      mesh(place, cylinder, m.gold, 6.5, 1.4, -4, 0.35, 0.08, 0.35);
    }
    ground(
      `${p.name} footpath`,
      p.x + 5.5,
      p.x + 22,
      p.z - 6,
      p.z + 16,
      m.path,
      0.065,
      2,
    );
    sign(place, p.name, "NEIGHBOURHOOD LANE", 9, 2.4, 6, 4, Math.PI / 2);
  }
  const { x, z } = SEVENS;
  ground("Sevens ground", x - 18, x + 18, z - 22, z + 22, m.sand, 0.07, 2);
  ground("Ground approach", 0, x - 18, z + 19, z + 22, m.path, 0.075, 2);
  const pitch = group("Sevens touchlines", x, 0, z);
  for (const side of [-1, 1]) {
    // Lines follow the same terrain as the players.
    for (let i = -20; i < 20; i++)
      block(
        pitch,
        m.white,
        side * 16,
        terrainHeight(x + side * 16, z + i) + 0.09,
        i,
        0.08,
        0.025,
        1.02,
      );
    for (let i = -16; i < 16; i++)
      block(
        pitch,
        m.white,
        i,
        terrainHeight(x + i, z + side * 20) + 0.09,
        side * 20,
        1.02,
        0.025,
        0.08,
      );
    const goal = group(
      "Local goal frame",
      x,
      terrainHeight(x, z + side * 20),
      z + side * 20,
    );
    beam(goal, m.white, [-3, 0, 0], [-3, 2.2, 0]);
    beam(goal, m.white, [3, 0, 0], [3, 2.2, 0]);
    beam(goal, m.white, [-3, 2.2, 0], [3, 2.2, 0]);
  }
  const shelter = group(
    "Ground rain shelter",
    48,
    terrainHeight(48, -1017),
    -1017,
  );
  roof(shelter, 0, 2.9, 0, 18, 6, 0.7);
  for (const dx of [-8, 8])
    block(shelter, m.wood, dx, 1.45, 2.5, 0.2, 2.9, 0.2);
  sign(
    shelter,
    "MALABAR SEVENS",
    "EVENING SEVENS • WEATHER PERMITTING",
    0,
    2.1,
    3,
    7,
  );
  const scoreboard = sign(
    shelter,
    "TEAL 0 — 0 GOLD",
    "NEIGHBOURHOOD SEVENS",
    0,
    1.1,
    3.1,
    5,
  );
  // Keep lights in the scene even during daylight to avoid shader recompiles at dusk.
  const floodlights = [-1, 1].map((side) => {
    const tower = group(
      "Sevens floodlight",
      x + side * 18,
      terrainHeight(x + side * 18, z),
      z,
    );
    block(tower, m.darkWood, 0, 5.5, 0, 0.18, 11, 0.18);
    block(tower, m.white, 0, 11, 0, 1.4, 0.45, 0.35);
    const light = new THREE.SpotLight(0xffefcd, 0, 65, Math.PI / 2.8, 0.65, 1);
    light.position.set(0, 10.8, 0);
    light.target.position.set(-side * 18, 0, 0);
    tower.add(light, light.target);
    return { tower, light };
  });
  // Low benches leave the approach and players' retreat routes clear.
  for (const offset of [-10, 0, 10]) {
    const bench = group(
      "Pitch-side bench",
      x + 19,
      terrainHeight(x + 19, z + offset),
      z + offset,
    );
    block(bench, m.wood, 0, 0.5, 0, 0.65, 0.16, 5);
    for (const end of [-2, 2])
      block(bench, m.darkWood, 0, 0.25, end, 0.5, 0.5, 0.18);
  }
  const spectatorShelter = group(
    "Supporters rain shelter",
    33,
    terrainHeight(33, -1008),
    -1008,
  );
  roof(spectatorShelter, 0, 2.7, 0, 12, 5, 0.6);
  for (const dx of [-5.5, 5.5])
    block(spectatorShelter, m.wood, dx, 1.35, 2, 0.16, 2.7, 0.16);
  const supporters = SPECTATORS.map((d) => human(d.id, m[d.color], m.trousers));
  let lastScore = "";
  const actors = COMMUNITY_PEOPLE.map((d) =>
    human(d.id, m[d.color], m.trousers),
  );
  const ball = group("Sevens ball");
  mesh(ball, sphere, m.white, 0, 0.18, 0, 0.18, 0.18, 0.18);
  return {
    animated: [
      ball,
      ...supporters.map((a) => a.person),
      ...floodlights.map((f) => f.tower),
      ...actors.map((a) => a.person),
    ],
    update(life, dt) {
      const hour = (life.clock / 120) % 24;
      // Stay lit through rain retreats and departure, then close for the night.
      const brightness = Math.max(
        0,
        Math.min(1, (hour - 17.5) * 2, (22 - hour) * 2),
      );
      for (const { light } of floodlights) light.intensity = brightness * 180;

      const score = life.community.football.score.join(" — ");
      if (score !== lastScore) {
        lastScore = score;
        const canvas = scoreboard.material.map.image,
          ctx = canvas.getContext("2d");
        ctx.fillStyle = "#244d46";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff0c7";
        ctx.textAlign = "center";
        ctx.font = "bold 68px sans-serif";
        ctx.fillText(`TEAL ${score} GOLD`, 384, 145, 720);
        scoreboard.material.map.needsUpdate = true;
      }

      life.community.people.forEach((p, i) => {
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
            : 0;
        });
      });
      life.community.spectators.people.forEach((p, i) => {
        const actor = supporters[i];
        const at = spectatorPosition(p, SPECTATORS[i]);
        const blend = actor.person.userData.placed ? 1 - Math.exp(-18 * dt) : 1;
        actor.person.userData.placed = true;
        actor.person.position.x += (at.x - actor.person.position.x) * blend;
        actor.person.position.z += (at.z - actor.person.position.z) * blend;
        const reaction = Math.min(1, p.remaining);
        actor.person.position.y =
          terrainHeight(actor.person.position.x, actor.person.position.z) +
          (p.reaction > 0
            ? Math.abs(Math.sin(life.clock * 7 + i)) * 0.12 * reaction
            : 0);
        const angle = p.heading - actor.person.rotation.y;
        actor.person.rotation.y +=
          Math.atan2(Math.sin(angle), Math.cos(angle)) * blend;
        actor.limbs.forEach((limb, j) => {
          limb.rotation.x =
            p.mode === "walking"
              ? Math.sin(life.clock * 6 + i) * (j % 2 ? 0.35 : -0.35)
              : j >= 2
                ? reaction * (p.reaction > 0 ? -2.4 : -0.8)
                : 0;
        });
      });
      const b = communityBall(life.community);
      const blend =
        ball.userData.placed && ball.userData.active === life.community.active
          ? 1 - Math.exp(-18 * dt)
          : 1;
      ball.userData.placed = true;
      ball.userData.active = life.community.active;
      ball.position.x += (b.x - ball.position.x) * blend;
      ball.position.z += (b.z - ball.position.z) * blend;
      ball.position.y = terrainHeight(ball.position.x, ball.position.z) + 0.08;
    },
  };
}
