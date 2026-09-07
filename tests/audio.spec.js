import { test, expect } from "@playwright/test";

// Taps whatever the game connects to the speakers, using only public browser
// APIs, so we can assert the soundscape is genuinely producing audio.
const PROBE = () => {
  const original = AudioNode.prototype.connect;
  // Re-entering the world builds a fresh AudioContext, so tap every one and
  // always read the newest — an old context's analyser holds stale samples.
  window.__probes = [];
  window.__rms = () => {
    const probe = window.__probes[window.__probes.length - 1];
    if (!probe) return -1;
    const data = new Float32Array(probe.fftSize);
    probe.getFloatTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += v * v;
    return Math.sqrt(sum / data.length);
  };
  AudioNode.prototype.connect = function (destination, ...rest) {
    if (destination === this.context?.destination && !this.context.__tapped) {
      this.context.__tapped = true;
      const analyser = this.context.createAnalyser();
      analyser.fftSize = 2048;
      original.call(analyser, destination);
      window.__probes.push(analyser);
      return original.call(this, analyser, ...rest);
    }
    return original.call(this, destination, ...rest);
  };
};

async function enterWithSound(page, position) {
  await page.addInitScript(PROBE);
  await page.addInitScript(
    (position) =>
      localStorage.setItem(
        "kerala-world-journey",
        JSON.stringify({
          v: 2,
          position,
          discoveries: [],
          interactions: [],
          moments: [],
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

const loudness = async (page, samples = 26) => {
  let peak = 0;
  for (let i = 0; i < samples; i++) {
    peak = Math.max(peak, await page.evaluate(() => window.__rms()));
    await page.waitForTimeout(120);
  }
  return peak;
};

test("the soundscape actually produces audio when sound is on", async ({
  page,
}) => {
  test.setTimeout(90000);
  await enterWithSound(page, { x: -70, z: 14 });
  expect(await page.evaluate(() => window.__probes.length)).toBeGreaterThan(0);
  expect(await loudness(page)).toBeGreaterThan(0.001);
});

test("a source gets quieter the further away you stand", async ({ page }) => {
  test.setTimeout(120000);
  // Silverthread Falls is loud, isolated, and far from the sea.
  await enterWithSound(page, { x: 612, z: -191 });
  const beside = await loudness(page, 30);
  // Leave the world first: it writes its own journey back on the way out,
  // which would otherwise overwrite the position we are about to seed.
  await page.getByRole("button", { name: "Back to Kerala" }).click();
  await page.evaluate(() =>
    localStorage.setItem(
      "kerala-world-journey",
      JSON.stringify({
        v: 2,
        position: { x: 500, z: -300 },
        discoveries: [],
        interactions: [],
        moments: [],
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
  const wayOff = await loudness(page, 30);
  expect(beside).toBeGreaterThan(wayOff * 2.5);
});

test("muting silences the world and unmuting brings it back", async ({
  page,
}) => {
  test.setTimeout(90000);
  await enterWithSound(page, { x: -70, z: 14 });
  expect(await loudness(page)).toBeGreaterThan(0.001);
  await page.getByRole("button", { name: "Mute the world" }).click();
  await page.waitForTimeout(1200);
  expect(await loudness(page, 10)).toBeLessThan(0.0005);
  await page.getByRole("button", { name: "Unmute the world" }).click();
  expect(await loudness(page)).toBeGreaterThan(0.001);
});
