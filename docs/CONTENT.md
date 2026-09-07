# Adding to the world

Most content is data in `src/game/world.js` and `src/game/culture.js`. You
rarely need to touch the engine.

Before adding anything, read the voice guidance in
[CONTRIBUTING.md](../CONTRIBUTING.md#writing-about-kerala).

## A discoverable place

Add an entry to `sites` in `src/game/world.js`:

```js
{
  id: "riverghat",
  name: "The Periyar Steps",
  x: 30,
  z: -632,
  radius: 9,          // how close you must get to discover it
  kind: "place",      // place | food | culture | hidden
  line: "One short line, shown on discovery.",
  story: "A paragraph the player reads when they interact.",
}
```

Then give it something to look at in `src/game/environment.js`, near the same
coordinates.

Rules the tests enforce:

- `canWalk(x, z)` must be `true` at the site's position.
- `kind: "hidden"` places get no floating beacon and stay off the map and out of
  the passport until found.
- Anything with an `npc` gets an interaction prompt; add `handsOn` for a
  three-step activity, and `hint` for a line pointing somewhere else.

## A rest spot

Add to `REST_SPOTS`. `face` is the yaw the seated player looks along, so point
it at whatever is worth looking at; the seat prop is placed behind them.

```js
{
  id: "ghat-step",
  name: "The Ghat Step",
  x: 30,
  z: -628,
  face: Math.PI,
  seat: "bench",     // bench | log | none (none = scenery already provides one)
  line: "Cool stone underfoot. The river goes about its business.",
}
```

## An exploration activity

Add to `activities`. `source` picks which list the requirements are checked
against: `discoveries`, `interactions` or `moments`.

```js
{
  id: "old-ways",
  name: "The Old Ways",
  description: "Reach the paddy fields and find the sacred grove.",
  requires: ["paddy", "kavu"],
  source: "discoveries",
  badge: "Keeper of Old Ways",
}
```

## Something to overhear

Add a zone to `OVERHEARD` in `src/game/culture.js`. Keep lines short, and add a
`gloss` only where the meaning would otherwise be lost.

```js
{
  id: "ghat",
  x: 30,
  z: -630,
  radius: 26,
  when: (c) => c.rain > 0.3,   // optional
  lines: [
    { who: "A woman washing", text: "Vellathinu ippozhum thanuppundu." },
    { who: "A boy", text: "Chaadaan pattumo?", gloss: "can I jump in?" },
  ],
}
```

Lines are rate-limited to roughly one per 21 seconds and never repeat back to
back, so a zone can hold plenty without becoming chatter.

## A sound

Add a layer to `layers` in `src/game/audio.js`. Everything is synthesised — use
the `hit` and `tone` helpers rather than adding an audio file.

```js
{
  id: "ferry",
  range: 90,              // beyond this the layer is switched off entirely
  level: 0.6,             // its share of the mix at zero distance
  at: { x: 120, z: 400 }, // or (listener) => ({ x, z }) to follow something
  when: (l) => l.night < 0.5,           // optional
  drone(out) { /* continuous; return a stop function */ },
  every: () => 8 + Math.random() * 12,  // seconds until the next one-shot
  fire(out) { /* a one-shot */ },
}
```

Distance sets the gain, bearing sets the stereo position, and distance also
rolls off the high end — so a new layer becomes an exploration cue for free.

## A new region

1. Add to `regions` with a `test(x, z)` predicate. Order matters: the first
   match wins, and the last entry is the fallback.
2. Shape the land in `terrainHeight`, and keep it walkable in `canWalk`.
3. Add a `REGION_GATEWAYS` entry with an `at` threshold — the number of
   discoveries after which the bus stand opens.
4. Add sites, environment geometry, sounds and overheard lines.

Discovered landmarks become fast-travel destinations on their own; you do not
need to register them anywhere.
