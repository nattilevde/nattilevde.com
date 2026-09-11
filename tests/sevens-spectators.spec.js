import { test, expect } from "@playwright/test";
import { createLife, saveLife, advanceLife } from "../src/game/life.js";
import {
  SPECTATORS,
  spectatorRouteLength,
  spectatorPosition,
  stepSpectators,
} from "../src/game/sevens-spectators.js";
import { canWalk } from "../src/game/world.js";
test("supporter routes stay outside the pitch and obstacles", () => {
  for (const d of SPECTATORS)
    for (
      let progress = 0;
      progress <= spectatorRouteLength(d);
      progress += 0.2
    ) {
      const p = spectatorPosition({ progress }, d);
      expect(canWalk(p.x, p.z)).toBe(true);
      expect(p.x < 39 || p.z > -1020).toBe(true);
    }
});
test("supporters watch, react to goals once, shelter and leave with save continuity", () => {
  const life = createLife();
  life.clock = 19 * 120;
  life.weather = {
    rain: 0,
    target: 0,
    wetness: 0,
    remaining: 1000,
    episode: 0,
    sheltering: false,
  };
  advanceLife(life, 60);
  const crowd = life.community.spectators;
  expect(crowd.people.every((p) => p.mode === "watching")).toBe(true);
  life.community.active = true;
  life.community.football.score[0]++;
  stepSpectators(crowd, life, 0.1);
  expect(crowd.people[0].reaction).toBe(1);
  expect(crowd.people[1].reaction).toBe(-1);
  expect(crowd.people.every((p) => p.remaining === 3)).toBe(true);
  stepSpectators(crowd, life, 0.1);
  expect(crowd.people[0].remaining).toBeCloseTo(2.9);
  const restored = createLife(saveLife(life));
  advanceLife(life, 2);
  advanceLife(restored, 2);
  expect(restored.community.spectators).toEqual(life.community.spectators);
  life.weather.rain = life.weather.target = 0.8;
  life.weather.sheltering = true;
  advanceLife(life, 40);
  expect(
    crowd.people.every((p) => p.mode === "sheltering" && p.remaining === 0),
  ).toBe(true);
  life.clock = 22 * 120;
  advanceLife(life, 40);
  expect(crowd.people.every((p) => p.mode === "home" && p.progress === 0)).toBe(
    true,
  );
});
