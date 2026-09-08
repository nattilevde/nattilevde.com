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
