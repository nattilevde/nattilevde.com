import { test, expect } from "@playwright/test";
import {
  createFishing,
  stepFishing,
  helpFish,
  FISH_LANDING,
  FISH_MARKET,
  FISH_ROUTE,
  fishingPosition,
} from "../src/game/fishing.js";
import {
  createLife,
  saveLife,
  advanceLife,
  actOnLife,
  observeLife,
} from "../src/game/life.js";
import { canWalk } from "../src/game/world.js";
const run = (f, seconds, hour = 8, rain = 0) => {
  for (let t = 0; t < seconds - 0.001; t += 0.1)
    stepFishing(f, 0.1, hour, rain);
};
test("catch physically reaches market and stock is conserved", () => {
  const f = createFishing();
  run(f, 140);
  expect(f.phase).toBe("unloading");
  expect(f.cargo).toBeGreaterThan(0);
  expect(helpFish(f, FISH_MARKET)).toBe(false);
  expect(helpFish(f, FISH_LANDING)).toBe(true);
  expect(helpFish(f, FISH_LANDING)).toBe(false);
  run(f, 100);
  expect(f.stock).toBeGreaterThan(0);
  expect(f.cargo).toBe(0);
  expect(f.buyer).toBe(1);
  run(f, 160, 12);
  expect(f.stock).toBe(0);
  expect(f.sold).toBeGreaterThan(0);
  expect(f.caught).toBe(f.cargo + f.stock + f.sold + f.spoiled);
});
test("rain curtails catches, delays unloading and unsold fish spoil", () => {
  const f = createFishing();
  run(f, 55);
  run(f, 0.1, 8, 1);
  expect(f.phase).toBe("returning");
  expect(f.cargo).toBeLessThan(4);
  run(f, 21, 8, 1);
  expect(f.phase).toBe("unloading");
  const before = f.remaining;
  run(f, 20, 8, 1);
  expect(f.remaining).toBe(before);
  run(f, 240, 8, 1);
  expect(f.cargo + f.stock).toBe(0);
  expect(f.spoiled).toBe(f.caught);
  const night = createFishing();
  run(night, 300, 20);
  expect(night.phase).toBe("resting");
  expect(night.caught).toBe(0);
});
test("courier route stays walkable and save resumes the same supply chain", () => {
  for (let i = 1; i < FISH_ROUTE.length; i++)
    for (let t = 0; t <= 1; t += 0.02) {
      const a = FISH_ROUTE[i - 1],
        b = FISH_ROUTE[i];
      expect(canWalk(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)).toBe(true);
    }
  const life = createLife();
  advanceLife(life, 70);
  const restored = createLife(saveLife(life));
  advanceLife(life, 30);
  advanceLife(restored, 30);
  expect(restored.fishing).toEqual(life.fishing);
  const old = saveLife(life);
  delete old.fishing;
  expect(createLife(old).fishing).toEqual(createFishing());
  const moving = createFishing({ phase: "delivering", progress: 0.5 });
  expect(canWalk(fishingPosition(moving).x, fishingPosition(moving).z)).toBe(
    true,
  );
});
// Other village features record their own ambient memories, and some sit within
// range of the market, so this test counts only the fishing ones it is about.
const fishMemories = (life) =>
  life.memories.filter(
    (m) => m.id.startsWith("fish-") || m.id.startsWith("catch-"),
  );

test("memories require a witnessed catch and matching delivery", () => {
  const life = createLife();
  life.fishing = createFishing({
    phase: "unloading",
    trip: 1,
    cargo: 4,
    remaining: 24,
    caught: 4,
  });
  observeLife(life, FISH_MARKET);
  expect(fishMemories(life)).toHaveLength(0);
  expect(actOnLife(life, "help-fish", FISH_LANDING)).toBe(true);
  life.fishing.phase = "walking-home";
  life.fishing.cargo = 0;
  life.fishing.stock = 4;
  observeLife(life, FISH_MARKET);
  expect(life.memories.some((m) => m.id === "fish-market-1")).toBe(true);
  observeLife(life, FISH_MARKET);
  expect(fishMemories(life)).toHaveLength(2);
});
test("shore help, saved catch and market render on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const life = createLife();
  life.fishing = createFishing({
    phase: "unloading",
    trip: 1,
    cargo: 4,
    caught: 4,
    remaining: 24,
  });
  life.weather.remaining = 180;
  await page.addInitScript(
    ({ life }) => {
      if (sessionStorage.getItem("fish-seeded")) return;
      sessionStorage.setItem("fish-seeded", "1");
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position: { x: -76, z: 12 },
          discoveries: [],
          interactions: [],
          moments: [],
          cells: [],
          captions: true,
        }),
      );
    },
    { life },
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
  await page.getByRole("button", { name: "Help unload the catch" }).click();
  await expect(
    page.getByRole("button", { name: "Help unload the catch" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kerala-world-journey")),
  );
  expect(saved.life.fishing.helped).toBe(1);
  // Inspect the same delivered batch at its stall, without a long real-time walk.
  saved.position = FISH_MARKET;
  saved.life.fishing = createFishing({
    ...saved.life.fishing,
    phase: "walking-home",
    cargo: 0,
    stock: 4,
    buyer: 1,
  });
  await page.evaluate(
    (saved) =>
      localStorage.setItem("kerala-world-journey", JSON.stringify(saved)),
    saved,
  );
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page.getByRole("button", { name: "Continue your journey" }).click();
  await expect(page.locator(".game-world-cue")).toContainText(
    "Trade at the fish stall",
  );
  await page.screenshot({ path: "test-results/kadal-fish-market.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
