import { test, expect } from "@playwright/test";
import { POOKALAM, pookalamStage } from "../src/game/onam.js";
import { createLife, saveLife, actOnLife } from "../src/game/life.js";
import { canWalk } from "../src/game/world.js";
test("pookalam grows without participation and fits a walkable clearing", () => {
  const life = createLife();
  expect(pookalamStage(life)).toBe(1);
  life.clock = 4 * 2880;
  expect(pookalamStage(life)).toBe(5);
  life.clock = 30 * 2880;
  expect(pookalamStage(life)).toBe(10);
  for (let angle = 0; angle < Math.PI * 2; angle += 0.2)
    expect(
      canWalk(
        POOKALAM.x + Math.sin(angle) * 2.2,
        POOKALAM.z + Math.cos(angle) * 2.2,
      ),
    ).toBe(true);
});
test("flowers require a nearby dry daytime visit and persist without duplicate reward", () => {
  const life = createLife();
  life.weather.rain = 0;
  expect(actOnLife(life, "add-flowers", { x: 100, z: 100 })).toBe(false);
  life.clock = 22 * 120;
  expect(actOnLife(life, "add-flowers", POOKALAM)).toBe(false);
  life.clock = 8 * 120;
  life.weather.rain = 0.5;
  expect(actOnLife(life, "add-flowers", POOKALAM)).toBe(false);
  life.weather.rain = 0;
  expect(actOnLife(life, "add-flowers", POOKALAM)).toBe(true);
  const restored = createLife(saveLife(life));
  expect(restored.onam.helped).toBe(true);
  expect(actOnLife(restored, "add-flowers", POOKALAM)).toBe(false);
  expect(
    restored.memories.filter((m) => m.id === "pookalam-helped"),
  ).toHaveLength(1);
});

test("neighbours arrive, retreat in rain, and resume consistently after reload", async () => {
  const { advanceLife } = await import("../src/game/life.js");
  const { FLOWER_NEIGHBOURS, flowerNeighbourPosition } = await import(
    "../src/game/onam.js"
  );
  const life = createLife();
  life.clock = 8 * 120;
  life.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
  advanceLife(life, 8);
  const restored = createLife(saveLife(life));
  advanceLife(life, 40);
  advanceLife(restored, 40);
  expect(restored.onam).toEqual(life.onam);
  expect(life.onam.neighbours.every((p) => p.mode === "arranging")).toBe(true);
  for (let i = 0; i < 2; i++)
    for (
      let progress = 0;
      progress <= life.onam.neighbours[i].progress;
      progress += 0.2
    ) {
      const p = flowerNeighbourPosition({ progress }, FLOWER_NEIGHBOURS[i]);
      expect(canWalk(p.x, p.z)).toBe(true);
    }
  life.weather.rain = life.weather.target = 0.8;
  life.weather.sheltering = true;
  advanceLife(life, 40);
  expect(
    life.onam.neighbours.every(
      (p) => p.mode === "sheltering" && p.progress === 0,
    ),
  ).toBe(true);
  life.weather.rain = life.weather.target = 0;
  life.weather.sheltering = false;
  life.clock = 16.5 * 120;
  advanceLife(life, 40);
  expect(life.onam.neighbours.every((p) => p.mode === "visiting")).toBe(true);
  life.clock = 19 * 120;
  advanceLife(life, 40);
  expect(life.onam.neighbours.every((p) => p.mode === "home")).toBe(true);
});

test("neighbour dialogue reflects contribution and rain without remote chatter", async () => {
  const { advanceLife, villageLine } = await import("../src/game/life.js");
  const { flowerNeighbourLine, FLOWER_NEIGHBOURS, flowerNeighbourPosition } =
    await import("../src/game/onam.js");
  const life = createLife();
  life.clock = 8 * 120;
  life.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
  advanceLife(life, 45);
  const position = flowerNeighbourPosition(
    life.onam.neighbours[0],
    FLOWER_NEIGHBOURS[0],
  );
  expect(villageLine(life, position).who).toBe("Meera");
  expect(flowerNeighbourLine(life, position).zone).toContain("flowers");
  actOnLife(life, "add-flowers", POOKALAM);
  const restored = createLife(saveLife(life));
  expect(flowerNeighbourLine(restored, position).zone).toContain("thanks");
  restored.weather.sheltering = true;
  expect(flowerNeighbourLine(restored, position).zone).toContain("rain");
  expect(flowerNeighbourLine(restored, { x: 400, z: 400 })).toBeNull();
});
