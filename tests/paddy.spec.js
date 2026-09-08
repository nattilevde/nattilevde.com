import { test, expect } from "@playwright/test";
import { createLife, advanceLife, saveLife } from "../src/game/life.js";
import { PADDY_PEOPLE, inPlayCourt } from "../src/game/paddy-data.js";
import { canWalk } from "../src/game/world.js";
import { jeepFootprint } from "../src/game/jeep.js";
function dry(s) {
  s.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
}
test("village approaches are walkable and courtyard excludes the jeep", () => {
  for (const d of PADDY_PEOPLE)
    for (let t = 0; t <= 1; t += 0.02)
      expect(
        canWalk(
          d.home.x + (d.work.x - d.home.x) * t,
          d.home.z + (d.work.z - d.home.z) * t,
        ),
        d.id,
      ).toBe(true);
  expect(jeepFootprint(285, 93, 0)).toBe(false);
  expect(jeepFootprint(285, 111, 0)).toBe(true);
});
test("children stay inside the courtyard, rain sends residents home, and saved market stock persists", () => {
  const s = createLife();
  dry(s);
  s.clock = 16 * 120;
  advanceLife(s, 40);
  const kids = s.paddy.people.filter((p) => p.id.startsWith("child"));
  expect(kids.every((p) => p.mode === "child" && inPlayCourt(p.x, p.z))).toBe(
    true,
  );
  expect(s.paddy.stock).toBe(9);
  const restored = createLife(saveLife(s));
  advanceLife(s, 10);
  advanceLife(restored, 10);
  expect(restored.paddy).toEqual(s.paddy);
  s.weather.rain = 0.8;
  s.weather.target = 0.8;
  s.weather.sheltering = true;
  advanceLife(s, 90);
  expect(s.paddy.people.every((p) => p.mode === "home")).toBe(true);
});

test("paddy destination renders with no browser errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const life = createLife();
  dry(life);
  life.clock = 16 * 120;
  advanceLife(life, 40);
  await page.addInitScript(
    (life) =>
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position: { x: 283, z: 175 },
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
  await page.screenshot({ path: "test-results/paddy-village.png" });
  expect(errors).toEqual([]);
});

test("market delivery arrives, unloads once and returns; shops open with staff", () => {
  const s = createLife();
  dry(s);
  s.clock = 9 * 120;
  s.paddy.stock = 2;
  s.paddy.day = 0;
  advanceLife(s, 70);
  expect(s.paddy.delivery.day).toBe(0);
  expect(s.paddy.delivery.phase).toBe("waiting");
  expect(s.paddy.stock).toBe(12);
  expect(s.paddy.people.filter((p) => p.mode === "shop")).toHaveLength(2);
  const restored = createLife(saveLife(s));
  advanceLife(s, 10);
  advanceLife(restored, 10);
  expect(restored.paddy).toEqual(s.paddy);
});
