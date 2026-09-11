// Events emerge from existing workers, stock, clock and weather; no spawn timer.
export function roadsideEvents(life) {
  const day = Math.floor(life.clock / 2880),
    hour = (life.clock / 120) % 24;
  const dry = !life.weather.sheltering;
  const repair = day % 2 === 0;
  const workers = life.town.people.filter(
    (p) => p.mode === "harbour" && Math.hypot(p.x + 70, p.z + 279) < 12,
  );
  const seller = life.paddy.people.find((p) => p.id === "vendor");
  return [
    {
      id: "harbour-work",
      x: -72,
      z: -279,
      active:
        dry &&
        workers.length >= 2 &&
        hour >= (repair ? 7 : 12) &&
        hour < (repair ? 11 : 17),
      variant: repair ? "nets" : "ropes",
      title: repair
        ? "Nets spread along the harbour"
        : "Ropes being prepared for the boats",
      memory: repair
        ? "Stopped to watch the harbour crew working on their nets."
        : "Watched the harbour crew lay out ropes for the boats.",
    },
    {
      id: "produce-table",
      x: 313,
      z: 101,
      active:
        dry &&
        seller?.mode === "market" &&
        Math.hypot(seller.x - 310, seller.z - 101) < 4 &&
        life.paddy.stock > 0 &&
        hour >= 8 &&
        hour < 18,
      variant: life.paddy.stock > 6 ? "full" : "last",
      title:
        life.paddy.stock > 6
          ? "A fresh display at the produce stall"
          : "The last few bundles at the stall",
      memory:
        life.paddy.stock > 6
          ? "Found the produce table full before the neighbourhood shopping rush."
          : "Reached the produce stall as the last few bundles were being sold.",
    },
  ];
}
export function roadsideCue(life, player) {
  const event = roadsideEvents(life).find(
    (e) => e.active && Math.hypot(e.x - player.x, e.z - player.z) < 24,
  );
  return event ? { ...event, text: event.title } : null;
}
export function buildRoadsideView({
  group,
  block,
  mesh,
  sphere,
  m,
  terrainHeight,
}) {
  const net = group("Harbour work table", -72, terrainHeight(-72, -279), -279);
  block(net, m.wood, 0, 0.65, 0, 2.6, 0.12, 2);
  for (const x of [-1, 1]) block(net, m.wood, x, 0.3, 0, 0.12, 0.6, 1.8);
  const strands = [];
  for (let i = 0; i < 9; i++)
    strands.push(
      block(net, m.rope, -1.1 + i * 0.27, 0.76, 0, 0.025, 0.025, 1.7),
    );
  for (let i = 0; i < 6; i++)
    strands.push(
      block(net, m.rope, 0, 0.78, -0.8 + i * 0.3, 2.4, 0.025, 0.025),
    );
  const coils = [];
  for (let i = 0; i < 3; i++)
    coils.push(
      mesh(net, sphere, m.rope, -0.7 + i * 0.7, 0.86, 0, 0.28, 0.14, 0.6),
    );
  const table = group(
    "Changing produce display",
    313,
    terrainHeight(313, 101),
    101,
  );
  block(table, m.wood, 0, 0.65, 0, 2, 0.15, 1.2);
  block(table, m.wood, 0, 0.3, 0, 1.6, 0.6, 0.8);
  const bundles = [];
  for (let i = 0; i < 6; i++)
    bundles.push(
      mesh(
        table,
        sphere,
        i % 2 ? m.leafLight : m.gold,
        -0.65 + (i % 3) * 0.65,
        0.86,
        Math.floor(i / 3) * 0.5 - 0.25,
        0.22,
        0.15,
        0.2,
      ),
    );
  return {
    animated: [net, table],
    update(life) {
      const [harbour, produce] = roadsideEvents(life);
      strands.forEach(
        (p) => (p.visible = harbour.active && harbour.variant === "nets"),
      );
      coils.forEach((p, i) => {
        p.visible = !harbour.active || harbour.variant === "ropes";
        p.position.z = harbour.active
          ? Math.sin(life.clock * 0.7 + i) * 0.05
          : 0;
      });
      bundles.forEach(
        (p, i) =>
          (p.visible = produce.active && i < Math.ceil(life.paddy.stock / 2)),
      );
    },
  };
}
