import { test, expect } from "@playwright/test";
import { createLife, saveLife } from "../src/game/life.js";
import {
  FOREST_DEER,
  stepForestWildlife,
} from "../src/game/forest-wildlife.js";
test("deer react to approach and moving jeeps, then settle; saves preserve their state", () => {
  const life = createLife();
  life.clock = 8 * 120;
  life.weather.rain = 0;
  const p = life.forestWildlife[0];
  stepForestWildlife(life, 0.1, { x: p.x - 18, z: p.z });
  expect(p.mode).toBe("alert");
  const before = p.x;
  stepForestWildlife(life, 0.1, { x: p.x - 5, z: p.z });
  expect(p.mode).toBe("retreating");
  expect(p.x).toBeGreaterThan(before);
  const restored = createLife(saveLife(life));
  expect(restored.forestWildlife).toEqual(life.forestWildlife);
  for (let i = 0; i < 200; i++) stepForestWildlife(life, 0.1, null);
  expect(p.calm).toBe(0);
  expect(["walking", "grazing", "alert"]).toContain(p.mode);
  life.jeep.x = p.x - 25;
  life.jeep.z = p.z;
  life.jeep.speed = 10;
  stepForestWildlife(life, 0.1, null);
  expect(p.calm).toBe(8);
  expect(["retreating", "alert"]).toContain(p.mode);
  for (let i = 0; i < 1000; i++) stepForestWildlife(life, 0.1, null);
  expect(
    Math.hypot(p.x - FOREST_DEER[0].x, p.z - FOREST_DEER[0].z),
  ).toBeLessThan(40);
});

test("forest tree clearance covers the whole movement segment and deer stay clear", async () => {
  const { FOREST_TREES, clearForestStep } = await import(
    "../src/game/forest-layout.js"
  );
  const tree = FOREST_TREES[0];
  expect(clearForestStep(tree.x - 3, tree.z, tree.x + 3, tree.z)).toBe(false);
  const life = createLife();
  life.clock = 8 * 120;
  life.weather.rain = 0;
  for (const p of life.forestWildlife)
    expect(clearForestStep(p.x, p.z, p.x, p.z)).toBe(true);
  for (let i = 0; i < 1200; i++) {
    const previous = life.forestWildlife.map((p) => ({ ...p }));
    life.clock += 0.1;
    stepForestWildlife(life, 0.1, { x: 500, z: -90 });
    life.forestWildlife.forEach((p, j) => {
      expect(clearForestStep(previous[j].x, previous[j].z, p.x, p.z)).toBe(
        true,
      );
      expect(Math.hypot(p.x - previous[j].x, p.z - previous[j].z)).toBeLessThan(
        0.35,
      );
    });
  }
});
