import { readFile, writeFile, mkdir } from "node:fs/promises";
import { districts } from "../src/portal/data.js";
const origin = "https://nattilevde.com";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const districtUrl = (d) => `/districts/${d.id}/`;
const placeUrl = (p) => `/places/${p.id}/`;
const links = (items) =>
  `<ul>${items.map(([url, name]) => `<li><a href="${url}">${esc(name)}</a></li>`).join("")}</ul>`;
const homeDescription =
  "Explore Kerala’s 14 districts, local food, living traditions and places to discover. Start your journey with Kerala Unfolded and its playable 3D world.";
const metadata = (title, description, path, schema) =>
  `<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin}${path}"><meta property="og:type" content="website"><meta property="og:site_name" content="Kerala Unfolded"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}/logo-with-domain-label.png"><meta property="og:image:alt" content="Kerala Unfolded"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${origin}/logo-with-domain-label.png"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
const header =
  '<header><a href="/">Kerala Unfolded</a><nav aria-label="Main"><a href="/districts/">All districts</a><a href="/#world">Enter the 3D world</a></nav></header>';
const footer =
  '<footer><p>Open source. Made with care for Kerala. Explore the code, contribute, or support the project.</p><nav aria-label="Project and support"><a href="https://github.com/nattilevde/nattilevde.com" target="_blank" rel="noopener noreferrer">Open source on GitHub ↗</a><a href="https://buymeacoffee.com/nabeelc" target="_blank" rel="noopener noreferrer">Buy me a coffee ↗</a></nav><p>The portal describes real Kerala. The game is a fictional, stylised interpretation.</p><a href="/">Return to the interactive map, passport and photo credits</a></footer>';
async function page(path, title, description, body, crumbs) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        description: description,
        url: origin + path,
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map(([name, url], i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: name,
          item: origin + url,
        })),
      },
    ],
  };
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${metadata(title, description, path, schema)}<link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/guide.css"></head><body>${header}<main><nav aria-label="Breadcrumb">${crumbs.map(([name, url]) => `<a href="${url}">${esc(name)}</a>`).join(" / ")}</nav>${body}</main>${footer}</body></html>`;
  await mkdir("dist" + path, { recursive: true });
  await writeFile("dist" + path + "index.html", html);
}
const rootCrumb = ["Home", "/"];
await page(
  "/districts/",
  "Kerala’s 14 Districts | Kerala Unfolded",
  homeDescription,
  `<h1>Explore Kerala’s 14 districts</h1><p>Follow the coast, head inland or choose a story that catches your curiosity.</p>${links(districts.map((d) => [districtUrl(d), d.name]))}`,
  [rootCrumb, ["Districts", "/districts/"]],
);
for (const d of districts) {
  const context = `<section><h2>A taste of ${esc(d.name)}</h2><h3>${esc(d.food.name)}</h3><p>${esc(d.food.description)}</p></section><section><h2>Living traditions</h2><h3>${esc(d.culture.name)}</h3><p>${esc(d.culture.description)}</p></section>`;
  await page(
    districtUrl(d),
    `${d.name}: Places, Food & Culture | Kerala Unfolded`,
    d.description,
    `<h1>${esc(d.name)}</h1><p class="lead">${esc(d.tagline)}</p><p>${esc(d.description)}</p><aside><h2>A little thing to know</h2><p>${esc(d.fact)}</p></aside><h2>Places to explore</h2>${links(d.places.map((p) => [placeUrl(p), p.name]))}${context}`,
    [rootCrumb, ["Districts", "/districts/"], [d.name, districtUrl(d)]],
  );
  for (const p of d.places)
    await page(
      placeUrl(p),
      `${p.name}, ${d.name} | Kerala Unfolded`,
      p.description,
      `<p class="eyebrow">${esc(d.name)} · ${esc(p.type)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.description)}</p><aside><h2>Before you explore</h2><p>${esc(p.tip)}</p></aside><h2>The surrounding district</h2><p>${esc(d.description)}</p>${context}<h2>Keep exploring ${esc(d.name)}</h2>${links(d.places.filter((q) => q.id !== p.id).map((q) => [placeUrl(q), q.name]))}<p><a href="${districtUrl(d)}">Explore all of ${esc(d.name)}</a></p>`,
      [rootCrumb, [d.name, districtUrl(d)], [p.name, placeUrl(p)]],
    );
}
const paths = [
  "/",
  "/districts/",
  ...districts.flatMap((d) => [districtUrl(d), ...d.places.map(placeUrl)]),
];
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
let home = await readFile("dist/index.html", "utf8");
home = home
  .replace(/<title>[\s\S]*?<\/title>/, "")
  .replace(/<meta\s+name="description"[\s\S]*?>/, "")
  .replace(
    "</head>",
    metadata(
      "Kerala Unfolded | Explore Kerala’s Places, Food & Culture",
      homeDescription,
      "/",
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Kerala Unfolded",
        alternateName: "Nattilevde",
        url: origin + "/",
      },
    ) + "</head>",
  );
home = home.replace(
  '<div id="root"></div>',
  `<div id="root"><main><h1>Kerala Unfolded</h1><p>${homeDescription}</p><a href="/districts/">Explore all districts</a>${links(districts.map((d) => [districtUrl(d), d.name]))}</main></div>`,
);
await writeFile("dist/index.html", home);
await writeFile(
  "dist/404.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found | Kerala Unfolded</title><link rel="stylesheet" href="/guide.css"></head><body>${header}<main><h1>This path ends here.</h1><p>That page could not be found.</p><a href="/districts/">Explore Kerala’s districts</a></main></body></html>`,
);
console.log(`Generated ${paths.length} indexable pages and sitemap.`);
