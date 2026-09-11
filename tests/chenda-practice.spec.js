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
