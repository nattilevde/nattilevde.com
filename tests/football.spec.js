import { test, expect } from "@playwright/test";
import { createCommunity } from "../src/game/community.js";
import { stepFootball, footballTarget } from "../src/game/football.js";
function setup() {
  const c = createCommunity();
  c.people
    .slice(9)
    .forEach((p, i) =>
      Object.assign(p, { x: 42 + i * 2, z: i < 7 ? -1049 : -1031 }),
    );
  return c;
}
test("possession follows the dribbler and produces a shot near goal", () => {
  const c = setup(),
    p = c.people[10];
  p.x = 55;
  p.z = -1030;
  c.football.time = 2;
  stepFootball(c, 0.1);
  expect(c.football.shots).toBe(1);
  expect(c.football.holder).toBe(-1);
  expect(c.football.vz).toBeGreaterThan(0);
});
test("goalkeeper intercepts swept shots; an unobstructed shot scores", () => {
  const c = setup();
  c.people.slice(9).forEach((p) => {
    p.x = 40;
    p.z = -1040;
  });
  const keeper = c.people[16];
  keeper.x = 55;
  keeper.z = -1022;
  Object.assign(c.football, {
    x: 55,
    z: -1024,
    vx: 0,
    vz: 19,
    holder: -1,
    shot: true,
    last: 1,
    time: 1,
  });
  stepFootball(c, 0.2);
  expect(c.football.holder).toBe(7);
  expect(c.football.saves).toBe(1);
  keeper.x = 40;
  Object.assign(c.football, {
    x: 55,
    z: -1021,
    vx: 0,
    vz: 19,
    holder: -1,
    shot: true,
    last: 1,
    time: 1,
  });
  stepFootball(c, 0.1);
  expect(c.football.score[0]).toBe(1);
  expect(c.football.restart).toBeGreaterThan(0);
  expect(footballTarget(c, 0).z).toBe(-1058);
});

test("an unattended game produces passes, shots and saves rather than stalling", async () => {
  const { createLife, advanceLife } = await import("../src/game/life.js");
  const s = createLife();
  s.clock = 16 * 120;
  s.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
  advanceLife(s, 160);
  expect(s.community.football.passes).toBeGreaterThan(0);
  expect(s.community.football.shots).toBeGreaterThan(0);
  expect(s.community.football.saves).toBeGreaterThan(0);
});
