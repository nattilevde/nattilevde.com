import { test, expect } from "@playwright/test";
import {
  createBoatTraining,
  stepBoatTraining,
  trainingPosition,
} from "../src/game/boat-training.js";
test("practice stays in lagoon water and returns continuously when rain arrives", () => {
  const boat = createBoatTraining();
  let previous = trainingPosition(boat);
  for (let i = 0; i < 4000; i++) {
    stepBoatTraining(boat, 0.05, 8, i < 800 ? 0 : 0.8);
    const p = trainingPosition(boat);
    expect(Math.hypot(p.x - previous.x, p.z - previous.z)).toBeLessThan(0.2);
    for (const offset of [-7, 7])
      expect(
        ((p.x + Math.sin(p.heading) * offset - 250) / 92) ** 2 +
          ((p.z + Math.cos(p.heading) * offset - 450) / 137) ** 2,
      ).toBeLessThan(1);
    previous = p;
  }
  expect(boat.phase).toBe("resting");
  expect(boat.progress).toBe(0);
});
test("night prevents departure and restored training follows the same course", () => {
  const boat = createBoatTraining();
  stepBoatTraining(boat, 1, 22, 0);
  expect(boat.phase).toBe("resting");
  stepBoatTraining(boat, 1, 8, 0);
  const restored = createBoatTraining(JSON.parse(JSON.stringify(boat)));
  for (const b of [boat, restored]) stepBoatTraining(b, 0.05, 8, 0);
  expect(restored).toEqual(boat);
});
