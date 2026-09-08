import { COMMUNITY_PEOPLE, FAITH_SPACES, SEVENS } from "./community-data.js";
import { canWalk } from "./world.js";
const gap = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function createCommunity(saved) {
  return {
    people: COMMUNITY_PEOPLE.map((d) => {
      const old = saved?.people?.find?.((p) => p.id === d.id);
      const valid =
        old &&
        Number.isFinite(old.x) &&
        Number.isFinite(old.z) &&
        gap(old, d.home) < 85 &&
        canWalk(old.x, old.z);
      return {
        id: d.id,
        ...(valid ? { x: old.x, z: old.z } : d.home),
        moving: false,
        heading: valid && Number.isFinite(old.heading) ? old.heading : 0,
      };
    }),
    active: saved?.active === true,
    passes: Number.isInteger(saved?.passes)
      ? Math.max(0, Math.min(1e8, saved.passes))
      : 0,
    progress: Number.isFinite(saved?.progress)
      ? Math.max(0, Math.min(1, saved.progress))
      : 0,
  };
}
export function stepCommunity(life, dt) {
  const c = life.community,
    hour = (life.clock / 120) % 24;
  c.people.forEach((p, i) => {
    const d = COMMUNITY_PEOPLE[i];
    const visiting = hour >= d.start && hour < d.end;
    let target = visiting
      ? life.weather.sheltering
        ? d.shelter
        : d.visit
      : d.home;
    const playing =
      d.place === "sevens" && visiting && !life.weather.sheltering && c.active;
    if (playing) {
      const ball = communityBall(c),
        local = i - 9;
      const chasing =
        local === ((c.passes + 1) * 5) % 14 ||
        local === ((c.passes + 1) * 5 + 7) % 14;
      target = chasing
        ? ball
        : {
            x: d.visit.x * 0.65 + ball.x * 0.35,
            z: d.visit.z * 0.65 + ball.z * 0.35,
          };
      target = {
        x: Math.max(40, Math.min(70, target.x)),
        z: Math.max(-1058, Math.min(-1022, target.z)),
      };
    }
    const distance = gap(p, target),
      step = Math.min(
        distance,
        dt * (playing ? 3.5 : life.weather.sheltering ? 2.4 : 1.7),
      );
    p.moving = distance > 0.02;
    if (p.moving) {
      const x = p.x + ((target.x - p.x) * step) / distance,
        z = p.z + ((target.z - p.z) * step) / distance;
      if (canWalk(x, z)) {
        p.heading = Math.atan2(p.x - x, p.z - z);
        p.x = x;
        p.z = z;
      }
    }
    p.mode = playing
      ? "visiting"
      : gap(p, target) > 0.03
        ? "walking"
        : !visiting
          ? "home"
          : life.weather.sheltering
            ? "sheltering"
            : "visiting";
  });
  const players = c.people.slice(9);
  c.active =
    life.weather.rain < 0.15 &&
    life.weather.wetness < 0.5 &&
    players.every((p) => p.mode === "visiting");
  if (c.active) {
    c.progress += dt / 2.5;
    while (c.progress >= 1) {
      c.progress--;
      c.passes++;
    }
    const ball = communityBall(c);
    players.forEach((p) => {
      p.heading = Math.atan2(p.x - ball.x, p.z - ball.z);
    });
  } else c.progress = 0;
}
export function communityBall(c) {
  const players = c.people.slice(9);
  const from = players[(c.passes * 5) % 14],
    to = players[((c.passes + 1) * 5) % 14];
  return c.active
    ? {
        x: from.x + (to.x - from.x) * c.progress,
        z: from.z + (to.z - from.z) * c.progress,
      }
    : { x: SEVENS.x, z: SEVENS.z + 22 };
}
export function communityCue(life, player) {
  if (life.community.active && gap(player, SEVENS) < 65)
    return { ...SEVENS, text: "A ball being passed at the Malabar ground" };
  for (const place of FAITH_SPACES) {
    if (
      gap(player, { x: place.x + 9, z: place.z }) < 22 &&
      life.community.people.some(
        (p) => p.id.startsWith(place.id) && p.mode === "visiting",
      )
    )
      return {
        x: place.x + 9,
        z: place.z,
        text: `Neighbours in ${place.name.toLowerCase()}`,
      };
  }
  return null;
}
