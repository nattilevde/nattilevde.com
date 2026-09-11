import { test, expect } from "@playwright/test";
import * as THREE from "three";
import { groundDampness, buildWetGround } from "../src/game/wet-ground.js";
import { createLife, saveLife, advanceLife } from "../src/game/life.js";

test("surface wetness persists after rain, survives reload and dries without a new shower", () => {
  const life = createLife();
  life.weather = {
    rain: 0,
    target: 0,
    wetness: 0.8,
    remaining: 800,
    episode: 1,
    sheltering: false,
  };
  expect(groundDampness(life.weather)).toBe(0.8);
  const restored = createLife(saveLife(life));
  expect(groundDampness(restored.weather)).toBe(0.8);
  advanceLife(restored, 30);
  expect(groundDampness(restored.weather)).toBeCloseTo(0.55);
  advanceLife(restored, 100);
  expect(groundDampness(restored.weather)).toBe(0);
  expect(restored.weather.episode).toBe(1);
});
test("puddles follow terrain and disappear as residual wetness dries", () => {
  const root = new THREE.Group();
  const geometries = [],
    materials = [];
  const view = buildWetGround({
    group: () => root,
    ownGeometry: (g) => (geometries.push(g), g),
    material: (color, options) => {
      const m = new THREE.MeshStandardMaterial({ color, ...options });
      materials.push(m);
      return m;
    },
    terrainHeight: (x, z) => x * 0.1 + z * 0.02,
  });
  const positions = geometries[0].attributes.position;
  for (let i = 0; i < positions.count; i++)
    expect(positions.getY(i)).toBeCloseTo(
      positions.getX(i) * 0.1 + positions.getZ(i) * 0.02 + 0.125,
      4,
    );
  view.update({ rain: 0, wetness: 0.8 });
  expect(root.visible).toBe(true);
  expect(materials[0].opacity).toBeGreaterThan(0.3);
  view.update({ rain: 0, wetness: 0 });
  expect(root.visible).toBe(false);
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
});
