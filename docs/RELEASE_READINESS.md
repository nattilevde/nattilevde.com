# Release readiness — 9 September 2026

## Passed on the local production build

- Build and metadata/structured-data/sitemap/internal-link checks for 45 pages.
- Desktop 1280 × 800 and phone-sized 390 × 844 portal layout without horizontal overflow; map introduction above map.
- Portal → game information → playable world → first jeep entry → photo preview → return.
- No browser page errors during those journeys.
- JavaScript-disabled home → game information → district → place navigation.
- Public GitHub repository and Buy Me a Coffee links returned HTTP 200.
- Inspected captured phone portal and photo screens.

Repeat with `npm run test:release`. Release checks use the built output, separate from the normal development-server test suite.

## Remaining checks

- [ ] Real phone: first-load frame pacing, touch steering/braking, native share sheet.
- [ ] After publishing: /game/, robots.txt and sitemap.xml return the intended content; missing pages return HTTP 404, with correct HTTPS/domain redirects.
- [ ] Search Console: submit sitemap, inspect home and /game/, request indexing, and monitor indexing exclusions.
- [ ] Run the cumulative world playtest checklist with the initial tester group.

The game bundle still triggers the existing size warning. Phone-sized browser testing is not a real-device performance benchmark. No publishing, indexing request, external post or payment was performed.
