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
