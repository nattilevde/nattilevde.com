# Community life batch

Adds three fictional exterior faith-space lanes across the existing geography,
with nine local visitors, and a Malabar ground with fourteen scheduled players.
Visitors walk to/from nearby neighbourhood positions, take shelter in rain and
leave at the end of their visiting window. These are small local pedestrian
routines; they do not yet connect to the inter-town transport network.

The ground hosts a seven-per-side passing warm-up, not a scored football match.
Both teams must arrive and rain/wetness must permit play. A local ball sound and
nearby caption invite discovery; witnessing it can create a passport memory.
Clock, weather and saved positions drive the activity independently of the player.

The mosque, temple and church use distinct simplified exterior details. Visiting
hours are fictional social windows, not religious calendars. Interiors, rituals,
prayer recordings and festival scheduling are not implemented. Architecture and
local portrayal remain subject to the user's manual/local review.

Community models and bounded saved progress live in community.js; locations and
routines in community-data.js; rendering in community-view.js. Rendering uses the
existing shared geometry/material disposal and static batching infrastructure.
Tree clearance keeps the new lanes and playing area open. Building bodies block
walking; exterior routes are tested against existing collision geometry.

Manual checks are appended to KADAL_PLAYTEST.md. No deployment was performed.

## Sevens game follow-up

Replaces the passing warm-up with a small autonomous football simulation:
possessors dribble, teammates move forward into space, nearby opponents press,
players pass or shoot, and two goalkeepers track and intercept the ball. Swept
ball checks prevent fast shots skipping defenders. Goals update a physical score
board; reset time lets players spread out again. Ball/possession/score are saved.
Rain and the existing arrival/departure schedule continue to gate play.

This is an ambient neighbourhood game, not a playable football mode: no fouls,
offside, halves, complex keeper dives or user-controlled players. Model checks
include an unattended sequence that must produce passes, shots and saves.
