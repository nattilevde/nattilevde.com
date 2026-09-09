import { test, expect } from "@playwright/test";
import { createLife, saveLife, advanceLife } from "../src/game/life.js";
import { stepTea, teaOpen, teaProgramme } from "../src/game/tea-shop.js";

test("service requires a present customer and survives reload without duplicate sales", () => {
  const life = createLife();
  const customer = life.residents.find((r) => r.id === "jaya");
  stepTea(life, 0.1);
  expect(life.tea.customer).toBeNull();
  Object.assign(customer, { x: -9, z: 31, mode: "break", moving: false });
  stepTea(life, 0.1);
  expect(life.tea.customer).toBe("jaya");
  const restored = createLife(saveLife(life));
  // createLife reconstructs modes from saved destinations; hold the same visit.
  Object.assign(
    restored.residents.find((r) => r.id === "jaya"),
    customer,
  );
  for (let i = 0; i < 100; i++) {
    stepTea(life, 0.1);
    stepTea(restored, 0.1);
  }
  expect(restored.tea).toEqual(life.tea);
  expect(life.tea.stock).toBe(7);
  customer.x = 50;
  stepTea(life, 0.1);
  expect(life.tea.served).not.toContain("jaya");
});

test("closed shop cancels pouring and afternoon preparation replenishes the tray", () => {
  const life = createLife();
  Object.assign(
    life.residents.find((r) => r.id === "jaya"),
    { x: -9, z: 31, mode: "break", moving: false },
  );
  stepTea(life, 0.1);
  life.residents[0].mode = "sheltering";
  stepTea(life, 0.1);
  expect(teaOpen(life)).toBe(false);
  expect(life.tea.pouring).toBe(0);
  life.tea.stock = 0;
  life.clock = 14 * 120;
  stepTea(life, 0.1);
  expect(life.tea.stock).toBe(8);
  expect(teaProgramme(life)).toBeNull();
});

test("TV visitors arrive through routes and leave when the afternoon break ends", () => {
  const life = createLife();
  life.clock = 16 * 120;
  life.weather = {
    rain: 0,
    target: 0,
    remaining: 1000,
    wetness: 0,
    episode: 0,
    sheltering: false,
  };
  advanceLife(life, 130);
  expect(
    life.residents.filter((r) => r.mode === "watching").length,
  ).toBeGreaterThan(0);
  const restored = createLife(saveLife(life));
  advanceLife(life, 190);
  advanceLife(restored, 190);
  expect(life.residents.filter((r) => r.mode === "watching")).toHaveLength(0);
  expect(restored.tea).toEqual(life.tea);
});
