# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the version is below `1.0.0`, minor releases may contain breaking changes
to saved progress or to the world's data shapes.

## [Unreleased]

### Added

- First Kadal living-village prototype: a saved clock and seeded weather, twelve
  persistent residents, work/break/home routes, reserved shelters, interrupted
  coir work and participant-dependent rehearsal.
- A short passenger-boat service with boarding, optional shortened rides and
  safe landing; two residents use it for their cross-canal commute.
- Contextual memories, local recognition, memory pinning and portal summaries.
- Quiet exploration by default, optional assistance and directional captions,
  a development-only state inspector, and single-writer protection on browsers
  with Web Locks.
- Model and browser checks for the village simulation and existing-save migration.

### Changed

- Village sound cues follow actual practice and boat movement. The perpetual
  canal race, detached boat-song and unreachable train cues are held back.
- The canoe return check waits for the boat to return, rather than a button
  temporarily enabled while it is still gliding away from the landing.

### Fixed

- The world no longer runs in slow motion on slow hardware. Movement now
  integrates in fixed steps, as many per frame as real time requires, so walking,
  riding and paddling cover the same ground per second whatever the frame rate.
  Previously a frame could advance the simulation by at most 50ms, so a device
  rendering at 5fps played at a quarter speed.
- Continuous integration no longer times out. Test runs are serialised on CI,
  where the 3D world renders in software and parallel browsers starve each
  other, and local runs are capped to two workers for the same reason.
- The canoe test now paddles back to the jetty before stepping ashore, instead
  of assuming the boat drifted nowhere.

## [0.1.0] — 2026-09-07

First public release. Both halves of the project — the illustrated portal and
the 3D world — are playable end to end.

### Added

**Portal**

- Illustrated, keyboard-navigable SVG map of all 14 Kerala districts, with zoom
  controls and district search.
- 28 place discoveries, a signature food and a cultural story for each district,
  and three quest badges.
- A contextual offline guide using curated content and intent matching.
- A passport stored in `localStorage`, shared with the 3D world.
- Responsive layouts from 375px upward, native modal dialogs, and reduced-motion
  support.

**The 3D world**

- A procedural Three.js world of roughly 920 × 2400 units, lazy-loaded from the
  portal or reachable directly at `/#world`.
- Five regions standing in for the 14 districts: the Malabar Coast, Central
  Kerala, the High Ranges, the Backwaters, and Travancore South, joined by one
  coastal highway with branching spur roads and railed river bridges.
- 23 discoverable places, two of them hidden, including a laterite sea fort, a
  Theyyam ground, a Pooram ground with caparisoned elephants, a river ghat,
  contoured tea slopes, a waterfall, a lagoon and a lighthouse.
- 9 exploration activities with badges, and 7 traveller ranks from New Arrival
  to Naattukaaran.
- 8 locals to meet, 4 of them offering hands-on encounters: chenda beats, the
  coir spindle, blending masala, and plucking tea.
- 7 rest spots that seat the player and settle the camera into a slow, low,
  drifting view; lingering records the moment in the passport.
- Fog-of-discovery map with region labels, a cropped local minimap, and floating
  markers over undiscovered places.

**Movement and travel**

- Third-person walking and running with camera orbit, terrain following, and
  collision against buildings, water and world bounds.
- A borrowable scooter whose parked position is saved and shown on the map.
- A paddled canoe with its own handling model: several strokes to build way, a
  top speed well under a run, and a long glide after you stop.
- A bus network for fast travel. Five region stands open on overall progress,
  and every place already found becomes a destination of its own. Destinations
  can be chosen from a list or picked directly off the map.

**Atmosphere**

- A layered soundscape synthesised entirely in the browser from noise buffers
  and oscillators — no audio files. Layers are positioned in the world and mixed
  by distance and bearing, with high frequencies rolled off by distance, so a
  faint sound reads as somewhere to walk towards.
- Monsoon showers that arrive and pass, changing the light, the sky and how
  villagers move.
- Ambient life: villagers, drummers, boats, birds, dogs, auto-rickshaws,
  snake-boat crews, dolphins, a peacock, elephants, and fireflies at night.
- Day, night and day/night-cycle atmospheres, and a lightweight graphics mode.
- 50 overheard lines across 19 places, in transliterated Malayalam with dialect
  that shifts north to south, glossed only where meaning would be lost.
- Fast travel presented as a bus ride, with the conductor's bell and calls.

**Project and tooling**

- Vite build with the React plugin, code-splitting the 3D world into its own
  lazily loaded chunk.
- 25 Playwright tests covering the portal, the world, movement, travel,
  progression, and the soundscape — including checks that audio is produced,
  attenuates with distance, and can be muted.
- Prettier formatting, a GitHub Actions CI workflow, issue and pull request
  templates, and contributor documentation.

### Known limitations

- No ESLint and no type checking; only Prettier is configured.
- No combat, traffic simulation, building interiors, multiplayer, or weather
  beyond rain.
- Place names in the 3D world are fictional and inspired by real locations
  rather than modelled on them; each region carries a handful of landmarks
  rather than a full district.
- Progress is saved to `localStorage` in one browser only, with no account or
  backend, and can be lost if site data is cleared.
- The portal loads photographs and fonts from third-party hosts at runtime, so
  it needs network access; the 3D world needs WebGL and Web Audio.
- The 3D world has not been profiled on low-end mobile hardware.
