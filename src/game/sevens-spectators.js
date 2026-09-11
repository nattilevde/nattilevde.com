// Separate from the fourteen-player roster so spectators never affect possession.
export const SPECTATORS = Array.from({ length: 6 }, (_, i) => ({
  id: `sevens-supporter-${i}`,
  team: i % 2,
  color: i % 2 ? "gold" : "teal",
  path: [
    { x: 29 + i * 1.5, z: -1000 },
    { x: 29 + i * 1.5, z: -1008 },
    { x: 35, z: -1013 },
    { x: 35, z: -1030 - i * 3 },
  ],
}));
export const spectatorRouteLength = (d) =>
  d.path
    .slice(1)
    .reduce(
      (n, p, i) => n + Math.hypot(p.x - d.path[i].x, p.z - d.path[i].z),
      0,
    );
export function spectatorPosition(p, d) {
  let remaining = p.progress;
  for (let i = 1; i < d.path.length; i++) {
    const a = d.path[i - 1],
      b = d.path[i];
    const distance = Math.hypot(b.x - a.x, b.z - a.z);
    if (remaining <= distance)
      return {
        x: a.x + ((b.x - a.x) * remaining) / distance,
        z: a.z + ((b.z - a.z) * remaining) / distance,
      };
    remaining -= distance;
  }
  return { ...d.path.at(-1) };
}
export function createSpectators(saved, score) {
  return {
    score: [...score],
    people: SPECTATORS.map((d, i) => {
      const p = saved?.people?.[i];
      return {
        progress: Number.isFinite(p?.progress)
          ? Math.max(0, Math.min(spectatorRouteLength(d), p.progress))
          : 0,
        heading: Number.isFinite(p?.heading) ? p.heading : 0,
        mode: ["home", "walking", "watching", "sheltering"].includes(p?.mode)
          ? p.mode
          : "home",
        reaction: p?.reaction === -1 ? -1 : 1,
        remaining: Number.isFinite(p?.remaining)
          ? Math.max(0, Math.min(3, p.remaining))
          : 0,
      };
    }),
  };
}
export function stepSpectators(crowd, life, dt) {
  const hour = (life.clock / 120) % 24;
  const c = life.community;
  const scoringTeam = c.football.score.findIndex(
    (score, i) => score > crowd.score[i],
  );
  crowd.score = [...c.football.score];
  crowd.people.forEach((p, i) => {
    const d = SPECTATORS[i];
    const visiting = hour >= 16.3 + i * 0.06 && hour < 21.4 - i * 0.025;
    const wet = life.weather.sheltering;
    const target = !visiting ? 0 : wet ? 8 : spectatorRouteLength(d);
    const before = spectatorPosition(p, d);
    p.progress +=
      Math.sign(target - p.progress) *
      Math.min(Math.abs(target - p.progress), dt * (wet ? 2.2 : 1.5));
    const after = spectatorPosition(p, d);
    p.mode =
      p.progress !== target
        ? "walking"
        : !visiting
          ? "home"
          : wet
            ? "sheltering"
            : "watching";
    if (p.mode === "walking")
      p.heading = Math.atan2(before.x - after.x, before.z - after.z);
    if (p.mode === "watching" && c.active) {
      p.heading = Math.atan2(after.x - c.football.x, after.z - c.football.z);
      p.remaining = Math.max(0, p.remaining - dt);
      if (scoringTeam >= 0) {
        p.reaction = scoringTeam === d.team ? 1 : -1;
        p.remaining = 3;
      }
    } else p.remaining = 0;
  });
}
