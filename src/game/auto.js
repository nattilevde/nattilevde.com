// One local driver responds to transport arrivals, rather than circling on a timer.
export const AUTO_STOPS = [
  { name: "Kadal Auto Stand", x: 8, z: 90, land: { x: 10, z: 90 } },
  { name: "Far-bank Auto Stand", x: 52, z: 65, land: { x: 54, z: 65 } },
];
export const AUTO_ROUTE = [
  AUTO_STOPS[0],
  { x: -1.5, z: 90 },
  { x: -1.5, z: 0 },
  { x: 56.5, z: 0 },
  { x: 56.5, z: 65 },
  AUTO_STOPS[1],
];
const lengths = AUTO_ROUTE.slice(1).map((p, i) =>
  Math.hypot(p.x - AUTO_ROUTE[i].x, p.z - AUTO_ROUTE[i].z),
);
export const AUTO_LENGTH = lengths.reduce((a, b) => a + b, 0);
const bounded = (n, max, fallback = 0) =>
  Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : fallback;
export function createAuto(saved) {
  return {
    stop: saved?.stop === 1 ? 1 : 0,
    phase: saved?.phase === "travelling" ? "travelling" : "waiting",
    progress: saved?.phase === "travelling" ? bounded(saved.progress, 1) : 0,
    player: saved?.player === true,
    arrived: saved?.arrived === true,
    remaining: bounded(saved?.remaining, 60, 20),
    busSeen: bounded(saved?.busSeen, 1e8),
    ferrySeen: bounded(saved?.ferrySeen, 1e8),
    request:
      saved?.request === 0 || saved?.request === 1 ? saved.request : null,
    yielding: false,
  };
}
export function autoPosition(auto) {
  let distance =
    (auto.stop === 0 ? auto.progress : 1 - auto.progress) * AUTO_LENGTH;
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const a = AUTO_ROUTE[i],
        b = AUTO_ROUTE[i + 1],
        t = distance / lengths[i],
        direction = auto.stop === 0 ? 1 : -1;
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        heading: Math.atan2(-(b.x - a.x) * direction, -(b.z - a.z) * direction),
      };
    }
    distance -= lengths[i];
  }
}
export const autoOpen = (hour) => hour >= 6 && hour < 21;
export function stepAuto(auto, dt, hour, rain, bus, ferry, pedestrians = []) {
  if (bus.trips !== auto.busSeen) {
    auto.busSeen = bus.trips;
    if (bus.stop === 0) auto.request = 0;
  }
  if (ferry.trips !== auto.ferrySeen) {
    auto.ferrySeen = ferry.trips;
    if (ferry.stop === 1) auto.request = 1;
  }
  auto.yielding = false;
  if (auto.phase === "travelling") {
    const p = autoPosition(auto),
      dx = -Math.sin(p.heading),
      dz = -Math.cos(p.heading);
    auto.yielding = pedestrians.some((q) => {
      const x = q.x - p.x,
        z = q.z - p.z,
        ahead = x * dx + z * dz;
      return ahead > -0.2 && ahead < 5 && Math.abs(x * dz - z * dx) < 1.15;
    });
    if (auto.yielding) return;
    auto.progress = Math.min(
      1,
      auto.progress + (dt * (rain > 0.4 ? 3 : 4.5)) / AUTO_LENGTH,
    );
    if (auto.progress >= 1) {
      auto.stop = 1 - auto.stop;
      auto.progress = 0;
      auto.phase = "waiting";
      auto.remaining = 20;
      auto.arrived = auto.player;
    }
    return;
  }
  auto.remaining = Math.max(0, auto.remaining - dt);
  if (auto.player || !autoOpen(hour)) return;
  if (auto.request === auto.stop) auto.request = null;
  if (auto.request !== null && auto.remaining === 0) {
    auto.phase = "travelling";
    auto.request = null;
  }
}
export function boardAuto(auto, player, hour) {
  const stop = AUTO_STOPS[auto.stop];
  if (
    auto.player ||
    auto.phase !== "waiting" ||
    !autoOpen(hour) ||
    Math.hypot(player.x - stop.x, player.z - stop.z) >= 5
  )
    return false;
  auto.player = true;
  auto.arrived = false;
  auto.phase = "travelling";
  auto.request = null;
  return true;
}
export function leaveAuto(auto) {
  if (!auto.player || auto.phase !== "waiting") return false;
  auto.player = false;
  return true;
}
