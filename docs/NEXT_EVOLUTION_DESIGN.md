# Next Evolution Design

## Nattilevde: a Kerala that carries on around you

**Design proposal · 8 September 2026 · repository baseline `c710041`**

**WORLD → LIFE → CURIOSITY → EXPLORATION → DISCOVERY → MEMORY**

The next evolution should make familiar places worth returning to. People have
somewhere to go, weather changes their plans, transport brings people together,
and small consequences survive after a situation ends. The player learns how
this Kerala works by spending time in it.

The central design decision is to build a shared simulation of everyday life
under the existing world. Begin with one connected neighbourhood in Kadal
Village. Expand only after its ordinary day can generate interesting,
understandable situations without an objective panel.

This document specifies the direction, system rules, migration approach and a
bounded first development phase. It does not implement gameplay. The assessment
is based on repository documentation and source inspection, including the world
model, engine, ambient animation, audio, dialogue, HUD, portal integration and
existing test coverage. It is not a live playthrough or a hardware performance
assessment. Proposed tuning values below are starting hypotheses.

## 1. What the existing game actually offers

The project already has a coherent identity: peaceful, browser-based wandering
through a stylised, fictional Kerala. React and Vite host both an illustrated
district portal and a lazily loaded Three.js world. There is no backend or
account; progress is saved locally.

| Area                | Existing behaviour                                                                                                                                       | Implication for the next evolution                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Geography           | Five macro-regions representing 14 districts, one long highway, spur roads, bridges, coast, canal, lagoon and hills in a roughly 920 × 2400-unit world   | Keep this footprint; give its connections and settlements more purpose                           |
| Discovery           | 23 sites, including two hidden places; proximity records a discovery and removes its beacon                                                              | Preserve place identity while separating finding a place from experiencing its changing life     |
| People              | Eight named site contacts; ambient walkers travel back and forth along prescribed lanes                                                                  | Separate people from site coordinates; give a small persistent cast destinations and obligations |
| Participation       | Food interactions and four hands-on encounters; cultural encounters use a three-action completion sequence                                               | Replace repeated completion with small actions that alter a shared activity                      |
| Progress            | Nine activities, seven ranks, discovery counts and a default next unfinished activity in the HUD                                                         | Make accomplishment retrospective and assistance optional                                        |
| Rest                | Seven seats; sitting for about 3.2 seconds records a one-time moment                                                                                     | Keep rest as a way to watch life unfold; add contextual memories without rewarding idle farming  |
| Movement            | Walking, running, a borrowable scooter and a paddled canoe                                                                                               | Preserve handling; make roads and waterways carry other lives                                    |
| Bus travel          | Discovery thresholds or regional discovery unlock stands; discovered sites become direct destinations; a brief bus presentation precedes relocation      | Retain convenient returns while adding physical services that can introduce unfamiliar places    |
| Ambient life        | Walkers, autos, boats, dogs, birds, boat crews, dolphins, elephants, peacock and fireflies                                                               | Existing visual assets can express simulated states rather than independent loops                |
| Weather and time    | Rain timers, lighting changes, faster walkers with rain poses; selectable day/night and a 240-second visual cycle                                        | Establish a shared clock and persistent local weather state before schedules or seasons          |
| Sound               | Synthesised positional layers with distance attenuation, stereo bearing and distance filtering                                                           | An excellent foundation for curiosity, once significant sounds are tied to actual sources        |
| Language            | Authored transliterated Malayalam, regional flavour, place/weather/time conditions and repetition limits                                                 | Preserve the understated voice; make speech depend on present speakers and known facts           |
| Memory and portal   | World journey stores position, scooter, explored cells and lists of discoveries/interactions/rest moments; portal merges world records into its passport | Add world continuity separately from the existing collectable lists                              |
| Quality foundations | Static instancing, reduced graphics mode, pure model functions and Playwright model/browser/audio checks                                                 | Extend the existing architecture incrementally and profile before raising population density     |

**The current exploration loop is predominantly:** notice a landmark or prompt,
approach a fixed site, read or complete an interaction, receive progress, move on.
Atmosphere enriches that loop, but generally does not change what happens next.

Important source-level distinctions:

- Rain changes the walkers' animation and speed, but does not currently give
  them shelter destinations. Autos and boats likewise follow animation paths.
- The engine discovers and interacts with sites by distance to fixed coordinates.
  A named local is currently part of a site's data, rather than an independent
  resident with a remembered day.
- Some sound sources are geographical approximations: road sounds track the
  nearest highway position, boat song tracks a canal position near the listener,
  and the train sounds from `x = 900`, beyond the world's `maxX = 760`.
- Default objective selection is the first unfinished activity. The HUD also
  exposes discovery totals. Both encourage completion even though the writing
  invites wandering.
- The saved journey has no persistent NPC schedules, event histories, clock or
  weather state. Rest moments remain in the world passport rather than being
  passed to the portal as individual moments.
- The portal currently adds the Alappuzha stamp for world records, including
  records originating elsewhere. A new memory system must use explicit location
  metadata rather than extending that assumption.

Source anchors: [world definitions](../src/game/world.js),
[engine and discovery](../src/game/engine.js),
[ambient animation](../src/game/environment.js),
[soundscape](../src/game/audio.js), [local speech](../src/game/culture.js),
[game interface](../src/game/Game.jsx), [portal records](../src/portal/App.jsx),
[architecture](ARCHITECTURE.md), [game tests](../tests/game.spec.js),
[audio tests](../tests/audio.spec.js).

## 2. The experience contract

| Principle   | World responsibility                                                            | Player experience                              |
| ----------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| WORLD       | Maintain legible geography, routes, weather and places with useful functions    | “I wonder where this road goes.”               |
| LIFE        | People pursue work, travel, rest and social contact with or without observation | “Something is happening nearby.”               |
| CURIOSITY   | Let activity produce sound, movement, light, conversation and traces            | “Where did that sound come from?”              |
| EXPLORATION | Offer multiple plausible ways to investigate, follow, wait or wander away       | “I want to follow that.”                       |
| DISCOVERY   | Reveal a place, relationship, route, explanation or temporary state             | “I've never seen this place like this before.” |
| MEMORY      | Preserve what the player actually experienced and selected consequences         | “That is where we waited out the rain.”        |

Memory feeds the next visit: recognition, route knowledge and changed expectations
create curiosity in a place the player already knows.

Design rules:

1. **Every meaningful happening has a cause.** A gathering needs participants,
   a reason, a place and an available time window.
2. **People finish things without the player.** Participation changes details;
   it is rarely the condition for the world to continue.
3. **Followable cues tell the truth.** Their source exists, can be approached or
   observed, and leaves a understandable trace if the player arrives late.
4. **Ordinary stretches matter.** Walking, quiet work, empty grounds and pauses
   give unusual activity its meaning. Constant spectacle destroys curiosity.
5. **Recognition is more valuable than volume.** A dozen people with continuity
   can establish a neighbourhood more effectively than a dense anonymous crowd.
6. **Observation is a complete way to play.** No compulsory jobs, survival chores,
   missed-event penalties, daily streaks or urgent world-saving role.
7. **Kerala is specific and internally varied.** Terrain, livelihoods and local
   institutions shape behaviour. Region tags do not prescribe personalities.

## 3. One shared world state

The environment, audio and conversations should describe the same state. They
should not independently decide whether a bus, rehearsal or gathering exists.

The dependency flow is:

**Clock + local conditions → needs and schedules → travel and shared places →
situations → perceptible cues → optional player actions → consequences and memory.**

| Record           | Minimum information                                                                                          | Why it exists                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| World clock      | Simulation day, time, season profile, seed                                                                   | Gives every system a common timeline                       |
| Place            | Stable ID, entrances, functions, opening windows, capacity, shelter slots, permitted activities              | Makes a shop, jetty or field useful to residents           |
| Person           | Stable ID, home anchor, occupation, current intent, destination, schedule, relationships, recent experiences | Supports continuity and explainable behaviour              |
| Route            | Connected nodes, mode, travel cost, availability and alternatives                                            | Lets conditions affect actual journeys                     |
| Vehicle/service  | Route, location, capacity, passengers, stops, operating state                                                | Connects transport sounds, queues and arrivals             |
| Local conditions | Rain, wetness, visibility, wind and authored route restrictions                                              | Produces more than a visual weather effect                 |
| Situation        | Preconditions, participants, reserved place/resources, phase, outcome, expiry and traces                     | Coordinates people without scripting the player's route    |
| Memory           | Witnessed event, place, people, time, condition, player contribution and optional note                       | Records experience rather than hidden simulation knowledge |

Use stable authored definitions plus compact changing state. A seed resolves
uncertainty once when needed; coming around a corner must not reroll the day.

**Time policy:** prototype a roughly 48-minute day, with adjustable pacing after
testing. Start at a readable morning period. Schedules use broad windows and
include real travel duration. Rain can interrupt work within those windows.
Long roads are a reason to use transport, not a reason for NPCs to teleport.

Pause and modal panels stop the simulation, as they do today. Hidden tabs and
time outside the game do not silently age the world. Returning resumes the saved
day. Rest may explicitly advance time, resolving intermediate state without
replaying every animation. Do not make players wait a real week for a season.

Retain day/night appearance preferences as a clearly labelled visual override;
the simulation clock still determines people's routines. The ordinary mode
uses lighting consistent with the clock. Developer time controls remain separate.

## 4. Residents with lives

Give the existing named locals the first persistent identities. Leela has a shop
to open, supplies to receive and breaks to take. Radha moves between work,
shelter and social time. Hari rehearses with available partners. Binu has
departures and boat-related work. Their familiar sites remain discoverable when
they are elsewhere; speaking to a person requires that person's presence.

Start with a small state machine: **at home → travelling → working → taking a
break → socialising → returning**, with **sheltering/waiting** as interruptions.

Choose intent from schedule commitment, immediate need, weather exposure,
distance and personal preference. Hold an intent long enough to act on it;
use hysteresis so light rain cannot make someone repeatedly change direction.
Small seeded variation makes days flexible while preserving recognisable habits.

Shared resources create believable situations:

- A veranda has a limited number of shelter slots. Later arrivals use another
  nearby shelter, forming a second group rather than overlapping bodies.
- A worker has to finish stowing material before leaving. A friend may wait,
  take another route or leave a message.
- A conversation requires compatible availability and co-presence. Participants
  turn toward one another, pause their other actions and eventually leave.
- A rehearsal needs its players. An absent participant changes its size or
  start time; the player is not always recruited to replace them.

NPC knowledge is local: a person remembers something they witnessed, were told,
or were directly involved in. A small relationship record changes greetings and
invitations. No universal reputation meter makes all Kerala aware of one favour.

## 5. Kerala's regions as different patterns of life

These are proposed fictional setting profiles, not claims that every settlement
or resident in a real district behaves the same way. Each region contains work,
leisure, homes, ordinary transport and quiet places.

| Existing region  | Proposed daily drivers                                                             | Exploratory consequences                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Backwaters       | Canal crossings, coir work, field work, waterside homes, tea-shop meetings         | Departures move small groups; showers redistribute work; bund paths connect familiar places differently                |
| Malabar Coast    | Landing and selling catch, market setup, evening food trade, coastal travel        | An arrival changes the market; empty crates lead back to the shore; a headland has a different social life at dusk     |
| Central Kerala   | River access, trading streets, commuting and locally scheduled gatherings          | A delivery or service arrival feeds a street; temporary activity changes pedestrian routes around a ground             |
| High Ranges      | Terrain, work rounds, breaks, hill transport, mist and forest edges                | Visibility changes a view; workers reveal usable paths; travel takes the slope into account                            |
| Travancore South | Lagoon services, town opening hours, meal preparation and evening coastal movement | Passengers connect jetty and street; a meal draws neighbours; lights and returning boats change the coast after sunset |

Author variation at settlement and person level. Malayalam vocabulary, address,
register and code-switching should reflect a speaker and context. The existing
transliteration and restrained glossing are the default; fluent local review is
needed before adding new regional lines or cultural schedules. Include the
plurality of contemporary life through specific residents and places, not a
statewide collection of festival attractions.

## 6. Transportation as a social ecosystem

Transport should make somewhere else visible: a destination board, people
waiting, passengers carrying things, a path from the stop into a neighbourhood.

| Mode        | System behaviour                                                                                                  | What the player can notice or do                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pedestrians | Trips between homes, work, shops and stops; queues and crossings                                                  | Follow someone with a destination, recognise a shortcut, wait with neighbours           |
| Buses       | Authored routes, scheduled stop windows, boarding capacity and bounded delays                                     | Read the destination, board for an unfamiliar public stop, watch a neighbourhood arrive |
| Autos       | Wait at stands; take short local passenger trips; respond to nearby demand                                        | See arrivals redistribute people or take a short connection                             |
| Boats       | Separate working boats, passenger services and the player's canoe; use navigable routes and proper landing points | Follow a crew from shore, cross by service, paddle an available side channel            |
| Trains      | Later: a physical corridor and reachable station or viewing point, connected to feeder trips                      | A whistle predicts a passing train or station arrival with observable consequences      |
| Scooter     | Preserve borrowing, parking and manual riding                                                                     | Explore freely between services and walk the smaller paths                              |

Begin with authored route graphs and simple yielding at shared conflict points.
Vehicles slow for pedestrians; vehicles and walkers never require combat or
injury mechanics. A blocked route waits, reroutes or cancels visibly. Reserve
capacity before boarding; no person occupies two vehicles or arrives without
travelling. Use designated off-screen entrances for regional boundary trips.

**Resolve the fast-travel tension explicitly.** Physical services can take the
player to an unvisited public stop: choosing an unfamiliar destination is itself
exploration. Hidden landmarks remain unknown until found. Keep existing free
returns to discovered places as a separate convenience option, without pretending
a full-sized bus drives to every secluded grove. Preserve existing unlocks during
migration; new physical routes do not depend on discovery counts.

Long rides can be shortened by choice. Time advances consistently for the world,
and arrival reflects the state at that later time. A service delay never traps
the player: walking, another service, waiting or the return convenience remains
available. Prototype services without a currency grind.

The existing canoe is constrained to part of the village canal. Broader boat
travel requires an authored water navigation graph and landing rules before
promising lagoon or interregional paddling. A train needs geography and route
work; changing its sound alone would deepen the current false promise.

## 7. Work, commerce and weather create each other's situations

Use a small number of visible resource states, not a statewide economic model.
A shop can have supplies waiting, ready food, customers, used glasses and a
closing routine. Fish can be expected, landed, available or sold. Coir material
can be outside, being worked, covered or stored.

Examples of interacting rules:

- A fishing crew returns in its operating window. Landing creates work, draws
  buyers and birds, and changes available stock. If conditions prevent a trip,
  the crew works ashore and the market has a quieter opening.
- Rain interrupts exposed coir work. Materials move under cover, workers change
  destination, and another shop gains customers. A passing shower does not stop
  every livelihood in exactly the same way.
- A field's authored stage changes the work performed, the people present and
  the appearance of its bunds. Growth progresses across simulated days; rice
  does not complete a season in a single afternoon.
- A tea shop has capacity and opening hours. Customers arrive for reasons beyond
  proximity to the player. Overlapping breaks make an unscheduled conversation
  possible.

Weather should have a lifecycle: approach, rain, easing, residual wetness, drying.
Drying surfaces and resuming work make the aftermath worth seeing. Later,
regional fog, wind and selected water-level states can change visibility,
service operation and a few authored paths. Provide a visible alternative
before closing a route; never strand the player behind a weather gate.

Season profiles adjust probabilities and eligible work, wildlife and community
events. They do not simply recolour the whole map. Use an authored fictional
calendar with locally reviewed cultural entries. Seasons become accessible
through play and optional time advancement, without real-world calendar lockouts.

## 8. Gatherings and temporary events

Build reusable **situation rules**, each with:

1. Preconditions: time window, local conditions, people and resources.
2. Participant and place reservations, including cancellation if these fail.
3. Phases: preparation, activity, dispersal and aftermath.
4. Sounds, visible behaviour and eligible speech for the current phase.
5. Optional player actions and the precise state they change.
6. A resolution without player intervention, an expiry and a repeat cooldown.

For example, a shelter gathering emerges from several residents independently
choosing the same available veranda. A short conversation can then become
eligible. It does not need a proximity trigger that spawns an audience.

Larger festivals use authored local calendars and preparation, with surrounding
life responding systemically: materials arrive, stalls assemble, transport demand
changes, people attend, and the ground is cleared afterward. A practice session,
a public performance and a sacred ritual have different participation rules.
Theyyam and Pooram should not be perpetually active background loops or generic
minigames. Review their specific portrayal and timing with people who know them.

Spontaneous does not mean arbitrary. A sheltered conversation, informal game,
work pause or spectators at a landing needs an ordinary cause. Avoid a global
director spawning exciting events next to a bored player. An event coordinator
may enforce capacity, continuity and repetition limits; it does not fabricate
causes to steer a route.

Situations can end before discovery. Leave relevant evidence: stacked chairs,
covered equipment, a departure board, recent footprints, or a participant who
actually knows where the group went. Some days remain quiet. Do not keep a
festival waiting at its climax until the player arrives.

## 9. Curiosity through perception and landscape

Three distances help a situation reveal itself naturally:

- **Far:** an intermittent rhythm, smoke above a roof, lights through trees,
  people turning into a lane, birds lifting near the shore.
- **Approaching:** a second cue confirms the direction: footsteps, equipment,
  departing passengers, a partial conversation or a change in the path surface.
- **Near:** the cause becomes legible, with room to watch, participate or pass.

Important cues need both audible and visible evidence. Optional directional
captions such as “Oars on water · across the canal” support muted play and
hearing access without revealing an exact destination. Provide readable text,
touch interaction and reduced-motion camera behaviour. Avoid automatic camera
turns and repeated “something nearby” announcements.

Attach consequential audio to actual actors and situations. Bus horns belong
to buses; rehearsal sound follows its participants and stops when practice
stops; boat song follows a crew. Ambient surf and wind can remain broad beds.
Mixing should leave space between cues, and later use simple authored occlusion
zones where buildings or terrain materially affect directional reading.

A cue's lifetime must match approach time. In the village prototype, target
activity windows long enough to approach on foot, or guarantee discoverable
aftermath. Do not solve arrival problems by secretly freezing the source.

The current highway and spurs should gain local loops: a working route, a
slower scenic path and a narrow connection that becomes understandable through
use. Existing landmarks orient the player; paths reveal destinations gradually.
Hidden places should have subtle, consistent evidence, such as a worn turn
between rocks or someone using a bund. Following an NPC is one possible way to
learn a path, never its only opening condition.

Changing locations means changing use and appearance: a quiet jetty becomes a
departure point, a shop becomes shelter, a ground alternates between preparation
and emptiness. Temporary vendors move by a known route and schedule. Avoid
silently moving landmarks or rerolling the map on return.

## 10. Wildlife belongs to habitat

Introduce a few habitat behaviours before adding species: rest, forage, drink,
travel and retreat. Existing birds, dogs and fireflies are enough to begin.

Birds may forage where work leaves food and withdraw from loud activity. A dog
can move between shade, familiar people and a habitual resting place. Fireflies
depend on suitable authored habitat, darkness and weather conditions. These are
design abstractions to review for the selected species, not universal biology.

Give animals safe spaces beyond normal player routes, with cooldowns after
disturbance. Staying still can make observation easier. Chasing wildlife should
not produce better rewards. The hidden elephant meadow retains distant viewing;
do not turn it into a pursuit, feeding or taming activity. Dolphins and other
rare sightings become occasional habitat events rather than a constant leap loop.

## 11. Choice, discovery and memory

The player changes something small enough to understand and persistent enough
to recognise. A contribution affects the people involved, a task's duration,
a local resource or access to a relationship-based invitation.

| Player choice                       | Direct consequence                                               | Possible later recognition                                                    |
| ----------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Help move exposed coir under cover  | Less material remains outside; Radha finishes securing it sooner | Radha remembers this shared episode and can introduce a neighbour             |
| Wait at a tea shop through a shower | The player witnesses whoever genuinely arrives                   | A contextual memory and recognition from someone present                      |
| Follow a departing worker           | Discover a usable path and destination                           | The route becomes personal knowledge; no forced task begins                   |
| Join an available rehearsal         | The live practice briefly includes the player                    | Hari recalls playing together, without awarding the same encounter repeatedly |
| Leave a gathering alone             | The participants finish and disperse normally                    | A return visit reveals aftermath rather than a failure notice                 |

Rewards should widen understanding and possibility: a route learned, a person
recognising you, access to a shared practice, a story explaining an old place,
or a view encountered under unusual conditions. Small keepsakes can carry
provenance; they should not become another mandatory inventory checklist.

Evolve the passport into a place for **places found, people met and moments kept**.
Keep existing stamps and earned badges. Move totals, ranks and activity lists
inside it, and make suggested activities opt-in. The default walking HUD retains
controls when needed, nearby interaction, optional captions and map access.
Retire automatic objective selection and undiscovered floating beacons as the
default only when environmental cues prove sufficient; retain an assistance mode.

Record contextual memories from witnessed facts, with bounded authored text
templates. Example: “Waited at Leela's while the rain passed. Radha arrived with
the covered bundle.” Only write that if both events were observed. A personal
note is optional. Never tell the player they felt moved or claim they witnessed
an off-screen action.

Deduplicate routine repeats by situation and context. Let players pin a few
moments; prune unpinned routine records when necessary. There is no completion
percentage for all possible memories and no reward for repeatedly sitting for
three seconds. A remembered person and a changed place give return visits value
after the original site stamp has been earned.

## 12. Three possible journeys from interacting systems

These illustrate possible outcomes, not required mission sequences.

**A shower changes the lane.** Radha is working outside when rain arrives. She
begins covering fibre; pedestrians seek available shelter. The player sees
movement into Leela's veranda and follows. If the player helps Radha first, she
finishes sooner and may reach the shop before another customer leaves. If the
player walks straight there, a different conversation overlaps. When the rain
eases, residents resume their plans. A return visit shows drying material and
a greeting from someone who shared the shelter.

**A boat gives the shore a reason to gather.** A scheduled working boat returns
with an available landing. Its calls and visible approach draw buyers already
waiting nearby. The player follows the shoreline to understand the activity.
They can watch, help with an offered task or follow a seller toward the market.
If they arrive late, empty baskets and departing workers explain the quieter
shore. Rough conditions could instead leave the crew repairing equipment on land.

**A familiar hillside becomes unfamiliar.** In a later regional phase, mist
obscures the main viewpoint during a work break. A small group takes an authored
lower path to shelter. The player follows the voices, learns the connection and
later sees the valley when visibility improves. If no workers are present,
the worn path remains a discoverable route. The weather does not clear merely
because the player arrived.

## 13. How this fits the repository

Preserve the separation between model, engine, rendering and interface. Add a
small pure simulation layer; do not accumulate decision-making inside
`environment.update()` or React effects.

| Existing area           | Proposed responsibility/change                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `world.js`              | Keep stable site IDs, terrain, collision, roads, travel definitions and pure helpers; introduce place anchors and validated route data          |
| Proposed `life.js`      | Pure clock, resident state transitions, reservations and situation resolution; no Three.js, DOM or audio dependency                             |
| Proposed `life-data.js` | Authored residents, places, schedules and initial situation definitions; expand the data before adding new abstractions                         |
| `engine.js`             | Own one simulation instance; feed elapsed simulation time and player actions, query dynamic interaction targets, publish compact snapshots      |
| `environment.js`        | Reuse meshes and static instancing; interpolate simulated positions and animate the current action; visual loops no longer determine life state |
| `audio.js`              | Keep synthesis and spatial mixing; bind followable sources to entity positions and active situation phases                                      |
| `culture.js`            | Keep authored lines; select from speaker presence, phase, knowledge and recent utterances; emit dialogue from simulated conversations           |
| `Game.jsx`              | Present nearby choices, optional help and contextual memories; remove world decisions from UI timers                                            |
| Save boundary           | Version and validate simulation state separately from the existing journey/passport lists                                                       |
| `portal/App.jsx`        | Merge durable discovery/memory summaries only; never merge competing clocks or NPC states as if they were collectable sets                      |

The movement integration already uses small bounded steps. Keep movement smooth;
do not run pathfinding, daily planning or a full React update every render frame.
Start high-level life decisions around 2 Hz with immediate handling for relevant
state changes, and interpolate movement for rendering. Profile before fixing
these frequencies as requirements.

Simulation distance is not existence:

- Near the player, render full actors, movement, conversation and interaction.
- Further away, update route progress and schedule transitions at lower frequency.
- Distant regions store compact intentions and resolve scheduled transitions when
  time advances. Re-entry reconstructs the same identity and phase.

Do not teleport a followed actor, restart a heard event when it becomes visible,
or cancel an event just because it is off-screen. Use a bounded active population,
pooled render objects and spatial lookup. Do not add a backend, generated dialogue
service, general-purpose economy or statewide traffic solver for this phase.

**Persistence:** keep the current version-2 discoveries, interactions, moments,
scooter and explored cells. Initialise new simulation state once when absent.
Save the seed, clock, persistent cast, active situations, consequential local
state and recent memory IDs. Validate references and positions on load; safely
cancel an obsolete situation while preserving earned progress. Bound the save
size and debounce writes. Resume from a coherent checkpoint after interruption.

The world is single-player. If multiple tabs enter it, only one should own
simulation writes; another can offer to take over. The portal's existing set
union remains suitable for collectables, not for two simultaneous versions of
Radha's whereabouts. Preserve current graceful in-memory play if storage fails.

## 14. The next development phase: “A Day Around Kadal”

**Scope:** one neighbourhood connecting Leela's shop, Radha's yard, the courtyard,
Palmwater Jetty and the existing bridges. Reuse the current world and scenery.
Leave the wider regions available while converting their simulation gradually.

Initial budget:

- Four existing named locals plus up to eight persistent supporting residents.
- Home entrances, work anchors, two viable shelters and connected pedestrian routes.
- One shared clock, daily routine windows, rain interruption and resumption.
- Three situation rules: shelter gathering, securing exposed coir, rehearsal
  with available participants.
- One short physical passenger-boat service with two validated landings within
  existing suitable canal water; support boarding and optional ride skipping.
- Actor-linked rehearsal and boat audio, truthful contextual speech, optional
  directional captions, and context-aware memories.
- A quiet default HUD, introduced behind a reversible setting during evaluation.
- Saved continuity and migration from the existing journey.

**Exclude from this phase:** physical buses/autos/trains across the whole map,
large festivals, season transitions, new districts, expanded lagoons, complex
agriculture, new wildlife species, interiors, currency systems and multiplayer.
They remain part of the direction, not acceptance criteria for the first slice.

Implementation order and gates:

| Step                     | Deliverable                                                                  | Exit condition                                                                          |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1. Continuity            | Pure clock/state layer, migration, actor IDs and debugging view              | Save/reload preserves identity and intent; pause does not advance the day               |
| 2. Ordinary day          | Connected anchors, schedules, movement and shared capacity                   | The cast reaches work, breaks and home without player triggers or visible teleportation |
| 3. Weather consequences  | Shelter selection, exposed-work interruption and resumption                  | Rain yields several coherent outcomes across seeds; ignoring it still resolves the day  |
| 4. Followable life       | Boat service, rehearsal state, source-linked sound and factual conversations | A cue can be followed to its source or legible aftermath; rendering and sound agree     |
| 5. Memory and quiet play | Context records, local recognition and optional assistance                   | Returning to an already stamped place has a meaningful difference; saved badges survive |
| 6. Validation            | Participant sessions, accessibility checks and device profiling              | The criteria below pass before widening the simulation                                  |

Stop after this neighbourhood if the result still feels like timed attractions.
The corrective action is better causality, continuity and readable routes, not
more events.

## 15. How to judge whether it works

Use observation sessions with consent rather than introducing production
analytics. Compare the existing experience with the prototype. Include players
familiar with Kerala, newcomers, muted-audio play and touch controls. Avoid
telling participants which attractions to find. Ask afterward what drew them,
what they think happened and what they remember.

Provisional acceptance criteria:

| Question                                  | Evidence sought                                                                                                                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the world invite exploration?        | In an initial six-person test, at least four voluntarily investigate two world cues in 15 minutes without an objective directing them; inspect individual sessions, not just the count          |
| Can players understand causes?            | Players can explain at least one change such as why people gathered or work stopped, using observed evidence                                                                                    |
| Is there continuity?                      | Followed residents complete journeys, remain recognisable on return, and resume coherently after save/reload                                                                                    |
| Does the world work without intervention? | Seeded unattended runs resolve all three situation rules, including no-help and unavailable-participant cases                                                                                   |
| Are cues trustworthy?                     | Every prototype followable sound has an active source; late arrivals have an authored trace or visible departure, without secretly extending the event                                          |
| Are outcomes varied for a reason?         | Changing rain timing, participant availability or player help changes appropriate outcomes; identical seed and actions reproduce the same state                                                 |
| Is stillness worthwhile?                  | Participants can recall a specific moment involving people, place and circumstance; no requirement to collect or interact caused it                                                             |
| Can people play without stereo audio?     | Visual cues and optional captions allow the same sources to be located in muted and mono checks                                                                                                 |
| Does it respect device limits?            | Measure a baseline and prototype on a named mid-range phone; provisional target is 30 fps with p95 frame time at or below 33 ms in the busiest village scene, plus bounded simulation/save cost |

Technical checks should target failure modes: shelter contention, route closure,
participant cancellation, a followed actor crossing a simulation boundary,
departure while the player approaches, skipping a ride, background/pause,
save interruption, version-2 migration, repeated actions and duplicate memories.
Retain existing movement, boat handling, hidden-site, passport, audio-mute and
distance checks. Update threshold-based travel tests deliberately when physical
services arrive; do not silently discard old convenience-travel guarantees.

No gameplay checks or device benchmarks were run for this design-only change.
The repository's current tests document useful behaviour, but do not establish
that a future shared simulation is correct or affordable.

## 16. Expansion after the village proves itself

1. **Connect neighbourhoods:** physical bus stops, auto feeder trips, working
   shore/market interactions and shared route rules. Add local road loops before
   increasing total map area.
2. **Make regional differences playable:** hill visibility and work breaks,
   lagoon services, town opening patterns, agricultural stages and a small set
   of habitat behaviours. Reuse simulation rules with locally authored data.
3. **Give places longer histories:** season profiles, reviewed community calendars,
   festival preparation and aftermath, recurring acquaintances and a physical
   rail corridor where the geography supports it.

Every expansion must name which existing systems interact and what a player can
notice because of that interaction. If its only benefit is another icon or
another animation, it has not yet earned priority.

The desired memory of the next phase is simple: **“I followed those people out
of the rain, and that is how I found the place.”**
