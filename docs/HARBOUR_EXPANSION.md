# Harbour quarter and inland connection

Adds 23 buildings across a fictional coastal town and its inland approach: mixed
one/two-storey buildings, tiled homes, shop signs, planted frontages, waterfront
boat-work props, four moored boats, a roadside shelter and town parking. Five road
segments form cross-streets, a harbour/back-lane loop and a connection toward the
laterite/Paddy Lane route. These roads also appear in the existing map.

Ten saved local residents walk defined street routes between home approaches and
harbour/shopping positions. Work windows and rain determine travel; residents
finish their current street segment before turning back. Jeep collision checks
include these residents. Three optional discoveries mark the harbour, market
street and inland turning.

Start north of Kadal at (0, -190). The town extends to z -355. The inland branch
heads east to x 150, then south to the existing laterite loop. The overall world
bounds remain unchanged: this batch fills previously sparse space with connected
places. There is no new scheduled bus route, functioning harbour economy, shop
interior or inter-town commuter simulation yet. The roadside shelter does not
claim a new boardable bus service.

Geometry/material sharing and instancing reuse the existing rendering pipeline.
New roads and pedestrian segments are checked against collision geometry; phone
performance, architectural variety and route appeal remain manual checklist items.
