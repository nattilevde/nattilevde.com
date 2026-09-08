import { test, expect } from "@playwright/test";
import { STORIES, storyImage } from "../src/game/stories.js";
import { createLife, saveLife, keepPhotoStory } from "../src/game/life.js";
import { canWalk } from "../src/game/world.js";
import { statSync } from "node:fs";
test("story anchors, bounded images and saved references are valid", () => {
  const life = createLife();
  for (const story of STORIES) {
    expect(canWalk(story.x, story.z)).toBe(true);
    expect(statSync("public" + storyImage(story, true)).size).toBeLessThan(
      40000,
    );
    expect(statSync("public" + storyImage(story)).size).toBeLessThan(400000);
    expect(keepPhotoStory(life, story.id, { x: 900, z: 900 })).toBe(false);
    expect(keepPhotoStory(life, story.id, story)).toBe(true);
    keepPhotoStory(life, story.id, story);
  }
  expect(life.memories).toHaveLength(3);
  expect(createLife(saveLife(life)).memories).toEqual(life.memories);
  expect(keepPhotoStory(life, "missing", STORIES[0])).toBe(false);
});

async function enter(page, story) {
  await page.addInitScript(
    ({ life, story }) => {
      if (sessionStorage.getItem("story-seed")) return;
      sessionStorage.setItem("story-seed", "yes");
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          life,
          position: story,
          discoveries: [],
          interactions: [],
          moments: [],
          cells: [],
        }),
      );
    },
    { life: createLife(), story },
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

test("optional photo reader, translations and passport survive reload on phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const photos = [];
  page.on("request", (r) => {
    if (r.url().includes("/stories/")) photos.push(r.url());
  });
  await enter(page, STORIES[2]);
  await expect(page.locator("dialog")).toHaveCount(0);
  expect(photos.some((u) => u.endsWith("/tea.jpg"))).toBe(false);
  await page
    .getByRole("button", { name: "Inspect Leela's photo wall" })
    .click();
  await expect(page.locator(".kerala-story img")).toBeVisible();
  await expect
    .poll(() =>
      page.locator(".kerala-story img").evaluate((i) => i.naturalWidth),
    )
    .toBe(960);
  await page.getByRole("button", { name: "മലയാളം", exact: true }).click();
  await expect(page.locator(".story-copy")).toHaveAttribute("lang", "ml");
  await expect(
    page.getByRole("button", { name: "മലയാളം", exact: true }),
  ).toHaveCSS("background-color", "rgb(40, 79, 67)");
  await page.screenshot({ path: "test-results/story-phone.png" });
  await page.getByRole("button", { name: "Keep this photo story" }).click();
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("kerala-world-journey")).life.clock,
  );
  await page.waitForTimeout(1200);
  await page
    .getByText("Kadal film club · imagine a scene", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Quiet journey", exact: true })
    .click();
  await expect(page.locator(".story-film-club")).toContainText("folded letter");
  await page.getByRole("button", { name: "Close game panel" }).click();
  await page.getByRole("button", { name: "Open game passport" }).click();
  await page.getByRole("button", { name: "Reopen photo story" }).click();
  await expect(
    page.getByRole("button", { name: "Kept in your passport" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("kerala-world-journey")).life.clock,
    ),
  ).toBeLessThan(before + 1);
  await page.getByRole("button", { name: "Close game panel" }).click();
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page.getByRole("button", { name: "Continue your journey" }).click();
  await page.getByRole("button", { name: "Open game passport" }).click();
  await expect(
    page.getByRole("button", { name: "Reopen photo story" }),
  ).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("failed photograph keeps source and story readable", async ({ page }) => {
  await page.route("**/stories/coir.jpg", (r) => r.abort());
  await enter(page, STORIES[1]);
  await page
    .getByRole("button", { name: "Inspect The coir photograph" })
    .click();
  await expect(page.locator(".story-image-fallback")).toBeVisible();
  await expect(page.locator(".story-copy")).toContainText(
    "coconut's outer husk",
  );
  await expect(
    page.getByRole("link", { name: "Original photograph" }),
  ).toHaveAttribute("href", STORIES[1].source);
});
