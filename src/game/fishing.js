export const FISH_LANDING = { x: -76, z: 12 };
export const FISH_MARKET = { x: -8, z: 44 };
export const FISH_ROUTE = [
  FISH_LANDING,
  { x: 0, z: 12 },
  { x: 0, z: 44 },
  FISH_MARKET,
];
const lengths = FISH_ROUTE.slice(1).map((p, i) =>
  Math.hypot(p.x - FISH_ROUTE[i].x, p.z - FISH_ROUTE[i].z),
);
const length = lengths.reduce((a, b) => a + b, 0);
const phases = [
  "resting",
  "outbound",
  "fishing",
  "returning",
  "unloading",
  "delivering",
  "walking-home",
];
const bound = (n, max, fallback = 0) =>
  Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : fallback;
export function createFishing(saved) {
  const f = {
    buyer: bound(saved?.buyer, 1),
    phase: phases.includes(saved?.phase) ? saved.phase : "resting",
    progress: bound(saved?.progress, 1),
    remaining: bound(saved?.remaining, 120),
    effort: bound(saved?.effort, 90),
    trip: Math.floor(bound(saved?.trip, 1e8)),
    helped: Math.floor(bound(saved?.helped, 1e8)),
    cargo: Math.floor(bound(saved?.cargo, 6)),
    stock: Math.floor(bound(saved?.stock, 6)),
    age: bound(saved?.age, 240),
    sale: bound(saved?.sale, 30, 30),
    sold: Math.floor(bound(saved?.sold, 1e8)),
    spoiled: Math.floor(bound(saved?.spoiled, 1e8)),
    caught: Math.floor(bound(saved?.caught, 1e8)),
  };
  return f;
}
export function fishingPosition(f) {
  const atSea = ["outbound", "fishing", "returning"].includes(f.phase);
  if (atSea) {
    const t =
      f.phase === "outbound"
        ? f.progress
        : f.phase === "returning"
          ? 1 - f.progress
          : 1;
    return {
      x: -89 - t * 36,
      z: 12 - t * 18,
      heading: f.phase === "returning" ? -Math.PI * 0.65 : Math.PI * 0.35,
      atSea: true,
    };
  }
  let d =
    (f.phase === "delivering"
      ? f.progress
      : f.phase === "walking-home"
        ? 1 - f.progress
        : 0) * length;
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const a = FISH_ROUTE[i],
        b = FISH_ROUTE[i + 1],
        t = d / lengths[i],
        sign = f.phase === "walking-home" ? -1 : 1;
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        heading: Math.atan2(-(b.x - a.x) * sign, -(b.z - a.z) * sign),
        atSea: false,
      };
    }
    d -= lengths[i];
  }
}
export const fishMarketOpen = (f, hour, rain) =>
  f.stock > 0 && hour >= 6 && hour < 18 && rain < 0.65;
export function stepFishing(f, dt, hour, rain) {
  if (f.stock + f.cargo > 0) {
    f.age += dt;
    if (f.age >= 240) {
      f.spoiled += f.stock + f.cargo;
      f.stock = 0;
      f.cargo = 0;
      f.age = 0;
    }
  }
  const trading = fishMarketOpen(f, hour, rain);
  f.buyer = Math.max(0, Math.min(1, f.buyer + (dt * (trading ? 1 : -1)) / 6));
  if (trading && f.buyer === 1) {
    f.sale -= dt;
    if (f.sale <= 0) {
      f.stock--;
      f.sold++;
      f.sale = 30;
    }
  }
  const next = (phase) => {
    f.phase = phase;
    f.progress = 0;
  };
  if (f.phase === "resting") {
    f.remaining = Math.max(0, f.remaining - dt);
    if (
      hour >= 6 &&
      hour < 11 &&
      rain < 0.4 &&
      f.remaining === 0 &&
      f.stock === 0
    ) {
      f.trip++;
      f.effort = 0;
      next("outbound");
    }
  } else if (f.phase === "outbound") {
    f.progress = Math.min(1, f.progress + dt / 20);
    if (rain > 0.65) {
      f.progress = 1 - f.progress;
      f.phase = "returning";
    } else if (f.progress === 1) next("fishing");
  } else if (f.phase === "fishing") {
    f.effort = Math.min(90, f.effort + dt);
    if (f.effort === 90 || rain > 0.65 || hour >= 11) {
      f.cargo = Math.floor(((3 + (f.trip % 3)) * f.effort) / 90);
      f.caught += f.cargo;
      f.age = 0;
      next("returning");
    }
  } else if (f.phase === "returning") {
    f.progress = Math.min(1, f.progress + dt / 20);
    if (f.progress === 1) {
      next(f.cargo ? "unloading" : "resting");
      f.remaining = f.cargo ? 24 : 60;
    }
  } else if (f.phase === "unloading") {
    if (rain < 0.65) f.remaining = Math.max(0, f.remaining - dt);
    if (f.remaining === 0 || f.cargo === 0)
      next(f.cargo ? "delivering" : "resting");
  } else {
    f.progress = Math.min(
      1,
      f.progress + (dt * (rain > 0.4 ? 1.15 : 1.6)) / length,
    );
    if (f.progress === 1) {
      if (f.phase === "delivering") {
        f.stock += f.cargo;
        f.cargo = 0;
        f.sale = 30;
        next("walking-home");
      } else {
        next("resting");
        f.remaining = 60;
      }
    }
  }
}
export function helpFish(f, player) {
  if (
    f.phase !== "unloading" ||
    !f.cargo ||
    f.helped === f.trip ||
    Math.hypot(player.x - FISH_LANDING.x, player.z - FISH_LANDING.z) >= 6
  )
    return false;
  f.remaining = Math.max(0, f.remaining - 16);
  f.helped = f.trip;
  return true;
}
