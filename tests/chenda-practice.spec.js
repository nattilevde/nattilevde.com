import { test, expect } from "@playwright/test";
import {
  PRACTICE_PATTERNS,
  matchesPractice,
} from "../src/game/chenda-practice.js";
test("practice accepts a freely chosen start and small timing differences", () => {
  for (const { beats } of PRACTICE_PATTERNS) {
    expect(
      matchesPractice(
        beats.map((t) => t + 10000),
        beats,
      ),
    ).toBe(true);
    expect(
      matchesPractice(
        beats.map((t, i) => t + 10000 + (i ? 80 : 0)),
        beats,
      ),
    ).toBe(true);
  }
});
test("rapid clicking, missing beats and invalid timings do not complete a phrase", () => {
  const { beats } = PRACTICE_PATTERNS[1];
  expect(matchesPractice([0, 10, 20, 30], beats)).toBe(false);
  expect(matchesPractice([0, 500], beats)).toBe(false);
  expect(matchesPractice([0, 500, NaN, 2000], beats)).toBe(false);
});

test("chenda demonstration is audible while paused and a matched answer is saved", async ({
  page,
}) => {
  test.setTimeout(process.env.CI ? 180000 : 90000);
  await page.addInitScript(() => {
    localStorage.setItem(
      "kerala-world-journey",
      JSON.stringify({
        v: 2,
        position: { x: -22, z: -25 },
        discoveries: [],
        interactions: [],
        moments: [],
        cells: [],
      }),
    );
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (destination, ...args) {
      if (destination === this.context.destination) {
        if (!this.context.__practiceProbe) {
          const probe = this.context.createAnalyser();
          probe.fftSize = 2048;
          connect.call(probe, destination);
          this.context.__practiceProbe = probe;
          window.__practiceProbe = probe;
        }
        return connect.call(this, this.context.__practiceProbe, ...args);
      }
      return connect.call(this, destination, ...args);
    };
  });
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 60000 },
  );
  await page
    .getByRole("button", { name: /Step into Kerala|Continue your journey/ })
    .click();
  await page.keyboard.press("e");
  const practice = page.getByRole("region", { name: "Chenda practice" });
  await expect(practice).toBeVisible();
  await expect(
    practice.getByRole("button", { name: "Tap drum" }),
  ).toBeDisabled();
  // Let the paused world fade out so ambient sound cannot satisfy this check.
  await page.waitForTimeout(400);
  await practice.getByRole("button", { name: "Listen again" }).click();
  const peak = await page.evaluate(async () => {
    let peak = 0;
    const samples = new Float32Array(2048);
    const until = performance.now() + 3000;
    while (performance.now() < until) {
      window.__practiceProbe.getFloatTimeDomainData(samples);
      peak = Math.max(
        peak,
        Math.sqrt(samples.reduce((sum, v) => sum + v * v, 0) / samples.length),
      );
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    return peak;
  });
  expect(peak).toBeGreaterThan(0.001);
  await expect(
    practice.getByRole("button", { name: "Tap drum" }),
  ).toBeEnabled();
  // Schedule input in the browser so protocol latency cannot distort the rhythm.
  await practice.getByRole("button", { name: "Tap drum" }).evaluate((button) =>
    Promise.all(
      [0, 700, 1400, 2100].map(
        (delay) =>
          new Promise((resolve) =>
            setTimeout(() => {
              button.click();
              resolve();
            }, delay),
          ),
      ),
    ),
  );
  await expect(practice).toContainText("That spacing felt good");
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kerala-world-journey")),
  );
  expect(saved.life.rehearsal.joined).toBeGreaterThanOrEqual(0);
  expect(
    saved.life.memories.some((memory) => memory.id.startsWith("joined-")),
  ).toBe(true);
});
