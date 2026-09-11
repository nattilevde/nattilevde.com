import { test, expect } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`built portal and first ride at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /A little curiosity/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const intro = await page.locator(".map-intro").boundingBox(),
      map = await page.locator(".map-canvas").boundingBox();
    expect(intro.y + intro.height).toBeLessThanOrEqual(map.y + 1);
    await expect(
      page.getByRole("link", { name: /Open source on GitHub/ }),
    ).toHaveAttribute("href", "https://github.com/nattilevde/nattilevde.com");
    await expect(
      page.getByRole("link", { name: /Buy me a coffee/ }),
    ).toHaveAttribute("href", "https://buymeacoffee.com/nabeelc");
    await page.screenshot({
      path: `test-results/release-home-${viewport.width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("link", { name: /About the game and how to play/ })
      .click();
    await expect(page).toHaveURL(/\/game\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Nattilevde: a Kerala 3D world to explore",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("link", { name: "Play Nattilevde in your browser →" })
      .click();
    await expect(page.getByTestId("kerala-game")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 60000 },
    );
    await page
      .getByRole("button", { name: "Start with the jeep", exact: true })
      .click();
    await expect(page.getByTestId("kerala-game")).toHaveAttribute(
      "data-driving",
      "true",
    );
    await page.getByRole("button", { name: "Got it", exact: true }).click();
    await page.getByRole("button", { name: "Photo mode", exact: true }).click();
    await expect(
      page.getByRole("link", { name: "Download postcard" }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/release-photo-${viewport.width}.png`,
    });
    await page
      .getByRole("button", { name: "Return to world", exact: true })
      .click();
    expect(errors).toEqual([]);
  });
}
test("built pages are usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4176/");
  await page.getByRole("link", { name: "Explore the Kerala 3D game" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "All districts", exact: true }).click();
  await page.getByRole("link", { name: "Alappuzha", exact: true }).click();
  await page
    .getByRole("link", { name: "Alleppey Backwaters", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Alleppey Backwaters",
  );
  await context.close();
});
