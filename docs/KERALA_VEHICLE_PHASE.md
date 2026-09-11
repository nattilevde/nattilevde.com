# Kerala vehicle culture — planned after forest work

Goal: vehicles should change how a road feels and where the player wants to go.
Keep the current jeep accessible and saved progress compatible.

## Requested catalogue

- Cars: BMW and Mercedes-Benz, classic cars and Kerala-style modified street cars.
- 4×4s: Mahindra Thar and recognisable jeep models.
- Bikes: Royal Enfield Bullet and Himalayan, KTM, Hero XPulse, older motorcycles.
- Cycles: everyday roadsters and a lighter touring option.

Exact model years and suitable assets are still to be selected. Do not present a
generic shape as an accurate replica. Use original or appropriately licensed meshes,
textures and sounds, with credits and no suggestion of manufacturer endorsement.

## Implementation sequence

1. Establish a shared vehicle definition and ownership/parking system, preserving
   current jeep controls and the quick-find function. No required purchase grind.
2. Add one distinct vehicle per handling class: road car, off-road 4×4, motorcycle,
   bicycle. Complete entering, exiting, braking, camera and save behaviour first.
3. Expand into the requested catalogue after silhouette, interiors, scale, wheels,
   lights, animation and performance are satisfactory.
4. Add visual customisation: paint, wheels, roof racks, auxiliary lights and suitable
   body accessories. Keep driving visibility and terrain clearance meaningful.
5. Build a small garage/meet-up destination with parked vehicles, owners and changing
   attendance. A social discovery place, not a menu full of mandatory unlocks.

## Handling differences

- Road cars: stable cruising, longer braking distance and limited rough-ground clearance.
- 4×4: suspension travel, torque delivery and traction on climbs; do not merely add speed.
- Bullet/classic bikes: weight and relaxed response; Himalayan/XPulse: rough-road control;
  KTM-inspired class: quicker response. Tune from references before claiming accuracy.
- Cycles: momentum, coasting, hill effort and a quieter way to notice wildlife.

## References to collect later

User's preferred model/year or reference photos for the first car and bike; examples
of Kerala modifications; asset budget if buying models. These do not block forest work.
Branded replicas, detailed interiors and recorded engine sounds are not implemented yet.

## First implementation delivered

- Shared handling profiles for the existing jeep and an original Coastal Saloon.
- Separate saved parking positions, nearest-vehicle entry, shared driving/braking
  and camera controls; Find jeep remains specifically attached to the jeep.
- Saloon body, wheels, headlights and brake lights; separate acceleration,
  steering, speed cap and slope limit.
- The existing sound foundation is reused; model-specific audio, interiors,
  ownership/garage menus and branded assets remain future work.

## Trail motorcycle foundation

An original trail motorcycle joins the jeep and saloon with its own saved position,
narrower collision footprint, stronger initial acceleration and cornering lean.
It includes a helmeted rider, steering fork, wheels and lights. Balance is assisted;
bike-specific suspension, gears, audio and named-model art remain future work.
