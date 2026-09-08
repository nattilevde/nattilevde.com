import { test, expect } from "@playwright/test";
import {
  createLife,
  advanceLife,
  saveLife,
  villageRoute,
  actOnLife,
  observeLife,
  villageCue,
} from "../src/game/life.js";
import {
  LIFE_NODES,
  LIFE_EDGES,
  RESIDENTS,
  SHELTERS,
  FERRY_STOPS,
  DAY_SECONDS,
} from "../src/game/life-data.js";
import { canWalk } from "../src/game/world.js";

test("village routes connect every resident to work, home and both shelters without crossing solids", () => {
  for (const point of Object.values(LIFE_NODES))
    expect(canWalk(point.x, point.z)).toBe(true);
  for (const [a, b] of LIFE_EDGES) {
    for (let t = 0; t <= 1; t += 0.025) {
      const x = LIFE_NODES[a].x * (1 - t) + LIFE_NODES[b].x * t;
      const z = LIFE_NODES[a].z * (1 - t) + LIFE_NODES[b].z * t;
      expect(canWalk(x, z), `${a} → ${b} at ${t}`).toBe(true);
    }
  }
  for (const r of RESIDENTS)
    for (const to of [r.work, ...SHELTERS.flatMap((s) => s.slots)])
      expect(villageRoute(r.home, to).length).toBeGreaterThan(0);
  expect(
    new Set(RESIDENTS.map((r) => JSON.stringify(LIFE_NODES[r.work]))).size,
  ).toBe(RESIDENTS.length);
});

test("seeded life preserves routes, weather and outcomes across frame rates and reload", () => {
  const a = createLife(null, 91),
    b = createLife(null, 91);
  advanceLife(a, 137);
  for (let i = 0; i < 548; i++) advanceLife(b, 0.25);
  expect(a.residents).toEqual(b.residents);
  expect(a.weather).toEqual(b.weather);
  const restored = createLife(saveLife(a));
  advanceLife(a, 120);
  advanceLife(restored, 120);
  expect(restored.residents).toEqual(a.residents);
  expect(restored.weather).toEqual(a.weather);
  expect(restored.ferry).toEqual(a.ferry);
});

test("shelter capacity is exclusive and work resumes after an unattended shower", () => {
  const life = createLife();
  life.weather = {
    rain: 0.7,
    target: 0.7,
    remaining: 150,
    episode: 1,
    wetness: 0.7,
    sheltering: true,
  };
  advanceLife(life, 100);
  const reserved = life.residents.map((r) => r.shelter).filter(Boolean);
  expect(new Set(reserved).size).toBe(reserved.length);
  expect(
    life.residents.filter((r) => r.mode === "sheltering").length,
  ).toBeGreaterThanOrEqual(6);
  expect(life.coir.phase).toBe("covered");
  expect(life.rehearsal.active).toBe(false);
  life.weather.target = 0;
  life.weather.remaining = 180;
  advanceLife(life, 130);
  expect(life.residents.every((r) => !r.shelter)).toBe(true);
  expect(life.coir.phase).toBe("outside");
  expect(life.memories).toEqual([]);
});

test("help changes coir work once and only a witnessed gathering becomes a memory", () => {
  const life = createLife();
  life.weather.rain = 0.7;
  life.weather.target = 0.7;
  life.weather.remaining = 150;
  life.weather.episode = 1;
  advanceLife(life, 0.2);
  const before = life.coir.remaining;
  expect(actOnLife(life, "coir", { x: 0, z: 0 })).toBe(false);
  expect(actOnLife(life, "coir", LIFE_NODES.coir)).toBe(true);
  expect(life.coir.remaining).toBeLessThan(before);
  expect(actOnLife(life, "coir", LIFE_NODES.coir)).toBe(false);
  advanceLife(life, 100);
  observeLife(life, { x: 0, z: 500 });
  expect(life.memories).toHaveLength(1);
  observeLife(life, LIFE_NODES.tea);
  observeLife(life, LIFE_NODES.tea);
  expect(life.memories.filter((m) => m.id.startsWith("shelter-"))).toHaveLength(
    1,
  );
});

test("rehearsal requires present players and stops during their absence", () => {
  const life = createLife();
  expect(life.rehearsal.active).toBe(true);
  expect(villageCue(life, LIFE_NODES.court)?.text).toBe("Chenda practice");
  life.clock = (DAY_SECONDS * 14) / 24;
  life.weather.target = 0;
  life.weather.rain = 0;
  life.weather.remaining = 180;
  advanceLife(life, 0.2);
  expect(life.rehearsal.active).toBe(false);
  expect(actOnLife(life, "rehearsal", LIFE_NODES.court)).toBe(false);
});

test("the ferry preserves its crossing and never boards a remote passenger", () => {
  const life = createLife();
  life.weather.remaining = 180;
  expect(actOnLife(life, "board-ferry", { x: 0, z: 76 })).toBe(false);
  expect(actOnLife(life, "board-ferry", FERRY_STOPS[0].land)).toBe(true);
  advanceLife(life, 35);
  expect(life.ferry.phase).toBe("crossing");
  expect(actOnLife(life, "leave-ferry", FERRY_STOPS[0].land)).toBe(false);
  const restored = createLife(saveLife(life));
  expect(restored.ferry).toEqual(life.ferry);
  advanceLife(restored, 20);
  expect(restored.ferry.stop).toBe(1);
  expect(actOnLife(restored, "leave-ferry", FERRY_STOPS[1].land)).toBe(true);
  expect(canWalk(FERRY_STOPS[1].land.x, FERRY_STOPS[1].land.z)).toBe(true);
});

test("malformed state is repaired without inventing residents or duplicating memory", () => {
  const life = createLife();
  life.residents[0].x = NaN;
  life.residents[1].node = "__proto__";
  life.residents[2].route = ["missing"];
  life.memories = [
    { id: "a", text: "A remembered day", place: "Kadal", day: 1 },
    { id: "a", text: "Duplicate", place: "Kadal", day: 1 },
    null,
  ];
  const repaired = createLife(life);
  expect(repaired.residents).toHaveLength(12);
  expect(
    repaired.residents.every((r) => Number.isFinite(r.x) && canWalk(r.x, r.z)),
  ).toBe(true);
  expect(repaired.memories).toHaveLength(1);
  expect(createLife({ v: 1, residents: { find: 4 } }).residents).toHaveLength(
    12,
  );
});

test("a closed world does not advance and residents complete a quiet evening at home", () => {
  const life = createLife();
  life.clock = (DAY_SECONDS * 20) / 24;
  life.weather.target = 0;
  life.weather.rain = 0;
  life.weather.remaining = 180;
  advanceLife(life, 170);
  expect(life.residents.every((r) => r.mode === "home")).toBe(true);
  const checkpoint = saveLife(life);
  expect(createLife(checkpoint).clock).toBe(checkpoint.clock);
  advanceLife(life, 0);
  expect(saveLife(life)).toEqual(checkpoint);
});

async function enter(page, position = { x: -12, z: 32 }, life = createLife()) {
  await page.addInitScript(
    ({ position, life }) => {
      if (!sessionStorage.getItem("life-test-seeded")) {
        localStorage.setItem(
          "kerala-world-journey",
          JSON.stringify({
            v: 2,
            position,
            life,
            discoveries: ["tea-shop"],
            interactions: [],
            moments: [],
            cells: ["4,37"],
            captions: true,
          }),
        );
        sessionStorage.setItem("life-test-seeded", "yes");
      }
    },
    { position, life },
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
}

test("quiet exploration, captions and old progress survive a pause and reload", async ({
  page,
}) => {
  await enter(page, { x: -19, z: -23 });
  await expect(page.locator(".game-objective")).toHaveCount(0);
  await expect(page.locator(".game-world-cue")).toContainText(
    "Chenda practice",
  );
  await page.getByRole("button", { name: "Play a few beats together" }).click();
  await page.getByRole("button", { name: "Open game passport" }).click();
  await expect(page.locator(".game-lived-memories")).toContainText(
    "Played a few beats",
  );
  await page.getByRole("button", { name: "Close game panel" }).click();
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kerala-world-journey")),
  );
  expect(saved.discoveries).toContain("tea-shop");
  expect(saved.cells).toContain("4,37");
  expect(saved.life.memories.some((m) => m.id.startsWith("joined-"))).toBe(
    true,
  );
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("kerala-passport")).worldMemories.some(
        (text) => text.includes("Played a few beats"),
      ),
    ),
  ).toBe(true);
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page.getByRole("button", { name: "Continue your journey" }).click();
  await page.getByRole("button", { name: "Pause game" }).click();
  await page.getByRole("button", { name: /Exploration assistance/ }).click();
  await page.getByRole("button", { name: "Back to the wandering" }).click();
  await expect(page.locator(".game-objective")).toBeVisible();
});

test("a passenger can board, shorten the crossing and step onto the far bank", async ({
  page,
}) => {
  await enter(page, FERRY_STOPS[0].land);
  await page
    .getByRole("button", { name: "Board for Far-bank Landing" })
    .click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ferry",
    "true",
  );
  await page.getByRole("button", { name: "Shorten the ride" }).click();
  await expect(page.locator(".game-life-actions")).toContainText(
    "Far-bank Landing",
  );
  await page.getByRole("button", { name: "Step ashore", exact: true }).click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ferry",
    "false",
  );
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-x",
    "49.0",
  );
});

test("only one tab owns world simulation writes", async ({ page, context }) => {
  await enter(page);
  const other = await context.newPage();
  await other.goto("/#world");
  await expect(
    other.getByText(/Your world is open in another tab/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await other.reload();
  await expect(other.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
});

test("village life stays readable on a touch screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const life = createLife();
  life.weather = {
    rain: 0.7,
    target: 0.7,
    remaining: 150,
    episode: 1,
    wetness: 0.7,
    sheltering: true,
  };
  advanceLife(life, 100);
  await enter(page, { x: -7, z: 35 }, life);
  await expect(
    page.getByRole("group", { name: "Movement joystick" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/kadal-mobile.png" });
});
