# Kadal manual playtest

Run `npm run dev`, then open the local address printed in the terminal with
`/#world` appended. Test the local build; these changes have not been deployed.

## First: five minutes without a checklist

Leave exploration assistance off. Wander wherever something draws your attention.
Afterward, note what made you change direction and anything that felt empty,
confusing or repetitive. This is the most useful feedback.

## Then: focused checks

| Check                 | What to try                                               | Expected behaviour                                                                              |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Rain and residents    | Watch the shop or coir yard through a shower              | People seek separate shelter spaces; Radha covers fibre when working; routines resume afterward |
| Practice              | Follow courtyard percussion, then revisit during rain     | Sound matches people actually practising and stops when practice stops                          |
| Passenger boat        | Board at Palmwater, shorten the ride, then step ashore    | Arrive safely on the far bank; controls work afterward; a crossing memory appears               |
| Continuity            | Return to the portal, re-enter, and inspect your passport | Memories and old progress remain; the village resumes rather than starting a new day            |
| Phone and muted audio | Try movement, interaction, menus and directional captions | Controls remain reachable, text does not overlap, and captions help locate activity             |

For a fresh first impression without changing your existing save, use a private
browser window. Its progress is temporary. Light appearance settings do not
advance the village clock.

## Send feedback

Copy only the rows you tested:

```text
Device/browser:
What drew me somewhere:
Rain/residents: PASS / issue
Practice: PASS / issue
Boat: PASS / issue
Save/re-entry: PASS / issue
Phone/muted audio: PASS / issue
Biggest improvement needed:
```

For an issue, include the place, action and what happened instead. A screenshot
helps with visual problems. Automated regression coverage is already in place;
prioritise how the world feels and any visible failures.

## Batch 2: local bus and Kerala scenery (pending combined manual test)

- At Kadal Village Stand, board the red local bus to Periyar Bridge Stand.
  Let it travel, or shorten the journey, then leave safely. Check the return trip.
- Watch commuters arrive and depart; the bus should run without you, slow in
  rain, yield to someone ahead, and rest between 20:00 and 06:00 on the world clock.
- Exit to the portal during a ride and return: the journey should resume.
  Completing a ride and leaving should add a memory; boarding alone should not.
- Walk around the village gardens and canal: look for banana plants, flowering
  shrubs, bank reeds and varied ground greens. Check that paths stay readable.
- Check the bus, scenery and controls on your phone for clipping or sluggishness.

Feedback: Bus / commuters / save / scenery / phone: PASS or issue.
This batch adds one physical route; autos and the fishing-to-market chain remain next.

## Batch 3: village auto (pending combined manual test)

- Find the black-and-yellow auto just south of Kadal bus shelter. Take it to
  Far-bank Auto Stand, shorten the journey if preferred, and leave beside it.
  Walk to the ferry landing nearby; try the auto back to the bus stand later.
- Watch without boarding: the driver waits, then repositions in response to
  bus arrivals at Kadal or ferry arrivals on the far bank. No arrivals means no
  automatic circuit. Service runs 06:00–21:00 on the world clock.
- Watch it slow in rain and wait for pedestrians or the bus ahead; check turns
  and the bridge for clipping. It cannot overtake a persistent obstruction.
- Return to the portal mid-ride, resume, and finish. Check the arrival memory and
  that walking, scooter and other transport controls work after leaving.
- On a phone, try boarding, shortening, leaving and returning to the portal;
  listen for the auto engine or follow its directional caption with sound muted.

Feedback: Auto / connections / save / road behaviour / phone: PASS or issue.
This batch is one driver and one route; NPC transfers and fares are not simulated.

## Batch 4: fishing to market (pending combined manual test)

- Visit the beach approach west of the village in the morning. Watch Sasi's
  vallam leave, fish, return and unload. Heavy showers may shorten a trip or
  produce no catch; departures stop after 11:00 on the world clock.
- Help unload once, then follow the baskets along the beach road to the small
  fish stall just south of Leela's shop. The same catch should appear there.
- Watch a buyer approach. Trading pauses in heavy rain and closes at 18:00;
  displayed fish disappear as they sell or spoil. An empty stall stays quiet.
- Witness unloading and then visit the stocked stall: check your passport for
  the connected memory. Arriving only at the stall should not invent a shore visit.
- Leave and return during fishing or delivery. Check that the boat, catch and
  buyer resume; watch the courier at crossings with the bus and auto.
- Check the stall, carried baskets, rain and nearby actions on a phone.

Feedback: Fishing / delivery / stall / help / memories / save / phone: PASS or issue.

## Ride smoothness fix (pending manual confirmation)

- Ride the bus, auto and passenger boat normally, without shortening: scenery
  should glide between simulation steps and passengers should stay with the vehicle.
- Try auto corners, a bus bridge crossing and the manual canoe; watch for sudden
  camera shaking. Drag to look around while moving, then stop and start again.
- Pause/resume, reload mid-ride and shorten a journey: there should be no long
  camera sweep across the skipped route, and leaving should still land safely.
- Compare desktop and phone. Report vehicle, location and whether the vehicle,
  camera or both still jerk; smoothness on real hardware remains to be confirmed.

## Batch 5: Kerala photo stories (pending combined manual test)

- Find the framed photographs at the fishing shore, beside Radha's yard and
  near Leela's veranda. Walking past must not open a panel automatically.
- Inspect a photograph. The world should pause; closing resumes the same moment.
  Read the short story, switch English/Malayalam, and check sources and credits.
- Keep a photo story, open the passport and reopen it there. Return to the portal
  and re-enter: the story should remain saved without a duplicate memory.
- At the tea-shop story, try the original film-club scene prompts. They should
  read as fiction, separate from the real photograph and its facts.
- Check the photo frame and reader on a phone. Reading should remain possible
  when an image fails, and large images should load only when inspected.
- Give feedback on Malayalam wording, local authenticity, and whether a photo
  makes you look more closely at the surrounding world.

## Tea-shop life — deferred combined manual pass

- [ ] Visit Leela's veranda around midday: customers arrive by existing paths;
      watch a long tea pour and check cups/arms/stream look connected.
- [ ] Return after 14:00: the tray changes from pazham pori to parippuvada.
      Portions decrease with service; an empty tray still permits tea service.
- [ ] Find the TV during 11:30–13:30 or 16:00–18:30: original animated football
      or a rainy-road film-club short plays in the world. Outside these hours it
      switches off. No reading panel opens automatically.
- [ ] Watch Jaya/Rajan during their breaks: face the TV, then resume their routes.
      Rain shelter and ferry commitments still take precedence.
- [ ] Listen from either side of the shop; check quiet TV/pouring sounds, muted
      play and nearby captions. Reload during a visit: no duplicate snack sale.
- [ ] On a phone, inspect the tray/TV and revisit photo stories; confirm smooth
      walking and bus/auto/boat rides remain intact.

## Faith lanes and Malabar sevens — deferred combined manual pass

- [ ] Visit the mosque lane northwest of the Malabar market (x -18, z -1050),
      temple lane north of Pooram Ground (90, -785), and church lane south of the
      old street (-24, 582). Check exterior appearance, terrain contact and paths.
- [ ] Morning neighbours arrive at different times: temple 06:00–08:30,
      mosque 07:00–09:00, church 08:00–10:00. These are fictional exterior visiting
      hours, not prayer/service schedules. Check arrivals, shade and departures.
- [ ] Find the Malabar ground east of the market (55, -1040), around 16:00–18:00.
      Fourteen players arrive, then pass a ball in a sevens warm-up. Check sound,
      smooth ball movement, team colours and the optional witnessed memory.
- [ ] Rain interrupts the warm-up and sends players under the ground shelter.
      Play waits for the ground to dry; evening departures still happen.
- [ ] Reload during a gathering; check continuity. On phone, check performance,
      muted captions and existing transport smoothness. Review local architectural
      details before treating these fictional exteriors as authentic recreations.

## Thumba, Chemmeen and Silent Valley — deferred manual pass

- [ ] Find the coastal science board near the southern lighthouse (-58, 620),
      film-club board near Kadal shore (-67, 23), and forest reading board (456, -477).
      Check visibility and approach from both sides; no panel opens automatically.
- [ ] Read each in English and Malayalam; check source links, save to passport,
      reload and reopen. Malayalam needs local wording review.
- [ ] These three are text reading boards. Confirm they never show a broken image
      or imply an archival photo, film still or exact geographical recreation.
- [ ] Revisit an existing photo story: photo, credits, language and saved memory
      still work. Check phone readability and resuming movement after closing.

## Jeep, laterite loop and moving football players

- [ ] Find the jeep beside the village stand/scooter (13, 78). Enter with J or
      the button; W/S drive/brake/reverse, A/D steer, Space brakes. Stop to exit.
- [ ] Try the touch stick and BRAKE toggle. Check that other ride/interaction
      buttons do not conflict while driving and pausing stops movement/sound.
- [ ] Cross the village bridge, take the far-bank lane toward (58, 65), then head
      east to the laterite loop. Compare bends, hills, coasting and wet grip.
- [ ] Check chase-camera comfort, collision stopping near walls/water/people,
      safe exit and parked position after reload. Report any tree/rock clipping.
- [ ] Visit sevens around 16:00–18:00: players chase passes and move into support;
      rain shelter and evening departures still work. This is still a warm-up.
- [ ] Compare existing scooter, bus, auto and boat rides for regressions.

## Paddy Lane destination — deferred combined manual pass

- [ ] Follow the laterite loop east; take the branch near (220, 111) to Paddy
      Lane (285, 110). Check the jeep approach and pedestrian paths to homes.
- [ ] Walk the bunds beside six paddy plots; check crop rows, channels, terrain
      contact, shaded verandas and the produce stall.
- [ ] Visit between 07:00–17:00 for farm work, 08:00–18:00 for the stall and
      around 16:00–18:00 for children in the courtyard. Look for actual movement.
- [ ] Check the jeep cannot enter the railed play courtyard. Rain should send
      people home; market produce decreases after resident visits and survives reload.
- [ ] Check phone performance, ball movement, garden/home appearance and existing
      jeep handling. The fields are stylised; farming seasons and player shopping
      transactions remain future work.

## Rain pacing adjustment

- [ ] Dry periods now last 8–14 active-play minutes; showers last 25–45 seconds,
      plus the existing fade. Existing saves finish their current weather timer.
- [ ] Reload midway through a long dry period; the interval should not shorten.
      Pause menus should not advance it. Verify wet driving and shelter routines.

## Jeep lights and stronger acceleration

- [ ] Drive at night and in rain: twin headlights should light the road ahead
      through bends and slopes, with dim red tail lights visible from behind.
- [ ] Brake using Space, the touch brake toggle or opposite throttle while
      moving: rear lamps should brighten, then dim again when released.
- [ ] Compare acceleration, high-speed steering and stopping distance on the
      laterite loop and highway. Speed is capped at 108 km/h; wet grip still matters.
- [ ] Check headlights switch off after exiting and performance remains acceptable
      on a phone. Check road visibility rather than only the glowing lamp lenses.

## Visual polish, market junction and sevens game

- [ ] Revisit Paddy Lane in morning/evening: warmer sunlight, field-edge plants,
      garden walls and clotheslines should add detail without hiding the paths.
- [ ] Continue east to the bakery and cycle-repair shop (343/363, 94). Staff arrive
      during opening hours; shutters close when staff leave or shelter from rain.
- [ ] Use the marked parking area south of the shops. Around 09:00 a delivery van
      approaches, unloads beside the produce stall and returns. Check it waits if
      the jeep blocks its lane; stock is replenished once for that day's run.
- [ ] Watch sevens: possession/dribbling, passes under pressure, shots, goalkeeper
      interceptions, goals and reset periods. Compare the physical score board.
- [ ] Reload mid-game or delivery; progress should persist. Recheck rain pauses,
      evening departures, village pedestrians, jeep headlights and phone performance.

## Quick jeep access

- [ ] Use the car icon / “Find my jeep” in the top toolbar after parking elsewhere.
      “Return to jeep” should place you beside it and immediately allow entry.
- [ ] “Show direction” displays a camera-relative arrow and distance. Rotate the
      view, walk closer and cancel guidance. This is a bearing, not a routed path.
- [ ] Reload after parking: the shortcut should use the saved location. Returning
      should be unavailable while seated or using another vehicle. Check on phone.

## Harbour quarter and inland drive

- [ ] Drive north from Kadal on the main road. The harbour quarter begins near
      (0, -190) and continues to (-355 on the z-axis). Explore cross-streets,
      harbour-front/back-lane loop, shopfronts, two-storey buildings and parking.
- [ ] Walk the waterfront near (-66, -287): moored boats and working residents
      should be visible after morning arrivals. Rain sends workers home by streets.
- [ ] At (0, -190), turn east to (150, -190), then follow the inland road south
      past homes to the laterite loop and Paddy Lane. Try the return journey too.
- [ ] Check new discoveries appear on the map, roadside scenery avoids the road,
      jeep lights/steering remain usable and parked-jeep return still works.
- [ ] Check phone performance and distant building appearance. Report blocked
      turns, clipping, empty-looking streets or repetitive scenery for refinement.

## Highland drive

- [ ] Drive east beyond Paddy Lane (381, 110). Follow the climb to the ridge and continue north to the older hill road; return to the coast through the foothills.
- [ ] Take the red-earth branch at (448, 140). Check narrow turns, uphill grip, downhill braking and its rejoin at (555, 85), in dry weather and rain.
- [ ] At (705, 90), take the ridge spur. Park, exit, find the viewpoint and sit at the bench. Reload and check parked-jeep access and discoveries.
- [ ] Check roads do not disappear into terrain, foliage avoids the bends, and headlights illuminate the road at night. Edge posts are visual markers only.
- [ ] Check camera comfort and phone performance through the woodland and ridge. Report sharp turns, visual clipping or repetitive scenery.

## First journey pilot

- [ ] Fresh profile: Start with the jeep, controls hint, walking alternative and phone layout.
- [ ] Returning save keeps location/time; drive harbour → Paddy Lane → ridge using roadside signs.
- [ ] Discover Paddy Lane Market and sit at the shaded fieldside bench.
- [ ] Pause → Local playtest summary: active/driving time, first jeep use and discoveries; check pause/tab hiding and clear without losing game progress.
- Full details: [First journey pilot](FIRST_JOURNEY_PILOT.md).

## Photo postcards

- [ ] Open the camera button or press C while walking, parked or riding. The world should pause; the postcard must contain the scene without HUD, notices or controls.
- [ ] Download the PNG; confirm the location/region name and nattilevde.com footer are readable. Try landscape and portrait screens, daylight, night and rain.
- [ ] Return to world or press Escape; movement, sound and rides resume. Photo time should not increase local active-play time.
- [ ] On supported phones, Share postcard opens the device share sheet only when tapped. Cancel it, try again, and check download fallback where file sharing is unavailable.
- [ ] Keyboard Tab stays in photo controls. Repeated captures do not retain old images. Frame the view in normal play before opening the camera.

## First-run graphics preparation

- [ ] Clear site data in a test profile, reopen and immediately start with the jeep when ready. Compare the first 30 seconds with a later ride, using the same device and route.
- [ ] Check loading finishes without showing temporary camera views; returning saves and photo mode still work.
- [ ] If the first ride still stutters, note device/browser, sound on/off and approximate duration. Graphics warm-up addresses a likely source, not a confirmed device-level diagnosis.

## Changing roadside scenes

- [ ] Harbour near (-72, -279): after workers arrive, net work appears in the morning on alternating in-game days; rope preparation appears in the afternoon on the other days. Outside those hours the work table stays packed.
- [ ] Paddy stall near (313, 101): bundles reflect stock, purchases and delivery restocking. Display stops when the seller leaves or rain sends people to shelter.
- [ ] Stand nearby briefly: a memory should appear once per scene variant/day. Reload and confirm it remains; no repeated pop-up objectives.
- [ ] Check tables, workers and produce do not overlap roads or existing stalls on phone and desktop. Existing NPC movement remains unchanged.
- [ ] Changes use saved in-game time, not real-world dates; immediately reopening the game should preserve the scene rather than reroll it.

## Sevens after dark

- Visit the Malabar ground near (55, -1040) after 19:00: both teams still pass and shoot.
- Check the pitch is readable under two floodlights; daylight and jeep performance remain smooth.
- Watch a rain interruption and return to play when dry.
- After 21:30 players leave; lights fade out by 22:00.
- Check pitch-side benches, approach and rain shelter remain accessible.
- Save/reload during the evening and confirm the match continues.

## Firefly evening discoveries

- After 18:30, visit the inland groves near (92, -70), (77, -118) or (470, -500).
- Look for independently glowing, gently drifting lights; check visibility against vegetation.
- Approach within 12 metres: a grove memory should appear once and survive reload.
- Open photo mode and download a postcard with the lights in frame.
- Check daylight hides them, rain dims them, and late night fades them away.
- Check riding nearby remains smooth. Visual brightness and real-device performance need manual review.

## Chenda listen-and-repeat

- Meet Hari during dry courtyard rehearsal (07:00–09:30 or 16:00–18:30).
- Listen: four or five numbered beats should match the drum sounds.
- Repeat the spacing using Tap drum, touch, or keyboard focus + Enter/Space.
- A matched phrase saves the encounter and advances to another original exercise.
- Rapid clicking should invite another attempt; retries and replay remain available.
- Test muted play using the visual beats.
- Close mid-demonstration or switch browser tabs: no leftover demonstration beats.
- Leave the encounter freely; verify ordinary exploration controls resume.

## Lagoon boat-training groundwork

- Visit Ashtamudi Reach (138, 442) around 08:00 or 16:30 in dry weather.
- Look southeast for a small six-person crew following a loop.
- Paddles and bodies should move together, with gentle speed variation and smooth turns.
- Observe nearby to receive the lagoon training memory; check save/reload.
- Rain or practice closing should send the crew around to their starting position,
  then stop paddling. No teleport or disappearing hull.
- Check the hull stays afloat, clears the houseboat, and is visible in photo mode.
- The crew currently rests aboard between sessions; boarding, shore routines,
  authentic song and a full snake-boat race are future work.

## Onam preparation: pookalam

- Walk north from the starting point toward the tea shop: flowers are beside the lane at (-7, 47).
- Check the carpet sits above the ground and its colours read clearly.
- During dry daylight, choose “Add a few flowers”: an outer ring and memory should appear once.
- Save/reload: your added flowers and memory remain.
- Compare early and later world days: one ring per day, up to ten, without requiring visits.
- Existing saves past day ten show the finished carpet immediately.
- Verify no flower action while riding, during rain or at night.
- This first episode remains displayed after day ten; NPC flower-laying, sadya,
  a repeating festival calendar and processions are not implemented yet.

## Pookalam neighbours

- Near (-7, 47), watch Meera and Ravi arrive after 07:00 during the first ten world days.
- They should walk around the flower carpet and lean/reach beside the flower trays.
- At 16:30, check their short afternoon visit and gestures.
- Rain sends them back toward home; dry weather within visiting hours brings them back.
- After 17:30, watch them leave rather than disappear.
- Save/reload while they are walking; verify continuous movement.
- Add your own flowers while they are present: their routines must continue.
- Review animation, spacing and roof cover at their home approaches manually.

## Contextual flower-neighbour conversations

- Approach Meera or Ravi within four metres while they are at the carpet.
- Before helping, hear about their work; after adding flowers, hear acknowledgement.
- Reload and confirm the acknowledgement remains.
- Rain should switch the conversation to getting under cover.
- While walking, they should avoid talking as though already at the carpet.
- Walk away: no remote dialogue. Stay nearby: verify the existing dialogue cooldown
  prevents repeated chatter. These are text lines, not recorded voices.

## Post-rain ground polish

- After a shower, watch the rain stop while roads and field edges remain darker.
- Check small puddles on Kadal lane, the far-bank path and Paddy Lane/market parking.
- Surfaces should gradually dry over roughly two minutes after heavy rain; reload
  partway through drying and check they retain their damp appearance.
- Check paddy water catches light more strongly while wet.
- Drive through patches: grip, steering and road access should remain unchanged.
- Check low graphics and night + headlights for readability and smoothness.
- Inspect puddles for terrain clipping or flicker, especially Paddy Lane field bunds.
- Real-device visual/performance checks remain manual; puddles use surface highlights,
  not mirrored scene reflections.

## Combined pass — September 2026 additions

Automated behaviour coverage: 21 combined tests passed (boat training, drum timing,
community/football, fireflies, Onam, roadside events and wet ground).

Use the existing save; do not clear progress just to test. Visit when the world clock
matches the activity. A night lighting override alone may not advance NPC schedules.

### Short manual route

1. **Kadal lane → courtyard, morning:** flowers at (-7, 47), neighbour movement and
   dialogue, then Hari at (-19, -23). Listen and repeat one phrase, retry once,
   and close mid-demo to check no sound keeps playing.
2. **Jeep → Paddy Lane:** check driving smoothness and market activity. If a shower
   happens, inspect road/parking puddles and field bunds after it stops. Reload once
   while damp; the ground should retain moisture and subsequently dry.
3. **Ashtamudi Reach, dry 07:00–09:00 or 16:00–18:00:** observe the training crew
   from (138, 442), checking water alignment, paddles and turns.
4. **Evening inland grove → Malabar ground:** fireflies near (92, -70) after 18:30;
   take a postcard, then sevens near (55, -1040) around 19:00–21:00.
   Check that the ball, players and road remain readable at night.

Do these across normal play sessions rather than waiting for every time/weather
condition in one sitting. Day-ten flower progression and every individual schedule
remain covered by the saved detailed checklist and automated tests.

Report only: location/activity, what looked or felt wrong, device/browser, approximate
world time and whether it was raining. A short clip or screenshot is useful if available.
Visual appearance, real-device frame pacing, audible timing and mobile touch remain
manual checks; automated timing tests do not establish that they feel good to play.

Production verification: build passed; metadata, structured data, sitemap and links
passed for 45 pages; all 3 browser smoke tests passed (1280px, 390px and static pages
without JavaScript). The existing large game-bundle warning remains (~754 kB minified).
These browser tests cover startup, entering the jeep and postcard access, not a full
visual inspection of every new destination.

## Sevens supporters

- Visit the Malabar ground near (55, -1040) after 17:00 or under floodlights at 19:00.
- Six supporters should approach at staggered times and stand outside the west touchline.
- Their gaze should follow the ball; a goal produces a brief celebration from that
  team's supporters and a subdued response from the other side.
- Check no repeated celebration without a new goal.
- Rain sends them along the approach to the new shelter south of the ground;
  dry weather during match hours brings them back.
- After approximately 21:30, they leave toward their home approaches.
- Reload mid-walk or reaction; verify smoothness and no fresh goal celebration.
- Check shelter posts, pitch spacing, nighttime visibility and frame pacing manually.

## Warm nighttime gathering places

- At dusk/night, inspect the tea-shop frontage (-10, 32), harbour shelter (10, -177),
  Paddy Lane bakery (343, 98), cycle shop (363, 98) and parking (332, 130).
- Lamps should glow warmly and illuminate nearby ground and people.
- Approach and leave by jeep: local lighting should fade without sudden changes
  between nearby shops; check road readability with headlights.
- Compare daylight: lights should no longer illuminate the scene.
- Check night + rain: highlights should remain readable rather than washed out.
- Test low graphics and mobile smoothness. Only two nearby shadow-free point lights
  are used; distant fixtures remain visible without lighting the whole map.
- Frontage lamps are exterior courtesy lights, not indicators that a shop is open.

## Forest Churam and first wildlife pass

- From Paddy Lane, drive uphill to Estate Bend (488, 48), then take the signed
  Forest Churam branch north through successive bends to the older hill road (450, -200).
- Check the switchbacks in both directions: steering room, slope, road edges,
  trees and reflector positions, especially at night and in rain.
- Stop near (486, -109), looking east toward the forest deer around (513, -94).
- Watch quietly, approach on foot, then approach with a moving jeep: compare
  grazing/walking, raised-head alertness and retreat. Do not expect combat.
- Back away and wait: they should settle and gradually wander back.
- Reload near them; verify position continuity and terrain alignment.
- Check the forest's appearance and frame pacing on your device. This is a fictional
  ghat route, not a geographical recreation of Thamarassery, Gavi or another real pass.
- Deer use simple stylised bodies. Species-specific anatomy, canopy animals, wildlife
  sounds, avoidance of all decorative vegetation and vehicle/animal collision need future work.

## Forest atmosphere and canopy pass

- Forest Churam: stop the jeep and listen near (463, -42) and (515, -104).
  Quiet directional calls should vary by position; they pause in rain/night and
  when the player is driving quickly. Synthetic sounds are not species recordings.
- Look up at the branch trees at (506, -119) and (528, -62): squirrels move along
  branches and tuck toward cover when approached, in rain or outside daytime hours.
- Check branch alignment, leaf occlusion, gradual movement and visibility from below.
- Inspect deer eyes, ears, pale underside and alert tail movement.
- Verify mute, pause/resume, night and photo mode; check no sound persists after exit.

## Forest navigation and stopping-place polish

- Approach deer near the grove and watch them steer around trunks instead of walking through them.
- Check all three deer start clear of trees, and keep space from one another.
- Reload an older forest save: a position inside a new tree clearance may reset to its home spot.
- Park at (486, -109); check the new bench and sign leave room to enter, exit and turn.
- Drive the switchbacks both ways, checking edge markers and vegetation.
- Review real-device smoothness; browser smoke checks are not a frame-rate benchmark.
- Avoidance currently covers the dedicated forest/canopy trees and existing world solids,
  not every decorative shrub or randomly scattered tree elsewhere in the world.

## First road car and shared handling foundation

- Find the Coastal Saloon at (20, 78), beside the starting jeep.
- Approach each vehicle: the J/action prompt should name the nearest vehicle.
- Drive, brake fully and exit the car; then drive the jeep. Neither parked vehicle
  should move with the other, and they should block driving through each other.
- Compare steering and acceleration: the saloon has gentler steering, a lower initial
  pull, a higher speed cap and a stricter slope limit.
- Check car headlights in night/rain and brake lights while braking.
- Park both elsewhere and reload: both positions persist; entry starts on foot.
- Use Find jeep: it must still target the jeep, even after driving the car.
- Check camera, wheels, player/body clipping, shadows and low-graphics performance.
- First-car body and sound are stylised placeholders, not a BMW/Benz replica or
  an accurate model-specific engine recording. Detailed interiors remain future work.

## Trail motorcycle

- Find it at (27, 78), beside the saloon and jeep; press J or use the named action.
- Check acceleration, low-speed steering, cornering lean, braking and safe exit.
- Verify helmet/rider posture, wheel alignment, headlight and brake light.
- Park all three vehicles separately and reload; check their positions and the nearest-vehicle prompt.
- Find jeep must still target the original jeep.
- Try the estate track and gentle forest bends before faster riding.
- Check touch controls and frame pacing. This first bike uses assisted balance and
  shared vehicle physics; it is not a model-accurate Himalayan/XPulse simulation.
