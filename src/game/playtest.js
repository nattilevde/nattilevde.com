// Device-local pilot summaries only: no network, identity, coordinates or text.
export const PLAYTEST_KEY = "kerala-playtest-summaries";
export function createPlaytest(returning = false) {
  return {
    returning,
    activeSeconds: 0,
    drivingSeconds: 0,
    jeepAt: null,
    discoveryAt: null,
    discoveries: 0,
    stops: [],
  };
}
export function tickPlaytest(run, seconds, driving) {
  const dt = Math.max(0, Math.min(2, seconds));
  run.activeSeconds += dt;
  if (driving) {
    if (run.jeepAt === null) run.jeepAt = Math.round(run.activeSeconds);
    run.drivingSeconds += dt;
  }
}
export function discoverPlaytest(run, id) {
  if (run.discoveryAt === null) run.discoveryAt = Math.round(run.activeSeconds);
  run.discoveries++;
  if (
    [
      "harbour-town",
      "town-street",
      "inland-lane",
      "paddy-market-stop",
      "ridge-view",
      "estate-bend",
    ].includes(id) &&
    !run.stops.includes(id)
  )
    run.stops.push(id);
}
export function loadPlaytests(storage) {
  try {
    const data = JSON.parse(storage.getItem(PLAYTEST_KEY));
    return Array.isArray(data)
      ? data.slice(-19).filter((r) => Number.isFinite(r.activeSeconds))
      : [];
  } catch {
    return [];
  }
}
export function persistPlaytest(storage, previous, run) {
  try {
    storage.setItem(PLAYTEST_KEY, JSON.stringify([...previous, run]));
  } catch {
    /* A blocked store never blocks play. */
  }
}
export function playtestSummary(previous, run) {
  return JSON.stringify(
    {
      scope: "This browser only; active time excludes pauses and hidden tabs.",
      earlierSessions: previous.length,
      current: {
        ...run,
        activeSeconds: Math.round(run.activeSeconds),
        drivingSeconds: Math.round(run.drivingSeconds),
      },
    },
    null,
    2,
  );
}
