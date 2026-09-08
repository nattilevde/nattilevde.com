// A fictional Kadal shop menu, not a claim of exclusive regional ownership.
export const TEA_SHOP = { x: -12, z: 32 };
export const TEA_TV = { x: -12.4, z: 28 };
export const teaHour = (life) => (life.clock / 120) % 24;
export const teaProgramme = (life) => {
  const h = teaHour(life);
  return h >= 11.5 && h < 13.5
    ? "football"
    : h >= 16 && h < 18.5
      ? "cinema"
      : null;
};
export const teaMenu = (life) =>
  teaHour(life) < 14 ? "Pazham pori" : "Parippuvada";
export function createTea(saved) {
  return {
    batch: Number.isInteger(saved?.batch) ? saved.batch : -1,
    stock: Number.isInteger(saved?.stock)
      ? Math.max(0, Math.min(8, saved.stock))
      : 8,
    customer: typeof saved?.customer === "string" ? saved.customer : null,
    pouring: Number.isFinite(saved?.pouring)
      ? Math.max(0, Math.min(4, saved.pouring))
      : 0,
    served: Array.isArray(saved?.served)
      ? saved.served.filter((x) => typeof x === "string").slice(-20)
      : [],
  };
}
export function teaOpen(life) {
  const leela = life.residents.find((r) => r.id === "leela");
  return (
    teaHour(life) >= 6 &&
    teaHour(life) < 19 &&
    leela?.mode === "working" &&
    Math.hypot(leela.x + 12, leela.z - 32) < 1
  );
}
export function teaCustomers(life) {
  return life.residents.filter(
    (r) =>
      r.id !== "leela" &&
      !r.moving &&
      ["break", "watching", "sheltering"].includes(r.mode) &&
      Math.hypot(r.x + 12, r.z - 32) < 7,
  );
}
export function stepTea(life, dt) {
  const tea = life.tea;
  const batch =
    Math.floor(life.clock / 2880) * 2 + (teaHour(life) >= 14 ? 1 : 0);
  if (tea.batch !== batch) {
    tea.batch = batch;
    tea.stock = 8;
    tea.served = [];
  }
  const customers = teaCustomers(life);
  tea.served = tea.served.filter((id) => customers.some((r) => r.id === id));
  if (!teaOpen(life)) {
    tea.customer = null;
    tea.pouring = 0;
    return;
  }
  if (tea.customer && !customers.some((r) => r.id === tea.customer)) {
    tea.customer = null;
    tea.pouring = 0;
  }
  if (!tea.customer) {
    tea.customer =
      customers.find((r) => !tea.served.includes(r.id))?.id || null;
    if (tea.customer) tea.pouring = 4;
  } else {
    tea.pouring = Math.max(0, tea.pouring - dt);
    if (!tea.pouring) {
      tea.served.push(tea.customer);
      tea.stock = Math.max(0, tea.stock - 1);
      tea.customer = null;
    }
  }
}
