import { canWalk, terrainHeight } from "./world.js";
export const JEEP_HOME = { x: 13, z: 78 };
export function jeepFootprint(x, z, heading) {
  for (const side of [-1.15, 0, 1.15])
    for (const end of [-2, 0, 2]) {
      if (
        !canWalk(
          x + side * Math.cos(heading) - end * Math.sin(heading),
          z - side * Math.sin(heading) - end * Math.cos(heading),
        )
      )
        return false;
    }
  return true;
}
export function createJeep(saved) {
  const heading = Number.isFinite(saved?.heading) ? saved.heading : 0;
  const valid =
    Number.isFinite(saved?.x) &&
    Number.isFinite(saved?.z) &&
    jeepFootprint(saved.x, saved.z, heading);
  const at = valid ? saved : JEEP_HOME;
  return {
    x: at.x,
    z: at.z,
    heading,
    speed: 0,
    lateral: 0,
    steer: 0,
    y: terrainHeight(at.x, at.z),
    vy: 0,
    pitch: 0,
    roll: 0,
    travel: 0,
    remainder: 0,
  };
}
export function jeepExit(j) {
  for (const side of [1, -1])
    for (const offset of [2.2, 3.2]) {
      const x = j.x + Math.cos(j.heading) * side * offset,
        z = j.z - Math.sin(j.heading) * side * offset;
      if (canWalk(x, z)) return { x, z };
    }
  return null;
}
export function advanceJeep(j, seconds, input = {}, rain = 0, obstacles = []) {
  j.remainder += Math.min(0.25, Math.max(0, seconds));
  const dt = 1 / 120;
  while (j.remainder + 1e-9 >= dt) {
    j.remainder -= dt;
    const throttle = Math.max(-1, Math.min(1, input.throttle || 0));
    const steerTarget =
      (Math.max(-1, Math.min(1, input.steer || 0)) * 0.52) /
      (1 + Math.abs(j.speed) / 20);
    j.steer += (steerTarget - j.steer) * (1 - Math.exp(-5 * dt));
    const front = terrainHeight(
      j.x - Math.sin(j.heading) * 1.5,
      j.z - Math.cos(j.heading) * 1.5,
    );
    const rear = terrainHeight(
      j.x + Math.sin(j.heading) * 1.5,
      j.z + Math.cos(j.heading) * 1.5,
    );
    const slope = (front - rear) / 3;
    const braking =
      input.brake ||
      (throttle &&
        Math.sign(throttle) !== Math.sign(j.speed) &&
        Math.abs(j.speed) > 0.4);
    const drag = 0.45 * j.speed + 0.017 * j.speed * Math.abs(j.speed);
    j.speed +=
      ((braking ? -Math.sign(j.speed) * 14 : throttle * (rain > 0.4 ? 6 : 8)) -
        drag -
        slope * 7) *
      dt;
    if (braking && Math.abs(j.speed) < 0.2) j.speed = 0;
    if (!throttle && Math.abs(j.speed) < 0.08) j.speed = 0;
    j.speed = Math.max(-5, Math.min(22, j.speed));
    const turn = (-j.speed / 3) * Math.tan(j.steer);
    const nextHeading = j.heading + turn * dt;
    j.lateral +=
      (-turn * j.speed * 0.12 - j.lateral * (rain > 0.4 ? 3 : 7)) * dt;
    const nx =
      j.x +
      (-Math.sin(nextHeading) * j.speed + Math.cos(nextHeading) * j.lateral) *
        dt;
    const nz =
      j.z +
      (-Math.cos(nextHeading) * j.speed - Math.sin(nextHeading) * j.lateral) *
        dt;
    const safe =
      jeepFootprint(nx, nz, nextHeading) &&
      Math.abs(terrainHeight(nx, nz) - terrainHeight(j.x, j.z)) <
        Math.hypot(nx - j.x, nz - j.z) * 0.75 + 0.005 &&
      !obstacles.some((p) => Math.hypot(p.x - nx, p.z - nz) < 3.2);
    if (safe) {
      j.x = nx;
      j.z = nz;
      j.heading = nextHeading;
      j.travel += j.speed * dt;
    } else {
      j.speed = 0;
      j.lateral = 0;
    }
    const ground = terrainHeight(j.x, j.z);
    j.vy += ((ground - j.y) * 85 - j.vy * 17) * dt;
    j.y += j.vy * dt;
    const left = terrainHeight(
      j.x - Math.cos(j.heading),
      j.z + Math.sin(j.heading),
    );
    const right = terrainHeight(
      j.x + Math.cos(j.heading),
      j.z - Math.sin(j.heading),
    );
    j.pitch += (Math.atan(slope) - j.pitch) * (1 - Math.exp(-7 * dt));
    j.roll +=
      (Math.atan((right - left) / 2) - turn * j.speed * 0.009 - j.roll) *
      (1 - Math.exp(-6 * dt));
  }
  return j;
}
