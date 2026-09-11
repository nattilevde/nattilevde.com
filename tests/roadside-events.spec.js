import { test, expect } from "@playwright/test";
import {
  createLife,
  advanceLife,
  saveLife,
  observeLife,
} from "../src/game/life.js";
import { roadsideEvents, roadsideCue } from "../src/game/roadside-events.js";
test("harbour work needs workers and changes with the day and weather", () => {
  const s = createLife();
  s.clock = 8 * 120;
  expect(roadsideEvents(s)[0].active).toBe(false);
  advanceLife(s, 180);
  expect(roadsideEvents(s)[0].active).toBe(true);
  expect(roadsideEvents(s)[0].variant).toBe("nets");
  s.clock = 2880 + 13 * 120;
  expect(roadsideEvents(s)[0].variant).toBe("ropes");
  expect(roadsideEvents(s)[0].active).toBe(true);
  s.weather.sheltering = true;
  expect(roadsideCue(s, { x: -72, z: -279 })).toBeNull();
});
test("produce reflects seller presence and remaining stock; memories survive reload", () => {
  const s = createLife();
  s.clock = 10 * 120;
  const seller = s.paddy.people.find((p) => p.id === "vendor");
  Object.assign(seller, { x: 310, z: 101, mode: "market" });
  s.paddy.stock = 12;
  expect(roadsideEvents(s)[1].variant).toBe("full");
  observeLife(s, { x: 313, z: 101 });
  observeLife(s, { x: 313, z: 101 });
  expect(
    s.memories.filter((m) => m.id.startsWith("roadside-produce")),
  ).toHaveLength(1);
  expect(createLife(saveLife(s)).memories).toEqual(s.memories);
  s.paddy.stock = 3;
  expect(roadsideEvents(s)[1].variant).toBe("last");
  s.paddy.stock = 0;
  expect(roadsideEvents(s)[1].active).toBe(false);
  s.paddy.stock = 12;
  seller.mode = "home";
  expect(roadsideEvents(s)[1].active).toBe(false);
});
