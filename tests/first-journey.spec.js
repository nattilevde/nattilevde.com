import { test, expect } from "@playwright/test";
import {
  createPlaytest,
  tickPlaytest,
  discoverPlaytest,
  persistPlaytest,
  loadPlaytests,
} from "../src/game/playtest.js";
import { createLife } from "../src/game/life.js";
test("pilot summaries bound time and history without needing storage", () => {
  const run = createPlaytest();
  tickPlaytest(run, 1, false);
  tickPlaytest(run, 1, true);
  tickPlaytest(run, 60, true);
  discoverPlaytest(run, "ridge-view");
  expect(run.activeSeconds).toBe(4);
  expect(run.jeepAt).toBe(2);
  expect(run.drivingSeconds).toBe(3);
  expect(run.stops).toEqual(["ridge-view"]);
  const storage = {
    getItem: () => JSON.stringify(Array.from({ length: 30 }, () => run)),
    setItem: () => {
      throw Error("blocked");
    },
  };
  expect(loadPlaytests(storage)).toHaveLength(19);
  expect(() => persistPlaytest(storage, [], run)).not.toThrow();
  const life = createLife();
  expect(life.clock).toBe(960);
  expect(life.weather.rain).toBe(0);
  expect(life.weather.remaining).toBeGreaterThanOrEqual(480);
});
test("first visit can start in jeep and show a local summary", async ({
  page,
}) => {
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page.screenshot({ path: "test-results/first-journey.png" });
  await page
    .getByRole("button", { name: "Start with the jeep", exact: true })
    .click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-driving",
    "true",
  );
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("kerala-playtest-summaries") || "[]",
          ).at(-1)?.jeepAt,
      ),
    )
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await page.getByText("Local playtest summary", { exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Local playtest summary" }),
  ).toHaveValue(/This browser only/);
});
