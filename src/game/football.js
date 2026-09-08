const clamp = (n, a, b, f = 0) =>
  Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : f;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function createFootball(saved) {
  return {
    x: clamp(saved?.x, 38, 72, 55),
    z: clamp(saved?.z, -1062, -1018, -1040),
    vx: clamp(saved?.vx, -25, 25),
    vz: clamp(saved?.vz, -25, 25),
    holder:
      Number.isInteger(saved?.holder) && saved.holder >= -1 && saved.holder < 14
        ? saved.holder
        : 1,
    last:
      Number.isInteger(saved?.last) && saved.last >= 0 && saved.last < 14
        ? saved.last
        : 1,
    time: clamp(saved?.time, 0, 10),
    restart: clamp(saved?.restart, 0, 12),
    shot: saved?.shot === true,
    shots: clamp(saved?.shots, 0, 1e7),
    saves: clamp(saved?.saves, 0, 1e7),
    passes: clamp(saved?.passes, 0, 1e7),
    score: [0, 1].map((i) => Math.floor(clamp(saved?.score?.[i], 0, 999))),
  };
}
export function footballTarget(c, index) {
  const f = c.football,
    players = c.people.slice(9),
    team = Math.floor(index / 7),
    dir = team ? -1 : 1;
  if (index % 7 === 0)
    return { x: clamp(f.x, 52.5, 57.5, 55), z: team ? -1022 : -1058 };
  if (f.restart) return { x: 44 + (index % 7) * 3.6, z: team ? -1031 : -1049 };
  if (f.holder === index)
    return { x: 55 + Math.sin(f.passes * 1.7) * 2, z: team ? -1059 : -1021 };
  const closest = players
    .map((p, i) => ({ i, d: distance(p, f) }))
    .filter(
      (p) => Math.floor(p.i / 7) === team && p.i % 7 !== 0 && p.i !== f.holder,
    )
    .sort((a, b) => a.d - b.d);
  if (
    (f.holder < 0 || Math.floor(f.holder / 7) !== team) &&
    closest.slice(0, 2).some((p) => p.i === index)
  )
    return { x: clamp(f.x, 40, 70, 55), z: clamp(f.z, -1058, -1022, -1040) };
  return {
    x: 44 + (index % 7) * 3.6,
    z: clamp(f.z + dir * (4 + (index % 3)), -1055, -1025, -1040),
  };
}
export function stepFootball(c, dt) {
  const f = c.football,
    players = c.people.slice(9);
  if (f.restart > 0) {
    f.restart = Math.max(0, f.restart - dt);
    f.x = 55;
    f.z = -1040;
    return;
  }
  f.time += dt;
  if (f.holder >= 0) {
    const p = players[f.holder],
      team = Math.floor(f.holder / 7),
      dir = team ? -1 : 1;
    f.x = p.x;
    f.z = p.z + dir * 0.65;
    const defenders = players
      .map((p, i) => ({ p, i }))
      .filter((p) => Math.floor(p.i / 7) !== team)
      .sort((a, b) => distance(a.p, p) - distance(b.p, p));
    if (f.time > 1.8 && distance(defenders[0].p, p) < 0.7) {
      f.holder = defenders[0].i;
      f.time = 0;
      return;
    }
    const goalZ = team ? -1060 : -1020;
    if (Math.abs(p.z - goalZ) < 14 && f.time > 0.35 && f.holder % 7 !== 0) {
      const aimX = 55 + [-2.3, 1.9, 0.5][f.shots % 3],
        d = Math.hypot(aimX - f.x, goalZ - f.z);
      f.vx = ((aimX - f.x) / d) * 19;
      f.vz = ((goalZ - f.z) / d) * 19;
      f.shots++;
      f.shot = true;
      f.last = f.holder;
      f.holder = -1;
      f.time = 0;
    } else if (
      f.time > 3 ||
      (f.time > 0.6 && distance(defenders[0].p, p) < 2.2)
    ) {
      const mates = players
        .map((p, i) => ({ p, i }))
        .filter(
          (a) =>
            a.i !== f.holder &&
            Math.floor(a.i / 7) === team &&
            a.i % 7 !== 0 &&
            distance(a.p, p) > 3,
        )
        .sort((a, b) => dir * (b.p.z - a.p.z));
      if (mates.length) {
        const target = mates[0],
          d = distance(target.p, f);
        f.vx = ((target.p.x - f.x) / d) * 12;
        f.vz = ((target.p.z - f.z) / d) * 12;
        f.last = f.holder;
        f.holder = -1;
        f.time = 0;
        f.passes++;
        f.shot = false;
      }
    }
  } else {
    const old = { x: f.x, z: f.z };
    f.x += f.vx * dt;
    f.z += f.vz * dt;
    // Swept segment catches avoid a fast shot skipping a goalkeeper between ticks.
    for (let i = 0; i < players.length; i++) {
      if (i === f.last && f.time < 0.5) continue;
      const p = players[i],
        dx = f.x - old.x,
        dz = f.z - old.z,
        t = clamp(
          ((p.x - old.x) * dx + (p.z - old.z) * dz) / (dx * dx + dz * dz || 1),
          0,
          1,
        );
      if (
        distance(p, { x: old.x + dx * t, z: old.z + dz * t }) <
        (i % 7 === 0 ? 1.3 : 0.8)
      ) {
        if (i % 7 === 0 && f.shot) f.saves++;
        f.shot = false;
        f.holder = i;
        f.vx = f.vz = 0;
        f.time = 0;
        return;
      }
    }
    if (f.z < -1060 || f.z > -1020) {
      if (Math.abs(f.x - 55) < 3) f.score[f.z > -1020 ? 0 : 1]++;
      f.holder = f.z > -1020 ? 8 : 1;
      f.restart = 10;
      f.vx = f.vz = 0;
      f.time = 0;
    } else if (f.x < 39 || f.x > 71) {
      f.holder = Math.floor(f.last / 7) ? 1 : 8;
      f.restart = 10;
      f.vx = f.vz = 0;
      f.time = 0;
    }
  }
}
