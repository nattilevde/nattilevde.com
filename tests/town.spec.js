import { test, expect } from "@playwright/test";
import {
  TOWN_ROADS,
  TOWN_PEOPLE,
  TOWN_BUILDINGS,
} from "../src/game/town-data.js";
import { canWalk } from "../src/game/world.js";
import { jeepFootprint } from "../src/game/jeep.js";
import { createLife, advanceLife, saveLife } from "../src/game/life.js";
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
test("town roads fit the jeep and pedestrian routes avoid buildings", () => {
  for (const r of TOWN_ROADS)
    for (let i = 1; i < r.points.length; i++) {
      const a = r.points[i - 1],
        b = r.points[i],
        heading = Math.atan2(a[0] - b[0], a[1] - b[1]);
      for (let t = 0; t <= 1; t += 0.02)
        expect(
          jeepFootprint(
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            heading,
          ),
          r.id,
        ).toBe(true);
    }
  for (const d of TOWN_PEOPLE)
    for (let i = 1; i < d.route.length; i++) {
      const a = d.route[i - 1],
        b = d.route[i];
      for (let t = 0; t <= 1; t += 0.02)
        expect(
          canWalk(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t),
          d.id,
        ).toBe(true);
    }
  expect(TOWN_BUILDINGS).toHaveLength(23);
});
test("harbour workers arrive, preserve routes on reload and return during rain", () => {
  const s = createLife();
  dry(s);
  s.clock = 8 * 120;
  advanceLife(s, 180);
  expect(s.town.people.filter((p) => p.mode === "harbour")).toHaveLength(4);
  const r = createLife(saveLife(s));
  advanceLife(s, 20);
  advanceLife(r, 20);
  expect(r.town).toEqual(s.town);
  s.weather.rain = 0.8;
  s.weather.target = 0.8;
  s.weather.sheltering = true;
  s.weather.remaining = 1000;
  advanceLife(s, 180);
  expect(s.town.people.every((p) => p.mode === "home")).toBe(true);
});
test("expanded town renders without browser errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const life = createLife();
  dry(life);
  life.clock = 8 * 120;
  advanceLife(life, 180);
  await page.addInitScript(
    (life) =>
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position: { x: 0, z: -180 },
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
  await page.screenshot({ path: "test-results/harbour-town.png" });
  expect(errors).toEqual([]);
});
