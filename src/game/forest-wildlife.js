import { clearForestStep } from "./forest-layout.js";
import { canWalk } from "./world.js";
export const FOREST_DEER = [
  { x: 513, z: -94 },
  { x: 520, z: -87 },
  { x: 509, z: -79 },
];
export function createForestWildlife(saved) {
  return FOREST_DEER.map((home, i) => {
    const p = saved?.[i];
    const valid =
      Number.isFinite(p?.x) &&
      Number.isFinite(p?.z) &&
      Math.hypot(p.x - home.x, p.z - home.z) < 45 &&
      canWalk(p.x, p.z) &&
      clearForestStep(p.x, p.z, p.x, p.z);
    return {
      ...(valid ? { x: p.x, z: p.z } : home),
      heading: Number.isFinite(p?.heading) ? p.heading : 0,
      mode: ["grazing", "alert", "retreating", "resting", "walking"].includes(
        p?.mode,
      )
        ? p.mode
        : "grazing",
      calm: Number.isFinite(p?.calm) ? Math.max(0, Math.min(8, p.calm)) : 0,
    };
  });
}
export function stepForestWildlife(life, dt, player) {
  const hour = (life.clock / 120) % 24;
  life.forestWildlife.forEach((p, i) => {
    const home = FOREST_DEER[i];
    const distance = player
      ? Math.hypot(p.x - player.x, p.z - player.z)
      : Infinity;
    const jeepNear =
      Math.abs(life.jeep.speed) > 3 &&
      Math.hypot(p.x - life.jeep.x, p.z - life.jeep.z) < 32;
    const startled = distance < 12 || jeepNear;
    if (startled) p.calm = 8;
    else p.calm = Math.max(0, p.calm - dt);
    let x = p.x,
      z = p.z,
      speed = 0;
    if (startled || p.calm > 4) {
      p.mode = "retreating";
      speed = 3.4;
      const threat = jeepNear ? life.jeep : player;
      const dx = p.x - (threat?.x ?? home.x - 1),
        dz = p.z - (threat?.z ?? home.z);
      const gap = Math.hypot(dx, dz) || 1;
      x = p.x + (dx / gap) * dt * speed;
      z = p.z + (dz / gap) * dt * speed;
    } else if (distance < 23 || p.calm > 0) p.mode = "alert";
    else if (hour < 6 || hour > 19 || life.weather.rain > 0.4)
      p.mode = "resting";
    else {
      const target = {
        x: home.x + Math.sin(life.clock * 0.018 + i) * 4,
        z: home.z + Math.cos(life.clock * 0.013 + i) * 4,
      };
      const gap = Math.hypot(target.x - p.x, target.z - p.z);
      p.mode = gap > 1 ? "walking" : "grazing";
      if (gap > 1) {
        speed = 0.65;
        x += ((target.x - p.x) / gap) * dt * speed;
        z += ((target.z - p.z) / gap) * dt * speed;
      }
    }
    if (speed) {
      const dx = x - p.x,
        dz = z - p.z;
      let moved = false;
      // Try a few nearby headings rather than stopping against a trunk.
      for (const turn of [0, 0.55, -0.55, 1.1, -1.1]) {
        const nx = p.x + dx * Math.cos(turn) - dz * Math.sin(turn);
        const nz = p.z + dx * Math.sin(turn) + dz * Math.cos(turn);
        if (
          Math.hypot(nx - home.x, nz - home.z) >= 40 ||
          !canWalk(nx, nz) ||
          !clearForestStep(p.x, p.z, nx, nz) ||
          life.forestWildlife.some(
            (other, j) =>
              j !== i && Math.hypot(nx - other.x, nz - other.z) < 1.1,
          )
        )
          continue;
        p.heading = Math.atan2(p.x - nx, p.z - nz);
        p.x = nx;
        p.z = nz;
        moved = true;
        break;
      }
      if (!moved) p.mode = "alert";
    }
  });
}
