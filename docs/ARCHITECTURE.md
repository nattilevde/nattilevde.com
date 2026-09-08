# Architecture

Two experiences share one React app: a 2D **portal** covering all 14 districts,
and a lazy-loaded 3D **game** world built with Three.js. There is no backend.
All progress lives in the visitor's `localStorage`.

```
index.html
└── src/main.jsx
    └── src/portal/App.jsx          the portal: districts, discoveries, passport
        └── src/game/Game.jsx       lazy-loaded on entering the 3D world
```

## The portal — `src/portal/`

A single-page React app with no router; `App.jsx` holds the view state and
renders the district map, discovery lists, search, the offline guide, and the
passport.

| File            | What it holds                                                     |
| --------------- | ----------------------------------------------------------------- |
| `App.jsx`       | All portal UI and state, plus the passport merge and storage sync |
| `KeralaMap.jsx` | The illustrated, keyboard-navigable SVG district map              |
| `data.js`       | District, place, food and story content                           |
| `styles.css`    | Portal styling                                                    |

The portal owns the shared passport in `localStorage` under `kerala-passport`.
The game reports discoveries up to it through an `onRecord` callback.

## The game — `src/game/`

The first living-village prototype is documented in [KADAL_PHASE_ONE.md](KADAL_PHASE_ONE.md).

Entering the world mounts `Game.jsx`, which creates the engine and renders the
HUD over its canvas. The split is deliberate: **`world.js` is the model,
`environment.js` is what you see, `engine.js` is what you do, and `Game.jsx` is
what you read.**

| File             | Responsibility                                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `world.js`       | Pure data and pure functions: region bounds, terrain height, walkability, the coastline, sites, activities, ranks, roads, bus stands, rest spots, travel unlocks, and canoe handling. No Three.js, no DOM — which is why it can be unit-tested directly. |
| `environment.js` | Builds the scene: terrain tiles, water, roads, buildings, landmarks, vegetation, people, vehicles, wildlife, rain and fireflies. Merges everything static into instanced meshes, and animates the rest each frame.                                       |
| `engine.js`      | Renderer, camera, third-person controller, input, collision, discovery triggers, shared life simulation, sitting, fast travel, and the canoe and scooter modes.                                                                                          |
| `audio.js`       | The positional soundscape. Synth helpers plus one declarative entry per layer.                                                                                                                                                                           |
| `culture.js`     | Overheard lines by place, weather and time, and the bus conductor.                                                                                                                                                                                       |
| `Game.jsx`       | HUD, map, passport, encounters, notices, subtitles, touch controls.                                                                                                                                                                                      |
| `game.css`       | Game presentation and touch controls.                                                                                                                                                                                                                    |

### How a frame runs

`engine.js` owns the loop. Each frame it reads input, moves the player (walking,
scooter, or canoe), resolves collision against `canWalk`, checks discovery and
proximity, advances the shared village state (clock, weather, residents and boat), then calls `environment.update()` and
`soundscape.update()` with the player's position and the world's state. It
publishes a throttled snapshot to `Game.jsx`, which re-renders the HUD.

### Village life

`life-data.js` holds the persistent cast, connected paths, shelter spaces and
landings. `life.js` advances seeded state without a renderer. The engine sends
its state to the scene, audio and HUD, and saves it alongside the existing journey.
Village contacts follow residents; discovery remains attached to places. Only
witnessed situations or direct contributions create contextual memories. The
portal merges their summaries without owning the simulation clock.

### Performance approach

The world is roughly 920 × 2400 units. It stays cheap because:

- Terrain is four coarse tiles, not a dense mesh.
- Everything static is merged into `InstancedMesh` batches at build time, so
  hundreds of palms and buildings cost a handful of draw calls.
- Only animated objects stay as individual meshes.
- Audio layers activate and deactivate by distance, so nothing runs off-screen.
- A lightweight graphics mode drops shadows and pixel ratio.

### The soundscape

Every sound is synthesised at runtime from noise buffers and oscillators —
nothing is downloaded. Each layer declares where it is (`at`), whether it should
run (`when`), a continuous `drone`, and/or a scheduled `every`/`fire` one-shot.
`update()` sets each layer's gain from distance, its stereo position from
bearing relative to the camera, and rolls off the high frequencies with
distance so far-away sounds read as far away.

## Tests — `tests/`

Playwright, against a dev server it starts itself. `game.spec.js` mixes pure
model assertions with browser tests; `exploration.spec.js` covers the portal;
`audio.spec.js` taps the Web Audio graph to confirm the world actually makes
sound, gets quieter with distance, and can be muted.

## Extending to more of Kerala

The world is defined as data. A new region needs an entry in `regions`, a bus
gateway with a progress threshold, sites, and terrain in `terrainHeight`.
Landmarks become fast-travel destinations automatically once discovered. See
[CONTENT.md](CONTENT.md).
