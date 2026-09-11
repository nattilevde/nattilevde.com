import { test, expect } from "@playwright/test";
import { createLife, saveLife } from "../src/game/life.js";
import { createJeep, advanceJeep } from "../src/game/jeep.js";
test("car and jeep keep separate parking and handling profiles", () => {
  const life = createLife();
  expect(life.car.kind).toBe("car");
  expect(life.jeep.kind).toBe("jeep");
  const parked = { x: life.jeep.x, z: life.jeep.z };
  advanceJeep(life.car, 0.2, { throttle: 1 });
  expect({ x: life.jeep.x, z: life.jeep.z }).toEqual(parked);
  const restored = createLife(saveLife(life));
  expect(restored.car.z).toBe(life.car.z);
  expect(restored.jeep.x).toBe(life.jeep.x);
  const car = createJeep({ x: 0, z: 80 }, "car"),
    jeep = createJeep({ x: 0, z: 80 });
  advanceJeep(car, 0.2, { throttle: 1 });
  advanceJeep(jeep, 0.2, { throttle: 1 });
  expect(car.speed).toBeLessThan(jeep.speed);
});
for (const ride of [
  { name: "road car", x: 20, prompt: /Drive the Coastal Saloon/ },
  { name: "trail motorcycle", x: 27, prompt: /Ride the trail motorcycle/ },
]) {
  test(`${ride.name} can be entered, driven, stopped and exited`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(
      ({ life, x }) =>
        localStorage.setItem(
          "kerala-world-journey",
          JSON.stringify({
            v: 2,
            life,
            position: { x, z: 81 },
            discoveries: [],
            interactions: [],
            moments: [],
            cells: [],
          }),
        ),
      { life: createLife(), x: ride.x },
    );
    await page.goto("/#world");
    await expect(page.getByTestId("kerala-game")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 60000 },
    );
    await page
      .getByRole("button", { name: /Continue your journey|Step into Kerala/ })
      .click();
    await page.getByRole("button", { name: ride.prompt }).click();
    const game = page.getByTestId("kerala-game");
    await expect(game).toHaveAttribute("data-driving", "true");
    const before = Number(await game.getAttribute("data-z"));
    await page.keyboard.down("w");
    await page.waitForTimeout(1500);
    await page.keyboard.up("w");
    expect(Number(await game.getAttribute("data-z"))).toBeLessThan(before);
    await page.keyboard.down("Space");
    await page.waitForTimeout(1500);
    await page.keyboard.up("Space");
    await page.keyboard.press("j");
    await expect(game).toHaveAttribute("data-driving", "false");
    expect(errors).toEqual([]);
  });
}
