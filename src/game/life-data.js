// The village's shared places and routes. Positions stay outside building solids.
export const DAY_SECONDS = 48 * 60;
export const LIFE_STEP = 0.1;
export const LIFE_NODES = {
  south: { x: 0, z: 76 },
  homes: { x: 0, z: 65 },
  shopRoad: { x: 0, z: 30 },
  landingRoad: { x: 0, z: 8 },
  bridgeWest: { x: 0, z: 0 },
  courtRoad: { x: 0, z: -25 },
  northHomes: { x: 0, z: -66 },
  northWest: { x: 0, z: -90 },
  northEast: { x: 58, z: -90 },
  coirRoad: { x: 58, z: -44 },
  bridgeEast: { x: 58, z: 0 },
  eastHomes: { x: 58, z: 22 },
  eastLanding: { x: 49, z: 65 },
  eastSouth: { x: 58, z: 65 },
  jetty: { x: 26, z: 8 },
  tea: { x: -12, z: 32 },
  teaDoor: { x: -10, z: 30 },
  coir: { x: 62, z: -44 },
  court: { x: -19, z: -23 },
  courtDoor: { x: -12, z: -23 },
  leelaHome: { x: -12, z: 65 },
  hariHome: { x: -12, z: -66 },
  binuHome: { x: 9, z: 65 },
  radhaHome: { x: 59, z: 25 },
};
export const LIFE_EDGES = [
  ["south", "homes"],
  ["homes", "shopRoad"],
  ["shopRoad", "landingRoad"],
  ["landingRoad", "bridgeWest"],
  ["bridgeWest", "courtRoad"],
  ["courtRoad", "northHomes"],
  ["northHomes", "northWest"],
  ["northWest", "northEast"],
  ["northEast", "coirRoad"],
  ["coirRoad", "bridgeEast"],
  ["bridgeEast", "bridgeWest"],
  ["bridgeEast", "eastHomes"],
  ["eastHomes", "eastSouth"],
  ["eastSouth", "eastLanding"],
  ["landingRoad", "jetty"],
  ["shopRoad", "teaDoor"],
  ["teaDoor", "tea"],
  ["coirRoad", "coir"],
  ["courtRoad", "courtDoor"],
  ["courtDoor", "court"],
  ["homes", "leelaHome"],
  ["homes", "binuHome"],
  ["northHomes", "hariHome"],
  ["eastHomes", "radhaHome"],
];

export const SHELTERS = [
  { id: "tea", name: "Leela's veranda", slots: [] },
  { id: "coir", name: "The coir veranda", slots: [] },
];
for (const shelter of SHELTERS) {
  for (let i = 0; i < 6; i++) {
    const id = `${shelter.id}-shelter-${i}`;
    LIFE_NODES[id] = {
      x: shelter.id === "tea" ? -12.7 : 62.8,
      z: (shelter.id === "tea" ? 26.5 : -47.5) + i * 1.35,
    };
    LIFE_EDGES.push([shelter.id === "tea" ? "teaDoor" : "coirRoad", id]);
    shelter.slots.push(id);
  }
}

export const RESIDENTS = [
  {
    id: "leela",
    name: "Leela",
    site: "tea-shop",
    home: "leelaHome",
    work: "tea",
    start: "tea",
    color: "rose",
  },
  {
    id: "binu",
    name: "Binu",
    site: "jetty",
    home: "binuHome",
    work: "jetty",
    start: "jetty",
    color: "teal",
  },
  {
    id: "radha",
    name: "Radha",
    site: "coir",
    home: "radhaHome",
    work: "coir",
    start: "coir",
    color: "gold",
  },
  {
    id: "hari",
    name: "Hari",
    site: "courtyard",
    home: "hariHome",
    work: "court",
    start: "court",
    color: "cream",
  },
  {
    id: "anil",
    name: "Anil",
    home: "leelaHome",
    work: "court",
    start: "court",
    color: "gold",
    drummer: true,
  },
  {
    id: "usha",
    name: "Usha",
    home: "radhaHome",
    work: "court",
    start: "court",
    color: "rose",
    drummer: true,
  },
  {
    id: "mani",
    name: "Mani",
    home: "binuHome",
    work: "court",
    start: "court",
    color: "cream",
    drummer: true,
  },
  {
    id: "jaya",
    name: "Jaya",
    home: "leelaHome",
    work: "eastHomes",
    start: "homes",
    color: "olive",
  },
  {
    id: "rajan",
    name: "Rajan",
    home: "hariHome",
    work: "jetty",
    start: "courtRoad",
    color: "white",
  },
  {
    id: "latha",
    name: "Latha",
    home: "radhaHome",
    work: "coir",
    start: "eastHomes",
    color: "teal",
  },
  {
    id: "venu",
    name: "Venu",
    home: "binuHome",
    work: "northEast",
    start: "south",
    color: "gold",
  },
  {
    id: "suma",
    name: "Suma",
    home: "hariHome",
    work: "eastLanding",
    start: "northHomes",
    color: "rose",
  },
];

// Personal work/break positions prevent a group converging on one coordinate.
const personalSlots = {};
RESIDENTS.forEach((resident, i) => {
  for (const [kind, anchor] of [
    ["work", resident.work],
    ["home", resident.home],
    ["break", "teaDoor"],
  ]) {
    const id = `${resident.id}-${kind}`;
    const base = LIFE_NODES[anchor];
    const key = `${kind}-${anchor}`;
    const slot = personalSlots[key] || 0;
    personalSlots[key] = slot + 1;
    LIFE_NODES[id] = { x: base.x, z: base.z + [0, -1.5, 1.5, 3][slot % 4] };
    if (kind === "break")
      LIFE_NODES[id] = {
        x: -9 + Math.floor(i / 4) * 1.2,
        z: 27 + (i % 4) * 1.4,
      };
    if (kind === "work" && resident.drummer)
      LIFE_NODES[id] = { x: -25 + (i - 4) * 2.3, z: -26.5 };
    // The named contacts retain their familiar first-morning positions.
    if (kind === "work" && i < 4) LIFE_NODES[id] = { ...base };
    LIFE_EDGES.push([anchor, id]);
    resident[kind] = id;
  }
});

export const FERRY_STOPS = [
  {
    id: "palmwater",
    name: "Palmwater Jetty",
    land: { x: 26, z: 8 },
    water: { x: 39, z: 22 },
  },
  {
    id: "far-bank",
    name: "Far-bank Landing",
    land: { x: 49, z: 65 },
    water: { x: 43, z: 65 },
  },
];
