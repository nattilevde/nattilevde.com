import {
  createTea,
  stepTea,
  teaProgramme,
  teaOpen,
  teaMenu,
  TEA_TV,
} from "./tea-shop.js";
import { storyById } from "./stories.js";
import {
  createFishing,
  stepFishing,
  fishingPosition,
  fishMarketOpen,
  helpFish,
  FISH_LANDING,
  FISH_MARKET,
} from "./fishing.js";
import {
  createAuto,
  stepAuto,
  autoPosition,
  boardAuto,
  leaveAuto,
  AUTO_STOPS,
} from "./auto.js";
import {
  createBus,
  stepBus,
  busPosition,
  BUS_STOPS,
  boardBus,
  leaveBus,
} from "./bus.js";
import { canWalk } from "./world.js";
import {
  DAY_SECONDS,
  LIFE_STEP,
  LIFE_NODES,
  LIFE_EDGES,
  RESIDENTS,
  SHELTERS,
  FERRY_STOPS,
} from "./life-data.js";

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const bounded = (n, min, max, fallback) =>
  Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
const copy = (value) => JSON.parse(JSON.stringify(value));
const neighbours = Object.fromEntries(
  Object.keys(LIFE_NODES).map((id) => [id, []]),
);
LIFE_EDGES.forEach(([a, b]) => {
  neighbours[a].push(b);
  neighbours[b].push(a);
});

export function villageRoute(from, to) {
  if (!neighbours[from] || !neighbours[to]) return [];
  const costs = { [from]: 0 },
    previous = {},
    pending = new Set(Object.keys(neighbours));
  while (pending.size) {
    const at = [...pending].reduce((a, b) =>
      (costs[a] ?? Infinity) < (costs[b] ?? Infinity) ? a : b,
    );
    if (!Number.isFinite(costs[at])) return [];
    pending.delete(at);
    if (at === to) {
      const path = [to];
      while (path[0] !== from) path.unshift(previous[path[0]]);
      return path.slice(1);
    }
    for (const next of neighbours[at]) {
      const cost = costs[at] + distance(LIFE_NODES[at], LIFE_NODES[next]);
      if (cost < (costs[next] ?? Infinity)) {
        costs[next] = cost;
        previous[next] = at;
      }
    }
  }
  return [];
}

function random(state) {
  state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

export function createLife(saved, seed = 7391) {
  const valid = saved?.v === 1;
  const state = {
    v: 1,
    seed: valid ? bounded(saved.seed, 0, 4294967295, seed) >>> 0 : seed >>> 0,
    clock: valid ? bounded(saved.clock, 0, DAY_SECONDS * 100000, 960) : 960,
    remainder: valid ? bounded(saved.remainder, 0, LIFE_STEP, 0) : 0,
    weather: {
      rain: 0,
      target: 0,
      remaining: 95,
      wetness: 0,
      episode: 0,
      sheltering: false,
    },
    residents: [],
    coir: { phase: "outside", remaining: 0, helped: -1 },
    rehearsal: { active: false, joined: -1 },
    ferry: {
      stop: 0,
      phase: "boarding",
      remaining: 28,
      progress: 0,
      trips: 0,
      player: false,
      boardedTrip: 0,
      passengers: [],
    },
    bus: createBus(valid ? saved.bus : null),
    auto: createAuto(valid ? saved.auto : null),
    fishing: createFishing(valid ? saved.fishing : null),
    tea: createTea(valid ? saved.tea : null),
    memories: [],
    met: [],
  };
  if (valid && saved.weather) {
    for (const key of ["rain", "target", "wetness"])
      state.weather[key] = bounded(saved.weather[key], 0, 1, 0);
    state.weather.remaining = bounded(saved.weather.remaining, 0, 180, 95);
    state.weather.episode = bounded(saved.weather.episode, 0, 1e8, 0);
    state.weather.sheltering = !!saved.weather.sheltering;
  } else state.weather.remaining = 55 + random(state) * 70;
  const reserved = new Set();
  state.residents = RESIDENTS.map((definition, i) => {
    const old =
      valid &&
      Array.isArray(saved.residents) &&
      saved.residents.find((r) => r?.id === definition.id);
    const start = i < 7 ? definition.work : definition.start;
    const r = {
      id: definition.id,
      node: start,
      destination: start,
      route: [],
      ...LIFE_NODES[start],
      heading: 0,
      mode: "working",
      moving: false,
      ferryIntent: null,
      shelter: null,
      offset: (i * 7) % 25,
    };
    if (
      old &&
      Object.hasOwn(LIFE_NODES, old.node) &&
      Object.hasOwn(LIFE_NODES, old.destination) &&
      Number.isFinite(old.x) &&
      Number.isFinite(old.z) &&
      canWalk(old.x, old.z)
    ) {
      const route = Array.isArray(old.route) ? old.route : [];
      let at = old.node;
      const routeValid =
        route.length < 100 &&
        route.every((next) => {
          const ok = neighbours[at]?.includes(next);
          at = next;
          return ok;
        });
      // A checkpoint must lie on its current route edge, not merely on walkable land.
      const end = LIFE_NODES[route[0] || old.node];
      const onEdge =
        end &&
        Math.abs(
          distance(LIFE_NODES[old.node], old) +
            distance(old, end) -
            distance(LIFE_NODES[old.node], end),
        ) < 0.1;
      if (
        routeValid &&
        onEdge &&
        (route.at(-1) || old.node) === old.destination
      ) {
        Object.assign(r, {
          node: old.node,
          destination: old.destination,
          route: [...route],
          mode: [
            "working",
            "home",
            "break",
            "watching",
            "sheltering",
            "covering",
            "travelling",
            "waiting",
            "passenger",
          ].includes(old.mode)
            ? old.mode
            : "waiting",
          moving: route.length > 0,
          ferryIntent:
            old.ferryIntent === 0 || old.ferryIntent === 1
              ? old.ferryIntent
              : null,
          x: old.x,
          z: old.z,
          heading: bounded(old.heading, -Math.PI * 2, Math.PI * 2, 0),
        });
        if (
          SHELTERS.some((s) => s.slots.includes(old.shelter)) &&
          !reserved.has(old.shelter)
        ) {
          r.shelter = old.shelter;
          reserved.add(old.shelter);
        }
      }
    }
    return r;
  });
  if (
    valid &&
    saved.coir &&
    ["outside", "covering", "covered", "drying"].includes(saved.coir.phase)
  ) {
    state.coir = {
      phase: saved.coir.phase,
      remaining: bounded(saved.coir.remaining, 0, 120, 0),
      helped: bounded(saved.coir.helped, -1, 1e8, -1),
    };
  }
  if (valid && saved.ferry) {
    const f = saved.ferry;
    state.ferry = {
      stop: f.stop === 1 ? 1 : 0,
      phase: ["boarding", "crossing", "waiting"].includes(f.phase)
        ? f.phase
        : "boarding",
      remaining: bounded(f.remaining, 0, 60, 28),
      progress: bounded(f.progress, 0, 1, 0),
      trips: bounded(f.trips, 0, 1e8, 0),
      player: !!f.player,
      boardedTrip: bounded(f.boardedTrip, 0, 1e8, 0),
      passengers: [],
    };
    state.ferry.passengers = Array.isArray(f.passengers)
      ? [
          ...new Set(
            f.passengers.filter((id) => RESIDENTS.some((r) => r.id === id)),
          ),
        ].slice(0, 3)
      : [];
  }
  if (valid) {
    state.rehearsal.joined = bounded(saved.rehearsal?.joined, -1, 1e8, -1);
    state.met = Array.isArray(saved.met)
      ? [
          ...new Set(
            saved.met.filter((id) => RESIDENTS.some((r) => r.id === id)),
          ),
        ]
      : [];
    const ids = new Set();
    state.memories = (Array.isArray(saved.memories) ? saved.memories : [])
      .filter((m) => {
        if (
          !m ||
          typeof m.id !== "string" ||
          ids.has(m.id) ||
          typeof m.text !== "string" ||
          typeof m.place !== "string"
        )
          return false;
        ids.add(m.id);
        return true;
      })
      .slice(-40)
      .map((m) => ({
        id: m.id.slice(0, 100),
        text: m.text.slice(0, 300),
        place: m.place.slice(0, 80),
        day: bounded(m.day, 1, 1e8, 1),
        pinned: !!m.pinned,
      }));
  }
  if (state.ferry.player) state.bus.player = false;
  if (state.ferry.player || state.bus.player) state.auto.player = false;
  updateRehearsal(state);
  return state;
}

export const saveLife = (state) => copy(state);
export const lifeHour = (state) =>
  ((state.clock % DAY_SECONDS) / DAY_SECONDS) * 24;
export const lifeDay = (state) => Math.floor(state.clock / DAY_SECONDS) + 1;

function destinationFor(state, r, definition) {
  const hour = lifeHour(state);
  if (hour < 6 || hour >= 19) return definition.home;
  if (definition.id === "leela") return definition.work;
  if (
    ["jaya", "rajan"].includes(r.id) &&
    hour >= 16 + r.offset / 120 &&
    hour < 17.5 + r.offset / 120 &&
    teaProgramme(state)
  )
    return definition.break;
  if (hour >= 11.5 + r.offset / 60 && hour < 13 + r.offset / 60)
    return definition.break;
  if (
    (definition.drummer || definition.id === "hari") &&
    hour >= 9.5 &&
    hour < 16
  )
    return definition.home;
  return definition.work;
}

function setDestination(r, destination) {
  if (r.destination === destination) return;
  // Finish the edge already being walked before taking a different route.
  const next = r.route[0];
  r.route = next
    ? [next, ...villageRoute(next, destination)]
    : villageRoute(r.node, destination);
  r.destination = destination;
}

function stepResident(state, r, definition, dt) {
  if (state.ferry.passengers.includes(r.id)) {
    r.mode = "passenger";
    r.moving = false;
    return;
  }
  const wet = state.weather.sheltering;
  let dest = destinationFor(state, r, definition);
  const covering = definition.id === "radha" && state.coir.phase === "covering";
  if (
    wet &&
    !covering &&
    !(dest === definition.home && r.node === definition.home && !r.route.length)
  ) {
    if (!r.shelter) {
      const taken = new Set(state.residents.map((p) => p.shelter));
      const slots = SHELTERS.flatMap((s) => s.slots).filter(
        (id) => !taken.has(id),
      );
      slots.sort(
        (a, b) => distance(r, LIFE_NODES[a]) - distance(r, LIFE_NODES[b]),
      );
      r.shelter = slots[0] || null;
    }
    if (r.shelter) dest = r.shelter;
  } else {
    r.shelter = null;
    if (covering) dest = definition.work;
  }
  r.ferryIntent = null;
  if (
    ["jaya", "suma"].includes(r.id) &&
    !wet &&
    LIFE_NODES[dest].x > 47 !== r.x > 47
  ) {
    const stop = r.x > 47 ? 1 : 0;
    r.ferryIntent = 1 - stop;
    dest = stop ? "eastLanding" : "jetty";
  }
  setDestination(r, dest);
  let budget = dt * (wet ? 2.7 : 1.8);
  r.moving = r.route.length > 0;
  while (budget > 0 && r.route.length) {
    const node = r.route[0],
      target = LIFE_NODES[node],
      gap = distance(r, target);
    if (gap < 0.001) {
      r.node = r.route.shift();
      continue;
    }
    const step = Math.min(budget, gap);
    const x = r.x + ((target.x - r.x) * step) / gap;
    const z = r.z + ((target.z - r.z) * step) / gap;
    if (!canWalk(x, z)) {
      r.mode = "waiting";
      r.moving = false;
      return;
    }
    r.heading = Math.atan2(r.x - x, r.z - z);
    r.x = x;
    r.z = z;
    budget -= step;
    if (step >= gap) r.node = r.route.shift();
  }
  r.mode = r.route.length
    ? "travelling"
    : r.shelter
      ? "sheltering"
      : covering
        ? "covering"
        : dest === definition.home
          ? "home"
          : dest === definition.break
            ? "break"
            : "working";
  r.moving = r.route.length > 0;
  if (r.ferryIntent !== null && !r.moving) r.mode = "waiting";
  if (
    r.mode === "break" &&
    ["jaya", "rajan"].includes(r.id) &&
    teaProgramme(state) &&
    teaOpen(state)
  ) {
    r.mode = "watching";
    r.heading = Math.atan2(r.x - TEA_TV.x, r.z - TEA_TV.z);
  }
}

function updateRehearsal(state) {
  const hour = lifeHour(state);
  const participants = state.residents.filter(
    (r) =>
      ["hari", "anil", "usha", "mani"].includes(r.id) &&
      r.mode === "working" &&
      distance(r, LIFE_NODES.court) < 6,
  );
  state.rehearsal.active =
    !state.weather.sheltering &&
    ((hour >= 7 && hour < 9.5) || (hour >= 16 && hour < 18.5)) &&
    participants.some((r) => r.id === "hari") &&
    participants.length >= 3;
}

export function ferryPosition(state) {
  const f = state.ferry,
    a = FERRY_STOPS[f.stop].water,
    b = FERRY_STOPS[1 - f.stop].water;
  return {
    x: a.x + (b.x - a.x) * f.progress,
    z: a.z + (b.z - a.z) * f.progress,
    heading: Math.atan2(a.x - b.x, a.z - b.z),
  };
}

function stepFerry(state, dt) {
  const f = state.ferry;
  if (f.phase === "crossing") {
    f.progress = Math.min(1, f.progress + dt / 22);
    if (f.progress >= 1) {
      f.stop = 1 - f.stop;
      f.progress = 0;
      f.phase = "boarding";
      f.remaining = 28;
      f.trips++;
      const node = f.stop ? "eastLanding" : "jetty";
      for (const id of f.passengers) {
        const r = state.residents.find((p) => p.id === id);
        Object.assign(r, LIFE_NODES[node], {
          node,
          destination: node,
          route: [],
          mode: "waiting",
        });
      }
      f.passengers = [];
    }
    return;
  }
  const available =
    lifeHour(state) >= 6 && lifeHour(state) < 19 && state.weather.rain < 0.8;
  if (!available) {
    f.phase = "waiting";
    return;
  }
  f.phase = "boarding";
  f.remaining = Math.max(0, f.remaining - dt);
  if (f.remaining <= 0) {
    // Only residents physically waiting near this landing can become passengers.
    f.passengers = state.residents
      .filter(
        (r) =>
          r.ferryIntent === 1 - f.stop &&
          !r.route.length &&
          !r.shelter &&
          distance(r, FERRY_STOPS[f.stop].land) < 5,
      )
      .slice(0, 3)
      .map((r) => r.id);
    f.phase = "crossing";
  }
}

function tickLife(state, dt, player) {
  state.clock += dt;
  const w = state.weather;
  w.remaining -= dt;
  if (w.remaining <= 0) {
    w.target = w.target > 0 ? 0 : 0.55 + random(state) * 0.45;
    w.remaining = w.target ? 36 + random(state) * 24 : 95 + random(state) * 70;
    if (w.target) w.episode++;
  }
  w.rain += (w.target - w.rain) * Math.min(1, dt * 1.3);
  w.wetness = Math.max(w.rain, w.wetness - dt / 120);
  if (w.rain > 0.4) w.sheltering = true;
  if (w.rain < 0.15) w.sheltering = false;
  const radha = state.residents.find((r) => r.id === "radha");
  if (
    state.coir.phase === "outside" &&
    w.sheltering &&
    radha.mode === "working" &&
    distance(radha, LIFE_NODES.coir) < 3
  ) {
    state.coir.phase = "covering";
    state.coir.remaining = 24;
  }
  if (state.coir.phase === "covering" && distance(radha, LIFE_NODES.coir) < 3) {
    state.coir.remaining = Math.max(0, state.coir.remaining - dt);
    if (!state.coir.remaining) state.coir.phase = "covered";
  } else if (state.coir.phase === "covered" && !w.sheltering) {
    state.coir.phase = "drying";
    state.coir.remaining = 100;
  } else if (state.coir.phase === "drying") {
    if (w.sheltering) state.coir.phase = "covered";
    else {
      state.coir.remaining -= dt;
      if (state.coir.remaining <= 0) state.coir.phase = "outside";
    }
  }
  state.residents.forEach((r, i) => stepResident(state, r, RESIDENTS[i], dt));
  stepTea(state, dt);
  updateRehearsal(state);
  stepFishing(state.fishing, dt, lifeHour(state), w.rain);
  stepFerry(state, dt);
  const fisher = fishingPosition(state.fishing);
  stepBus(state.bus, dt, lifeHour(state), w.rain, [
    ...(!fisher.atSea ? [fisher] : []),
    ...state.residents.filter((r) => r.mode !== "passenger"),
    ...(!state.bus.player && !state.auto.player && player ? [player] : []),
  ]);
  stepAuto(state.auto, dt, lifeHour(state), w.rain, state.bus, state.ferry, [
    ...(!fisher.atSea ? [fisher] : []),
    ...state.residents.filter((r) => r.mode !== "passenger"),
    ...(!state.auto.player && !state.bus.player && !state.ferry.player && player
      ? [player]
      : []),
    busPosition(state.bus),
  ]);
}

export function advanceLife(state, seconds, player = null, onStep = null) {
  if (!Number.isFinite(seconds) || seconds <= 0) return state;
  state.remainder += Math.min(seconds, DAY_SECONDS);
  while (state.remainder + 1e-9 >= LIFE_STEP) {
    state.remainder = Math.max(0, state.remainder - LIFE_STEP);
    tickLife(state, LIFE_STEP, player);
    onStep?.(state);
  }
  return state;
}

function remember(state, memory) {
  if (state.memories.some((m) => m.id === memory.id)) return;
  if (state.memories.length >= 40) {
    const index = state.memories.findIndex((m) => !m.pinned);
    if (index < 0) return;
    state.memories.splice(index, 1);
  }
  state.memories.push({ ...memory, day: lifeDay(state), pinned: false });
}

export function observeLife(state, player) {
  const fish = state.fishing;
  if (
    fish.phase === "unloading" &&
    fish.cargo &&
    distance(player, FISH_LANDING) < 12
  )
    remember(state, {
      id: `catch-${fish.trip}`,
      place: "Kadal fishing shore",
      text: "Saw the catch being unloaded at the shore.",
    });
  if (
    fishMarketOpen(fish, lifeHour(state), state.weather.rain) &&
    distance(player, FISH_MARKET) < 10 &&
    state.memories.some(
      (m) => m.id === `catch-${fish.trip}` || m.id === `fish-help-${fish.trip}`,
    )
  )
    remember(state, {
      id: `fish-market-${fish.trip}`,
      place: "Kadal fish stall",
      text: "Found the shore's catch on the village stall after its journey inland.",
    });
  const group = state.residents.filter(
    (r) => r.mode === "sheltering" && distance(r, player) < 7,
  );
  if (group.length >= 2 && state.weather.sheltering) {
    const place = SHELTERS.find((s) => s.slots.includes(group[0].shelter));
    const together = group.filter((r) => place.slots.includes(r.shelter));
    if (together.length >= 2)
      remember(state, {
        id: `shelter-${state.weather.episode}-${place.id}`,
        place: place.name,
        text: `Shared the shelter with ${together.map((r) => RESIDENTS.find((p) => p.id === r.id).name).join(" and ")} while rain crossed the village.`,
      });
  }
  if (state.rehearsal.active && distance(player, LIFE_NODES.court) < 12)
    remember(state, {
      id: `rehearsal-${lifeDay(state)}`,
      place: "The Rhythm Courtyard",
      text: "Heard Hari and the players practising together in the courtyard.",
    });
}

export function actOnLife(state, action, player) {
  if (action === "board-auto")
    return (
      !state.bus.player &&
      !state.ferry.player &&
      boardAuto(state.auto, player, lifeHour(state))
    );
  if (action === "leave-auto" && leaveAuto(state.auto)) {
    if (state.auto.arrived)
      remember(state, {
        id: `auto-${lifeDay(state)}-${state.auto.stop}`,
        place: AUTO_STOPS[state.auto.stop].name,
        text: `Rode the village auto to ${AUTO_STOPS[state.auto.stop].name}.`,
      });
    return true;
  }
  if (state.auto.player) return false;
  if (action === "board-bus")
    return !state.ferry.player && boardBus(state.bus, player);
  if (action === "leave-bus" && leaveBus(state.bus)) {
    if (state.bus.trips > state.bus.boardedTrip)
      remember(state, {
        id: `bus-${lifeDay(state)}-${state.bus.stop}`,
        place: BUS_STOPS[state.bus.stop].name,
        text: `Took the local bus to ${BUS_STOPS[state.bus.stop].name}.`,
      });
    return true;
  }
  if (state.bus.player) return false;
  if (
    action === "help-fish" &&
    !state.ferry.player &&
    helpFish(state.fishing, player)
  ) {
    remember(state, {
      id: `fish-help-${state.fishing.trip}`,
      place: "Kadal fishing shore",
      text: "Helped unload the catch for the village stall.",
    });
    return true;
  }
  if (
    action === "coir" &&
    state.coir.phase === "covering" &&
    distance(player, LIFE_NODES.coir) < 6 &&
    distance(
      state.residents.find((r) => r.id === "radha"),
      LIFE_NODES.coir,
    ) < 3 &&
    state.coir.helped !== state.weather.episode
  ) {
    state.coir.remaining = Math.max(0, state.coir.remaining - 16);
    state.coir.helped = state.weather.episode;
    remember(state, {
      id: `coir-${state.weather.episode}`,
      place: "Radha's Coir Yard",
      text: "Helped Radha cover the fibre as the rain arrived.",
    });
    return true;
  }
  if (
    action === "rehearsal" &&
    state.rehearsal.active &&
    distance(player, LIFE_NODES.court) < 7 &&
    state.rehearsal.joined !== lifeDay(state)
  ) {
    state.rehearsal.joined = lifeDay(state);
    remember(state, {
      id: `joined-${lifeDay(state)}`,
      place: "The Rhythm Courtyard",
      text: "Played a few beats with Hari and the courtyard ensemble.",
    });
    return true;
  }
  if (
    action === "board-ferry" &&
    state.ferry.phase === "boarding" &&
    !state.ferry.player &&
    distance(player, FERRY_STOPS[state.ferry.stop].land) < 6
  ) {
    state.ferry.player = true;
    state.ferry.boardedTrip = state.ferry.trips;
    return true;
  }
  if (
    action === "leave-ferry" &&
    state.ferry.player &&
    state.ferry.phase !== "crossing"
  ) {
    if (state.ferry.trips > state.ferry.boardedTrip)
      remember(state, {
        id: `ferry-${lifeDay(state)}-${state.ferry.stop}`,
        place: FERRY_STOPS[state.ferry.stop].name,
        text: `Crossed the canal by passenger boat to ${FERRY_STOPS[state.ferry.stop].name}.`,
      });
    state.ferry.player = false;
    return true;
  }
  return false;
}

export function villageCue(state, player) {
  if (teaOpen(state) && teaProgramme(state) && distance(player, TEA_TV) < 24)
    return {
      ...TEA_TV,
      text:
        teaProgramme(state) === "football"
          ? "Football on the tea-shop TV"
          : "A film-club short on the tea-shop TV",
    };
  if (
    state.fishing.phase === "unloading" &&
    state.fishing.cargo &&
    distance(player, FISH_LANDING) < 55
  )
    return { ...FISH_LANDING, text: "Baskets coming ashore" };
  if (
    fishMarketOpen(state.fishing, lifeHour(state), state.weather.rain) &&
    distance(player, FISH_MARKET) < 30
  )
    return { ...FISH_MARKET, text: "Trade at the fish stall" };
  const auto = autoPosition(state.auto);
  if (state.auto.phase === "travelling" && distance(auto, player) < 35)
    return { ...auto, text: "An auto along the village lane" };
  const bus = busPosition(state.bus);
  if (state.bus.phase === "travelling" && distance(bus, player) < 75)
    return { ...bus, text: "A local bus on the highway" };
  if (state.rehearsal.active && distance(player, LIFE_NODES.court) < 105)
    return { ...LIFE_NODES.court, text: "Chenda practice" };
  const f = ferryPosition(state);
  if (state.ferry.phase === "crossing" && distance(player, f) < 65)
    return { ...f, text: "A passenger boat on the canal" };
  return null;
}

export function villageLine(state, player) {
  const fisher = fishingPosition(state.fishing);
  if (!fisher.atSea && distance(player, fisher) < 6 && state.fishing.helped > 0)
    return {
      who: "Sasi",
      text: "Thanks for lending a hand with the baskets.",
      zone: "life-fisher-thanks",
    };
  const r = state.residents
    .filter(
      (r) => !state.ferry.passengers.includes(r.id) && distance(r, player) < 6,
    )
    .sort((a, b) => distance(a, player) - distance(b, player))[0];
  if (!r) return null;
  const definition = RESIDENTS.find((p) => p.id === r.id);
  if (r.id === "radha" && state.coir.helped >= 0 && state.met.includes("radha"))
    return {
      who: definition.name,
      text: "Thanks for helping with the fibre earlier.",
      zone: "life-radha",
    };
  if (r.mode === "watching")
    return {
      who: definition.name,
      text:
        teaProgramme(state) === "football"
          ? "Look at that pass down the wing!"
          : "That rainy road looks like the way home.",
      zone: `life-${r.id}-tv-${teaProgramme(state)}`,
    };
  if (r.id === "leela" && teaOpen(state))
    return {
      who: "Leela",
      text: state.tea.stock
        ? `${teaMenu(state)} on the tray. Stay for a chaya?`
        : "The snack tray is empty. There is still tea.",
      zone: `life-leela-tray-${teaMenu(state)}-${state.tea.stock > 0}`,
    };
  if (r.mode === "sheltering")
    return {
      who: definition.name,
      text: "We can wait here until it eases.",
      zone: `life-${r.id}-shelter`,
    };
  if (r.id === "hari" && state.rehearsal.active)
    return {
      who: "Hari",
      text: "Thaalam pizhachu. Onnu koodi.",
      zone: "life-hari-practice",
    };
  if (r.id === "leela" && r.mode === "working")
    return {
      who: "Leela",
      text: "Oru chaya koodi edukkatte?",
      zone: "life-leela-shop",
    };
  if (r.id === "binu" && state.ferry.phase === "crossing")
    return {
      who: "Binu",
      text: "The passenger boat is crossing. It'll come back to this landing.",
      zone: "life-binu-boat",
    };
  return null;
}

export function keepPhotoStory(state, id, player) {
  const story = storyById(id);
  if (
    !story ||
    distance(player, story) >= 6 ||
    state.bus.player ||
    state.auto.player ||
    state.ferry.player
  )
    return false;
  remember(state, {
    id: `story-${id}`,
    place: story.place,
    text: `Kept a photo story: ${story.title}.`,
  });
  return true;
}
