import { test, expect } from "@playwright/test";
import {
  canWalk,
  terrainHeight,
  cellAt,
  sites,
  activities,
  regionAt,
  REGION_GATEWAYS,
  REST_SPOTS,
  travelDestinations,
  stepBoat,
  BOAT,
} from "../src/game/world.js";

test.describe.configure({ mode: "serial" });

// CI runners render the 3D world in software, so every step takes longer
// there. Per-test budgets scale rather than capping the config value.
const budget = (ms) => (process.env.CI ? ms * 2 : ms);

async function enter(page, position, discoveries = []) {
  if (position)
    await page.addInitScript(
      ([position, discoveries]) =>
        localStorage.setItem(
          "kerala-world-journey",
          JSON.stringify({
            v: 2,
            position,
            discoveries,
            interactions: [],
            moments: [],
            cells: [],
          }),
        ),
      [position, discoveries],
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
  expect(canWalk(2, -600)).toBe(true); // highway bridge over the river
  expect(canWalk(60, -600)).toBe(false); // the river itself
  expect(canWalk(250, 450)).toBe(false); // Ashtamudi lagoon
  expect(canWalk(-62, -1350)).toBe(true); // fort interior
  expect(canWalk(-91, -1352)).toBe(false); // fort wall
  // The laterite bumps beside the off-road loop are Gaussians, so they never
  // decay to exactly zero; the lookout hill still peaks at 9.
  expect(terrainHeight(83, 111)).toBeCloseTo(9, 6);
  expect(terrainHeight(700, -300)).toBeGreaterThan(30); // the High Ranges climb
  expect(regionAt(0, -1200).id).toBe("malabar");
  expect(regionAt(600, -260).id).toBe("highlands");
  expect(regionAt(0, 600).id).toBe("south");
  expect(regionAt(0, 76).id).toBe("backwaters");
  expect(cellAt(0, 0)).toBe("4,37");
  sites.forEach((s) => expect(canWalk(s.x, s.z), s.name).toBe(true));
  activities.forEach((a) =>
    a.requires.forEach((id) =>
      expect(
        a.source === "moments"
          ? REST_SPOTS.some((s) => s.id === id)
          : sites.some((s) => s.id === id),
        `${a.id} requires ${id}`,
      ).toBe(true),
    ),
  );
  // Every bus stand must sit on walkable ground inside the region it serves.
  REGION_GATEWAYS.forEach((stop) => {
    expect(canWalk(stop.x, stop.z), stop.name).toBe(true);
    expect(regionAt(stop.x, stop.z).id, stop.name).toBe(stop.region);
  });
  REST_SPOTS.forEach((spot) =>
    expect(canWalk(spot.x, spot.z), spot.name).toBe(true),
  );
});

test("fast travel opens up through progress, not by walking to every stop", () => {
  const at = (discoveries) => travelDestinations({ discoveries });
  // A brand new journey can still ride home, but no further.
  const fresh = at([]);
  expect(fresh.filter((d) => d.unlocked).map((d) => d.id)).toEqual([
    "gw-backwaters",
  ]);
  // Three discoveries anywhere open the next region stand — no trek required.
  const three = at(["village", "beach", "jetty"]);
  expect(three.find((d) => d.id === "gw-central").unlocked).toBe(true);
  expect(three.find((d) => d.id === "gw-malabar").unlocked).toBe(false);
  expect(three.find((d) => d.id === "gw-malabar").remaining).toBe(3);
  // Reaching a region yourself opens its stand ahead of the progress gate.
  expect(at(["fort"]).find((d) => d.id === "gw-malabar").unlocked).toBe(true);
  // Every place already found is its own destination.
  const found = at(["village", "fort", "teahills"]);
  const places = found.filter((d) => d.kind === "site");
  expect(places.map((d) => d.siteId).sort()).toEqual([
    "fort",
    "teahills",
    "village",
  ]);
  places.forEach((d) => expect(canWalk(d.x, d.z), d.name).toBe(true));
  // Undiscovered places never become destinations.
  expect(found.some((d) => d.siteId === "pond")).toBe(false);
});

test("3D player walks, discovers, pauses, and preserves the portal passport", async ({
  page,
}) => {
  test.setTimeout(budget(60000));
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  const game = page.getByTestId("kerala-game");
  await page.keyboard.down("w");
  // The discovery notice is a toast that clears itself after a few seconds, so
  // watch for it while still walking. Polling a coordinate first and only then
  // looking for the toast raced with its own dismissal on a loaded machine.
  await expect(page.locator(".game-discovery-notice")).toContainText(
    "Kadal Village",
    { timeout: budget(30000) },
  );
  await expect
    .poll(async () => Number(await game.getAttribute("data-z")), {
      timeout: budget(20000),
    })
    .toBeLessThan(66);
  await page.keyboard.up("w");
  await page.keyboard.press("p");
  await expect(page.getByRole("dialog")).toContainText(`1/${sites.length}`);
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
  test.setTimeout(budget(60000));
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
  await page.keyboard.down("w");
  await expect
    .poll(
      async () =>
        Number(await page.getByTestId("kerala-game").getAttribute("data-z")),
      { timeout: 15000 },
    )
    .toBeGreaterThan(15);
  await page.keyboard.up("w");
  // The canoe only lets you step ashore near the jetty, so paddle back to it
  // rather than assuming the boat stayed where it was pushed off from.
  await page.keyboard.down("s");
  // Wait for an actual return, not a transient enabled button while still gliding away.
  await expect
    .poll(
      async () =>
        Number(await page.getByTestId("kerala-game").getAttribute("data-z")),
      { timeout: 40000 },
    )
    .toBeLessThan(12);
  await expect(page.getByRole("button", { name: "Step ashore" })).toBeEnabled();
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
  // Hari's encounter is now the listen-and-repeat practice, which only offers
  // its beats while a rehearsal is running; outside one the courtyard still
  // opens and tells its story. The practice itself is covered by
  // chenda-practice.spec.js and the rehearsal window by life.spec.js.
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("The Rhythm Courtyard");
  await expect(page.getByRole("dialog")).toContainText("chenda");
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

test("scooter can be borrowed, ridden fast, and parked", async ({ page }) => {
  test.setTimeout(budget(60000));
  await enter(page, { x: 7, z: 73 });
  const game = page.getByTestId("kerala-game");
  await expect(page.locator(".game-interaction")).toContainText(
    "village scooter",
  );
  await page.keyboard.press("r");
  await expect(game).toHaveAttribute("data-riding", "true");
  await page.keyboard.down("w");
  await expect
    .poll(async () => Number(await game.getAttribute("data-z")), {
      timeout: 15000,
    })
    .toBeLessThan(50);
  await page.keyboard.up("w");
  await page.keyboard.press("r");
  await expect(game).toHaveAttribute("data-riding", "false");
  await expect(page.locator(".game-interaction")).toContainText(
    "village scooter",
  );
});

test("the highway bridge carries the player across the river into Central Kerala", async ({
  page,
}) => {
  test.setTimeout(budget(120000));
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page, { x: 2, z: -580 });
  const game = page.getByTestId("kerala-game");
  await expect(page.locator(".game-region")).toContainText("Central Kerala");
  await page.keyboard.down("Shift");
  await page.keyboard.down("w");
  await expect
    .poll(async () => Number(await game.getAttribute("data-z")), {
      timeout: 60000,
    })
    .toBeLessThan(-625);
  await page.keyboard.up("w");
  await page.keyboard.up("Shift");
  expect(errors).toEqual([]);
});

test("the bus network unlocks with discovery and fast travels across Kerala", async ({
  page,
}) => {
  test.setTimeout(budget(90000));
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page, { x: 8, z: 84 });
  const game = page.getByTestId("kerala-game");
  await expect(page.locator(".game-interaction")).toContainText(
    "naadan bus stop",
  );
  await page.keyboard.press("b");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Where to, then?");
  // Far region stands stay closed until the journey has grown.
  await expect(
    dialog.getByRole("button", { name: /Elavara Hill Stand/ }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  // Progress alone opens them — no walk to the stand required.
  // Seed after leaving: the world writes its own journey back on exit.
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await page.evaluate(() =>
    localStorage.setItem(
      "kerala-world-journey",
      JSON.stringify({
        v: 2,
        position: { x: 0, z: 76 },
        discoveries: [
          "village",
          "beach",
          "jetty",
          "tea-shop",
          "courtyard",
          "coir",
          "paddy",
          "kavu",
          "lookout",
        ],
        interactions: [],
        moments: [],
        cells: [],
      }),
    ),
  );
  await page
    .getByRole("button", { name: /Don't just discover Kerala/ })
    .click();
  await page.getByRole("button", { name: /Continue your journey/ }).click();
  await page.keyboard.press("b");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Elavara Hill Stand/ })
    .click();
  await expect
    .poll(async () => Number(await game.getAttribute("data-x")))
    .toBeGreaterThan(500);
  expect(errors).toEqual([]);
});

test("a discovered place can be picked straight off the map and travelled to", async ({
  page,
}) => {
  test.setTimeout(budget(60000));
  await enter(page, { x: 0, z: 76 }, ["village", "beach"]);
  const game = page.getByTestId("kerala-game");
  await page.keyboard.press("m");
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Travel to The Quiet Shore" })
    .click({ force: true });
  await expect(dialog.locator(".game-map-pick")).toContainText(
    "The Quiet Shore",
  );
  await dialog.getByRole("button", { name: "Travel here" }).click();
  await expect
    .poll(async () => Number(await game.getAttribute("data-x")))
    .toBeLessThan(-60);
});

test("sitting at a rest spot records a quiet moment in the passport", async ({
  page,
}) => {
  test.setTimeout(budget(60000));
  await enter(page, { x: -70, z: 21 });
  await expect(page.locator(".game-interaction")).toContainText("Sit a while");
  await page.keyboard.press("e");
  await expect(page.locator(".game-rest-overlay")).toContainText(
    "The Driftwood Log",
  );
  await expect(page.getByTestId("kerala-game")).toHaveAttribute(
    "data-sitting",
    "beach-log",
  );
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("kerala-world-journey")).moments,
        ),
      { timeout: 20000 },
    )
    .toContain("beach-log");
  await page.keyboard.press("e");
  await expect(page.locator(".game-rest-overlay")).toHaveCount(0);
  await page.keyboard.press("p");
  await expect(page.getByRole("dialog")).toContainText("The Driftwood Log");
});

test("the canoe paddles like a boat: slow to build way, long to lose it", () => {
  const dt = 1 / 60;
  const run = (steps, input, from = { heading: 0, speed: 0 }) => {
    let state = { ...from };
    for (let i = 0; i < steps; i++) {
      const next = stepBoat({ ...state, ...input, dt });
      state = { heading: next.heading, speed: next.speed };
    }
    return state;
  };
  // Way builds over several strokes rather than snapping to full speed.
  const afterHalfSecond = run(30, { thrust: 1 }).speed;
  expect(afterHalfSecond).toBeGreaterThan(0.3);
  expect(afterHalfSecond).toBeLessThan(BOAT.forward * 0.6);
  // Top speed stays well under a 10/s land sprint, and never exceeds its cap.
  const flatOut = run(600, { thrust: 1 }).speed;
  expect(flatOut).toBeCloseTo(BOAT.forward, 1);
  expect(flatOut).toBeLessThan(6);
  // Reverse is slower still.
  expect(Math.abs(run(600, { thrust: -1 }).speed)).toBeCloseTo(BOAT.reverse, 1);
  // Releasing the paddle glides down instead of stopping dead or running on.
  const cruising = { heading: 0, speed: BOAT.forward };
  const oneSecond = run(60, { thrust: 0 }, cruising).speed;
  const fourSeconds = run(240, { thrust: 0 }, cruising).speed;
  expect(oneSecond).toBeLessThan(BOAT.forward);
  expect(oneSecond).toBeGreaterThan(BOAT.forward * 0.4);
  expect(fourSeconds).toBeLessThan(oneSecond);
  expect(fourSeconds).toBeLessThan(0.7);
  // With no input at all the canoe simply sits still.
  expect(run(120, { thrust: 0 }).speed).toBe(0);
  // Steering a stationary canoe turns it without moving it.
  const turned = stepBoat({ heading: 0, speed: 0, turn: 1, dt });
  expect(turned.heading).toBeLessThan(0);
  expect(Math.hypot(turned.dx, turned.dz)).toBe(0);
});

test("the canoe can be boarded, paddled forward, and comes to rest", async ({
  page,
}) => {
  test.setTimeout(budget(90000));
  await enter(page, { x: 24, z: 5 });
  const game = page.getByTestId("kerala-game");
  const z = async () => Number(await game.getAttribute("data-z"));
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Borrow the canoe" }).click();
  await expect(game).toHaveAttribute("data-boating", "true");
  // The bow points up the reach, so W paddles into open water.
  const from = await z();
  await page.keyboard.down("w");
  await expect.poll(z, { timeout: 20000 }).toBeGreaterThan(from + 2);
  await page.keyboard.up("w");
  // It glides, then settles, rather than running on for ever.
  await expect
    .poll(
      async () => {
        const a = await z();
        await page.waitForTimeout(700);
        return Math.abs((await z()) - a);
      },
      { timeout: 30000 },
    )
    .toBeLessThan(0.1);
});

test("the world is overheard, not narrated", async ({ page }) => {
  test.setTimeout(budget(90000));
  // Standing in the chaayakkada, you pick up the talk at the counter.
  await enter(page, { x: -12, z: 34 }, ["village", "tea-shop"]);
  const line = page.locator(".game-overheard");
  await expect(line).toBeVisible({ timeout: 25000 });
  const first = await line.innerText();
  expect(first.length).toBeGreaterThan(8);
  // It fades on its own: nothing to read, nothing to dismiss.
  await expect(line).toBeHidden({ timeout: 15000 });
  // Opening a panel never leaves a line stranded over the UI.
  await page.keyboard.press("p");
  await expect(line).toHaveCount(0);
});

test("fast travel is a bus ride with a conductor, not a teleport", async ({
  page,
}) => {
  test.setTimeout(budget(90000));
  await enter(page, { x: 8, z: 84 }, ["village", "beach", "jetty"]);
  const game = page.getByTestId("kerala-game");
  await page.keyboard.press("b");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Periyar Bridge Stand/ })
    .click();
  // The conductor says his piece while the bus is on the road.
  await expect(page.locator(".game-overheard")).toContainText("Conductor");
  await expect(page.locator(".game-bus-fade")).toBeVisible();
  await expect
    .poll(async () => Number(await game.getAttribute("data-z")), {
      timeout: 20000,
    })
    .toBeLessThan(-600);
  await expect(page.locator(".game-bus-fade")).toHaveCount(0);
});
