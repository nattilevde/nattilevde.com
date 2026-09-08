import { test, expect } from "@playwright/test";
import {
  createAuto,
  autoPosition,
  stepAuto,
  boardAuto,
  leaveAuto,
  AUTO_ROUTE,
  AUTO_STOPS,
} from "../src/game/auto.js";
import {
  createLife,
  saveLife,
  advanceLife,
  actOnLife,
} from "../src/game/life.js";
import { canWalk } from "../src/game/world.js";
const bus = { trips: 0, stop: 1 },
  ferry = { trips: 0, stop: 0 };

test("auto route clears solids and water with vehicle width", () => {
  for (let i = 1; i < AUTO_ROUTE.length; i++)
    for (let t = 0; t <= 1; t += 0.02) {
      const a = AUTO_ROUTE[i - 1],
        b = AUTO_ROUTE[i];
      const x = a.x + (b.x - a.x) * t,
        z = a.z + (b.z - a.z) * t;
      for (const dx of [-0.85, 0.85])
        for (const dz of [-1.3, 1.3])
          expect(canWalk(x + dx, z + dz), `${x + dx},${z + dz}`).toBe(true);
    }
});

test("auto waits without demand, responds to arrivals, yields and slows in rain", () => {
  const a = createAuto();
  stepAuto(a, 60, 8, 0, bus, ferry);
  expect(a.phase).toBe("waiting");
  stepAuto(a, 0.1, 8, 0, bus, { trips: 1, stop: 1 });
  expect(a.phase).toBe("travelling");
  const p = autoPosition(a);
  stepAuto(a, 1, 8, 0, bus, { trips: 1, stop: 1 }, [{ x: p.x - 2, z: p.z }]);
  expect(a.yielding).toBe(true);
  expect(a.progress).toBe(0);
  const wet = createAuto(a);
  stepAuto(a, 1, 8, 0, bus, ferry);
  stepAuto(wet, 1, 8, 1, bus, ferry);
  expect(wet.progress / a.progress).toBeCloseTo(2 / 3);
  const night = createAuto();
  stepAuto(night, 60, 23, 0, bus, { trips: 1, stop: 1 });
  expect(night.phase).toBe("waiting");
});

test("auto survives reload and cannot board other transport or leave mid-route", () => {
  const life = createLife();
  expect(boardAuto(life.auto, { x: 0, z: 0 }, 8)).toBe(false);
  expect(actOnLife(life, "board-auto", AUTO_STOPS[0])).toBe(true);
  expect(actOnLife(life, "board-bus", { x: 8, z: 84 })).toBe(false);
  expect(leaveAuto(life.auto)).toBe(false);
  advanceLife(life, 15);
  const restored = createLife(saveLife(life));
  advanceLife(life, 10);
  advanceLife(restored, 10);
  expect(restored.auto).toEqual(life.auto);
  for (let i = 0; i < 2400 && life.auto.phase === "travelling"; i++)
    advanceLife(life, 0.1);
  expect(life.auto.stop).toBe(1);
  expect(actOnLife(life, "leave-auto", AUTO_STOPS[1])).toBe(true);
  expect(life.memories.some((m) => m.id.startsWith("auto-"))).toBe(true);
  const old = saveLife(life);
  delete old.auto;
  expect(createLife(old).auto.player).toBe(false);
});

test("auto ride, reload and landing work on a phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    ({ life, position }) => {
      if (sessionStorage.getItem("auto-seeded")) return;
      sessionStorage.setItem("auto-seeded", "yes");
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
    { life: createLife(), position: AUTO_STOPS[0].land },
  );
  const enter = async () => {
    await page.goto("/#world");
    await expect(page.getByTestId("kerala-game")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 30000 },
    );
    await page
      .getByRole("button", { name: /Continue your journey|Step into Kerala/ })
      .click();
  };
  await enter();
  await page.screenshot({ path: "test-results/kadal-auto-mobile.png" });
  await page
    .getByRole("button", { name: "Take auto to Far-bank Auto Stand" })
    .click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-auto-passenger",
    "true",
  );
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await enter();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-auto-passenger",
    "true",
  );
  await page.getByRole("button", { name: "Shorten auto journey" }).click();
  await page
    .getByRole("button", { name: "Leave the auto", exact: true })
    .click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-auto-passenger",
    "false",
  );
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-x",
    "54.0",
  );
  await page.getByRole("button", { name: "Open game passport" }).click();
  await expect(page.locator(".game-lived-memories")).toContainText(
    "Rode the village auto",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
