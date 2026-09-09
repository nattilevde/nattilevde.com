// Fictional neighbourhoods; these hours describe exterior visits, not worship times.
export const FAITH_SPACES = [
  {
    id: "mosque",
    name: "Malabar neighbourhood mosque",
    x: -18,
    z: -1050,
    color: "#dce8d4",
    start: 7,
    end: 9,
  },
  {
    id: "temple",
    name: "Temple lane",
    x: 90,
    z: -785,
    color: "#e3bd87",
    start: 6,
    end: 8.5,
  },
  {
    id: "church",
    name: "Coastal church lane",
    x: -24,
    z: 582,
    color: "#f1e4c6",
    start: 8,
    end: 10,
  },
];
export const SEVENS = { x: 55, z: -1040, name: "Malabar neighbourhood ground" };
export const COMMUNITY_PEOPLE = [
  ...FAITH_SPACES.flatMap((place, p) =>
    Array.from({ length: 3 }, (_, i) => ({
      id: `${place.id}-${i}`,
      place: place.id,
      color: ["teal", "rose", "gold"][i],
      home: { x: place.x + 17 + i * 1.3, z: place.z + 14 },
      visit: { x: place.x + 9, z: place.z - 3 + i * 3 },
      shelter: { x: place.x + 7, z: place.z - 3 + i * 3 },
      start: place.start + i * 0.1,
      end: place.end - i * 0.1,
    })),
  ),
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `sevens-${i}`,
    place: "sevens",
    color: i < 7 ? "teal" : "gold",
    home: { x: 29 + (i % 7) * 1.6, z: -1004 + Math.floor(i / 7) * 2 },
    visit: { x: 44 + (i % 7) * 3.6, z: i < 7 ? -1049 : -1031 },
    shelter: { x: 41 + (i % 7) * 1.8, z: -1018 + Math.floor(i / 7) * 1.6 },
    start: 16 + (i % 4) * 0.04,
    end: 18 - (i % 3) * 0.04,
  })),
];
export function communityClearance(x, z) {
  return (
    (x > 24 && x < 83 && z > -1067 && z < -998) ||
    FAITH_SPACES.some(
      (p) => Math.abs(x - (p.x + 8)) < 22 && Math.abs(z - p.z) < 20,
    )
  );
}
