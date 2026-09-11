# Changelog

## [Unreleased]

## [0.3.0] — Release candidate

Prepared for the next deployment; not yet tagged or published.

### Added

- Shared vehicle handling with a controllable jeep, Coastal Saloon and trail
  motorcycle, independent saved parking, vehicle lights and quick jeep access.
- Paddy Lane homes, shops, deliveries and play areas; harbour-quarter expansion,
  connected hill roads and the fictional Forest Churam with viewing stops.
- Reactive forest deer, canopy squirrels and directional synthetic forest ambience.
- Sevens possession, shots, goalkeepers, floodlights, supporters and goal reactions.
- Listen-and-repeat chenda practice, ambient lagoon boat training, growing pookalam,
  participating neighbours and contextual recognition.
- Photo postcards, credited Kerala photo stories and sourced reading boards.
- Firefly discoveries, lingering wet ground and warm nighttime destination lighting.
- Portal/game search pages, sitemap and structured data for 45 indexable pages,
  visible open-source/support links and production browser release checks.

### Changed

- Longer dry intervals, improved jeep acceleration and braking, smoother first rides
  through graphics warm-up, and clearer portal navigation.
- Three.js is cached as a separate chunk; removed an unused shipped logo and resized
  the favicon. Preserved the image used by Open Graph metadata.
- Restored CI for main/develop with format/build checks and three test shards.
- Independent game tests and test-level sharding prevent one failure from skipping
  unrelated scenarios; each CI runner still renders one browser at a time.
- Existing saves initialise new vehicles, neighbours and wildlife without a reset.

### Fixed

- Chenda practice sounds while the world is paused and records participation.
- Stable terrain assertions, scoped fishing memories, current chenda encounter
  coverage, audio measurement overhead and discovery-toast timing.
- Courtyard test uses the visible interaction after closing the passport, avoiding
  a hotkey sent while button focus suppresses world controls.
- CI-aware test budgets and browser coverage for audible chenda practice and saved participation.

### Known limits

- Vehicle and wildlife visuals remain stylised; motorcycle balance is assisted.
- Boat training is ambient; no playable snake-boat race or licensed vanchipattu yet.
- Pookalam is a fictional ten-world-day episode, not an annual festival calendar.
- Real-device performance, touch handling and visual quality need the final smoke
  pass in docs/RELEASE_READINESS.md. Further features are deferred there.

## [0.2.0] — 2026-09-08

### Fixed

- Smoothed bus, auto and ferry rendering between simulation steps, keeping riders
  attached to their vehicles; eased camera aim for all movement, including canoe
  rides, and reset visual interpolation after shortened journeys.

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

### Added

- Kadal fishing-to-market cycle: weather-dependent catches, visible basket
  deliveries, perishable stall stock, buyer activity and connected memories.

- Village auto connecting the Kadal bus stand and far-bank landing, responding
  to transport arrivals with rain-sensitive travel, yielding and saved rides.

- Physical Kadal–Periyar local bus with commuters, daylight service, rain-sensitive
  speed, pedestrian yielding, saved rides and completed-trip memories.
- Village banana plants, flowering gardens, canal reeds and varied terrain greens.

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
