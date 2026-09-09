export const TOWN_ROADS = [
  {
    id: "harbour-front",
    width: 6,
    points: [
      [-66, -180],
      [-66, -355],
      [0, -355],
    ],
  },
  {
    id: "town-north-street",
    width: 7,
    points: [
      [-66, -190],
      [0, -190],
      [150, -190],
    ],
  },
  {
    id: "town-middle-street",
    width: 6,
    points: [
      [-66, -265],
      [0, -265],
    ],
  },
  {
    id: "town-back-lane",
    width: 4,
    points: [
      [-50, -190],
      [-50, -355],
    ],
  },
  {
    id: "paddy-connector",
    width: 6,
    points: [
      [150, -190],
      [150, -140],
      [150, -40],
      [150, 30],
      [130, 65],
    ],
  },
];
const colors = ["#efd8ac", "#d3dcc7", "#e8c5a5", "#e6dfc8", "#bfcfc3"];
export const TOWN_BUILDINGS = [
  ...[-213, -239, -289, -317, -342].flatMap((z, i) =>
    [-38, -16, 17].map((x, j) => ({
      x,
      z,
      w: j === 0 ? 10 : 12,
      d: 12,
      color: colors[(i + j) % 5],
      floors: i % 2 === 0 && j === 1 ? 2 : 1,
    })),
  ),
  ...[-165, -120, -35, 4].flatMap((z, i) =>
    [128, 176].map((x, j) => ({
      x,
      z,
      w: 9 + j * 2,
      d: 10,
      color: colors[(i + j) % 5],
    })),
  ),
];
export const TOWN_SITES = [
  {
    id: "harbour-town",
    name: "Kadal Harbour Quarter",
    x: -66,
    z: -287,
    radius: 12,
    kind: "place",
    line: "The coast has another working day ahead.",
    story:
      "This fictional harbour quarter connects small shops, boat work and the coastal road. Its people keep their own hours; return at another time to see the waterfront change.",
  },
  {
    id: "town-street",
    name: "The Old Market Street",
    x: 0,
    z: -265,
    radius: 11,
    kind: "place",
    line: "A street to slow down for.",
    story:
      "An imagined Kerala market street: tiled shopfronts, shaded thresholds and neighbourhood errands. The road east leads inland toward Paddy Lane.",
  },
  {
    id: "inland-lane",
    name: "The Inland Turning",
    x: 150,
    z: -40,
    radius: 10,
    kind: "place",
    line: "The buildings thin out. The road keeps going.",
    story:
      "Homes and planted yards give way to the laterite loop and paddy lanes. This is a fictional connection through the game's landscape, rather than a real mapped route.",
  },
];
export const TOWN_PEOPLE = Array.from({ length: 10 }, (_, i) => {
  const z = [-213, -239, -289, -317, -342][Math.floor(i / 2)],
    x = i % 2 ? -8 : 8;
  const home = { x, z };
  const harbour = i < 4;
  const route = harbour
    ? [
        home,
        { x: 0, z },
        { x: 0, z: -265 },
        { x: -66, z: -265 },
        { x: -70, z: -276 - i * 3 },
      ]
    : [
        home,
        { x: 0, z },
        { x: 0, z: -265 },
        { x: i % 2 ? -8 : 8, z: -251 - Math.floor((i - 4) / 2) * 3 },
      ];
  return {
    id: `town-${i}`,
    name: [
      "Nazar",
      "Babu",
      "Lisy",
      "Sajeev",
      "Beena",
      "Rasheed",
      "Mary",
      "Deepak",
      "Shyla",
      "Vinod",
    ][i],
    color: ["teal", "cream", "rose", "gold"][i % 4],
    route,
    start: 6 + i * 0.12,
    end: 17 + i * 0.08,
    harbour,
  };
});
