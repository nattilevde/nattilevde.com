import { test, expect } from "@playwright/test";
import {
  canWalk,
  terrainHeight,
  cellAt,
  sites,
  activities,
} from "../src/game/world.js";

test.describe.configure({ mode: "serial" });

async function enter(page, position) {
  if (position)
    await page.addInitScript(
      (position) =>
        localStorage.setItem(
          "kerala-world-journey",
          JSON.stringify({
            position,
            discoveries: [],
            interactions: [],
            cells: [],
          }),
        ),
      position,
    );
  await page.goto("/#world");
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page
    .getByRole("button", { name: /Step into Kerala|Continue your journey/ })
    .click();
}

test("world collision and activity definitions are traversable", () => {
  expect(canWalk(0, 76)).toBe(true);
  expect(canWalk(38, 40)).toBe(false);
  expect(canWalk(38, 0)).toBe(true);
  expect(canWalk(38, -90)).toBe(true);
  expect(canWalk(-18, 30)).toBe(false);
  expect(canWalk(-85, 0)).toBe(false);
  expect(canWalk(77, -122)).toBe(false);
  expect(terrainHeight(83, 111)).toBe(9);
  expect(cellAt(0, 0)).toBe("7,9");
  sites.forEach((s) => expect(canWalk(s.x, s.z), s.name).toBe(true));
  activities.forEach((a) =>
    a.requires.forEach((id) =>
      expect(sites.some((s) => s.id === id)).toBe(true),
    ),
  );
});

test("3D player walks, discovers, pauses, and preserves the portal passport", async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  const game = page.getByTestId("kerala-game");
  await page.keyboard.down("w");
  await expect
    .poll(async () => Number(await game.getAttribute("data-z")), {
      timeout: 20000,
    })
    .toBeLessThan(66);
  await page.keyboard.up("w");
  await expect(page.locator(".game-discovery-notice")).toContainText(
    "Kadal Village",
  );
  await page.keyboard.press("p");
  await expect(page.getByRole("dialog")).toContainText("1/8");
  const z = Number(await game.getAttribute("data-z"));
  await page.keyboard.down("w");
  await page.waitForTimeout(500);
  await page.keyboard.up("w");
  expect(Number(await game.getAttribute("data-z"))).toBe(z);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open exploration map" }).click();
  await expect(page.getByRole("dialog")).toContainText("Let it unfold");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Kerala");
  await page.getByRole("button", { name: "Open your passport" }).click();
  await expect(page.locator(".world-passport-section")).toContainText(
    "Kadal Village",
  );
  expect(errors).toEqual([]);
});

test("local food interaction saves and canoe can be boarded and steered", async ({
  page,
}) => {
  test.setTimeout(60000);
  await enter(page, { x: -11, z: 30 });
  await expect(page.locator(".game-interaction")).toContainText("Leela");
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Try pazham pori" }).click();
  await expect(
    page.getByRole("button", { name: "A moment in your passport" }),
  ).toBeDisabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("kerala-world-journey")).interactions,
      ),
    )
    .toContain("tea-shop");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await page.evaluate(() =>
    localStorage.setItem(
      "kerala-world-journey",
      JSON.stringify({
        position: { x: 24, z: 5 },
        discoveries: [],
        interactions: [],
        cells: [],
      }),
    ),
  );
  await page
    .getByRole("button", { name: /Don't just discover Kerala/ })
    .click();
  await page
    .getByRole("button", { name: /Step into Kerala|Continue your journey/ })
    .click();
  await expect(page.locator(".game-interaction")).toContainText("Binu");
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Borrow the canoe" }).click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-boating",
    "true",
  );
  await page.keyboard.down("s");
  await expect
    .poll(async () =>
      Number(await page.getByTestId("kerala-game").getAttribute("data-z")),
    )
    .toBeGreaterThan(15);
  await page.keyboard.up("s");
  await page.getByRole("button", { name: "Step ashore" }).click();
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-boating",
    "false",
  );
});

test("hidden places stay concealed until reached and culture activity is interactive", async ({
  page,
}) => {
  await enter(page, { x: -22, z: -25 });
  await page.keyboard.press("p");
  await expect(page.getByRole("dialog")).not.toContainText(
    "The Lotus Hideaway",
  );
  await page.keyboard.press("Escape");
  await page.keyboard.press("e");
  for (let i = 1; i <= 3; i++)
    await page.getByRole("button", { name: `Play beat ${i} of 3` }).click();
  await expect(
    page.getByRole("button", { name: "A moment in your passport" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pause game" }).click();
  await page.getByLabel("World atmosphere").selectOption("night");
  await page.getByRole("button", { name: "Back to the wandering" }).click();
  await expect(page.locator(".game-region")).toContainText("Moonlit");
});

test("mobile world fits the screen and touch joystick moves the player", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const joystick = page.getByRole("group", { name: "Movement joystick" }),
    box = await joystick.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 15);
  await page.mouse.down();
  await expect
    .poll(async () =>
      Number(await page.getByTestId("kerala-game").getAttribute("data-z")),
    )
    .toBeLessThan(74);
  await page.mouse.up();
  await page.getByRole("button", { name: "Open game passport" }).click();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});

test("finding the hidden pond unlocks its map marker and reload restores the journey", async ({
  page,
}) => {
  await enter(page, { x: 77, z: -105 });
  await page.keyboard.down("w");
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("kerala-world-journey"))
              .discoveries,
        ),
      { timeout: 15000 },
    )
    .toContain("pond");
  await page.keyboard.up("w");
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await page.getByRole("button", { name: "Open your passport" }).click();
  await expect(page.locator(".world-passport-section")).toContainText(
    "The Lotus Hideaway / Hidden discovery",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: /Don't just discover Kerala/ })
    .click();
  await page.getByRole("button", { name: "Continue your journey" }).click();
  await page.keyboard.press("m");
  await expect(page.locator(".game-map-large")).toContainText(
    "The Lotus Hideaway",
  );
});
