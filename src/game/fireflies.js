// Fictional habitat pockets, not a species or seasonal sighting forecast.
export const FIREFLY_POCKETS = [
  { id: "canal-grove", x: 92, z: -70, name: "Canal-side grove" },
  { id: "quiet-lane", x: 77, z: -118, name: "Quiet inland lane" },
  { id: "hill-grove", x: 470, z: -500, name: "Highland grove" },
];

export function fireflyActivity(life) {
  if (!life) return 0;
  const hour = (life.clock / 120) % 24;
  const evening = Math.max(0, Math.min(1, (hour - 18) * 2, (24 - hour) / 2));
  const rain = Math.max(0, Math.min(1, life.weather.rain));
  return evening * Math.max(0, 1 - rain / 0.35);
}

export function nearbyFireflies(life, player) {
  if (fireflyActivity(life) < 0.3) return null;
  return (
    FIREFLY_POCKETS.find(
      (p) => Math.hypot(player.x - p.x, player.z - p.z) < 12,
    ) || null
  );
}
