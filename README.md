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
- Third-person walking/running, camera orbit, building/water collisions, bridges, and a playable canoe.
- Eight discoverable places, a hidden lotus pond, three exploration activities, food and cultural interactions.
- Moving villagers, drummers, boats, birds, dogs, and a village auto-rickshaw.
- Fog-of-discovery map, saved journey, shared portal passport, day/night atmosphere, and lightweight graphics mode.

## Play

Select **Enter the 3D World**, then **Step into Kerala**. Use WASD or arrow keys to walk, Shift to run, drag to look around, and E to interact when near a local or landmark. M opens the map, P opens the passport, and Escape pauses. Touch devices have a movement joystick and a running toggle; drag the scenery to look around.

Start along the village lane. The tea shop is to the left; locals offer clues to the courtyard, jetty, and quieter corners beyond the canal. Borrow the canoe from Binu at the jetty and return there to step ashore. The canoe explores the southern canal reach; timber footbridges are not navigable by boat.

## World Structure

- `src/game/world.js`: region boundaries, spawn, terrain height, walkability, landmarks, and activities.
- `src/game/environment.js`: procedural art, shared mesh instances, animated ambient life, and resource cleanup.
- `src/game/engine.js`: rendering, third-person controller, camera, input, discovery triggers, and canoe movement.
- `src/game/Game.jsx`: minimal HUD, encounters, fog map, saved journey, and portal passport integration.
- `src/game/game.css`: full-screen game presentation and touch controls.

Add future connected regions through world definitions, terrain, and landmarks rather than separate destination pages. Transportation is currently a walking/canoe mode in the controller; additional vehicles will need their own collision and handling rules.

## Scope

The existing portal covers all 14 districts. The 3D game starts with one compact, fictional Alappuzha-inspired region, not a geographically accurate model of Kerala. Other districts are not yet playable in 3D. There is no combat, traffic simulation, interiors, multiplayer, or advanced weather. The canoe and ambient vehicles are intentionally simple.

The guide uses curated content and intent matching, not a connected language model or live travel data. Progress is saved in this browser only; there is no account service or backend. Portal fonts and photography require network access; the procedural game has no external model or texture downloads. WebGL and hardware acceleration are recommended. Balanced graphics use capped resolution and shared geometry; a lightweight mode disables shadows. District boundaries are illustrative, and some portal photographs are representative scenery. Photo attributions and license links are available in the app footer.
