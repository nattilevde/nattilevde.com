import { test, expect } from "@playwright/test";
import {
  createBus,
  stepBus,
  busPosition,
  boardBus,
  leaveBus,
  BUS_STOPS,
} from "../src/game/bus.js";
import {
  createLife,
  saveLife,
  advanceLife,
  actOnLife,
} from "../src/game/life.js";
import { canWalk } from "../src/game/world.js";

test("bus carries commuters, yields and slows in rain", () => {
  const bus = createBus();
  stepBus(bus, 35, 8, 0);
  expect(bus.commuters.every((p) => p.aboard)).toBe(true);
  const at = busPosition(bus);
  stepBus(bus, 1, 8, 0, [{ x: at.x, z: at.z - 5 }]);
  expect(bus.yielding).toBe(true);
  expect(bus.progress).toBe(0);
  const wet = createBus(bus);
  stepBus(wet, 1, 8, 1);
  stepBus(bus, 1, 8, 0);
  expect(wet.progress / bus.progress).toBeCloseTo(0.7);
  for (let i = 0; i < 720 && bus.trips === 0; i++) stepBus(bus, 0.1, 8, 0);
  expect(bus.stop).toBe(1);
  expect(bus.commuters.every((p) => !p.aboard && p.stop === 1)).toBe(true);
  stepBus(bus, 10, 8, 0);
  expect(bus.commuters.every((p) => p.x > 8)).toBe(true);
  for (const stop of BUS_STOPS)
    for (let x = 8; x <= 26; x++) expect(canWalk(x, stop.z)).toBe(true);
});

test("bus boarding, overnight rest and save continuity", () => {
  const life = createLife();
  expect(boardBus(life.bus, { x: 100, z: 100 })).toBe(false);
  expect(actOnLife(life, "board-bus", BUS_STOPS[0])).toBe(true);
  advanceLife(life, 40);
  expect(life.bus.phase).toBe("travelling");
  expect(leaveBus(life.bus)).toBe(false);
  const restored = createLife(saveLife(life));
  expect(restored.bus).toEqual(life.bus);
  advanceLife(life, 20);
  advanceLife(restored, 20);
  expect(restored.bus).toEqual(life.bus);
  const parked = createBus();
  stepBus(parked, 40, 23, 0);
  expect(parked.phase).toBe("waiting");
  expect(createBus(parked)).toEqual(parked);
  const old = saveLife(life);
  delete old.bus;
  expect(createLife(old).bus).toEqual(createBus());
});

test("local bus boarding, shortened journey and safe arrival", async ({
  page,
}) => {
  await page.addInitScript(
    ({ life, position }) => {
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position,
          discoveries: [],
          interactions: [],
          moments: [],
          cells: [],
          captions: true,
        }),
      );
    },
    { life: createLife(), position: BUS_STOPS[0] },
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
  await page.screenshot({ path: "test-results/kadal-bus.png" });
  await page
    .getByRole("button", { name: "Board local bus to Periyar Bridge Stand" })
    .click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-bus-passenger",
    "true",
  );
  await page.getByRole("button", { name: "Shorten bus journey" }).click();
  await expect(page.locator(".game-life-actions")).toContainText(
    "Periyar Bridge Stand",
  );
  await page
    .getByRole("button", { name: "Leave the bus", exact: true })
    .click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-bus-passenger",
    "false",
  );
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-z",
    "-632.0",
  );
  await page.getByRole("button", { name: "Open game passport" }).click();
  await expect(page.locator(".game-lived-memories")).toContainText(
    "Took the local bus to Periyar Bridge Stand",
  );
});
