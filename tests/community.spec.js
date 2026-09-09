import { test, expect } from "@playwright/test";
import {
  createLife,
  advanceLife,
  saveLife,
  observeLife,
} from "../src/game/life.js";
import {
  COMMUNITY_PEOPLE,
  FAITH_SPACES,
  SEVENS,
} from "../src/game/community-data.js";
import { canWalk } from "../src/game/world.js";
function dry(life) {
  life.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
}
test("community routes and rain retreats stay outside solids", () => {
  for (const d of COMMUNITY_PEOPLE)
    for (const a of [d.home, d.visit, d.shelter])
      for (const b of [d.home, d.visit, d.shelter]) {
        for (let t = 0; t <= 1; t += 0.02)
          expect(
            canWalk(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t),
            d.id,
          ).toBe(true);
      }
  for (const p of FAITH_SPACES) expect(canWalk(p.x, p.z)).toBe(false);
});
test("sevens needs both teams present, stops in rain and resumes consistently after reload", () => {
  const life = createLife();
  dry(life);
  life.clock = 16 * 120;
  expect(life.community.active).toBe(false);
  advanceLife(life, 65);
  expect(life.community.active).toBe(true);
  expect(
    life.community.people.slice(9).filter((p) => p.mode === "visiting"),
  ).toHaveLength(14);
  observeLife(life, SEVENS);
  expect(life.memories.some((m) => m.id.startsWith("sevens-"))).toBe(true);
  const restored = createLife(saveLife(life));
  advanceLife(life, 20);
  advanceLife(restored, 20);
  expect(restored.community).toEqual(life.community);
  life.weather.rain = 0.8;
  life.weather.target = 0.8;
  life.weather.sheltering = true;
  advanceLife(life, 35);
  expect(life.community.active).toBe(false);
  expect(
    life.community.people.slice(9).every((p) => p.mode === "sheltering"),
  ).toBe(true);
  life.clock = 19 * 120;
  advanceLife(life, 60);
  expect(life.community.people.every((p) => p.mode === "home")).toBe(true);
});
test("faith lane visits vary by hour without requiring the player", () => {
  const life = createLife();
  dry(life);
  life.clock = 7 * 120;
  advanceLife(life, 45);
  expect(
    life.community.people.filter(
      (p) => p.id.startsWith("mosque") && p.mode === "visiting",
    ),
  ).toHaveLength(3);
  expect(
    life.community.people.filter(
      (p) => p.id.startsWith("church") && p.mode === "visiting",
    ),
  ).toHaveLength(0);
});
