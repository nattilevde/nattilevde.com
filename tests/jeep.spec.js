import { test, expect } from "@playwright/test";
import {
  createJeep,
  advanceJeep,
  jeepFootprint,
  jeepExit,
} from "../src/game/jeep.js";
import { createLife } from "../src/game/life.js";

test("jeep physics is frame-rate independent and braking stops a moving jeep", () => {
  const a = createJeep({ x: 100, z: -200 }),
    b = createJeep({ x: 100, z: -200 });
  for (let i = 0; i < 600; i++)
    advanceJeep(a, 1 / 60, { throttle: 1, steer: 0.2 });
  for (let i = 0; i < 300; i++)
    advanceJeep(b, 1 / 30, { throttle: 1, steer: 0.2 });
  expect(a.x).toBeCloseTo(b.x, 6);
  expect(a.z).toBeCloseTo(b.z, 6);
  expect(a.speed).toBeGreaterThan(3);
  for (let i = 0; i < 300; i++) advanceJeep(a, 1 / 60, { brake: true });
  expect(Math.abs(a.speed)).toBeLessThan(0.3);
});
test("vehicle footprint blocks buildings and water, and exit chooses walkable ground", () => {
  expect(jeepFootprint(-18, 30, 0)).toBe(false);
  expect(jeepFootprint(38, 30, 0)).toBe(false);
  const j = createJeep({ x: 16, z: 62 });
  for (let i = 0; i < 600; i++) advanceJeep(j, 1 / 60, { throttle: 1 });
  expect(j.z).toBeGreaterThan(55);
  expect(jeepExit(j)).not.toBeNull();
  expect(createJeep({ x: NaN, z: Infinity }).x).toBe(13);
});
test("jeep can be entered, driven and parked through the game controls", async ({
  page,
}) => {
  const nightLife = createLife();
  nightLife.clock = 20 * 120;
  nightLife.weather = {
    rain: 0.8,
    target: 0.8,
    remaining: 120,
    wetness: 0.8,
    episode: 1,
    sheltering: true,
  };
  await page.addInitScript(
    (life) =>
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position: { x: 0, z: 76 },
          discoveries: [],
          interactions: [],
          moments: [],
          cells: [],
        }),
      ),
    nightLife,
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
  await page.getByRole("button", { name: "Find my jeep", exact: true }).click();
  await page
    .getByRole("button", { name: "Show direction", exact: true })
    .click();
  await expect(
    page.getByText("Direction to parked jeep", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Find my jeep", exact: true }).click();
  await page
    .getByRole("button", { name: "Return to jeep", exact: true })
    .click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /Borrow the hill jeep/ }).click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-driving",
    "true",
  );
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(800);
  await page.keyboard.up("KeyW");
  await expect(
    page.getByRole("button", { name: /Hill jeep · [1-9]/ }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/jeep-drive.png" });
  await page.keyboard.down("Space");
  await page.waitForTimeout(1200);
  await page.keyboard.up("Space");
  const park = page.getByRole("button", { name: /Hill jeep/ });
  await expect(park).toBeEnabled();
  await park.click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-driving",
    "false",
  );
});

test("stronger acceleration reaches cruising speed and brake state follows pedals", () => {
  const j = createJeep({ x: 100, z: -200 });
  for (let i = 0; i < 180; i++) advanceJeep(j, 1 / 60, { throttle: 1 });
  expect(j.speed).toBeGreaterThan(20);
  expect(j.speed).toBeLessThanOrEqual(30);
  expect(j.braking).toBe(false);
  advanceJeep(j, 1 / 60, { throttle: -1 });
  expect(j.braking).toBe(true);
  for (let i = 0; i < 180; i++) advanceJeep(j, 1 / 60, { brake: true });
  expect(Math.abs(j.speed)).toBeLessThan(0.3);
  expect(j.braking).toBe(true);
  advanceJeep(j, 1 / 60, {});
  expect(j.braking).toBe(false);
});
