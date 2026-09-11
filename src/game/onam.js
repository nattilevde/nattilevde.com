// A fictional preparation episode over the first ten world days, not a real calendar.
export const POOKALAM = { x: -7, z: 47, name: "Kadal neighbourhood pookalam" };
export function pookalamStage(life) {
  return Math.max(1, Math.min(10, Math.floor(life.clock / 2880) + 1));
}
export function canAddFlowers(life, player) {
  const hour = (life.clock / 120) % 24;
  return (
    !life.onam?.helped &&
    hour >= 6 &&
    hour < 18 &&
    life.weather.rain < 0.2 &&
    !life.bus.player &&
    !life.auto.player &&
    !life.ferry.player &&
    Math.hypot(player.x - POOKALAM.x, player.z - POOKALAM.z) < 4
  );
}

// Home approaches connect through the lane; the paths skirt the flower carpet.
export const FLOWER_NEIGHBOURS = [
  {
    name: "Meera",
    color: "rose",
    path: [
      { x: -12, z: 65 },
      { x: 0, z: 65 },
      { x: 0, z: 50 },
      { x: -7, z: 50 },
    ],
  },
  {
    name: "Ravi",
    color: "teal",
    path: [
      { x: 9, z: 65 },
      { x: 0, z: 65 },
      { x: 0, z: 47 },
      { x: -4, z: 47 },
    ],
  },
];
const length = (path) =>
  path
    .slice(1)
    .reduce(
      (total, p, i) => total + Math.hypot(p.x - path[i].x, p.z - path[i].z),
      0,
    );
export function flowerNeighbourPosition(person, definition) {
  let remaining = person.progress;
  for (let i = 1; i < definition.path.length; i++) {
    const a = definition.path[i - 1],
      b = definition.path[i];
    const distance = Math.hypot(b.x - a.x, b.z - a.z);
    if (remaining <= distance) {
      const t = remaining / distance;
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    }
    remaining -= distance;
  }
  return { ...definition.path.at(-1) };
}
export function createOnam(saved) {
  return {
    helped: saved?.helped === true,
    neighbours: FLOWER_NEIGHBOURS.map((definition, i) => {
      const old = saved?.neighbours?.[i];
      return {
        progress: Number.isFinite(old?.progress)
          ? Math.max(0, Math.min(length(definition.path), old.progress))
          : 0,
        mode: [
          "walking",
          "arranging",
          "visiting",
          "home",
          "sheltering",
        ].includes(old?.mode)
          ? old.mode
          : "home",
        heading: Number.isFinite(old?.heading) ? old.heading : 0,
      };
    }),
  };
}
export function stepOnam(life, dt) {
  const hour = (life.clock / 120) % 24;
  life.onam.neighbours.forEach((person, i) => {
    const definition = FLOWER_NEIGHBOURS[i];
    const arranging =
      life.clock < 10 * 2880 && hour >= 7 + i * 0.15 && hour < 10;
    const visiting = hour >= 16 + i * 0.15 && hour < 17.5;
    const wet = life.weather.sheltering;
    const attending = (arranging || visiting) && !wet;
    const before = flowerNeighbourPosition(person, definition);
    const target = attending ? length(definition.path) : 0;
    const delta =
      Math.sign(target - person.progress) *
      Math.min(Math.abs(target - person.progress), dt * (wet ? 2 : 1.3));
    person.progress += delta;
    const after = flowerNeighbourPosition(person, definition);
    if (Math.abs(delta) > 0.00001)
      person.heading = Math.atan2(before.x - after.x, before.z - after.z);
    person.mode =
      person.progress !== target
        ? "walking"
        : attending
          ? arranging
            ? "arranging"
            : "visiting"
          : wet
            ? "sheltering"
            : "home";
    if (attending && person.progress === target)
      person.heading = Math.atan2(after.x - POOKALAM.x, after.z - POOKALAM.z);
  });
}

// Short, contextual lines use stable zones so the existing dialogue cooldown can
// suppress repeats. No task markers or directions to inactive events.
export function flowerNeighbourLine(life, player) {
  const nearby = life.onam.neighbours
    .map((person, i) => ({
      person,
      definition: FLOWER_NEIGHBOURS[i],
      distance: Math.hypot(
        player.x - flowerNeighbourPosition(person, FLOWER_NEIGHBOURS[i]).x,
        player.z - flowerNeighbourPosition(person, FLOWER_NEIGHBOURS[i]).z,
      ),
    }))
    .filter(({ person, distance }) => person.mode !== "home" && distance < 4)
    .sort((a, b) => a.distance - b.distance)[0];
  if (!nearby) return null;
  const { person, definition } = nearby;
  let topic, text;
  if (life.weather.sheltering) {
    topic = "rain";
    text = "Let's get under cover. We can come back when this eases.";
  } else if (person.mode === "walking") {
    topic = "walking";
    text = "We can talk in a moment, once I am off the lane.";
  } else if (life.onam.helped) {
    topic = "thanks";
    text =
      definition.name === "Meera"
        ? "That little circle you added looks lovely with the rest."
        : "Your flowers are still there. It feels like everyone's work now.";
  } else if (person.mode === "arranging") {
    topic = "flowers";
    text =
      definition.name === "Meera"
        ? "A little more colour around the edge today."
        : "Leave those petals here. Meera is working on the next ring.";
  } else if (life.rehearsal.active) {
    topic = "practice";
    text =
      "Hari's group is practising again. You can hear them from this lane.";
  } else {
    topic = "visiting";
    text = "It's nice here once the afternoon heat begins to ease.";
  }
  return {
    who: definition.name,
    text,
    zone: `onam-${definition.name}-${topic}`,
  };
}
