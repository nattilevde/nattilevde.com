import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { districts } from "../src/portal/data.js";
const paths = [
  "/",
  "/districts/",
  "/game/",
  ...districts.flatMap((d) => [
    `/districts/${d.id}/`,
    ...d.places.map((p) => `/places/${p.id}/`),
  ]),
];
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const path of paths) {
  const html = await readFile(`dist${path}index.html`, "utf8");
  assert.equal((html.match(/<title>/g) || []).length, 1, path);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, path);
  assert(html.includes(`href="https://nattilevde.com${path}"`), path);
  assert(html.includes("<h1>"), path);
  assert(html.includes('property="og:description"'), path);
  assert(sitemap.includes(`<loc>https://nattilevde.com${path}</loc>`), path);
  JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  for (const [, href] of html.matchAll(
    /href="(\/(?:districts|places)\/[^"#]*)"/g,
  ))
    assert(paths.includes(href), href);
}
assert(
  (await readFile("dist/robots.txt", "utf8")).includes(
    "Sitemap: https://nattilevde.com/sitemap.xml",
  ),
);
assert((await readFile("dist/404.html", "utf8")).includes("noindex"));
console.log(
  `Verified metadata, structured data, sitemap and internal links for ${paths.length} pages.`,
);
