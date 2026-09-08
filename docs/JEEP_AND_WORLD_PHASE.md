# Roads worth following

The jeep becomes a reason to read the landscape: slow bends, a paddy bund seen
from the road, a market where the road narrows, a shaded village turning and a
rough laterite climb. Build recognizable destinations and connected journeys
before adding large quantities of scenery.

## First playable batch

A fictional unbranded Kerala hill jeep starts beside the village scooter/stand,
at (13, 78). J enters/exits; W/S accelerates, brakes and reverses; A/D steers;
Space brakes. Touch uses the existing stick and a brake toggle. Exit requires a
near-stop and a walkable side of the vehicle. Its parked location is saved.

The model uses fixed 120 Hz movement, speed-dependent bicycle steering,
longitudinal acceleration/drag, braking, lateral slip, reduced wet grip, slope
resistance, spring-damped body height and terrain pitch/roll. A nine-point vehicle
footprint rejects buildings, water and excessive slopes. Nearby residents and
shared vehicles cause it to stop. This is a grounded driving prototype: airborne
motion, tyre contact forces, differentials, damage and rollovers are not simulated.
Decorative trees/rocks do not all have collision bodies yet.

The chase camera follows smoothly and permits looking around. The laterite loop
branches from the far-bank path at (58, 65), runs east through (130, 65), and loops
around low hills, bends and shade. The jeep is available without progression locks.

Football players now chase receivers and move into support around the ball, with
walking/running animation. It remains a passing warm-up; tackles, goalkeeping,
shots, scores and complete matches are later work. Rain and evening departures
still take precedence.

## Next iterations after handling feedback

1. Driving feel: tune steering, braking, grip, suspension and camera on desktop
   and phone. Add proper four-wheel contact, improved wheel travel, recovery from
   awkward ground and roadside collision coverage before jumps or steep trails.
2. Football: ball possession, dribbling, opponent pressure, shots and goalkeeper
   responses; prove one believable match rather than labelling a warm-up a match.
3. Paddy village route: irrigation channels, walkable bunds, varied homes, shaded
   yards, agricultural work and a small shop cluster. Keep roads legible from the
   driver's seat and preserve safe pedestrian approaches.
4. Local childhood: a ball game in a safe courtyard and a small playground,
   supported by home/play/shelter routines. Place play areas away from through
   traffic and connect them with visible paths.
5. Market town route: delivery vehicles, shops opening/closing, market stock,
   pedestrians and parking. Distinguish a coastal market, inland junction and
   dense city street through architecture, vegetation, street width and activity.
6. Broader Kerala: connect those proven neighbourhoods into regional journeys.
   Review local architecture and food before claiming district-specific accuracy.

Maintain restrained scenery density, shared materials, distant simplification
and texture budgets. Every expansion needs a reason to stop, an alternate route
and a different atmosphere on returning after rain or at another time of day.

## Manual feedback requested

First judge the jeep: steering too loose/tight, stopping distance, camera comfort,
wet-ground behaviour and whether the loop makes you want to take another turn.
Then check football movement. Remaining full-world checks stay in KADAL_PLAYTEST.md.
