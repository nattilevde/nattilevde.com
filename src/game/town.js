import { TOWN_PEOPLE } from "./town-data.js";
import { canWalk } from "./world.js";
export function createTown(saved) {
  return {
    people: TOWN_PEOPLE.map((d) => {
      const p = saved?.people?.find?.((p) => p.id === d.id),
        valid =
          p &&
          Number.isFinite(p.x) &&
          Number.isFinite(p.z) &&
          Math.hypot(p.x - d.route[0].x, p.z - d.route[0].z) < 250 &&
          canWalk(p.x, p.z);
      return {
        id: d.id,
        ...(valid ? { x: p.x, z: p.z } : d.route[0]),
        node:
          valid && Number.isInteger(p.node)
            ? Math.max(0, Math.min(d.route.length - 1, p.node))
            : 0,
        heading: valid && Number.isFinite(p.heading) ? p.heading : 0,
        mode: "home",
        moving: false,
      };
    }),
  };
}
export function stepTown(life, dt) {
  const h = (life.clock / 120) % 24;
  life.town.people.forEach((p, i) => {
    const d = TOWN_PEOPLE[i],
      open = h >= d.start && h < d.end && !life.weather.sheltering;
    // Reach the current route point before reversing, so rain cannot cut across buildings.
    let target = d.route[p.node];
    if (Math.hypot(target.x - p.x, target.z - p.z) < 0.03) {
      p.node = Math.max(
        0,
        Math.min(d.route.length - 1, p.node + (open ? 1 : -1)),
      );
      target = d.route[p.node];
    }
    const gap = Math.hypot(target.x - p.x, target.z - p.z),
      step = Math.min(gap, dt * (life.weather.sheltering ? 2.4 : 1.65));
    p.moving = gap > 0.03;
    if (gap > 0.001) {
      const x = p.x + ((target.x - p.x) * step) / gap,
        z = p.z + ((target.z - p.z) * step) / gap;
      if (canWalk(x, z)) {
        p.heading = Math.atan2(p.x - x, p.z - z);
        p.x = x;
        p.z = z;
      }
    }
    p.mode = p.moving
      ? "walking"
      : open && p.node === d.route.length - 1
        ? d.harbour
          ? "harbour"
          : "shopping"
        : "home";
  });
}
export function townCue(life, player) {
  const p = life.town.people.find(
    (p) =>
      p.mode === "harbour" && Math.hypot(p.x - player.x, p.z - player.z) < 30,
  );
  return p ? { ...p, text: "Boat work along the harbour front" } : null;
}
