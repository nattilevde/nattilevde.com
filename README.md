# Kerala Unfolded

An interactive, field-journal-inspired Kerala exploration app built with React and Vite.

## Run

```sh
npm install
npm run dev
```

## Verify

```sh
npm run build
npx playwright install chromium
npm test
```

## Included

- Illustrated, keyboard-accessible map with all 14 districts and zoom controls.
- 28 place discoveries, 14 food discoveries, and 14 regional cultural stories.
- Local-storage passport, district stamps, discovery collection, and three quest badges.
- Place and district search, contextual offline guide, and optional synthesized ambient audio.
- Responsive desktop and mobile layouts, native modal dialogs, and reduced-motion support.
- Lazy-loaded, procedural Three.js world entered from the portal or directly at `/#world`.
- A five-region open world spanning all fourteen districts in miniature: the Malabar Coast (Bekal-style sea fort, beach market, Theyyam ground), Central Kerala (river, ghat, Pooram ground with caparisoned elephants, Spice Lane), the High Ranges (contoured tea slopes, waterfall, cloud viewpoint, forest belt), the Backwaters (the original Kadal Village chapter), and Travancore South (Ashtamudi lagoon, heritage street, red-banded lighthouse).
- A coastal highway running the full length of the world, a winding hill road east, branching spur roads, railed river bridges, and region signboards along the way.
- Third-person walking/running, camera orbit, building/water collisions, bridges, a playable canoe, and a borrowable village scooter (R to ride or park) that makes the long roads genuinely travelable.
- Twenty-three discoverable places, two hidden ones, nine exploration activities, and food and cultural interactions with locals across every region — including hands-on moments: chenda beats, the coir spindle, blending masala on Spice Lane, and plucking two leaves and a bud in the tea.
- A naadan bus network (B, any roadside stand, or straight off the map) for fast travel. Five region stands open as your journey grows — three discoveries anywhere opens Central Kerala, six opens Malabar, and so on — and reaching a region yourself opens its stand early. On top of that, every place you have already found becomes a destination of its own, so first visits are earned and return trips are free. Open the map, tap a gold stand or a pale dot, and choose **Travel here**.
- Seven quiet rest spots. Sit (E) on a driftwood log, a ghat step, or a cloudline bench and the camera settles into a slow, low, drifting view; linger and the moment is kept in your passport.
- A living world: monsoon showers roll in and pass, dimming the light and greying the sky while villagers hurry with an arm over their heads; chundan vallam crews race the canal in surging strokes; dolphins arc off the coast; a peacock struts the Pooram ground and fans its tail; elephants breathe and flap their ears; and fireflies come out at night in the kavu, the lotus pond, and the forest.
- A layered, fully synthesised Kerala soundscape, positioned in the world and mixed by distance and bearing, so a sound you can barely hear is somewhere to walk towards. Surf that follows the nearest shoreline, canal and river and lagoon water, Silverthread Falls, wind in the coconut fronds, day birds and night crickets, chenda melam that accelerates the way a real melam builds, temple bells, a chaayakkada's stove and glasses, market calls, autos and bus horns on the highway, a bus idling at a stand, vanchipattu from a boat crew, fishing shore work, cicadas and an elephant in the forest, plucking on the estate, rain and distant thunder, your own paddle, and a train somewhere inland. Nothing is downloaded; every layer is built from noise buffers and oscillators.
- Kerala overheard rather than explained: short transliterated Malayalam surfaces as a subtitle when you pass the right place, glossed only when the meaning would be lost. Talk at the counter of the chaayakkada, farmers on the paddy bund, an elder at the kavu, traders on Spice Lane, pluckers in the tea, and dialect that shifts north to south (*ingal* in Malabar, *ningal* in Travancore). Lines are rate-limited, never repeat back to back, and are never a popup to dismiss.
- Fast travel is a bus ride, not a teleport: the conductor's double bell, his call to get aboard, the road, and then *"Ethi. Irangikko."* when you get down.
- Floating golden glints mark undiscovered stops and disappear as each place is found; region-entry notices and a per-region HUD track where you are.
- Traveller ranks in the game passport, from New Arrival to Naattukaaran, earned through discoveries, encounters, quiet moments, and badges.
- Moving villagers, drummers, boats, birds, dogs, highway auto-rickshaws, and wild and festival elephants.
- Kerala-shaped fog-of-discovery map with region labels, local minimap, saved journey, shared portal passport, day/night atmosphere, and lightweight graphics mode.

## Play

Select **Enter the 3D World**, then **Step into Kerala**. Use WASD or arrow keys to walk, Shift to run, drag to look around, and E to interact when near a local, a landmark, or a place to sit. R borrows or parks the scooter, B calls up the bus network, M opens the map, P opens the passport, and Escape pauses. Touch devices have a movement joystick and a running toggle; drag the scenery to look around.

Start along the village lane. The tea shop is to the left; locals offer clues to the courtyard, jetty, paddies, kavu, and quieter corners beyond the canal. A scooter is parked beside the spawn lane — press R (or tap its prompt) to borrow it, and R again to park anywhere on land; its parked spot is saved and marked on the map. The coastal highway leads north through Spice Lane, the river bridge, and the beach market to the sea fort, and south past Ashtamudi to the lighthouse; the hill road east climbs to the tea estate, the falls, and the cloud viewpoint. Borrow the canoe from Binu at the jetty and return there to step ashore. It handles like a paddled boat rather than a speedboat: A and D steer, W and S paddle, it takes a few strokes to build way, tops out at well under a run, and keeps gliding after you stop. The canoe explores the southern canal reach; timber footbridges are not navigable by boat.

## World Structure

- `src/game/world.js`: region boundaries, spawn, terrain height, walkability, landmarks, activities, travel destinations, and canoe handling.
- `src/game/audio.js`: the positional soundscape — synth helpers plus one declarative entry per layer (`at`, `when`, `drone`, `every`/`fire`).
- `src/game/culture.js`: overheard lines by place, weather and time, plus the bus conductor.
- `src/game/environment.js`: procedural art, shared mesh instances, animated ambient life, and resource cleanup.
- `src/game/engine.js`: rendering, third-person controller, camera, input, discovery triggers, and canoe movement.
- `src/game/Game.jsx`: minimal HUD, encounters, fog map, saved journey, and portal passport integration.
- `src/game/game.css`: full-screen game presentation and touch controls.

Add future connected regions through world definitions, terrain, and landmarks rather than separate destination pages. Transportation is walking, the canoe, and the land scooter, all handled in the controller; additional vehicles will need their own collision and handling rules. Canoe handling is a pure function (`stepBoat` in `world.js`) so its feel can be tuned and unit-tested without the renderer. Fast-travel unlocks come from `travelDestinations(journey)`; adding a region means adding one gateway with a progress threshold, and new landmarks become destinations automatically once discovered.

## Scope

The existing portal covers all 14 districts. The 3D game is a stylised, compressed Kerala: five macro-regions along one continuous strip, with landmarks inspired by recognisable places (Bekal, Munnar, Thrissur, Ashtamudi, Kovalam) rather than geographic replicas. Each region currently carries a handful of landmarks and can grow into fuller district chapters using the same world definitions. There is no combat, traffic simulation, interiors, multiplayer, or advanced weather. The canoe and ambient vehicles are intentionally simple.

The guide uses curated content and intent matching, not a connected language model or live travel data. Progress is saved in this browser only; there is no account service or backend. Portal fonts and photography require network access; the procedural game has no external model, texture, or audio downloads. The whole soundscape is synthesised in the browser, so it needs Web Audio and only starts once you choose to turn sound on. WebGL and hardware acceleration are recommended. Balanced graphics use capped resolution and shared geometry; a lightweight mode disables shadows. District boundaries are illustrative, and some portal photographs are representative scenery. Photo attributions and license links are available in the app footer.
