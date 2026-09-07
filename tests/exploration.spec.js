import { test, expect } from "@playwright/test";

test("exploration collects places, food, and culture and persists the passport", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Kerala");
  await expect(page.locator(".district-region")).toHaveCount(14);
  await page.locator(".district-card-body .primary-button").click();
  await expect(page.locator("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Collect this discovery" })
    .first()
    .click();
  await page.getByRole("button", { name: "Collect this discovery" }).click();
  await page.locator(".place-list > button").first().click();
  await page.getByRole("button", { name: "Add to my discoveries" }).click();
  await expect(
    page.getByRole("button", { name: "Discovered & collected" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Open your passport" }).click();
  await expect(page.locator(".passport-stamps .stamped")).toHaveCount(1);
  await expect(page.locator(".passport-stats > div").nth(1)).toContainText(
    "1/28",
  );
  await expect(page.locator(".passport-stats > div").nth(2)).toContainText(
    "1/14",
  );
  await expect(page.locator(".passport-stats > div").nth(3)).toContainText(
    "1/14",
  );
  expect(errors).toEqual([]);
});

test("district map, discovery filters, search, guide, and quest rewards work", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('.district-region[aria-label="Explore Idukki"]').click();
  await expect(page.locator(".district-cover-title h3")).toHaveText("Idukki");
  await page.getByRole("button", { name: "Food", exact: true }).click();
  await expect(page.locator(".discovery-card").first()).toContainText(
    "Appam and Stew",
  );
  await page
    .getByRole("textbox", { name: "Search places and districts" })
    .fill("Fort Kochi");
  await page.locator(".search-results button").click();
  await expect(page.locator(".modal-hero h2")).toHaveText("Fort Kochi");
  await page.keyboard.press("Escape");
  await page.locator(".floating-guide").click();
  await page
    .getByRole("button", { name: "What food should I try here?" })
    .click();
  await expect(page.locator(".chat-message.guide").last()).toContainText(
    "Fish Molee",
  );
  await page
    .getByRole("textbox", { name: "Ask your Kerala guide" })
    .fill("Tell me about the history of Kannur");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.locator(".chat-message.guide").last()).toContainText(
    "Kannur",
  );
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    localStorage.setItem(
      "kerala-passport",
      JSON.stringify({
        districts: [],
        places: ["a", "b", "c"],
        foods: [],
        cultures: [],
        quests: [],
      }),
    ),
  );
  await page.reload();
  await page.getByRole("button", { name: "Quests & Trails" }).click();
  await page.getByRole("button", { name: "Claim your badge" }).click();
  await expect(
    page.getByRole("button", { name: "Badge earned" }),
  ).toBeDisabled();
});

for (const width of [375, 768, 1024, 1440]) {
  test(`responsive layout and district keyboard navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.locator(".map-canvas").scrollIntoViewIfNeeded();
    const obscuredDistricts = await page
      .locator(".district-region")
      .evaluateAll((regions) =>
        regions
          .filter((region) => {
            const bounds = region
              .querySelector("circle")
              .getBoundingClientRect();
            const hit = document.elementFromPoint(
              bounds.x + bounds.width / 2,
              bounds.y + bounds.height / 2,
            );
            return !region.contains(hit);
          })
          .map((region) => region.getAttribute("aria-label")),
      );
    expect(obscuredDistricts).toEqual([]);
    await page.locator('.district-region[aria-label="Explore Kannur"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".district-cover-title h3")).toHaveText("Kannur");
    if (width < 761) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("button", { name: "My Passport", exact: true })
        .click();
      await expect(page.locator("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
    await page.locator(".district-card-body .primary-button").click();
    await expect(page.locator(".modal-hero h2")).toHaveText("Kannur");
    expect(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  });
}
