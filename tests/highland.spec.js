import { test, expect } from "@playwright/test";
import * as THREE from "three";
import { HIGHLAND_ROADS } from "../src/game/highland-data.js";
import { terrainHeight } from "../src/game/world.js";
import { jeepFootprint, createJeep, jeepExit } from "../src/game/jeep.js";
import { createLife } from "../src/game/life.js";
test("hill curves clear the jeep, remain climbable and offer safe ridge parking", () => {
  for (const r of HIGHLAND_ROADS) {
    const curve = new THREE.CatmullRomCurve3(
      r.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      "catmullrom",
      0.12,
    );
    const points = curve.getSpacedPoints(600);
    for (let i = 1; i < points.length; i++) {
      const p = points[i],
        prev = points[i - 1],
        heading = Math.atan2(prev.x - p.x, prev.z - p.z);
      expect(jeepFootprint(p.x, p.z, heading), r.id).toBe(true);
      expect(
        Math.abs(terrainHeight(p.x, p.z) - terrainHeight(prev.x, prev.z)) /
          p.distanceTo(prev),
        r.id,
      ).toBeLessThan(0.6);
    }
  }
  expect(terrainHeight(731, 136) - terrainHeight(381, 110)).toBeGreaterThan(40);
  expect(jeepExit(createJeep({ x: 731, z: 136, heading: 0 }))).not.toBeNull();
});
test("highland drive renders without browser errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const life = createLife();
  life.clock = 9 * 120;
  life.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
  await page.addInitScript(
    (life) =>
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position: { x: 731, z: 136 },
          discoveries: [],
          interactions: [],
          moments: [],
          cells: [],
        }),
      ),
    life,
  );
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page
    .getByRole("button", { name: /Continue your journey|Step into Kerala/ })
    .click();
  await page.screenshot({ path: "test-results/highland-drive.png" });
  expect(errors).toEqual([]);
});
