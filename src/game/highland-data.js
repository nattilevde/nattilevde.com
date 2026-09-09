// Fictional connected hill drive; shares the existing High Ranges terrain.
export const HIGHLAND_ROADS = [
  {
    id: "ridge-climb",
    width: 6,
    points: [
      [381, 110],
      [415, 110],
      [448, 140],
      [470, 180],
      [510, 180],
      [540, 140],
      [555, 85],
      [590, 60],
      [630, 80],
      [665, 110],
      [705, 90],
      [710, 35],
      [690, -25],
      [710, -85],
      [715, -160],
      [705, -240],
      [690, -325],
    ],
  },
  {
    id: "estate-track",
    width: 3.8,
    surface: "laterite",
    points: [
      [448, 140],
      [460, 85],
      [488, 48],
      [515, 60],
      [535, 95],
      [555, 85],
    ],
  },
  {
    id: "ridge-view-spur",
    width: 5,
    points: [
      [705, 90],
      [730, 115],
      [731, 136],
    ],
  },
];
export const HIGHLAND_SITES = [
  {
    id: "estate-bend",
    name: "The Estate Bend",
    x: 488,
    z: 48,
    radius: 10,
    kind: "hidden",
    line: "Red earth under the tyres. Green shade overhead.",
    story:
      "A fictional estate track branches away from the hill road and rejoins above the next bend. The narrower lane rewards a slower approach and a look beyond the main road.",
  },
  {
    id: "ridge-view",
    name: "The Long View",
    x: 731,
    z: 136,
    radius: 12,
    kind: "place",
    line: "The road you climbed disappears into the green.",
    story:
      "An imagined ridge in Kerala's high ranges. Park here, walk to the bench and look back over the foothills. Another road continues north toward the older hill trail, making the journey a loop.",
  },
];
