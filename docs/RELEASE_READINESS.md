# Release readiness — 0.3.0 candidate

Prepared 11 September 2026. This is a release candidate, not a published release.
Package and lockfile versions agree at 0.3.0; the changelog separates this work
from the existing v0.2.0 and v0.1.0 releases.

## Included and reviewed

- Cultural encounters, forest driving and wildlife, and the first three vehicle
  types already committed in 600d1c9.
- Test reliability, restored CI, separate Three.js chunk and reduced shipped
  images from 7674c8e and de76ad3; these changes are preserved.
- Removed serial grouping from independent game tests. CI shards individual
  tests with one browser worker per runner. Keep the 60-minute ceiling until
  measured CI timings justify reducing it; equal counts do not promise equal time.
- Added browser coverage for audible chenda demonstration while paused, a timed
  player response and persisted participation, alongside the timing model tests.
- CI now checks generated search pages after building.

## Verification

- The contributor reports the previous full CI run passed 101 tests, with two
  retries, plus three production release tests. That is baseline evidence,
  not a fresh full-suite result for this candidate.
- Production release suite: 3/3 passed (desktop, phone-sized browser and
  JavaScript-disabled navigation). Build and all 45 generated SEO pages passed.
- Shard discovery: 35 tests per shard, 105 total; hosted CI timings remain pending.
- Targeted regression suite: 5/5 passed, covering chenda timing/audio/saved
  participation, terrain definitions and the courtyard interaction. The isolated
  courtyard run exposed a focus-sensitive hotkey in the test; it now uses the
  visible encounter action after the passport closes.
- Formatting and whitespace checks passed.
- The cumulative manual checks remain open; automated browsers cannot establish
  real-device frame pacing or the quality of the driving and wildlife experience.

## Final manual smoke pass

- [ ] Fresh session and existing save: enter the world, find the jeep and drive
      immediately. Check acceleration, braking and camera smoothness.
- [ ] Jeep, Coastal Saloon and trail motorcycle: enter/exit, switch vehicles,
      headlights/brake lights, reload and confirm independent parking.
- [ ] Forest Churam: complete the hairpins both ways; inspect road edges, deer
      avoiding trees/vehicles, squirrel reactions and directional ambience.
- [ ] Day/night and rain: road visibility, wet-ground drying, warm destination
      lights, firefly appearance and comfortable dry intervals.
- [ ] Chenda: audible demonstration, mouse/keyboard/touch answers, mute,
      close/reopen, switch browser tab during demonstration and saved recognition.
- [ ] Sevens: moving players, possession, shots, goalkeeper, crowd and floodlights.
- [ ] Boat training, pookalam growth/neighbours, markets and paddy-lane life:
      observe changing activity and check memories after reloading.
- [ ] Pookalam beside the fish market: judge whether its nearby discovery feels
      natural. The scoped fishing assertion is correct; placement is unchanged.
- [ ] Real phone: first-load performance, touch steering/braking, photo preview
      and native sharing. Repeat the portal → game → portal journey.

Detailed cumulative checklists remain in [culture](CULTURE_WORLD_EVOLUTION.md),
[vehicles](KERALA_VEHICLE_PHASE.md), [first journey](FIRST_JOURNEY_PILOT.md) and
[Kadal](KADAL_PLAYTEST.md).

## Deployment checks

- [ ] Candidate CI passes after these changes; review shard timings and retries.
- [ ] Complete the manual smoke pass above before declaring the release stable.
- [ ] Publish through the existing deployment flow, then verify /game/,
      robots.txt, sitemap.xml, missing-page 404s and HTTPS/domain redirects.
- [ ] Search Console: submit sitemap, inspect home and /game/, request indexing
      and monitor exclusions. Search placement is not guaranteed by code changes.

## Deferred to the next deployment

- Branded/licensed vehicle assets, more bikes, cycles, garages and customisation.
- Further forest art and navigation polish, guided by the smoke-test findings.
- Playable snake-boat racing and authentic licensed/commissioned vanchipattu.
- Larger festival and martial-arts systems; community involvement before
  interpreting community-specific living rituals.
- Pookalam relocation if testing shows the market proximity is distracting.

No new feature expansion is required for this release candidate. No deployment,
release tag, indexing request or external announcement has been performed here.
