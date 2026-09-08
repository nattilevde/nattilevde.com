export const PADDY_VILLAGE = { x: 285, z: 110, name: "The Paddy Lane" };
export const PADDY_HOMES = [
  { x: 260, z: 75, w: 10, d: 10, color: "#e4d8ad" },
  { x: 285, z: 75, w: 12, d: 10, color: "#d1dfca" },
  { x: 311, z: 75, w: 9, d: 10, color: "#e7c4ad" },
];
export const PLAY_COURT = { minX: 278, maxX: 297, minZ: 83, maxZ: 101 };
export const inPlayCourt = (x, z) =>
  x > PLAY_COURT.minX &&
  x < PLAY_COURT.maxX &&
  z > PLAY_COURT.minZ &&
  z < PLAY_COURT.maxZ;
export const PADDY_PEOPLE = [
  {
    id: "farmer-0",
    name: "Ravi",
    home: { x: 256, z: 84 },
    work: { x: 255, z: 145 },
    start: 7,
    end: 17,
    color: "cream",
    kind: "farm",
  },
  {
    id: "farmer-1",
    name: "Devaki",
    home: { x: 263, z: 84 },
    work: { x: 268, z: 156 },
    start: 7.5,
    end: 16.5,
    color: "rose",
    kind: "farm",
  },
  {
    id: "vendor",
    name: "Shaji",
    home: { x: 310, z: 84 },
    work: { x: 310, z: 101 },
    start: 8,
    end: 18,
    color: "teal",
    kind: "market",
  },
  {
    id: "buyer-0",
    name: "Latha",
    home: { x: 322, z: 84 },
    work: { x: 314, z: 105 },
    start: 10,
    end: 11,
    color: "gold",
    kind: "buyer",
  },
  {
    id: "buyer-1",
    name: "Manoj",
    home: { x: 325, z: 87 },
    work: { x: 317, z: 105 },
    start: 16,
    end: 17,
    color: "olive",
    kind: "buyer",
  },
  {
    id: "baker",
    name: "Reena",
    home: { x: 335, z: 84 },
    work: { x: 335, z: 100 },
    start: 7,
    end: 18,
    color: "cream",
    kind: "shop",
  },
  {
    id: "repairer",
    name: "Faisal",
    home: { x: 355, z: 84 },
    work: { x: 355, z: 100 },
    start: 9,
    end: 17,
    color: "teal",
    kind: "shop",
  },
  {
    id: "town-walker",
    name: "Suresh",
    home: { x: 370, z: 105 },
    work: { x: 331, z: 105 },
    start: 15,
    end: 17,
    color: "gold",
    kind: "buyer",
  },
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `child-${i}`,
    name: ["Ammu", "Kiran", "Meenu"][i],
    home: { x: 282 + i * 3, z: 84 },
    work: { x: 282 + i * 4, z: 93 },
    start: 16 + i * 0.03,
    end: 18 - i * 0.03,
    color: ["rose", "teal", "gold"][i],
    kind: "child",
  })),
];
