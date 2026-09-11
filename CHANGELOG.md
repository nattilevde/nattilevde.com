# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the version is below `1.0.0`, minor releases may contain breaking changes
to saved progress or to the world's data shapes.

## [Unreleased]

### Fixed

- Smoothed bus, auto and ferry rendering between simulation steps, keeping riders
  attached to their vehicles; eased camera aim for all movement, including canoe
  rides, and reset visual interpolation after shortened journeys.

### Added

- Three optional Kerala photo stories with credited local photographs, draft
  Malayalam, source links, passport saving and an original film-club experiment.

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

- Tea-shop life: resident-driven tea pouring, saved snack portions, changing tray,
  original in-world TV animations, scheduled viewers and local sound/text cues.

- Added fictional mosque, temple and church exterior lanes with timed local
  visitors, plus a rain-sensitive Malabar sevens warm-up and witnessed memory.

- Added sourced Thumba, Chemmeen and Silent Valley reading boards with draft
  Malayalam and passport saving; supports place stories without photographs.

- Added a controllable hill jeep with fixed-step grounded physics, braking,
  wet grip, body suspension and chase camera; added a scenic laterite loop.
- Sevens warm-up players now chase passes and move into support.

- Added Paddy Lane off the jeep trail: six paddy plots, home verandas, a produce
  stall, farm/market routines and a rain-responsive children's play courtyard.

- Reduced rain frequency: 8–14 minutes of dry play between 25–45-second showers;
  increased saved weather timer bounds so reloads preserve the longer intervals.

- Jeep headlights now illuminate the road at night/in rain; rear lamps brighten
  under braking. Increased acceleration and top speed with stronger braking and
  reduced high-speed steering sensitivity.

- Polished field edges, home gardens and morning/evening light; expanded Paddy
  Lane with staffed shops, shutters, deliveries, pedestrians and jeep parking.
- Replaced static sevens passing with possession, dribbling, pressure, shots,
  goalkeeper interceptions, goals, resets and a saved physical scoreboard.

- Added “Find my jeep” with optional direction/distance guidance and direct return
  to a walkable spot beside the saved parked vehicle.

- Expanded the coast north of Kadal into a harbour quarter with 23 town/inland
  buildings, waterfront props, moored boats, ten local residents, parking and
  connected roads toward Paddy Lane; added three optional place discoveries.

### Connected highland drive

- Added a winding road from Paddy Lane to the existing highland route, with an alternate laterite estate track and ridge parking spur.
- Added woodland, cultivated bands, road-edge reflectors, two discoveries and a ridge resting bench.
- Added curved-route jeep clearance, gradient and browser checks; appended the deferred manual checklist.

### Portal readability and SEO foundation

- Separated the map introduction/filters from map labels and reduced floating-guide overlap on smaller screens.
- Added crawlable district and place guides with existing food/culture context, related links, unique metadata, canonical URLs and structured data.
- Build now emits a sitemap, robots rules, branded sharing metadata and a 404 document; added automated output validation and a deployment/manual checklist.

### First journey pilot

- Added optional first-visit jeep start and dismissible driving controls, preserving returning saves.
- Added roadside route cues, Paddy Lane Market discovery and a shaded fieldside rest stop.
- Added bounded browser-local playtest summaries in Pause/Help, with no uploads and independent clearing.

### Photo postcards

- Added camera-button/C capture, a paused postcard preview, PNG download and optional device sharing.
- Export omits game HUD and includes a location/region title plus the game/domain footer.
- Added a capture/download/resume check and deferred phone/share-sheet checklist.

### First-run ride preparation

- Wait for shader compilation and nearby spawn/jeep render preparation before enabling Start.
- Keep simulation paused during preparation and reset frame timing on resume, avoiding loading-time catch-up.
- Added a fresh-session comparison to the manual checklist; cold-device performance still requires confirmation.

### Changing roadside scenes

- Added harbour net/rope work variants driven by existing workers, clock and rain.
- Added a produce display driven by seller presence and actual remaining stock.
- Added nearby cues and saved observation memories without new mandatory objectives.

### Game search identity

- Added an indexable /game/ page describing the browser game, jeep driving, controls and local progress, with VideoGame structured data.
- Connected Nattilevde and Kerala Unfolded in homepage metadata and visible copy; linked the game page from guides and included it in the sitemap.

### Release readiness checks

- Added a repeatable production-build release check for desktop/phone layouts, first jeep entry, photo controls and JavaScript-free guide navigation.
- Recorded remaining device, hosting and Search Console checks in docs/RELEASE_READINESS.md.

### Cultural world expansion

- Extended neighbourhood sevens into the evening with gradual floodlights and
  pitch-side benches; retained rain retreats and nighttime departures.
- Added the phased cultural-world roadmap and evening match playtest checklist.

- Improved existing firefly pockets with independent drifting glows, gradual evening
  activity, rain suppression and persistent local discovery memories; visible in photo mode.

- Replaced Hari's three-click encounter with optional listen-and-repeat drum practice,
  three original phrases, visual beat cues, timing feedback and unlimited replay.

- Added a small lagoon training crew with coordinated paddling, a continuous water
  route, weather-dependent practice, return/rest behaviour and a saved sighting.

- Added a gradually growing neighbourhood pookalam with optional flower contribution,
  persistent decoration and a saved memory.

- Added two pookalam neighbours with staggered preparation and visiting hours,
  flower trays, working gestures, rain retreats and persistent walking progress.

- Connected flower neighbours to ambient dialogue, including activity, rain and
  remembered acknowledgement of the player's flower contribution.

- Added lingering damp roads and field bunds, small terrain-following puddles and
  wetter paddy highlights, driven by saved surface moisture without changing rain frequency.

- Added six sevens supporters with staggered arrivals, ball tracking, team-specific
  goal reactions, rain shelter routes and saved movement/reaction progress.

- Added warm exterior lamps at village, market and harbour gathering places, with
  two pooled nearby lights and gradual distance/daylight fading.

- Added a connected fictional Forest Churam drive with switchbacks, denser woodland,
  reflectors and a stopping place, plus three reactive forest deer with saved state.

- Added canopy squirrels, directional forest ambience and clearer deer details;
  documented the requested Kerala vehicle catalogue and implementation sequence.

- Shared the forest tree layout between rendering and deer navigation, added local
  obstacle steering and spacing, corrected one deer spawn, and furnished the forest stop.

- Added an original drivable Coastal Saloon with separate parking persistence,
  shared vehicle handling profiles, nearest-vehicle entry and car lighting.

- Added an original trail motorcycle with separate saved parking, narrower footprint,
  assisted leaning, rider model, wheel steering and working lights.
