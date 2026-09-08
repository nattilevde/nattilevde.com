import { test, expect } from "@playwright/test";
import { createLife, advanceLife, saveLife } from "../src/game/life.js";
import { createTransportMotion } from "../src/game/transport-motion.js";

for (const hz of [30, 60, 120])
  test(`rendered bus advances evenly at ${hz} FPS between simulation steps`, () => {
    const life = createLife();
    life.bus.phase = "travelling";
    life.bus.progress = 0.3;
    const motion = createTransportMotion(life),
      distances = [];
    let previous;
    for (let i = 0; i < hz * 2; i++) {
      advanceLife(life, 1 / hz, null, motion.capture);
      const z = motion.sample(life.remainder).bus.z;
      if (i > hz / 2) distances.push(Math.abs(z - previous));
      previous = z;
    }
    expect(Math.min(...distances)).toBeGreaterThan(0);
    expect(Math.max(...distances) - Math.min(...distances)).toBeLessThan(
      0.00001,
    );
    expect(distances[0]).toBeCloseTo(10 / hz, 5);
  });

test("render interpolation leaves saves unchanged and resets shortened trips", () => {
  const life = createLife();
  life.auto.phase = "travelling";
  life.ferry.phase = "crossing";
  const motion = createTransportMotion(life);
  advanceLife(life, 0.15, null, motion.capture);
  const saved = saveLife(life),
    a = motion.sample(life.remainder);
  for (let i = 0; i < 20; i++) expect(motion.sample(life.remainder)).toEqual(a);
  expect(saveLife(life)).toEqual(saved);
  advanceLife(life, 120);
  motion.reset(life);
  expect(motion.sample(0)).toEqual(motion.sample(0.1));
  expect(motion.sample(0).bus.z).not.toBe(a.bus.z);
});
