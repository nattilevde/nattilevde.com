import * as THREE from "three";
export const NIGHT_PLACES = [
  { name: "Tea-shop frontage lamp", x: -10, z: 32, height: 2.4 },
  { name: "Paddy bakery lamp", x: 343, z: 98, height: 2.5 },
  { name: "Cycle shop lamp", x: 363, z: 98, height: 2.5 },
  { name: "Market parking lamp", x: 332, z: 130, height: 3.4, pole: true },
  { name: "Harbour shelter lamp", x: 10, z: -177, height: 2.5 },
];
export function nightLightStrength(darkness, distance) {
  const night = Number.isFinite(darkness)
    ? Math.max(0, Math.min(1, darkness))
    : 0;
  return night * Math.max(0, Math.min(1, (45 - distance) / 20));
}
export function buildNightPlaces({
  group,
  block,
  mesh,
  sphere,
  m,
  material,
  terrainHeight,
}) {
  const lamps = NIGHT_PLACES.map((place) => {
    const root = group(
      place.name,
      place.x,
      terrainHeight(place.x, place.z),
      place.z,
    );
    const glow = material("#ffe5b3", {
      emissive: "#ffc16c",
      emissiveIntensity: 0,
    });
    if (place.pole)
      block(root, m.darkWood, 0, place.height / 2, 0, 0.12, place.height, 0.12);
    block(root, m.darkWood, 0, place.height + 0.12, 0, 0.55, 0.12, 0.4);
    mesh(root, sphere, glow, 0, place.height, 0, 0.16, 0.1, 0.16);
    return { root, glow };
  });
  // A fixed light count avoids shader changes while moving between destinations.
  const pools = Array.from({ length: 2 }, () => {
    const root = group("Nearby warm light");
    const light = new THREE.PointLight(0xffcf8b, 0, 15, 1);
    root.add(light);
    return { root, light, site: -1 };
  });
  return {
    animated: [...lamps.map((l) => l.root), ...pools.map((p) => p.root)],
    update(darkness, player) {
      const x = player.x ?? 0,
        z = player.z ?? 0;
      for (const lamp of lamps)
        lamp.glow.emissiveIntensity = nightLightStrength(darkness, 0) * 1.6;
      const distance = (i) =>
        Math.hypot(x - NIGHT_PLACES[i].x, z - NIGHT_PLACES[i].z);
      for (const pool of pools) {
        // Release only once fully faded, so nearby assignments don't jump between shops.
        if (pool.site >= 0 && distance(pool.site) >= 45) pool.site = -1;
      }
      for (const pool of pools) {
        if (pool.site < 0) {
          let best = 45;
          NIGHT_PLACES.forEach((place, i) => {
            const gap = distance(i);
            if (gap < best && !pools.some((p) => p.site === i)) {
              pool.site = i;
              best = gap;
            }
          });
        }
        if (pool.site < 0) {
          pool.light.intensity = 0;
          continue;
        }
        const place = NIGHT_PLACES[pool.site];
        pool.root.position.set(
          place.x,
          terrainHeight(place.x, place.z) + place.height - 0.15,
          place.z,
        );
        pool.light.intensity =
          nightLightStrength(darkness, distance(pool.site)) * 18;
      }
    },
  };
}
