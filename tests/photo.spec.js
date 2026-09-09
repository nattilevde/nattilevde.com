import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("photo mode downloads a real PNG and resumes the world", async ({
  page,
}) => {
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page
    .getByRole("button", { name: "Step into Kerala", exact: true })
    .click();
  await page.getByRole("button", { name: "Photo mode", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Photo mode", exact: true });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open exploration map" }),
  ).toBeHidden();
  const source = await dialog.locator("img").getAttribute("src");
  expect(source).toMatch(/^data:image\/png;base64,/);
  const bytes = Buffer.from(source.split(",")[1], "base64");
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.length).toBeGreaterThan(30000);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download postcard" }).click();
  const download = await downloadEvent;
  await download.saveAs("test-results/kerala-postcard.png");
  expect(await readFile("test-results/kerala-postcard.png")).toEqual(bytes);
  await page
    .getByRole("button", { name: "Return to world", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  const world = page.getByTestId("kerala-game");
  const before = await world.getAttribute("data-z");
  await page.keyboard.down("w");
  await expect.poll(() => world.getAttribute("data-z")).not.toBe(before);
  await page.keyboard.up("w");
  await page.keyboard.press("c");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
