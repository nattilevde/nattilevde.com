# Portal and SEO — September 2026

## Implemented

- Moved the map introduction and filters above the map, increased filter readability and moved the floating guide into page flow at narrower widths.
- Added full-guide links to district/place dialogs and a crawlable district directory link to the portal footer.
- Build generates 44 HTML pages: home, district directory, 14 district guides and 28 place guides. Guides work without JavaScript and include existing district food/culture context and related places. The interactive passport remains on the main portal.
- Each generated page has a title, description, canonical URL, Open Graph/Twitter metadata and structured data (WebSite on home; WebPage and breadcrumbs on guides). Social previews use the existing brand image; no unverified destination imagery added.
- Build generates robots.txt, sitemap.xml and a noindex 404 document. Existing DNS verification is untouched. No ranking or indexing guarantee.

Run `npm run build`, then `node scripts/check-seo.mjs`. Deploy the complete dist directory using the existing hosting workflow. Guide pages are build output, so Vite development alone does not generate them. Rebuild when district content changes. Hosting must serve directory index.html files and the 404 document; verify unknown routes return HTTP 404 rather than rewriting every URL to the homepage.

After deployment, submit https://nattilevde.com/sitemap.xml in Search Console. Inspect the homepage and one district/place URL, confirming fetched HTML and the canonical URL. DNS ownership verification does not replace this check. Check redirects preserve the preferred https://nattilevde.com domain.

## Deferred manual checks

- [ ] Home map and filters at desktop, tablet and phone widths: no overlapping headings or floating guide controls.
- [ ] District and place dialogs open; full-guide links load; browser Back returns correctly.
- [ ] Directly open and reload a guide, with JavaScript disabled; content and links remain usable.
- [ ] Existing passport, search and game entry still work.
- [ ] Production sitemap/robots load and an unknown URL returns 404.
- [ ] Search Console sitemap submission and URL inspection after deployment.

Guides reuse existing editorial content; fact-checking and source enrichment remain a separate content pass. No publishing occurred in this batch.

Reference: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

## Project links

- Added open-source information, the GitHub repository and Nabeel's Buy Me a Coffee link to portal and generated guide footers.
- [ ] Check both footer links on desktop and phone; each opens the intended page in a new tab.

## Game search identity follow-up

The public homepage was verified as serving the previous SEO title and HTTPS canonical on 9 September 2026. The user's Google screenshot still shows an earlier title. This indicates a discrepancy between current content and that search snapshot; Search Console is needed to confirm Google's last crawl and selected canonical.

Added /game/ with visible product facts, controls, supported browser requirements, local-save explanation, open-source authorship and VideoGame structured data. Homepage title/description now identify Nattilevde as a Kerala browser game; visible portal content connects that name to Kerala Unfolded. All guide headers link to the game page, and the sitemap includes it. No invented ratings or special AI markup.

- [ ] Deploy this build; inspect https://nattilevde.com/game/ and the homepage in Search Console and request indexing.
- [ ] Resubmit the sitemap and check Page indexing for exclusions and Google's chosen canonical.
- [ ] Monitor branded/game queries, impressions and clicks in Search Console. Search screenshots alone cannot establish traffic or ranking performance.
- [ ] Share actual gameplay clips and the /game/ link through relevant communities where promotion is welcome. No external posting performed.

AI Overviews use standard search eligibility; no inclusion or ranking guarantee: https://developers.google.com/search/docs/appearance/ai-features
