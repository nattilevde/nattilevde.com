# Changing roadside scenes

Two small scenes are driven by existing simulation state rather than spawning new crowds:

- Harbour table: at least two nearby harbour workers, dry weather and an appropriate time window. Even-numbered elapsed days show net work from 07:00–11:00; odd days show rope preparation from 12:00–17:00. Packed ropes remain outside work hours.
- Produce display: actual stock controls visible bundles, requiring the vendor to be at the stall during market hours and dry weather. Existing buyer purchases and delivery restocking change the display.

Nearby exploration cues and saved observation memories use the same conditions as the visuals. Reopening preserves the world clock; there is no real-time daily reward or forced task. These are modest variants of existing work, not a new festival or crowd simulation. Actors retain their existing work animations and routes.

Automated checks cover worker presence, time/day variation, rain, inventory, seller absence and memory deduplication/reload. Visual placement and phone behaviour remain on KADAL_PLAYTEST.md. No deployment.
