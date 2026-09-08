// A physical service shares the village clock; convenience travel stays separate.
export const BUS_STOPS = [
  { name: "Kadal Village Stand", x: 8, z: 84 },
  { name: "Periyar Bridge Stand", x: 8, z: -632 },
];
const ROAD_X = 1.5;
const LENGTH = BUS_STOPS[0].z - BUS_STOPS[1].z;
const clamp = (n, a, b, fallback) =>
  Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : fallback;
export function createBus(saved) {
  const stop = saved?.stop === 1 ? 1 : 0;
  const travelling = saved?.phase === "travelling";
  return {
    stop,
    phase: travelling
      ? "travelling"
      : saved?.phase === "waiting"
        ? "waiting"
        : "boarding",
    progress: travelling ? clamp(saved.progress, 0, 1, 0) : 0,
    remaining: clamp(saved?.remaining, 0, 35, 35),
    trips: Math.floor(clamp(saved?.trips, 0, 1e8, 0)),
    player: saved?.player === true,
    boardedTrip: Math.floor(clamp(saved?.boardedTrip, 0, 1e8, 0)),
    yielding: false,
    commuters: ["Madhan", "Sreedevi"].map((name, i) => {
      const old =
        Array.isArray(saved?.commuters) &&
        saved.commuters.find((p) => p?.name === name);
      const at = old?.stop === 1 ? 1 : 0;
      return {
        name,
        stop: at,
        aboard: travelling && old?.aboard === true,
        x: clamp(old?.x, 8, 26, 8),
        z: BUS_STOPS[at].z + i * 1.5,
      };
    }),
  };
}
export function busPosition(bus) {
  return {
    x: ROAD_X,
    z:
      BUS_STOPS[bus.stop].z +
      (BUS_STOPS[1 - bus.stop].z - BUS_STOPS[bus.stop].z) * bus.progress,
    heading: bus.stop === 0 ? 0 : Math.PI,
  };
}
export function stepBus(bus, dt, hour, rain, pedestrians = []) {
  const desired = hour >= 7 && hour < 16 ? 1 : 0;
  for (const person of bus.commuters) {
    if (person.aboard) continue;
    const target = person.stop === desired ? 26 : 8;
    person.x +=
      Math.sign(target - person.x) *
      Math.min(Math.abs(target - person.x), dt * 1.4);
  }
  bus.yielding = false;
  if (bus.phase === "travelling") {
    const at = busPosition(bus),
      direction = bus.stop === 0 ? -1 : 1;
    bus.yielding = pedestrians.some(
      (p) =>
        Math.abs(p.x - at.x) < 2.3 &&
        (p.z - at.z) * direction > -1 &&
        (p.z - at.z) * direction < 10,
    );
    if (bus.yielding) return;
    bus.progress = Math.min(
      1,
      bus.progress + (dt * (rain > 0.4 ? 7 : 10)) / LENGTH,
    );
    if (bus.progress >= 1) {
      bus.stop = 1 - bus.stop;
      bus.phase = "boarding";
      bus.progress = 0;
      bus.remaining = 35;
      bus.trips++;
      bus.commuters.forEach((p, i) => {
        if (p.aboard)
          Object.assign(p, {
            aboard: false,
            stop: bus.stop,
            x: 8,
            z: BUS_STOPS[bus.stop].z + i * 1.5,
          });
      });
    }
    return;
  }
  if (hour < 6 || hour >= 20) {
    bus.phase = "waiting";
    return;
  }
  bus.phase = "boarding";
  bus.remaining = Math.max(0, bus.remaining - dt);
  if (!bus.remaining) {
    bus.commuters.forEach((p) => {
      p.aboard = p.stop === bus.stop && p.stop !== desired && p.x <= 8.1;
    });
    bus.phase = "travelling";
  }
}
export function boardBus(bus, player) {
  const stop = BUS_STOPS[bus.stop];
  if (
    bus.player ||
    bus.phase !== "boarding" ||
    Math.hypot(player.x - stop.x, player.z - stop.z) >= 6
  )
    return false;
  bus.player = true;
  bus.boardedTrip = bus.trips;
  return true;
}
export function leaveBus(bus) {
  if (!bus.player || bus.phase === "travelling") return false;
  bus.player = false;
  return true;
}
