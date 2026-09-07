export const REGION = {
  id: "alappuzha",
  name: "Kadal Village",
  subtitle: "An Alappuzha-inspired coastal world",
  bounds: { minX: -83, maxX: 105, minZ: -142, maxZ: 142 },
  spawn: { x: 0, z: 76 },
  cellSize: 16,
};

export const sites = [
  {
    id: "village",
    name: "Kadal Village",
    x: 0,
    z: 58,
    radius: 10,
    kind: "place",
    line: "A lane between the sea and the backwaters.",
    story:
      "This fictional village brings together everyday landscapes of coastal Alappuzha: tiled homes, coconut palms, small shops, and waterways. It is inspired by Kerala, not a scaled recreation of a real village.",
  },
  {
    id: "tea-shop",
    name: "Leela's Chayakada",
    x: -12,
    z: 30,
    radius: 8,
    kind: "food",
    npc: "Leela",
    action: "Try pazham pori",
    line: "Tea is better when you have nowhere to rush.",
    story:
      "Pazham pori is ripe banana dipped in batter and fried until golden. With a glass of chaya, it is a much-loved tea-time pause across Kerala.",
    hint: 'Leela: "Hear that rhythm? Follow the lane north, then look for the tiled pavilion on your left."',
  },
  {
    id: "courtyard",
    name: "The Rhythm Courtyard",
    x: -22,
    z: -25,
    radius: 10,
    kind: "culture",
    npc: "Hari",
    action: "Join the rhythm",
    line: "Follow the sound, not the signposts.",
    story:
      "The chenda is a cylindrical percussion instrument central to many Kerala ensembles. This courtyard is a fictional rehearsal space, not a reconstruction of a sacred performance.",
    hint: 'Hari: "There is a coir worker across the canal. The northern bridge takes you close."',
  },
  {
    id: "jetty",
    name: "Palmwater Jetty",
    x: 24,
    z: 5,
    radius: 10,
    kind: "place",
    npc: "Binu",
    action: "Talk to the boatkeeper",
    line: "The water has its own roads.",
    story:
      "Kettuvallam houseboats developed from boats once used to carry goods such as rice. Coconut-fibre rope and traditional woodwork are part of their story.",
    hint: 'Binu: "Both bridges are open. Beyond the far bank, the palms hide an old pond. Or borrow the canoe here and follow the water."',
  },
  {
    id: "beach",
    name: "The Quiet Shore",
    x: -73,
    z: 12,
    radius: 13,
    kind: "place",
    line: "Salt air. Fishing boats. Nothing to hurry for.",
    story:
      "Along the Alappuzha coast, working fishing beaches sit beside quiet stretches of sand. Give crews room to land their catch and follow local advice about the sea.",
  },
  {
    id: "coir",
    name: "Radha's Coir Yard",
    x: 62,
    z: -42,
    radius: 9,
    kind: "culture",
    npc: "Radha",
    action: "Learn to turn coconut fibre",
    line: "An everyday material. Generations of skill.",
    story:
      "Coir is fibre from the coconut husk, spun into yarn and made into rope, mats, and other products. Alappuzha has a long association with coir work and its workers.",
    hint: 'Radha: "Keep walking north on this bank. Where the path ends, go between the two large rocks. There is still a little more Kerala to find."',
  },
  {
    id: "pond",
    name: "The Lotus Hideaway",
    x: 77,
    z: -115,
    radius: 9,
    kind: "hidden",
    line: "Some places keep their stories quietly.",
    story:
      "You found a sheltered pond beyond the village paths. Small ponds and tree cover can support birds, insects, and amphibians. Leave this little corner just as you found it.",
  },
  {
    id: "lookout",
    name: "Coconut Grove Lookout",
    x: 80,
    z: 110,
    radius: 12,
    kind: "place",
    line: "A different view of the same beautiful world.",
    story:
      "This gently raised fictional viewpoint connects the coast, village, and backwaters in one vista. Alappuzha itself is predominantly low-lying; the rise here is an artistic world-building choice.",
  },
];

export const activities = [
  {
    id: "first-wander",
    name: "The Art of Wandering",
    description: "Discover the village, beach, and jetty.",
    requires: ["village", "beach", "jetty"],
    source: "discoveries",
    badge: "Coastal Wanderer",
  },
  {
    id: "local-life",
    name: "A Little Local Life",
    description: "Try Leela's food and join both cultural encounters.",
    requires: ["tea-shop", "courtyard", "coir"],
    source: "interactions",
    badge: "Village Friend",
  },
  {
    id: "hidden-kerala",
    name: "Beyond the Familiar",
    description: "Find the hidden pond and reach the grove lookout.",
    requires: ["pond", "lookout"],
    source: "discoveries",
    badge: "Quiet Pathfinder",
  },
];

export const buildings = [
  { x: -18, z: 30, w: 8, d: 9, color: "#f0d7a0", type: "shop" },
  { x: -22, z: -34, w: 14, d: 10, color: "#eadbb7", type: "pavilion" },
  { x: 68, z: -43, w: 8, d: 10, color: "#d6c7a0", type: "coir" },
  { x: -18, z: 65, w: 9, d: 10, color: "#dce1be" },
  { x: 16, z: 48, w: 10, d: 10, color: "#edc5a2" },
  { x: 16, z: -32, w: 9, d: 12, color: "#c6dac9" },
  { x: -19, z: -66, w: 11, d: 10, color: "#f0dda6" },
  { x: 17, z: -74, w: 8, d: 9, color: "#b8d5cf" },
  { x: 66, z: 22, w: 10, d: 12, color: "#e2c2a5" },
  { x: -49, z: 68, w: 9, d: 10, color: "#e8dcc0" },
];

export function terrainHeight(x, z) {
  if (x < 48) return 0;
  const distance = Math.hypot((x - 83) / 43, (z - 111) / 49);
  return Math.max(0, 1 - distance) ** 2 * 9;
}

export function canWalk(x, z) {
  const b = REGION.bounds;
  if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) return false;
  if (x > 29 && x < 47 && Math.abs(z) > 5 && Math.abs(z + 90) > 5) return false;
  if (Math.hypot(x - 77, z + 122) < 4.7) return false;
  return !buildings.some(
    (b) =>
      Math.abs(x - b.x) < b.w / 2 + 0.6 && Math.abs(z - b.z) < b.d / 2 + 0.6,
  );
}

export function cellAt(x, z) {
  return `${Math.floor((x + 112) / REGION.cellSize)},${Math.floor((z + 152) / REGION.cellSize)}`;
}

export function readJourney() {
  try {
    const data = JSON.parse(localStorage.getItem("kerala-world-journey"));
    const clean = (key) =>
      Array.isArray(data?.[key])
        ? [
            ...new Set(
              data[key].filter((id) =>
                key === "cells"
                  ? /^\d+,\d+$/.test(id)
                  : sites.some((s) => s.id === id),
              ),
            ),
          ]
        : [];
    const position = data?.position;
    return {
      discoveries: clean("discoveries"),
      interactions: clean("interactions"),
      cells: clean("cells"),
      position:
        position &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.z) &&
        canWalk(position.x, position.z)
          ? position
          : REGION.spawn,
    };
  } catch {
    return {
      discoveries: [],
      interactions: [],
      cells: [],
      position: REGION.spawn,
    };
  }
}
