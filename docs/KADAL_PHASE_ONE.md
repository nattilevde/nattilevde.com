# A Day Around Kadal — implementation notes

This is the first playable village prototype of the
[Next Evolution Design](NEXT_EVOLUTION_DESIGN.md). It implements the shared-life
foundation and a bounded set of interactions. The larger Kerala vision remains
future work. No release or deployment is part of this change.

## What changes when you play

- Leela, Binu, Radha, Hari and eight supporting residents have stable identities,
  connected walking routes, work windows, staggered lunch breaks and home anchors.
  They move even when the player is elsewhere. Speaking to the four named village
  contacts follows their current positions; their places remain discoverable.
- A shared 48-minute clock starts at 8 AM. The clock, seeded weather, resident
  routes, coir state and boat crossing survive re-entry. Menus and background tabs
  pause the world; time outside the game does not advance it.
- Rain reserves individual spaces at the two existing verandas. Radha secures
  exposed fibre before sheltering. Helping her shortens that work once per shower.
  Work resumes and covered material dries after the shower.
- Rehearsal needs Hari and available players in the courtyard. Its sound stops
  when the participants leave or take shelter. The player can join briefly.
- A passenger boat connects Palmwater and the far bank. Residents whose commute
  uses that crossing wait at its landing. Players can board, shorten a ride or
  leave at the next landing. Heavy rain pauses departures, and service runs from
  6 AM to 7 PM on the village clock.
- Shared shelter, heard practice, helping with fibre and completed crossings can
  become contextual memories. Memories are deduplicated, capped at 40, and up to
  eight can be pinned. Summaries also appear in the portal passport.
- The default HUD leaves objectives and discovery counts inside the passport.
  Exploration assistance restores the old objective panel and floating beacons.
  Optional directional captions describe actual practice and boat movement.
- Existing discoveries, interactions, badges, rest stamps, explored cells,
  scooter parking and convenient bus returns remain compatible.

The perpetual canal race and its detached boat-song cue are held back while the
passenger service uses the canal. The unreachable train cue and stand-idling cue
are disabled. Random road sounds are suppressed inside the village; regional
ambient life outside the pilot still uses its earlier implementation.

## Model and ownership

`life-data.js` defines route nodes/edges, the cast, personal anchors, shelter
slots and two landing points. `life.js` is a pure, seeded state machine with
small fixed steps. It resolves weather, actor movement, reservations, rehearsal,
coir work, service progress and memories. It has no renderer or browser timers.

The engine owns one instance. It queries dynamic contacts and sends the same
state to rendering, audio and the interface. Rendering interpolates walking
positions; it does not choose their destinations. Journey saves retain version 2
for the existing progress fields and add a separately versioned `life` object.
Invalid new-state fields are repaired without discarding old collectables.

On browsers with Web Locks, one tab owns world writes. Another tab asks the
player to close the active world and re-enter; it cannot overwrite that world's
clock. Browsers without Web Locks retain the existing single-tab expectation.
The portal only merges bounded memory summaries and collectable sets, never
simulation state.

For development, open `/?life-debug#world` and expand **Village simulation** in
the pause menu. The inspector is omitted from production builds. Deterministic
model tests can seed a clock, weather state or route directly without debug
controls in the player interface.

## Validation and remaining gates

Verified on 8 September 2026: all 37 Playwright checks passed (the existing 25
and 12 village-life checks). The production build, repository formatting check
and whitespace diff check also passed.

The new checks exercise connected/walkable routes, exclusive shelter capacity,
unattended resolution, repeatable outcomes, mid-route reload, rejected remote
actions, factual memory capture, safe ferry arrival, malformed-state recovery,
night-time return, quiet HUD/captions, legacy progress, portal memory summaries,
cross-tab ownership and touch layout. The existing regression suite remains part
of the acceptance check.

A local Node measurement advanced a full simulated day in approximately 111 ms
with 12 residents and a roughly 3.2 KB state snapshot. This measures model cost
only; it is not a rendered frame-rate result or a mobile performance claim.

The design's human gates are still open: six-person curiosity testing, Kerala
language/cultural review, and profiling on a named mid-range phone. The screenshot
check uses an emulated touch viewport, not physical hardware. Do not widen the
simulation on the strength of automated checks alone.

## Deliberate prototype limits

- Routines use authored work/break/home windows and a few shared conditions,
  rather than a general needs or economy system. Weather is village-wide.
- Houses use exterior home anchors; interiors are not simulated.
- Boarding transfers a passenger between the landing and boat; it is not a
  walkable gangway or full boarding animation. Ferry travel is a short authored
  crossing and the manual canoe retains its original bounds.
- The two bridge routes exist, but dynamic road closures and general traffic
  yielding are not implemented. Pedestrians share paths without crowd physics.
- Recognition is limited to people met and Radha's help acknowledgement.
  Dialogue uses the existing Malayalam lines where applicable, with
  plain English for new situational information pending local language review.
- Regional festivals, seasons, agriculture, wildlife ecology, physical bus/auto/
  train networks and distant-region simulation detail remain later phases.

Before expansion, use observation sessions to decide whether the village creates
recognisable causes and useful curiosity. More actors or event types should not
be used to compensate for weak continuity or unreadable routes.
