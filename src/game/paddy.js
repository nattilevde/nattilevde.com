import { PADDY_PEOPLE, PADDY_VILLAGE } from "./paddy-data.js";
import { canWalk } from "./world.js";
export function createPaddy(saved) {
  const old = saved?.delivery;
  const delivery = {
    x: Number.isFinite(old?.x) ? Math.max(323, Math.min(377, old.x)) : 377,
    z: 111,
    phase: ["waiting", "arriving", "unloading", "returning"].includes(
      old?.phase,
    )
      ? old.phase
      : "waiting",
    day: Number.isInteger(old?.day) ? old.day : -1,
    timer: Number.isFinite(old?.timer)
      ? Math.max(0, Math.min(20, old.timer))
      : 0,
  };
  return {
    delivery,
    people: PADDY_PEOPLE.map((d) => {
      const p = saved?.people?.find?.((p) => p.id === d.id);
      const valid =
        p &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.z) &&
        Math.hypot(p.x - d.home.x, p.z - d.home.z) < 90 &&
        canWalk(p.x, p.z);
      return {
        id: d.id,
        ...(valid ? { x: p.x, z: p.z } : d.home),
        heading: valid && Number.isFinite(p.heading) ? p.heading : 0,
        moving: false,
        mode: "home",
      };
    }),
    day: Number.isInteger(saved?.day) ? saved.day : -1,
    stock: Number.isInteger(saved?.stock)
      ? Math.max(0, Math.min(12, saved.stock))
      : 12,
    soldTo: Array.isArray(saved?.soldTo)
      ? saved.soldTo.filter((id) =>
          ["buyer-0", "buyer-1", "town-walker"].includes(id),
        )
      : [],
  };
}
export function stepPaddy(life, dt) {
  const s = life.paddy,
    h = (life.clock / 120) % 24,
    day = Math.floor(life.clock / 2880);
  if (s.day !== day) {
    s.day = day;
    s.stock = 12;
    s.soldTo = [];
  }
  s.people.forEach((p, i) => {
    const d = PADDY_PEOPLE[i],
      open = h >= d.start && h < d.end && !life.weather.sheltering;
    let target = open ? d.work : d.home;
    if (open && d.kind === "child")
      target = {
        x: d.work.x + Math.sin(life.clock * 0.3 + i * 2) * 1.7,
        z: d.work.z + Math.cos(life.clock * 0.3 + i * 2) * 2,
      };
    if (open && d.kind === "farm")
      target = {
        x: d.work.x + Math.sin(life.clock * 0.035 + i) * 3,
        z: d.work.z,
      };
    const gap = Math.hypot(target.x - p.x, target.z - p.z),
      step = Math.min(gap, dt * (d.kind === "child" ? 2.6 : 1.4));
    p.moving = gap > 0.08;
    if (gap > 0.001) {
      const x = p.x + ((target.x - p.x) * step) / gap,
        z = p.z + ((target.z - p.z) * step) / gap;
      if (canWalk(x, z)) {
        p.heading = Math.atan2(p.x - x, p.z - z);
        p.x = x;
        p.z = z;
      }
    }
    p.mode = !open
      ? gap < 0.2
        ? "home"
        : "returning"
      : Math.hypot(p.x - d.work.x, p.z - d.work.z) < 6
        ? d.kind
        : "walking";
  });
  const van = s.delivery;
  if (van.phase === "waiting" && van.day !== day && h >= 9 && h < 11) {
    van.phase = "arriving";
    van.day = day;
  }
  if (van.phase === "arriving" || van.phase === "returning") {
    const target = van.phase === "arriving" ? 323 : 377,
      direction = Math.sign(target - van.x);
    const nx =
      van.x +
      direction *
        Math.min(
          Math.abs(target - van.x),
          dt * (life.weather.sheltering ? 2 : 3),
        );
    if (
      ![...s.people, life.jeep].some((p) => Math.hypot(p.x - nx, p.z - 111) < 3)
    )
      van.x = nx;
    if (Math.abs(van.x - target) < 0.01) {
      van.phase = target === 323 ? "unloading" : "waiting";
      van.timer = 20;
    }
  }
  if (
    van.phase === "unloading" &&
    !life.weather.sheltering &&
    s.people.some((p) => p.id === "vendor" && p.mode === "market")
  ) {
    van.timer = Math.max(0, van.timer - dt);
    if (!van.timer) {
      s.stock = 12;
      van.phase = "returning";
    }
  }
  const vendor = s.people.find((p) => p.id === "vendor");
  if (vendor.mode === "market")
    for (const buyer of s.people.filter((p) => p.mode === "buyer"))
      if (
        !s.soldTo.includes(buyer.id) &&
        Math.hypot(buyer.x - vendor.x, buyer.z - vendor.z) < 10
      ) {
        s.stock = Math.max(0, s.stock - 3);
        s.soldTo.push(buyer.id);
      }
}
export function paddyCue(life, player) {
  const s = life.paddy;
  const child = s.people.find((p) => p.mode === "child");
  if (child && Math.hypot(player.x - child.x, player.z - child.z) < 28)
    return { ...child, text: "Children playing in the courtyard" };
  const market = s.people.find((p) => p.mode === "market");
  if (market && Math.hypot(player.x - market.x, player.z - market.z) < 25)
    return { ...market, text: "The produce stall is open" };
  return null;
}
