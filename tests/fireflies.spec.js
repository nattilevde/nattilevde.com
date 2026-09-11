import { test, expect } from "@playwright/test";
import { fireflyActivity, FIREFLY_POCKETS } from "../src/game/fireflies.js";
import { createLife, observeLife, saveLife } from "../src/game/life.js";

test("fireflies fade at dusk and disappear in rain and daylight", () => {
  const life = createLife();
  life.weather.rain = 0;
  for (const hour of [0, 8, 12, 18, 24]) {
    life.clock = hour * 120;
    expect(fireflyActivity(life)).toBe(0);
  }
  life.clock = 18.25 * 120;
  expect(fireflyActivity(life)).toBeCloseTo(0.5);
  life.clock = 20 * 120;
  expect(fireflyActivity(life)).toBe(1);
  life.weather.rain = 0.4;
  expect(fireflyActivity(life)).toBe(0);
});

test("a nearby evening sighting saves once and survives reload", () => {
  const life = createLife();
  life.weather.rain = 0;
  life.clock = 12 * 120;
  const spot = FIREFLY_POCKETS[0];
  observeLife(life, spot);
  expect(
    life.memories.filter((m) => m.id.startsWith("fireflies-")),
  ).toHaveLength(0);
  life.clock = 20 * 120;
  observeLife(life, { x: 0, z: 0 });
  expect(
    life.memories.filter((m) => m.id.startsWith("fireflies-")),
  ).toHaveLength(0);
  observeLife(life, spot);
  observeLife(life, spot);
  const restored = createLife(saveLife(life));
  expect(
    restored.memories.filter((m) => m.id.startsWith("fireflies-")),
  ).toHaveLength(1);
});
