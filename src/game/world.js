import { FAITH_SPACES } from "./community-data.js";
export const REGION = {
  id: "kerala",
  name: "Kerala Unfolded",
  subtitle: "A stylised Kerala, from Malabar to Travancore",
  bounds: { minX: -160, maxX: 760, minZ: -1500, maxZ: 900 },
  spawn: { x: 0, z: 76 },
  cellSize: 40,
};

export const regions = [
  {
    id: "malabar",
    name: "Malabar Coast",
    districts: "Kasaragod · Kannur · Kozhikode · Malappuram",
    test: (x, z) => z < -900 && x <= 380,
  },
  {
    id: "highlands",
    name: "The High Ranges",
    districts: "Wayanad · Idukki",
    test: (x) => x > 380,
  },
  {
    id: "central",
    name: "Central Kerala",
    districts: "Palakkad · Thrissur · Ernakulam",
    test: (x, z) => z < -280,
  },
  {
    id: "south",
    name: "Travancore South",
    districts: "Kollam · Pathanamthitta · Thiruvananthapuram",
    test: (x, z) => z > 280,
  },
  {
    id: "backwaters",
    name: "The Backwaters",
    districts: "Alappuzha · Kottayam",
    test: () => true,
  },
];
export const regionAt = (x, z) => regions.find((r) => r.test(x, z));

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
    handsOn: {
      prompt: "Three beats. One small beginning.",
      button: "Play beat",
    },
    line: "Follow the sound, not the signposts.",
    story:
      "The chenda is a cylindrical percussion instrument central to many Kerala ensembles. This courtyard is a fictional rehearsal space, not a reconstruction of a sacred performance.",
    hint: 'Hari: "There is a coir worker across the canal. The northern bridge takes you close. And west of here, past the palms, the paddies turn to green glass in the evening."',
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
    hint: 'Binu: "Both bridges are open. Beyond the far bank, the palms hide an old pond. Or borrow the canoe here and follow the water. And when you are ready for the long road — the highway runs from the far north fort to the southern lighthouse."',
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
    handsOn: {
      prompt: "Three turns of the spindle. Watch the fibres twist.",
      button: "Turn the spindle",
    },
    line: "An everyday material. Generations of skill.",
    story:
      "Coir is fibre from the coconut husk, spun into yarn and made into rope, mats, and other products. Alappuzha has a long association with coir work and its workers.",
    hint: 'Radha: "Keep walking north on this bank. Where the path ends, go between the two large rocks. And if you pass a grove the axes never touched — that is the old kavu. Walk softly there."',
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
  {
    id: "paddy",
    name: "The Green Mirror Paddies",
    x: -48,
    z: -108,
    radius: 11,
    kind: "place",
    line: "Rice, water, and sky sharing the same field.",
    story:
      "Kuttanad, south of Alappuzha, is famous for paddy fields that sit below sea level, protected by bunds and worked with the rhythm of the seasons. Rice from fields like these becomes the centre of every Kerala sadya.",
  },
  {
    id: "kavu",
    name: "The Old Kavu",
    x: 92,
    z: -70,
    radius: 9,
    kind: "culture",
    line: "The trees were here first. Everyone agrees.",
    story:
      "A kavu is a sacred grove left deliberately wild, often home to a small shrine and old serpent stones. In northern Kerala, groves like these host Theyyam, where a performer embodies the deity through firelight, drum, and dance. This quiet corner honours that tradition from a respectful distance.",
  },
  // CENTRAL KERALA
  {
    id: "riverghat",
    name: "The Periyar Steps",
    x: 30,
    z: -632,
    radius: 9,
    kind: "place",
    line: "Every Kerala river has a place where people meet it.",
    story:
      "Rivers such as the Periyar and the Bharathappuzha thread central Kerala together. Stone ghats like these are where villages wash, talk, cool their feet, and launch the occasional snake boat. The bridge nearby carries the coastal highway across the water.",
  },
  {
    id: "templeground",
    name: "The Pooram Ground",
    x: 90,
    z: -735,
    radius: 12,
    kind: "culture",
    line: "Imagine this ground with a hundred thousand people.",
    story:
      "Thrissur Pooram is one of Kerala's grandest temple festivals: caparisoned elephants in golden nettipattam, rows of silk parasols swapped in rhythm, and the massive layered percussion of the melam. This quiet ground, with its gate and patient elephants, holds a hint of that thunder.",
  },
  {
    id: "spicelane",
    name: "Spice Lane",
    x: -24,
    z: -870,
    radius: 10,
    kind: "culture",
    npc: "Fatima",
    action: "Blend the morning masala",
    handsOn: {
      prompt: "Cardamom, pepper, cinnamon — one at a time, into the mortar.",
      button: "Add spice",
    },
    line: "The whole world once sailed here for this smell.",
    story:
      "Kerala's coast drew traders from Rome, Arabia, and China for pepper and cardamom. Streets like Mattancherry's spice bazaars still stack burlap sacks of the harvest. Fatima's shop keeps a small corner of that long story.",
    hint: 'Fatima: "Going north? Slow down at the beach market before the fort road — Moidu\'s halwa is worth the stop."',
  },
  // MALABAR COAST
  {
    id: "beachmarket",
    name: "Chandhapura Beach Market",
    x: -44,
    z: -1005,
    radius: 10,
    kind: "food",
    npc: "Moidu",
    action: "Try Kozhikode halwa",
    line: "Fish at dawn, halwa at dusk.",
    story:
      "Kozhikode's beach evenings mean roasted peanuts, banana chips, and the city's famous halwa — dense, glossy, and cut from great slabs in Sweet Meat Street. Markets like this one keep Malabar's easy generosity alive.",
    hint: 'Moidu: "The fort? Keep to the highway north, then follow the sea road west. And listen for drums after dark — the Theyyam ground is east of the highway."',
  },
  {
    id: "fort",
    name: "Kadalkotta Fort",
    x: -62,
    z: -1350,
    radius: 14,
    kind: "place",
    line: "Stone shoulders against the sea.",
    story:
      "Bekal Fort in Kasaragod rises straight from the shoreline, its laterite bastions built for watching the sea, not for palaces. This game fort borrows that silhouette: a round seaward tower, long walls, and the Arabian Sea on three sides.",
  },
  {
    id: "theyyam",
    name: "The Theyyam Ground",
    x: 128,
    z: -1150,
    radius: 10,
    kind: "culture",
    line: "When the drums begin, the performer is no longer only human.",
    story:
      "Theyyam is a living ritual of northern Malabar. Through towering headgear, painted faces, firelight, and drumming, the performer embodies the deity and blesses the gathered village. This clearing honours the form from a respectful distance — the real thing belongs to its kavu and its community.",
  },
  // HIGH RANGES
  {
    id: "teahills",
    name: "Elavara Tea Estate",
    x: 563,
    z: -262,
    radius: 11,
    kind: "culture",
    npc: "Thanka",
    action: "Learn to pluck tea",
    handsOn: {
      prompt: "Two leaves and a bud. Again, gently.",
      button: "Pluck a round",
    },
    line: "A green staircase climbing into the mist.",
    story:
      "Munnar's slopes in Idukki are wrapped in contoured tea rows planted over a century ago. Pluckers work the bushes in rounds — two leaves and a bud — and the hills smell of rain and fresh leaf.",
    hint: 'Thanka: "The falls are just down the road, and past them the road climbs to the cloud viewpoint. Sound carries up here — you will hear the water first."',
  },
  {
    id: "waterfall",
    name: "Silverthread Falls",
    x: 610,
    z: -196,
    radius: 10,
    kind: "place",
    line: "The mountain, letting go of the monsoon.",
    story:
      "Kerala's ghats are stitched with waterfalls — Athirappilly's broad thunder, Meenmutty's tiers, countless roadside threads that appear with the rains. This one pours off the high ranges into a cold green pool.",
  },
  {
    id: "viewpoint",
    name: "Cloudline Viewpoint",
    x: 690,
    z: -330,
    radius: 12,
    kind: "place",
    line: "From up here, the whole coast is one green story.",
    story:
      "From viewpoints in Wayanad and Idukki, Kerala unrolls westward: tea, forest, river, paddy, backwater, and finally the sea. Stand at the rail and trace the road you travelled to get here.",
  },
  {
    id: "meadow",
    name: "The Elephant Meadow",
    x: 470,
    z: -500,
    radius: 9,
    kind: "hidden",
    line: "You are a guest here. The forest is theirs.",
    story:
      "In the forests of Wayanad and the Periyar reserve, wild elephants still move along old paths. You found a quiet meadow where a small family grazes. Watch from where you are — distance is the deepest form of respect in elephant country.",
  },
  // TRAVANCORE SOUTH
  {
    id: "lagoon",
    name: "Ashtamudi Reach",
    x: 138,
    z: 442,
    radius: 10,
    kind: "place",
    line: "Eight arms of quiet water.",
    story:
      "Ashtamudi Lake in Kollam — 'eight braids' — is the gateway to the southern backwaters, wider and windier than the canals of Alappuzha. Chinese fishing nets and houseboats share its silver reaches.",
  },
  {
    id: "lighthouse",
    name: "The Red-Banded Lighthouse",
    x: -70,
    z: 638,
    radius: 11,
    kind: "place",
    line: "A candy-striped watchman over the surf.",
    story:
      "The red-and-white lighthouse above Kovalam's beaches is one of south Kerala's best-loved landmarks. Climb any southern headland at dusk and you will find its beam sweeping the fishing boats home.",
  },
  {
    id: "southstreet",
    name: "The Old Durbar Street",
    x: 32,
    z: 560,
    radius: 10,
    kind: "food",
    npc: "Ammini",
    action: "Share a banana-leaf sadya",
    line: "History on one side, lunch on the other.",
    story:
      "Thiruvananthapuram's old quarter mixes heritage facades and temple lanes with everyday life. A proper sadya — rice, sambar, avial, thoran, payasam — is served on a banana leaf, and Ammini insists you eat with your hand.",
    hint: 'Ammini: "Walk it off along the sea road — the lighthouse is just west, and the lagoon jetty is up the highway past the town."',
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
  {
    id: "old-ways",
    name: "The Old Ways",
    description: "Reach the paddy fields and find the sacred grove.",
    requires: ["paddy", "kavu"],
    source: "discoveries",
    badge: "Keeper of Old Ways",
  },
  {
    id: "central-run",
    name: "Rivers and Processions",
    description: "Follow the highway north: ghat, Pooram ground, Spice Lane.",
    requires: ["riverghat", "templeground", "spicelane"],
    source: "discoveries",
    badge: "Heritage Rambler",
  },
  {
    id: "malabar-road",
    name: "The Malabar Road",
    description:
      "Reach the beach market, the sea fort, and the Theyyam ground.",
    requires: ["beachmarket", "fort", "theyyam"],
    source: "discoveries",
    badge: "Malabar Pilgrim",
  },
  {
    id: "high-ranges",
    name: "Into the High Ranges",
    description: "Climb the hill road to tea, falls, and the cloud viewpoint.",
    requires: ["teahills", "waterfall", "viewpoint"],
    source: "discoveries",
    badge: "Mist Walker",
  },
  {
    id: "southern-lights",
    name: "Southern Lights",
    description:
      "Ride south to the lagoon, the old street, and the lighthouse.",
    requires: ["lagoon", "southstreet", "lighthouse"],
    source: "discoveries",
    badge: "Southern Soul",
  },
  {
    id: "quiet-moments",
    name: "Sit With Kerala",
    description:
      "Rest at the driftwood log, the ghat step, and the cloudline bench.",
    requires: ["beach-log", "ghat-step", "viewpoint-bench"],
    source: "moments",
    badge: "Still Water",
  },
];

export const ranks = [
  { at: 0, title: "New Arrival" },
  { at: 4, title: "Coastal Wanderer" },
  { at: 8, title: "Backwater Regular" },
  { at: 13, title: "Village Storyteller" },
  { at: 19, title: "District Rambler" },
  { at: 26, title: "Kerala Yatri" },
  { at: 33, title: "Naattukaaran — A Local at Heart" },
];

export function rankFor(journey) {
  const score =
    journey.discoveries.length +
    journey.interactions.length +
    (journey.moments || []).length +
    activities.filter((a) =>
      a.requires.every((id) => (journey[a.source] || []).includes(id)),
    ).length;
  let current = ranks[0];
  for (const rank of ranks) if (score >= rank.at) current = rank;
  const next = ranks[ranks.indexOf(current) + 1] || null;
  return { ...current, score, next };
}

export const SCOOTER_HOME = { x: 9, z: 70 };

// A paddled canoe, not a speedboat: it builds way over several strokes, tops
// out well below a run, and keeps gliding for a while after you stop paddling.
export const BOAT = {
  forward: 4.6,
  reverse: 2,
  turn: 1.15,
  accelerate: 1.5,
  glide: 0.55,
};

export function stepBoat({ heading, speed, turn = 0, thrust = 0, dt }) {
  const nextHeading = heading - turn * dt * BOAT.turn;
  const target = thrust > 0 ? thrust * BOAT.forward : thrust * BOAT.reverse;
  const gaining = Math.abs(target) > Math.abs(speed);
  const response = gaining ? BOAT.accelerate : BOAT.glide;
  let nextSpeed = speed + (target - speed) * Math.min(1, dt * response);
  if (Math.abs(nextSpeed) < 0.02) nextSpeed = 0;
  return {
    heading: nextHeading,
    speed: nextSpeed,
    dx: -Math.sin(nextHeading) * nextSpeed,
    dz: -Math.cos(nextHeading) * nextSpeed,
  };
}

// Naadan bus stands: one gateway per region, opened by overall progress so the
// map keeps widening as you explore. Reaching a region yourself opens it early.
export const REGION_GATEWAYS = [
  {
    id: "gw-backwaters",
    region: "backwaters",
    name: "Kadal Village Stand",
    x: 10,
    z: 84,
    at: 0,
  },
  {
    id: "gw-central",
    region: "central",
    name: "Periyar Bridge Stand",
    x: 20,
    z: -632,
    at: 3,
  },
  {
    id: "gw-malabar",
    region: "malabar",
    name: "Chandhapura Beach Stand",
    x: -36,
    z: -1000,
    at: 6,
  },
  {
    id: "gw-highlands",
    region: "highlands",
    name: "Elavara Hill Stand",
    x: 554,
    z: -252,
    at: 9,
  },
  {
    id: "gw-south",
    region: "south",
    name: "Ashtamudi Jetty Stand",
    x: 128,
    z: 452,
    at: 12,
  },
];

// Everywhere the bus will take you: region stands you have unlocked, plus every
// place you have already found. First visits are earned; return trips are free.
export function travelDestinations(journey) {
  const found = new Set(journey?.discoveries || []);
  const gateways = REGION_GATEWAYS.map((gateway) => {
    const reached = sites.some(
      (s) => found.has(s.id) && regionAt(s.x, s.z).id === gateway.region,
    );
    return {
      ...gateway,
      kind: "gateway",
      unlocked: gateway.at === 0 || reached || found.size >= gateway.at,
      remaining: Math.max(0, gateway.at - found.size),
    };
  });
  const visited = sites
    .filter((s) => found.has(s.id))
    .map((s) => ({
      id: `site-${s.id}`,
      siteId: s.id,
      name: s.name,
      x: s.x,
      z: s.z,
      region: regionAt(s.x, s.z).id,
      kind: "site",
      unlocked: true,
    }));
  return [...gateways, ...visited];
}

// Quiet rest spots: sit, breathe, and let the camera drink in the view.
// `face` is the yaw the seated player looks along; the seat prop goes behind them.
export const REST_SPOTS = [
  {
    id: "beach-log",
    name: "The Driftwood Log",
    x: -70,
    z: 18,
    face: Math.PI / 2,
    seat: "log",
    line: "The fishing boats rock. The sea keeps its own slow time.",
  },
  {
    id: "lookout-bench",
    name: "The Lookout Bench",
    x: 80.5,
    z: 114,
    face: Math.PI,
    seat: "none",
    line: "Coast, village, canal — the whole first chapter in one view.",
  },
  {
    id: "paddy-bund",
    name: "The Paddy Bund",
    x: -47,
    z: -95,
    face: Math.PI,
    seat: "bench",
    line: "Wind writes moving lines across the young rice.",
  },
  {
    id: "ghat-step",
    name: "The Ghat Step",
    x: 30,
    z: -628,
    face: Math.PI,
    seat: "none",
    line: "Cool stone underfoot. The river goes about its business.",
  },
  {
    id: "kavu-roots",
    name: "The Kavu Roots",
    x: 88,
    z: -74,
    face: -Math.PI / 2,
    seat: "log",
    line: "Under the old tree, even your breathing slows down.",
  },
  {
    id: "viewpoint-bench",
    name: "The Cloudline Bench",
    x: 691,
    z: -326,
    face: -2.2,
    seat: "bench",
    line: "From up here, the road you travelled is a thin gold thread.",
  },
  {
    id: "lighthouse-rail",
    name: "The Lighthouse Rail",
    x: -66,
    z: 634,
    face: Math.PI / 2,
    seat: "bench",
    line: "Surf below, beam above, and the evening going soft.",
  },
];

export const buildings = [
  // Kadal Village (the original backwater chapter)
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
  // Central Kerala: Spice Lane flanking the highway
  { x: -13, z: -860, w: 8, d: 9, color: "#e7c9a1", type: "spice" },
  { x: -13, z: -876, w: 8, d: 8, color: "#d3b98e" },
  { x: 15, z: -864, w: 9, d: 9, color: "#e0d2ae" },
  { x: 15, z: -880, w: 8, d: 8, color: "#cbb894" },
  { x: 108, z: -748, w: 9, d: 9, color: "#f0dda6" },
  // Malabar: beach market shacks
  { x: -40, z: -992, w: 7, d: 8, color: "#e8d3a8" },
  { x: -52, z: -1014, w: 8, d: 8, color: "#d9c9a4" },
  { x: -32, z: -1018, w: 7, d: 7, color: "#e2bfa0", type: "market" },
  // High Ranges: hill-station cottages and the estate office
  { x: 545, z: -292, w: 8, d: 8, color: "#e8e0c8" },
  { x: 557, z: -282, w: 7, d: 8, color: "#dce1be" },
  { x: 572, z: -246, w: 8, d: 7, color: "#f0d7a0", type: "tea" },
  // Travancore South: the old street and the keeper's house
  { x: -12, z: 552, w: 8, d: 9, color: "#efd8b0" },
  { x: -12, z: 568, w: 8, d: 8, color: "#d8c8a2" },
  { x: 14, z: 556, w: 9, d: 8, color: "#e5c4a0", type: "sadya" },
  { x: 14, z: 572, w: 8, d: 8, color: "#cfd8b4" },
  { x: -58, z: 652, w: 7, d: 7, color: "#eee4ca" },
];

// Non-building obstacles: fort walls, gate legs, lighthouse, elephants.
export const solids = [
  ...FAITH_SPACES.map((p) => ({ x: p.x, z: p.z, w: 10, d: 12 })),
  { x: -65, z: -1372, w: 52, d: 2.4 },
  { x: -65, z: -1332, w: 52, d: 2.4 },
  { x: -91, z: -1352, w: 2.4, d: 42 },
  { x: -39, z: -1362, w: 2.4, d: 20 },
  { x: -39, z: -1339, w: 2.4, d: 14 },
  { x: 78, z: -744, w: 1.6, d: 1.6 },
  { x: 78, z: -756, w: 1.6, d: 1.6 },
  { x: -70, z: 646, w: 5, d: 5 },
  { x: 98, z: -742, w: 3, d: 5 },
  { x: 103, z: -750, w: 3, d: 5 },
  { x: 99, z: -758, w: 3, d: 5 },
  { x: 476, z: -494, w: 3, d: 5 },
  { x: 466, z: -507, w: 3, d: 5 },
];

// Roads beyond the straight coastal highway, as polylines for the map and the builder.
export const roads = [
  {
    id: "hill-road",
    width: 4,
    points: [
      [95, -90],
      [200, -98],
      [300, -60],
      [380, -118],
      [450, -200],
      [520, -238],
      [563, -262],
      [610, -215],
      [648, -262],
      [690, -325],
    ],
  },
  {
    id: "fort-road",
    width: 3.6,
    points: [
      [0, -1336],
      [-24, -1344],
      [-36, -1350],
    ],
  },
  {
    id: "market-road",
    width: 3.6,
    points: [
      [0, -998],
      [-44, -1003],
    ],
  },
  {
    id: "theyyam-road",
    width: 3.4,
    points: [
      [4, -1146],
      [124, -1150],
    ],
  },
  {
    id: "temple-road",
    width: 3.6,
    points: [
      [4, -750],
      [84, -750],
    ],
  },
  {
    id: "lagoon-road",
    width: 3.6,
    points: [
      [4, 452],
      [138, 446],
    ],
  },
  {
    id: "lighthouse-road",
    width: 3.6,
    points: [
      [-1, 642],
      [-64, 644],
    ],
  },
];

export const HIGHWAY = { x: 1.5, from: -1445, to: 860, width: 4.6 };

// Water bodies other than the sea and the village canal, for the map and builder.
export const waters = [
  { kind: "rect", x: 125, z: -600, w: 590, d: 44, name: "The Periyar" },
  { kind: "ellipse", x: 250, z: 450, rx: 92, rz: 137, name: "Ashtamudi Lake" },
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function coastX(z) {
  const blend = smooth(160, 320, Math.abs(z));
  const coast =
    -84 + blend * (Math.sin(z * 0.0035) * 16 + Math.sin(z * 0.0011) * 9 - 4);
  const headland = smooth(95, 30, Math.abs(z + 1350));
  return Math.min(coast, -84 - headland * 30);
}

export function terrainHeight(x, z) {
  // Kadal Village and its lookout hill stay exactly as originally authored.
  let h = Math.max(0, 1 - Math.hypot((x - 83) / 43, (z - 111) / 49)) ** 2 * 9;
  const rectX = Math.max(0, Math.abs(x - 12.5) - 122.5);
  const rectZ = Math.max(0, Math.abs(z) - 170);
  const away = smooth(0, 150, Math.hypot(rectX, rectZ));
  // Gentle countryside rolling everywhere outside the village.
  h += away * (Math.sin(x * 0.021) * Math.sin(z * 0.017) + 1) * 1.4;
  // The High Ranges climb to the east.
  const hi = smooth(390, 700, x);
  h +=
    away *
    hi *
    hi *
    (52 + Math.sin(z * 0.01) * 9 + Math.sin(x * 0.03 + z * 0.004) * 6);
  // Low rolling laterite beside the Kadal off-road loop.
  h += 2.2 * Math.exp(-(((x - 175) / 22) ** 2 + ((z - 80) / 20) ** 2));
  h += 1.6 * Math.exp(-(((x - 205) / 18) ** 2 + ((z - 123) / 18) ** 2));
  // Malabar's low laterite shelf.
  h += away * smooth(-950, -1150, z) * (2.2 + Math.sin(x * 0.05) * 0.8);
  // The fort headland rises over the sea.
  h += smooth(80, 40, Math.hypot((x + 65) * 1.1, z + 1350)) * 6;
  // A rocky shoulder the waterfall pours over.
  h += smooth(30, 8, Math.hypot(x - 648, z + 185)) * 14;
  // The river carves through, except under the two bridge causeways.
  const riverDist = Math.abs(z + 600);
  if (riverDist < 34 && x < 430) {
    const keep = Math.max(
      smooth(9, 5, Math.abs(x - 2)),
      smooth(9, 5, Math.abs(x - 155)),
    );
    const carve = smooth(34, 12, riverDist) * (1 - keep);
    h = h * (1 - carve) - 2.6 * carve;
  }
  // Ashtamudi lagoon.
  const lag = ((x - 250) / 95) ** 2 + ((z - 450) / 140) ** 2;
  if (lag < 1.6) {
    const keep = smooth(0.85, 1.35, lag);
    h = h * keep - 2.6 * (1 - keep);
  }
  // The waterfall's plunge pool sits on a mountain terrace.
  const pool = Math.hypot(x - 620, z + 185);
  if (pool < 16) {
    const c = smooth(15, 7, pool);
    h = h * (1 - c) + 22.5 * c;
  }
  // Land slopes into the sea along the whole coast.
  const c = coastX(z);
  if (x < c + 14) {
    const t = smooth(c + 14, c - 16, x);
    h = h * (1 - t) - 3 * t;
  }
  return h;
}

const blocked = (x, z, list, margin = 0.6) =>
  list.some(
    (b) =>
      Math.abs(x - b.x) < b.w / 2 + margin &&
      Math.abs(z - b.z) < b.d / 2 + margin,
  );

export function canWalk(x, z) {
  const b = REGION.bounds;
  if (x < b.minX || x > b.maxX || z < b.minZ || z > b.maxZ) return false;
  if (x < coastX(z) + 1) return false;
  if (
    x > 29 &&
    x < 47 &&
    z > -150 &&
    z < 150 &&
    Math.abs(z) > 5 &&
    Math.abs(z + 90) > 5
  )
    return false;
  if (
    Math.abs(z + 600) < 26 &&
    x < 430 &&
    Math.abs(x - 2) > 5 &&
    Math.abs(x - 155) > 5
  )
    return false;
  if (((x - 250) / 95) ** 2 + ((z - 450) / 140) ** 2 < 1.28) return false;
  if (Math.hypot(x - 620, z + 185) < 9) return false;
  if (Math.hypot(x - 77, z + 122) < 4.7) return false;
  if (blocked(x, z, solids)) return false;
  return !blocked(x, z, buildings);
}

export function cellAt(x, z) {
  const b = REGION.bounds;
  return `${Math.floor((x - b.minX) / REGION.cellSize)},${Math.floor(
    (z - b.minZ) / REGION.cellSize,
  )}`;
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
                  : key === "moments"
                    ? REST_SPOTS.some((s) => s.id === id)
                    : sites.some((s) => s.id === id),
              ),
            ),
          ]
        : [];
    const position = data?.position;
    return {
      v: 2,
      life: data?.life,
      assistance: data?.assistance === true,
      captions: data?.captions === true,
      discoveries: clean("discoveries"),
      interactions: clean("interactions"),
      moments: clean("moments"),
      // Cell coordinates changed when the world grew; older fog resets, discoveries stay.
      cells: data?.v === 2 ? clean("cells") : [],
      position:
        position &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.z) &&
        canWalk(position.x, position.z)
          ? position
          : REGION.spawn,
      scooter:
        data?.scooter &&
        Number.isFinite(data.scooter.x) &&
        Number.isFinite(data.scooter.z) &&
        canWalk(data.scooter.x, data.scooter.z)
          ? data.scooter
          : SCOOTER_HOME,
    };
  } catch {
    return {
      v: 2,
      discoveries: [],
      interactions: [],
      moments: [],
      cells: [],
      position: REGION.spawn,
      scooter: SCOOTER_HOME,
    };
  }
}
