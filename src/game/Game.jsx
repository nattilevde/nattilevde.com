import { canAddFlowers } from "./onam.js";
import ChendaPractice from "./ChendaPractice.jsx";
import { STORIES, storyById } from "./stories.js";
import {
  createPlaytest,
  tickPlaytest,
  discoverPlaytest,
  loadPlaytests,
  persistPlaytest,
  playtestSummary,
  PLAYTEST_KEY,
} from "./playtest.js";
import StoryCard from "./StoryCard.jsx";
import { makePostcard, postcardFile } from "./postcard.js";
import { FISH_LANDING } from "./fishing.js";
import { AUTO_STOPS, autoOpen } from "./auto.js";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bus,
  Car,
  Camera,
  Check,
  CloudRain,
  Compass,
  Flag,
  Footprints,
  HelpCircle,
  Leaf,
  Lock,
  Map,
  MapPin,
  Maximize,
  Moon,
  Pause,
  Play,
  Settings2,
  Ship,
  Sparkles,
  Sun,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { BUS_STOPS } from "./bus.js";
import { createGame } from "./engine.js";
import { RESIDENTS, FERRY_STOPS } from "./life-data.js";
import { lifeHour, lifeDay } from "./life.js";
import {
  overheardFor,
  weatherLine,
  conductorLine,
  arrivalLine,
} from "./culture.js";
import {
  REGION,
  sites,
  activities,
  readJourney,
  rankFor,
  regionAt,
  regions,
  roads,
  HIGHWAY,
  coastX,
  REGION_GATEWAYS,
  REST_SPOTS,
  travelDestinations,
} from "./world.js";
import "./game.css";

const MAP = (() => {
  const b = REGION.bounds;
  const W = b.maxX - b.minX;
  const H = b.maxZ - b.minZ;
  let coastPath = `M0 0`;
  for (let z = b.minZ; z <= b.maxZ; z += 60)
    coastPath += ` L${coastX(z) - b.minX} ${z - b.minZ}`;
  coastPath += ` L${coastX(b.maxZ) - b.minX} ${H} L0 ${H} Z`;
  const roadPaths = roads.map((road) =>
    road.points
      .map(([x, z], i) => `${i ? "L" : "M"}${x - b.minX} ${z - b.minZ}`)
      .join(" "),
  );
  return { b, W, H, coastPath, roadPaths };
})();

const MAP_LABELS = [
  {
    x: 210,
    z: -1200,
    name: "MALABAR COAST",
    sub: "Kasaragod · Kannur · Kozhikode",
  },
  {
    x: 210,
    z: -720,
    name: "CENTRAL KERALA",
    sub: "Palakkad · Thrissur · Ernakulam",
  },
  { x: 585, z: -580, name: "THE HIGH RANGES", sub: "Wayanad · Idukki" },
  { x: 220, z: 60, name: "THE BACKWATERS", sub: "Alappuzha · Kottayam" },
  {
    x: 210,
    z: 720,
    name: "TRAVANCORE SOUTH",
    sub: "Kollam · Thiruvananthapuram",
  },
];

function WorldMap({
  state,
  journey,
  large = false,
  destinations = [],
  picked = null,
  onPick,
}) {
  const { b, W, H, coastPath, roadPaths } = MAP;
  const explored = new Set(journey.cells);
  const cs = REGION.cellSize;
  const cols = Math.ceil(W / cs);
  const rows = Math.ceil(H / cs);
  const px = state.x - b.minX;
  const pz = state.z - b.minZ;
  const crop = 210;
  const view = large
    ? `0 0 ${W} ${H}`
    : `${px - crop / 2} ${pz - crop / 2} ${crop} ${crop}`;
  const c0 = large ? 0 : Math.max(0, Math.floor((px - crop / 2) / cs));
  const c1 = large ? cols : Math.min(cols, Math.ceil((px + crop / 2) / cs));
  const r0 = large ? 0 : Math.max(0, Math.floor((pz - crop / 2) / cs));
  const r1 = large ? rows : Math.min(rows, Math.ceil((pz + crop / 2) / cs));
  const fog = [];
  for (let cx = c0; cx < c1; cx++)
    for (let cz = r0; cz < r1; cz++)
      if (!explored.has(`${cx},${cz}`))
        fog.push(
          <rect
            key={`${cx},${cz}`}
            x={cx * cs}
            y={cz * cs}
            width={cs + 0.7}
            height={cs + 0.7}
            fill="#213f37"
            opacity={large ? ".62" : ".94"}
          />,
        );
  const marker = large ? 3.2 : 1;
  return (
    <svg
      className={`game-map ${large ? "game-map-large" : ""}`}
      viewBox={view}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Exploration map of Kerala. ${journey.discoveries.length} of ${sites.length} locations discovered. Undiscovered terrain is concealed.`}
    >
      <rect width={W} height={H} fill="#a8b882" />
      {/* Highlands tint east, laterite tint north */}
      <rect x={540} width={W - 540} height={H} fill="#8ba06b" opacity=".55" />
      <rect width={540} height={520} fill="#b3a06b" opacity=".3" />
      <path d={coastPath} fill="#559d9b" />
      <path
        d={coastPath}
        fill="none"
        stroke="#e3d4a2"
        strokeWidth={10}
        opacity=".9"
      />
      {/* canal, river, lagoon, pond, pool */}
      <rect
        x={30 - b.minX}
        y={-155 - b.minZ}
        width="16"
        height="310"
        fill="#64a6a0"
      />
      <rect x={0} y={-614 - b.minZ} width={590} height="28" fill="#64a6a0" />
      <ellipse
        cx={250 - b.minX}
        cy={450 - b.minZ}
        rx="92"
        ry="137"
        fill="#64a6a0"
      />
      <circle cx={620 - b.minX} cy={-185 - b.minZ} r="8" fill="#64a6a0" />
      {/* the coastal highway and branching roads */}
      <path
        d={`M${HIGHWAY.x - b.minX} ${HIGHWAY.from - b.minZ}V${HIGHWAY.to - b.minZ}`}
        fill="none"
        stroke="#dec998"
        strokeWidth="8"
      />
      {roadPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#dec998" strokeWidth="6" />
      ))}
      {fog}
      {large &&
        MAP_LABELS.map((label) => (
          <g key={label.name}>
            <text
              x={label.x}
              y={label.z - b.minZ}
              textAnchor="middle"
              fill="#d8e4c2"
              fontSize="30"
              letterSpacing="4"
              fontWeight="700"
              opacity=".85"
            >
              {label.name}
            </text>
            <text
              x={label.x}
              y={label.z - b.minZ + 30}
              textAnchor="middle"
              fill="#b9c9a4"
              fontSize="20"
              opacity=".8"
            >
              {label.sub}
            </text>
          </g>
        ))}
      {sites
        .filter((s) => journey.discoveries.includes(s.id))
        .map((s) => (
          <g key={s.id}>
            {/* On the large map the travel targets draw these dots instead. */}
            {!large && (
              <circle
                cx={s.x - b.minX}
                cy={s.z - b.minZ}
                r={(s.kind === "hidden" ? 4 : 3) * 1.2}
                fill={s.kind === "hidden" ? "#f3cc79" : "#fff4d4"}
                stroke="#294e3b"
                strokeWidth={1.5}
              />
            )}
            {large && (
              <text
                x={s.x - b.minX}
                y={s.z - b.minZ + 28}
                textAnchor="middle"
                fill="#fff4d4"
                fontSize="17"
                stroke="#294e3b"
                strokeWidth="3.5"
                paintOrder="stroke"
              >
                {s.name}
              </text>
            )}
          </g>
        ))}
      {/* Travel targets: click one on the large map to ride the bus there. */}
      {large &&
        destinations.map((dest) => {
          const cx = dest.x - b.minX;
          const cy = dest.z - b.minZ;
          const isPicked = picked?.id === dest.id;
          const gateway = dest.kind === "gateway";
          return (
            <g
              key={dest.id}
              className={
                dest.unlocked ? "game-map-target" : "game-map-target locked"
              }
              role={dest.unlocked ? "button" : undefined}
              tabIndex={dest.unlocked ? 0 : undefined}
              aria-label={
                dest.unlocked
                  ? `Travel to ${dest.name}`
                  : `${dest.name}, locked`
              }
              onClick={() => dest.unlocked && onPick?.(dest)}
              onKeyDown={(e) => {
                if (dest.unlocked && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onPick?.(dest);
                }
              }}
            >
              {isPicked && (
                <circle cx={cx} cy={cy} r="26" fill="#f6e8bc" opacity=".28" />
              )}
              {gateway ? (
                <rect
                  x={cx - 11}
                  y={cy - 11}
                  width="22"
                  height="22"
                  rx="5"
                  fill={dest.unlocked ? "#e8b755" : "#5c6f58"}
                  stroke={isPicked ? "#fff4d4" : "#294e3b"}
                  strokeWidth={isPicked ? 5 : 3.5}
                />
              ) : (
                <circle
                  cx={cx}
                  cy={cy}
                  r="9"
                  fill="#fff4d4"
                  stroke={isPicked ? "#e8b755" : "#294e3b"}
                  strokeWidth={isPicked ? 5 : 3.5}
                />
              )}
            </g>
          );
        })}
      {state.life?.jeep && !state.driving && (
        <g
          transform={`translate(${state.life.jeep.x - b.minX},${state.life.jeep.z - b.minZ}) scale(${marker})`}
        >
          <title>Parked hill jeep</title>
          <rect
            x="-5"
            y="-5"
            width="10"
            height="10"
            rx="2"
            fill="#506d49"
            stroke="#fff4d4"
            strokeWidth="1.5"
          />
        </g>
      )}
      {state.scooter && !state.riding && (
        <g
          transform={`translate(${state.scooter.x - b.minX},${state.scooter.z - b.minZ}) scale(${marker})`}
        >
          <circle r="5" fill="#3f8f86" stroke="#eee4ca" strokeWidth="1.6" />
        </g>
      )}
      <g
        transform={`translate(${px},${pz}) rotate(${(-state.heading * 180) / Math.PI}) scale(${marker})`}
      >
        <circle r="8" fill="#f6e8bc" opacity=".2" />
        <path
          d="M0-6L4 5 0 3-4 5Z"
          fill="#fff4d0"
          stroke="#173d32"
          strokeWidth="1"
        />
      </g>
      {large && (
        <>
          <text x="26" y="52" fill="#e9edcf" fontSize="26">
            N
          </text>
          <path
            d="M34 70V110M24 80L34 70 44 80"
            stroke="#e9edcf"
            strokeWidth="4"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

function GameDialog({ title, onClose, children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`game-dialog ${className}`}
      aria-label={title}
      onCancel={onClose}
    >
      <button
        className="game-dialog-close"
        aria-label="Close game panel"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}

export default function Game({ onExit, onRecord }) {
  const container = useRef(null),
    engine = useRef(null),
    callbacks = useRef({ onRecord });
  callbacks.current = { onRecord };
  const [journey, setJourney] = useState(readJourney);
  const journeyRef = useRef(journey);
  const firstVisit = useRef(!journey.life && journey.discoveries.length === 0);
  const pilot = useRef(null);
  const priorPilot = useRef([]);
  const [driveHint, setDriveHint] = useState(false);
  const [assistance, setAssistance] = useState(journey.assistance === true);
  const [captions, setCaptions] = useState(journey.captions === true);
  const [encounterDetail, setEncounterDetail] = useState(null);
  const [ownsWorld, setOwnsWorld] = useState(!navigator.locks);
  useEffect(() => {
    if (!navigator.locks) return;
    let cancelled = false,
      release;
    async function reserveWorld() {
      // StrictMode may release an initial mount's lock one browser task later.
      for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
        const acquired = await navigator.locks.request(
          "nattilevde-world-writer",
          { ifAvailable: true },
          async (lock) => {
            if (cancelled || !lock) return false;
            setOwnsWorld(true);
            await new Promise((resolve) => {
              release = resolve;
            });
            return true;
          },
        );
        if (acquired || cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!cancelled)
        setError(
          "Your world is open in another tab. Close that world's tab, then return here from the portal to continue safely.",
        );
    }
    reserveWorld().catch(() => {
      if (!cancelled)
        setError(
          "The world could not reserve its save. Return to the portal and try again.",
        );
    });
    return () => {
      cancelled = true;
      release?.();
    };
  }, []);
  const [jeepGuide, setJeepGuide] = useState(false);
  const [jeepReturnError, setJeepReturnError] = useState("");
  const [state, setState] = useState({
    ...journey.position,
    heading: 0,
    nearby: null,
    boating: false,
    riding: false,
    sitting: null,
    restSpot: null,
    busStop: null,
    rain: 0,
    nearScooter: false,
    scooter: journey.scooter,
    night: false,
    moving: false,
  });
  const [ready, setReady] = useState(false),
    [started, setStarted] = useState(false),
    [error, setError] = useState("");
  const [panel, setPanel] = useState(null),
    [encounter, setEncounter] = useState(null),
    [notice, setNotice] = useState(null);
  const [postcard, setPostcard] = useState(null);
  const [photoError, setPhotoError] = useState("");
  function openPhoto() {
    engine.current?.setPaused(true);
    setPhotoError("");
    try {
      const at = stateRef.current;
      const place = sites.find(
        (s) => Math.hypot(s.x - at.x, s.z - at.z) < s.radius,
      );
      setPostcard(
        makePostcard(
          engine.current.captureFrame(),
          place?.name || regionAt(at.x, at.z).name,
        ),
      );
    } catch {
      setPostcard(null);
      setPhotoError(
        "The postcard could not be created. Return to the world and try again.",
      );
    }
    setPanel("photo");
  }
  const [sound, setSound] = useState(true),
    [time, setTime] = useState("cycle"),
    [low, setLow] = useState(false),
    [running, setRunning] = useState(false);
  const [beats, setBeats] = useState(0),
    [stick, setStick] = useState({ x: 0, y: 0 }),
    [picked, setPicked] = useState(null),
    [overheard, setOverheard] = useState(null),
    [busRide, setBusRide] = useState(false);
  const overheardTimer = useRef(null),
    lastLine = useRef({ text: "", at: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastMemories = useRef("");
  const lastSave = useRef(0),
    noticeTimer = useRef(null);
  const region = regionAt(state.x, state.z);
  const lastRegion = useRef(region.id);
  const completed = activities.filter((a) =>
    a.requires.every((id) => journey[a.source].includes(id)),
  );
  const objective = activities.find((a) => !completed.includes(a));
  const nearby = state.contact || sites.find((s) => s.id === state.nearby);
  const encounterSite =
    encounterDetail || sites.find((s) => s.id === encounter);
  const life = state.life;
  const memories = life?.memories || [];
  const [storyId, setStoryId] = useState(null);
  const activeStory = storyById(storyId);
  const nearbyStory = STORIES.find(
    (s) => Math.hypot(state.x - s.x, state.z - s.z) < 6,
  );
  const openStory = (id) => {
    setStoryId(id);
    setPanel("story");
  };
  const keepStory = () => {
    if (engine.current?.keepPhotoStory(storyId))
      save({ ...journeyRef.current, life: engine.current.getLife() });
  };
  const parkedJeep = state.life?.jeep;
  const jeepDistance = parkedJeep
    ? Math.hypot(parkedJeep.x - state.x, parkedJeep.z - state.z)
    : 0;
  const jeepBearing = parkedJeep
    ? ((Math.atan2(parkedJeep.x - state.x, state.z - parkedJeep.z) +
        state.heading) *
        180) /
      Math.PI
    : 0;
  const canReturnToJeep =
    !state.riding &&
    !state.boating &&
    !state.sitting &&
    !state.autoPassenger &&
    !state.busPassenger &&
    !state.ferryPassenger;
  function returnToJeep() {
    if (engine.current?.returnToJeep()) {
      setJeepGuide(false);
      setPanel(null);
      setJeepReturnError("");
      save({
        ...journeyRef.current,
        position: engine.current.getPosition(),
        life: engine.current.getLife(),
      });
    } else
      setJeepReturnError(
        "Step out of your current ride or seat first. The jeep also needs a clear place beside it.",
      );
  }
  const cue = state.cue;
  const cueDirection = cue
    ? (() => {
        const dx = cue.x - state.x,
          dz = cue.z - state.z;
        const right =
          dx * Math.cos(state.heading) - dz * Math.sin(state.heading);
        const ahead =
          -dx * Math.sin(state.heading) - dz * Math.cos(state.heading);
        return Math.abs(right) > Math.abs(ahead)
          ? right > 0
            ? "to your right"
            : "to your left"
          : ahead > 0
            ? "ahead"
            : "behind you";
      })()
    : "";
  const restSpot = REST_SPOTS.find(
    (s) => s.id === (state.sitting || state.restSpot),
  );
  const destinations = travelDestinations(journey);
  const openDestinations = destinations.filter((d) => d.unlocked);

  function save(next) {
    journeyRef.current = next;
    setJourney(next);
    try {
      localStorage.setItem("kerala-world-journey", JSON.stringify(next));
    } catch {
      /* In-memory exploration remains available. */
    }
  }
  function announce(value) {
    clearTimeout(noticeTimer.current);
    setNotice(value);
    noticeTimer.current = setTimeout(() => setNotice(null), 5200);
  }
  // Overheard talk is ambience: it never blocks, never repeats back to back,
  // and stays quiet unless a while has passed since the last line.
  function say(line, { force = false } = {}) {
    if (!line) return;
    const now = Date.now();
    if (!force && now - lastLine.current.at < 21000) return;
    if (line.text === lastLine.current.text && !force) return;
    lastLine.current = { text: line.text, at: now };
    clearTimeout(overheardTimer.current);
    setOverheard(line);
    overheardTimer.current = setTimeout(
      () => setOverheard(null),
      line.gloss ? 7000 : 5600,
    );
  }
  function record(kind, id) {
    const old = journeyRef.current;
    if (old[kind].includes(id)) return;
    if (kind === "discoveries" && pilot.current)
      discoverPlaytest(pilot.current, id);
    const next = { ...old, [kind]: [...old[kind], id] };
    const oldRank = rankFor(old);
    save(next);
    const site =
      kind === "moments"
        ? REST_SPOTS.find((s) => s.id === id)
        : sites.find((s) => s.id === id);
    // Rest moments stay in the game passport; places and encounters reach the portal.
    if (kind !== "moments") callbacks.current.onRecord(kind, site);
    const newlyCompleted = activities.filter(
      (a) =>
        a.requires.every((id) => next[a.source].includes(id)) &&
        !a.requires.every((id) => old[a.source].includes(id)),
    );
    newlyCompleted.forEach((a) => callbacks.current.onRecord("activity", a));
    const newRank = rankFor(next);
    announce(
      newlyCompleted.length
        ? {
            title: newlyCompleted[0].badge,
            subtitle: "ACTIVITY COMPLETE",
            text: newlyCompleted[0].name,
            badge: true,
          }
        : newRank.title !== oldRank.title
          ? {
              title: newRank.title,
              subtitle: "TRAVELLER RANK EARNED",
              text: `${site.name} tipped the scales. Your passport remembers.`,
              badge: true,
            }
          : {
              title: site.name,
              subtitle:
                kind === "moments"
                  ? "A QUIET MOMENT, KEPT"
                  : kind === "discoveries"
                    ? site.kind === "hidden"
                      ? "A LITTLE SECRET, FOUND"
                      : "NEW PLACE DISCOVERED"
                    : "A LITTLE KERALA, COLLECTED",
              text: site.line,
            },
    );
  }

  useEffect(() => {
    if (!ownsWorld) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    callbacks.current.onRecord("restore", journeyRef.current);
    let game;
    try {
      game = createGame(container.current, {
        initial: journeyRef.current,
        onUpdate(next) {
          setState(next);
          const memoryKey = next.life.memories.map((m) => m.id).join("|");
          if (memoryKey !== lastMemories.current) {
            lastMemories.current = memoryKey;
            callbacks.current.onRecord(
              "memories",
              next.life.memories.map((m) => m.text),
            );
          }
          if (Date.now() - lastSave.current > 1800) {
            save({
              ...journeyRef.current,
              cells: next.cells,
              life: next.life,
              scooter: next.riding ? journeyRef.current.scooter : next.scooter,
              position: game?.getPosition() || journeyRef.current.position,
            });
            lastSave.current = Date.now();
          }
        },
        onDiscover: (id) => record("discoveries", id),
        onInteract: (id, detail) => {
          setEncounterDetail(detail);
          setBeats(0);
          setEncounter(id);
          setPanel("encounter");
        },
        onMoment: (id) => record("moments", id),
        onEvent: (kind) => {
          if (!journeyRef.current.assistance) return;
          say(weatherLine(kind), { force: true });
          announce(
            kind === "rain-start"
              ? {
                  title: "A shower rolls in",
                  subtitle: "THE SKY CHANGES ITS MIND",
                  text: "Kerala rain arrives without asking. Find a veranda, or just keep walking.",
                  weather: true,
                }
              : {
                  title: "The rain passes",
                  subtitle: "AFTER THE SHOWER",
                  text: "Everything smells green again.",
                  weather: true,
                },
          );
        },
        onError: setError,
      });
      engine.current = game;
      game
        .prepare()
        .then((prepared) => {
          if (prepared && engine.current === game) setReady(true);
        })
        .catch(() => {
          if (engine.current === game)
            setError(
              "The graphics could not finish loading. Return to the portal and try again.",
            );
        });
    } catch (e) {
      console.error("Kerala world could not initialize", e);
      setError(
        "This browser could not start WebGL. Enable hardware acceleration or try a recent browser. Your portal and passport are still available.",
      );
    }
    return () => {
      if (game) {
        const next = {
          ...journeyRef.current,
          position: game.getPosition(),
          life: game.getLife(),
        };
        try {
          localStorage.setItem("kerala-world-journey", JSON.stringify(next));
        } catch {}
        game.dispose();
      }
      engine.current = null;
      document.body.style.overflow = originalOverflow;
      clearTimeout(noticeTimer.current);
    };
  }, [ownsWorld]);

  useEffect(() => {
    engine.current?.setPaused(!started || !!panel || !!error);
  }, [started, panel, error, ready]);
  useEffect(() => {
    if (!started) return;
    let last = performance.now();
    const flush = () => {
      if (pilot.current)
        persistPlaytest(localStorage, priorPilot.current, pilot.current);
    };
    const timer = setInterval(() => {
      const now = performance.now();
      if (!panel && !error && !document.hidden)
        tickPlaytest(
          pilot.current,
          (now - last) / 1000,
          stateRef.current.driving,
        );
      last = now;
      flush();
    }, 1000);
    window.addEventListener("pagehide", flush);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [started, panel, error]);
  async function beginJourney(withJeep = false) {
    if (!pilot.current) {
      priorPilot.current = loadPlaytests(localStorage);
      pilot.current = createPlaytest(!firstVisit.current);
    }
    engine.current?.setPaused(false);
    const driving =
      withJeep && engine.current?.returnToJeep() && engine.current.drive();
    setDriveHint(!!driving);
    setStarted(true);
    if (sound) {
      const ok = await engine.current?.setSound(true);
      if (ok === false) setSound(false);
    }
  }
  // Listen for something worth overhearing wherever the player has wandered.
  useEffect(() => {
    if (!started || panel) return;
    const listen = setInterval(() => {
      const now = stateRef.current;
      if (now.boating || now.ferryPassenger) return;
      const inVillage = now.x > -100 && now.x < 115 && Math.abs(now.z) < 160;
      say(
        inVillage
          ? now.localLine
          : overheardFor({
              x: now.x,
              z: now.z,
              rain: now.rain,
              night: now.night,
            }),
      );
    }, 6500);
    return () => clearInterval(listen);
  }, [started, panel]);
  useEffect(() => () => clearTimeout(overheardTimer.current), []);
  useEffect(() => {
    if (!started || lastRegion.current === region.id) return;
    lastRegion.current = region.id;
    announce({
      title: region.name,
      subtitle: "ENTERING A NEW REGION",
      text: region.districts,
    });
  }, [region.id, started]);
  useEffect(() => {
    const shortcut = (e) => {
      if (!started || e.repeat || e.target?.closest?.("input")) return;
      if (e.code === "Escape" && panel === "photo") {
        e.preventDefault();
        setPanel(null);
        setPostcard(null);
        return;
      }
      if (e.code === "KeyC" && !panel) {
        e.preventDefault();
        openPhoto();
        return;
      }
      if (e.code === "Escape" && !panel) {
        e.preventDefault();
        setPanel("pause");
      }
      if (!panel && ["KeyM", "KeyP", "KeyH"].includes(e.code)) {
        e.preventDefault();
        setPanel(
          e.code === "KeyM" ? "map" : e.code === "KeyP" ? "passport" : "help",
        );
      }
      if (!panel && e.code === "KeyB" && engine.current) {
        e.preventDefault();
        setPanel("travel");
      }
    };
    const visibility = () => {
      if (document.hidden && started) setPanel((p) => p || "pause");
    };
    window.addEventListener("keydown", shortcut);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", shortcut);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [started, panel]);

  const closePanel = () => {
    setPanel(null);
    setEncounter(null);
    setEncounterDetail(null);
    setPicked(null);
  };
  // Fast travel is a bus ride, not a teleport: bell, conductor, then the road.
  function travel(destination) {
    if (!destination?.unlocked || busRide) return;
    closePanel();
    setBusRide(true);
    engine.current?.bell();
    say(conductorLine(), { force: true });
    setTimeout(() => {
      engine.current?.travelTo(destination);
      say(arrivalLine(), { force: true });
      announce({
        title: destination.name,
        subtitle: "THE BUS DROPS YOU OFF",
        text: "Mind the step. Good exploring.",
      });
      setTimeout(() => setBusRide(false), 260);
    }, 1150);
  }
  function completeEncounter() {
    if (encounterSite.residentId === "hari" && !life?.rehearsal.active) return;
    if (encounterSite.kind === "culture" && beats < 2) {
      setBeats((b) => b + 1);
      engine.current.playBeat();
      return;
    }
    record("interactions", encounter);
    engine.current.chime();
    setBeats(3);
  }
  function joystick(e) {
    const box = e.currentTarget.getBoundingClientRect(),
      dx = e.clientX - box.x - box.width / 2,
      dy = e.clientY - box.y - box.height / 2,
      length = Math.max(32, Math.hypot(dx, dy));
    const value = { x: dx / length, y: dy / length };
    setStick(value);
    engine.current?.setMove(value.x, value.y);
  }
  function releaseStick() {
    setStick({ x: 0, y: 0 });
    engine.current?.setMove(0, 0);
  }

  return (
    <div
      className={`kerala-game ${assistance ? "" : "game-quiet"} ${panel === "photo" ? "game-photo-mode" : ""}`}
      data-testid="kerala-game"
      data-ready={ready}
      data-x={state.x.toFixed(1)}
      data-z={state.z.toFixed(1)}
      data-boating={state.boating}
      data-auto-passenger={state.autoPassenger || false}
      data-bus-passenger={state.busPassenger || false}
      data-ferry={state.ferryPassenger || false}
      data-riding={state.riding}
      data-driving={!!state.driving}
      data-sitting={state.sitting || ""}
    >
      <div className="game-canvas-host" ref={container} />
      <div className="game-vignette" />
      <header className="game-top">
        <button
          className="game-back"
          aria-label="Back to Kerala"
          onClick={onExit}
        >
          <ArrowLeft size={17} />
          <span>Back to Kerala</span>
        </button>
        <div className="game-wordmark">
          <Leaf size={17} />
          <span>
            kerala <small>UNFOLDED</small>
          </span>
        </div>
        <div className="game-top-actions">
          {started && (
            <>
              <button
                aria-label="Open exploration map"
                title="Map (M)"
                onClick={() => setPanel("map")}
              >
                <Map size={19} />
              </button>
              <button
                aria-label="Photo mode"
                title="Photo mode (C)"
                onClick={openPhoto}
              >
                <Camera size={19} />
              </button>
              <button
                aria-label={sound ? "Mute the world" : "Unmute the world"}
                title="Sound"
                onClick={async () => {
                  const next = !sound;
                  const ok = await engine.current?.setSound(next);
                  setSound(next && ok !== false);
                }}
              >
                {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
              </button>
              {!state.driving && (
                <button
                  aria-label="Find my jeep"
                  title="Find my jeep"
                  onClick={() => {
                    setJeepReturnError("");
                    setPanel("jeep");
                  }}
                >
                  <Car size={19} />
                </button>
              )}
              <button
                aria-label="Open bus network"
                title="Fast travel (B)"
                onClick={() => setPanel("travel")}
              >
                <Bus size={19} />
              </button>
              <button
                aria-label="Open game passport"
                title="Passport (P)"
                onClick={() => setPanel("passport")}
              >
                <BookOpen size={19} />
              </button>
              <button aria-label="Pause game" onClick={() => setPanel("pause")}>
                <Pause size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {!started && !error && (
        <div className="game-intro">
          <div className="game-intro-kicker">
            <span /> YOUR FIRST CHAPTER IN THE WORLD
          </div>
          <h1>
            Less scrolling.
            <br />
            More <em>wandering.</em>
          </h1>
          <p>
            A jeep beside the village. Harbour streets to the north. Paddy lanes
            and a winding climb beyond. Take whichever road catches your eye.
          </p>
          <label className="game-intro-sound">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
            Sound on — the world is worth listening to
          </label>
          {firstVisit.current && (
            <button
              className="game-primary"
              disabled={!ready}
              onClick={() => beginJourney(true)}
            >
              Start with the jeep <Car size={18} />
            </button>
          )}
          <button
            className={firstVisit.current ? "game-secondary" : "game-primary"}
            disabled={!ready}
            onClick={() => beginJourney()}
          >
            {ready
              ? journey.discoveries.length
                ? "Continue your journey"
                : "Step into Kerala"
              : "Preparing your little world..."}
            <ArrowRight size={18} />
          </button>
          <div className="game-intro-meta">
            <MapPin size={13} /> KADAL VILLAGE <span /> FIVE REGIONS <span />{" "}
            FOURTEEN DISTRICTS
          </div>
          <div className="game-intro-controls">
            <span>
              <kbd>W A S D</kbd> Move
            </span>
            <span>Drag to look</span>
            <span>
              <kbd>E</kbd> Interact
            </span>
          </div>
          <small className="game-fiction-note">
            A handcrafted fictional village inspired by coastal Kerala. A short
            playtest summary stays in this browser; nothing is sent. View or
            clear it in Pause.
          </small>
        </div>
      )}

      {started && !error && (
        <>
          <div className="game-region">
            <span>{region.districts.toUpperCase()}</span>
            <h2>
              {state.boating
                ? "Along the backwaters"
                : nearby?.name || region.name}
            </h2>
            <div>
              <span className="game-live-dot" />
              {state.rain > 0.15
                ? "Monsoon shower passing through"
                : state.night
                  ? "Moonlit wandering"
                  : "A little golden-hour wandering"}
            </div>
          </div>
          {assistance && (
            <div className="game-objective">
              <span>
                <Flag size={13} />
                {objective ? "A LITTLE DIRECTION" : "A CHAPTER WELL TRAVELLED"}
              </span>
              <strong>
                {objective?.name || "Let curiosity take you further"}
              </strong>
              <p>
                {objective?.description ||
                  "All three activities complete. The village is still yours to wander."}
              </p>
              {objective && (
                <div className="game-objective-dots">
                  {objective.requires.map((id) => (
                    <i
                      key={id}
                      className={
                        journey[objective.source].includes(id) ? "filled" : ""
                      }
                    />
                  ))}
                  <small>
                    {
                      objective.requires.filter((id) =>
                        journey[objective.source].includes(id),
                      ).length
                    }
                    /{objective.requires.length}
                  </small>
                </div>
              )}
            </div>
          )}
          <button
            className="game-minimap"
            aria-label="Expand exploration map"
            onClick={() => setPanel("map")}
          >
            <WorldMap state={state} journey={journey} />
            <span>
              <Compass size={12} />
              {assistance
                ? `${journey.discoveries.length} / ${sites.length} discovered`
                : "Your surroundings"}
              <Maximize size={11} />
            </span>
          </button>
          {captions && cue && (
            <div className="game-world-cue" role="status">
              {cue.text} · {cueDirection}
            </div>
          )}
          {life && !panel && (
            <div className="game-life-actions">
              {nearbyStory &&
                !state.autoPassenger &&
                !state.busPassenger &&
                !state.ferryPassenger &&
                !state.boating &&
                !state.riding && (
                  <button onClick={() => openStory(nearbyStory.id)}>
                    Inspect {nearbyStory.label}
                  </button>
                )}
              {!state.autoPassenger &&
                !state.busPassenger &&
                !state.ferryPassenger &&
                !state.boating &&
                !state.riding &&
                !state.sitting &&
                life.fishing.phase === "unloading" &&
                life.fishing.cargo > 0 &&
                life.fishing.helped !== life.fishing.trip &&
                Math.hypot(state.x - FISH_LANDING.x, state.z - FISH_LANDING.z) <
                  6 && (
                  <button
                    onClick={() => engine.current?.lifeAction("help-fish")}
                  >
                    Help unload the catch
                  </button>
                )}
              {!state.autoPassenger &&
                !state.busPassenger &&
                !state.ferryPassenger &&
                !state.boating &&
                !state.riding &&
                !state.sitting &&
                state.autoStop === life.auto.stop &&
                life.auto.phase === "waiting" &&
                autoOpen(lifeHour(life)) && (
                  <button
                    onClick={() => engine.current?.lifeAction("board-auto")}
                  >
                    Take auto to {AUTO_STOPS[1 - life.auto.stop].name}
                  </button>
                )}
              {state.autoPassenger && (
                <>
                  <span>
                    {life.auto.phase === "travelling"
                      ? `Auto to ${AUTO_STOPS[1 - life.auto.stop].name}`
                      : AUTO_STOPS[life.auto.stop].name}
                  </span>
                  {life.auto.phase === "travelling" ? (
                    <button onClick={() => engine.current?.skipAuto()}>
                      Shorten auto journey
                    </button>
                  ) : (
                    <button
                      onClick={() => engine.current?.lifeAction("leave-auto")}
                    >
                      Leave the auto
                    </button>
                  )}
                </>
              )}

              {!state.autoPassenger &&
                !state.busPassenger &&
                !state.ferryPassenger &&
                !state.boating &&
                !state.riding &&
                !state.sitting &&
                state.physicalBusStop === life.bus.stop &&
                life.bus.phase === "boarding" && (
                  <button
                    onClick={() => engine.current?.lifeAction("board-bus")}
                  >
                    Board local bus to {BUS_STOPS[1 - life.bus.stop].name}
                  </button>
                )}
              {state.busPassenger && (
                <>
                  <span>
                    {life.bus.phase === "travelling"
                      ? `On the road to ${BUS_STOPS[1 - life.bus.stop].name}`
                      : BUS_STOPS[life.bus.stop].name}
                  </span>
                  {life.bus.phase !== "travelling" && (
                    <button
                      onClick={() => engine.current?.lifeAction("leave-bus")}
                    >
                      Leave the bus
                    </button>
                  )}
                  {life.bus.phase !== "waiting" && (
                    <button onClick={() => engine.current?.skipBus()}>
                      Shorten bus journey
                    </button>
                  )}
                </>
              )}
              {!state.boating &&
                !state.driving &&
                !state.riding &&
                canAddFlowers(life, state) && (
                  <button
                    onClick={() => engine.current?.lifeAction("add-flowers")}
                  >
                    Add a few flowers
                  </button>
                )}
              {!state.autoPassenger &&
                !state.busPassenger &&
                life.coir.phase === "covering" &&
                life.coir.helped !== life.weather.episode &&
                Math.hypot(state.x - 62, state.z + 44) < 6 && (
                  <button onClick={() => engine.current?.lifeAction("coir")}>
                    Help cover the fibre
                  </button>
                )}
              {!state.autoPassenger &&
                !state.busPassenger &&
                life.rehearsal.active &&
                life.rehearsal.joined !== lifeDay(life) &&
                Math.hypot(state.x + 19, state.z + 23) < 7 && (
                  <button
                    onClick={() => engine.current?.lifeAction("rehearsal")}
                  >
                    Play a few beats together
                  </button>
                )}
              {!state.autoPassenger &&
                !state.busPassenger &&
                !state.ferryPassenger &&
                state.ferryStop >= 0 &&
                life.ferry.stop === state.ferryStop &&
                life.ferry.phase === "boarding" &&
                !state.boating &&
                !state.riding && (
                  <button
                    onClick={() => engine.current?.lifeAction("board-ferry")}
                  >
                    Board for {FERRY_STOPS[1 - life.ferry.stop].name}
                  </button>
                )}
              {state.ferryPassenger && (
                <>
                  <span>
                    {life.ferry.phase === "crossing"
                      ? `Crossing to ${FERRY_STOPS[1 - life.ferry.stop].name}`
                      : FERRY_STOPS[life.ferry.stop].name}
                  </span>
                  {life.ferry.phase === "waiting" && (
                    <span>
                      {lifeHour(life) < 6 || lifeHour(life) >= 19
                        ? "Service resumes in the morning."
                        : "Waiting for the heavy shower to ease."}
                    </span>
                  )}
                  {life.ferry.phase !== "crossing" && (
                    <button
                      onClick={() => engine.current?.lifeAction("leave-ferry")}
                    >
                      Step ashore
                    </button>
                  )}
                  {life.ferry.phase !== "waiting" && (
                    <button onClick={() => engine.current?.skipFerry()}>
                      Shorten the ride
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          <div className="game-bottom-controls">
            <span>
              <kbd>W A S D</kbd> Move
            </span>
            <span>
              <kbd>SHIFT</kbd> Run
            </span>
            <span>
              <kbd>R</kbd> Scooter
            </span>
            <span>
              <kbd>B</kbd> Bus
            </span>
            <span>Drag to look</span>
            <button
              onClick={() => setPanel("help")}
              aria-label="Show game controls"
            >
              <HelpCircle size={15} />
            </button>
          </div>
          {state.sitting && restSpot && !panel && (
            <div className="game-rest-overlay" role="status">
              <span className="game-overline">SITTING FOR A WHILE</span>
              <h3>{restSpot.name}</h3>
              <p>{restSpot.line}</p>
              <button onClick={() => engine.current?.stand()}>
                <kbd>E</kbd> Stand up
              </button>
            </div>
          )}
          {!panel && !state.sitting && !nearby && state.restSpot && (
            <button
              className="game-interaction"
              onClick={() => engine.current?.sit()}
            >
              <kbd>E</kbd>
              <span>
                Sit a while
                <strong>{restSpot?.name || "Rest here"}</strong>
              </span>
              <ArrowRight size={17} />
            </button>
          )}
          {!panel &&
            !state.sitting &&
            !nearby &&
            !state.restSpot &&
            state.busStop &&
            !state.riding &&
            !state.boating && (
              <button
                className="game-interaction"
                onClick={() => setPanel("travel")}
              >
                <kbd>B</kbd>
                <span>
                  The naadan bus stop
                  <strong>Ride to anywhere you've been</strong>
                </span>
                <ArrowRight size={17} />
              </button>
            )}
          {!panel && (state.driving || state.nearJeep) && (
            <button
              className="game-interaction"
              onClick={() => engine.current?.drive()}
              disabled={state.driving && state.jeepSpeed > 1}
            >
              <kbd>J</kbd>
              <span>
                {state.driving
                  ? `${state.vehicleName || "Hill jeep"} · ${state.jeepSpeed} km/h`
                  : state.vehicleName === "Trail motorcycle"
                    ? "Ride the trail motorcycle"
                    : state.vehicleName === "Coastal Saloon"
                      ? "Drive the Coastal Saloon"
                      : "Borrow the hill jeep"}
                <strong>
                  {state.driving
                    ? "Stop to step out · W/S drive · A/D steer · Space brake"
                    : "Take the back roads"}
                </strong>
              </span>
            </button>
          )}
          {!panel &&
            !state.sitting &&
            !state.boating &&
            !state.driving &&
            (state.riding ||
              (!nearby &&
                !state.restSpot &&
                !state.busStop &&
                state.nearScooter)) && (
              <button
                className="game-interaction"
                onClick={() => engine.current?.ride()}
              >
                <kbd>R</kbd>
                <span>
                  {state.riding ? "Park the scooter" : "The village scooter"}
                  <strong>
                    {state.riding ? "Step off here" : "Borrow it for a ride"}
                  </strong>
                </span>
                <ArrowRight size={17} />
              </button>
            )}
          {!panel &&
            nearby &&
            !state.boating &&
            !state.autoPassenger &&
            !state.busPassenger &&
            !state.ferryPassenger &&
            !state.riding &&
            !state.sitting && (
              <button
                className="game-interaction"
                onClick={() => engine.current?.interact()}
              >
                <kbd>E</kbd>
                <span>
                  {nearby.npc ? `Meet ${nearby.npc}` : "Pause here"}
                  <strong>
                    {nearby.action || `A story from ${nearby.name}`}
                  </strong>
                </span>
                <ArrowRight size={17} />
              </button>
            )}
          {state.boating && !panel && (
            <div className="game-boat-prompt">
              <Ship size={18} />
              <span>
                Follow the backwater. Return to the jetty to disembark.
              </span>
              <button
                disabled={Math.abs(state.z - 5) > 18}
                onClick={() => engine.current.board()}
              >
                Step ashore
              </button>
            </div>
          )}
          <div className="game-touch-controls">
            <div
              className="game-joystick"
              role="group"
              aria-label="Movement joystick"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                joystick(e);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) joystick(e);
              }}
              onPointerUp={releaseStick}
              onPointerCancel={releaseStick}
            >
              <div
                className="game-stick"
                style={{
                  transform: `translate(${stick.x * 29}px,${stick.y * 29}px)`,
                }}
              >
                <Footprints size={20} />
              </div>
            </div>
            <button
              className={running ? "game-run active" : "game-run"}
              aria-label={
                state.driving ? "Toggle jeep brake" : "Toggle running"
              }
              aria-pressed={running}
              onClick={() => {
                setRunning(!running);
                engine.current.setSprint(!running);
              }}
            >
              <Footprints size={20} />
              <small>
                {state.driving
                  ? running
                    ? "BRAKE ON"
                    : "BRAKE"
                  : running
                    ? "RUNNING"
                    : "WALKING"}
              </small>
            </button>
          </div>
        </>
      )}

      {driveHint && started && !panel && state.driving && (
        <div className="game-drive-hint" role="status">
          <strong>The road is yours.</strong>
          <p>
            W / S: accelerate or reverse · A / D: steer · Space: brake · J: park
          </p>
          <p>
            On touch: use the joystick to drive and the brake button to slow
            down.
          </p>
          <button onClick={() => setDriveHint(false)}>Got it</button>
        </div>
      )}
      {jeepGuide && started && !panel && !state.driving && parkedJeep && (
        <div className="game-jeep-guide" role="status">
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              transform: `rotate(${jeepBearing}deg)`,
            }}
          >
            ↑
          </span>
          <span>
            {jeepDistance < 4
              ? "Your jeep is here"
              : `Jeep · ${Math.round(jeepDistance)} m`}
            <small>Direction to parked jeep</small>
          </span>
          <button
            aria-label="Stop jeep guidance"
            onClick={() => setJeepGuide(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {overheard && started && !panel && (
        <div className="game-overheard" role="status" key={lastLine.current.at}>
          <span>{overheard.who}</span>
          <p>
            &ldquo;{overheard.text}&rdquo;
            {overheard.gloss && <em>{overheard.gloss}</em>}
          </p>
        </div>
      )}
      {busRide && <div className="game-bus-fade" />}
      {notice && started && (
        <div
          className={`game-discovery-notice ${notice.badge ? "badge" : ""}`}
          role="status"
        >
          <span className="game-discovery-symbol">
            {notice.badge ? (
              <Trophy size={27} />
            ) : notice.weather ? (
              <CloudRain size={27} />
            ) : (
              <Compass size={27} />
            )}
          </span>
          <div>
            <small>{notice.subtitle}</small>
            <h3>{notice.title}</h3>
            <p>{notice.text}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="game-error">
          <Compass size={40} />
          <h2>A little pause in the journey.</h2>
          <p>{error}</p>
          <button className="game-primary" onClick={onExit}>
            Return to the portal <ArrowRight size={17} />
          </button>
        </div>
      )}

      {panel === "photo" && (
        <section
          className="game-photo-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Photo mode"
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const controls = [
              ...e.currentTarget.querySelectorAll(
                "a[href], button:not(:disabled)",
              ),
            ];
            const first = controls[0],
              last = controls.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }}
        >
          <h2>Your Kerala postcard</h2>
          <p>
            The world is paused. Return to the world to move or frame another
            view.
          </p>
          {postcard && (
            <img
              src={postcard}
              alt="Your captured Kerala game view with a branded postcard footer"
            />
          )}
          {photoError && <p role="alert">{photoError}</p>}
          <div className="game-photo-actions">
            {postcard && (
              <a
                className="game-primary"
                href={postcard}
                download="kerala-postcard.png"
              >
                Download postcard
              </a>
            )}
            {postcard && typeof navigator.share === "function" && (
              <button
                className="game-secondary"
                onClick={async () => {
                  try {
                    const file = postcardFile(postcard);
                    if (!navigator.canShare?.({ files: [file] })) {
                      setPhotoError(
                        "Photo sharing is unavailable here. Download the postcard and share the saved image.",
                      );
                      return;
                    }
                    await navigator.share({
                      files: [file],
                      title: "My Kerala postcard",
                    });
                  } catch (e) {
                    if (e.name !== "AbortError")
                      setPhotoError(
                        "Sharing did not finish. You can download the postcard instead.",
                      );
                  }
                }}
              >
                Share postcard
              </button>
            )}
            <button
              className="game-secondary"
              autoFocus
              onClick={() => {
                setPanel(null);
                setPostcard(null);
              }}
            >
              Return to world
            </button>
          </div>
          <small>
            Saved on your device. Sharing happens only when you choose it.
          </small>
        </section>
      )}
      {panel && panel !== "photo" && (
        <GameDialog
          title={
            panel === "jeep"
              ? "Find my jeep"
              : panel === "story"
                ? activeStory?.title || "Photo story"
                : panel === "encounter"
                  ? encounterSite.name
                  : panel === "passport"
                    ? "Kerala game passport"
                    : panel === "map"
                      ? "Exploration map"
                      : panel === "travel"
                        ? "Naadan bus network"
                        : "Game menu"
          }
          onClose={closePanel}
          className={`game-panel-${panel}`}
        >
          {panel === "jeep" && (
            <>
              <span className="game-overline">YOUR HILL JEEP</span>
              <h2>Back to the driver's seat.</h2>
              <p>
                {parkedJeep
                  ? `Parked ${Math.round(jeepDistance)} metres away.`
                  : "Locating your jeep…"}
              </p>
              <button
                className="game-primary"
                disabled={!parkedJeep || !canReturnToJeep}
                onClick={returnToJeep}
              >
                Return to jeep <Car size={18} />
              </button>
              {!canReturnToJeep && (
                <p>Step out of your current ride or seat to return.</p>
              )}
              <button
                className="game-secondary"
                disabled={!parkedJeep}
                onClick={() => {
                  setJeepGuide(true);
                  setPanel(null);
                }}
              >
                Show direction
              </button>
              <p>
                Return takes you directly to a clear spot beside your parked
                jeep. Direction guidance points toward it; follow the paths and
                bridges around obstacles.
              </p>
              {jeepReturnError && <p role="alert">{jeepReturnError}</p>}
            </>
          )}
          {panel === "story" && activeStory && (
            <StoryCard
              key={storyId}
              story={activeStory}
              kept={memories.some((m) => m.id === `story-${storyId}`)}
              onKeep={keepStory}
            />
          )}
          {panel === "encounter" && encounterSite && (
            <>
              <span className="game-overline">
                {encounterSite.npc
                  ? `A MOMENT WITH ${encounterSite.npc.toUpperCase()}`
                  : "STORIES FROM THE WORLD"}
              </span>
              <h2>{encounterSite.name}</h2>
              <p className="game-dialog-lead">{encounterSite.line}</p>
              <p>{encounterSite.story}</p>
              {encounterSite.npc && (
                <blockquote>{encounterSite.hint}</blockquote>
              )}
              {encounterSite.residentId !== "hari" &&
                encounterSite.kind === "culture" &&
                encounterSite.handsOn &&
                !journey.interactions.includes(encounter) && (
                  <div className="game-hands-on">
                    <span>{encounterSite.handsOn.prompt}</span>
                    <div>
                      {[0, 1, 2].map((i) => (
                        <i key={i} className={beats > i ? "done" : ""}>
                          {beats > i ? <Check size={18} /> : i + 1}
                        </i>
                      ))}
                    </div>
                  </div>
                )}
              {encounterSite.residentId === "hari" &&
                life?.rehearsal.active && (
                  <ChendaPractice
                    onBeat={() => engine.current?.practiceBeat()}
                    onComplete={() => {
                      record("interactions", encounter);
                      engine.current?.completePractice();
                    }}
                  />
                )}
              {encounterSite.npc && encounterSite.residentId !== "hari" && (
                <button
                  className="game-primary"
                  disabled={
                    journey.interactions.includes(encounter) ||
                    (encounterSite.residentId === "hari" &&
                      !life?.rehearsal.active)
                  }
                  onClick={completeEncounter}
                >
                  {journey.interactions.includes(encounter)
                    ? "A moment in your passport"
                    : encounterSite.kind === "culture" && encounterSite.handsOn
                      ? `${encounterSite.handsOn.button} ${beats + 1} of 3`
                      : encounterSite.action}
                  {journey.interactions.includes(encounter) ? (
                    <Check size={17} />
                  ) : (
                    <Sparkles size={17} />
                  )}
                </button>
              )}
              {encounter === "jetty" && (
                <button
                  className="game-secondary"
                  onClick={() => {
                    closePanel();
                    engine.current.board();
                  }}
                >
                  <Ship size={18} />
                  Borrow the canoe
                </button>
              )}
              <button className="game-text-button" onClick={closePanel}>
                Keep wandering <ArrowRight size={15} />
              </button>
            </>
          )}
          {panel === "travel" && (
            <>
              <span className="game-overline">THE BUS KNOWS EVERY ROAD</span>
              <h2>Where to, then?</h2>
              <p>
                Region stands open as your journey grows. Every place you've
                already found is a stop of its own — go once, return whenever.
              </p>
              <h3 className="game-passport-heading">Region stands</h3>
              <div className="game-travel-list">
                {destinations
                  .filter((d) => d.kind === "gateway")
                  .map((dest) => (
                    <button
                      key={dest.id}
                      disabled={!dest.unlocked}
                      className={dest.unlocked ? "open" : "locked"}
                      onClick={() => travel(dest)}
                    >
                      {dest.unlocked ? <Bus size={18} /> : <Lock size={16} />}
                      <span>
                        <strong>{dest.name}</strong>
                        <small>
                          {dest.unlocked
                            ? regions.find((r) => r.id === dest.region)
                                ?.districts
                            : `Opens after ${dest.remaining} more ${
                                dest.remaining === 1
                                  ? "discovery"
                                  : "discoveries"
                              }`}
                        </small>
                      </span>
                      {dest.unlocked && <ArrowRight size={16} />}
                    </button>
                  ))}
              </div>
              <h3 className="game-passport-heading">Places you've found</h3>
              {destinations.some((d) => d.kind === "site") ? (
                <div className="game-travel-list">
                  {destinations
                    .filter((d) => d.kind === "site")
                    .map((dest) => (
                      <button
                        key={dest.id}
                        className="open"
                        onClick={() => travel(dest)}
                      >
                        <MapPin size={17} />
                        <span>
                          <strong>{dest.name}</strong>
                          <small>
                            {regions.find((r) => r.id === dest.region)?.name}
                          </small>
                        </span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                </div>
              ) : (
                <p className="game-map-hint">
                  Nothing yet. Find a place once and it joins the timetable.
                </p>
              )}
              <p className="game-save-note">
                {openDestinations.length} destination
                {openDestinations.length === 1 ? "" : "s"} open. You can also
                pick any of them straight off the map. The scooter stays
                wherever you parked it.
              </p>
            </>
          )}
          {panel === "map" && (
            <>
              <span className="game-overline">THE WORLD, AS YOU KNOW IT</span>
              <h2>Let it unfold.</h2>
              <p>
                Only the paths you've walked and the places you've found. Tap a
                marker to ride there.
              </p>
              <div className="game-large-map-wrap">
                <WorldMap
                  state={state}
                  journey={journey}
                  large
                  destinations={destinations}
                  picked={picked}
                  onPick={setPicked}
                />
                <div>
                  {picked ? (
                    <div className="game-map-pick">
                      <span className="game-overline">SELECTED</span>
                      <strong>{picked.name}</strong>
                      <small>
                        {regions.find((r) => r.id === picked.region)?.name}
                      </small>
                      <button
                        className="game-primary"
                        onClick={() => travel(picked)}
                      >
                        <Bus size={17} />
                        Travel here
                      </button>
                    </div>
                  ) : null}
                  <span className="game-overline">KERALA, END TO END</span>
                  <h3>
                    {journey.discoveries.length}
                    <small> / {sites.length}</small>
                  </h3>
                  <p>places discovered</p>
                  <div className="game-map-key">
                    <span>
                      <i />
                      Your journey
                    </span>
                    <span>
                      <i />
                      Unexplored
                    </span>
                  </div>
                  <p className="game-map-hint">
                    {openDestinations.length} bus destination
                    {openDestinations.length === 1 ? "" : "s"} open.
                  </p>
                  <p className="game-map-hint">
                    Gold squares are region bus stands; pale dots are places
                    you've found. Pick one, then <em>Travel here</em>. The
                    highway and the hill road are still there when you feel like
                    the long way round.
                  </p>
                  <small>
                    Five regions / fourteen districts
                    <br />
                    Illustrative world, not a navigation map
                  </small>
                </div>
              </div>
            </>
          )}
          {panel === "passport" && (
            <>
              <span className="game-overline">NOT SOUVENIRS. STORIES.</span>
              <h2>Your Kerala Passport</h2>
              <p>A record of the Kerala you found on foot.</p>
              {(() => {
                const rank = rankFor(journey);
                return (
                  <div className="game-rank">
                    <Trophy size={18} />
                    <div>
                      <strong>{rank.title}</strong>
                      <small>
                        {rank.next
                          ? `${rank.next.at - rank.score} more ${
                              rank.next.at - rank.score === 1
                                ? "moment"
                                : "moments"
                            } to become ${rank.next.title}`
                          : "The village knows your name."}
                      </small>
                    </div>
                  </div>
                );
              })()}
              <div className="game-passport-stats">
                <span>
                  <strong>
                    {journey.discoveries.length}/{sites.length}
                  </strong>
                  Places
                </span>
                <span>
                  <strong>
                    {
                      journey.interactions.filter(
                        (id) => sites.find((s) => s.id === id)?.kind === "food",
                      ).length
                    }
                  </strong>
                  Foods
                </span>
                <span>
                  <strong>
                    {
                      journey.interactions.filter(
                        (id) =>
                          sites.find((s) => s.id === id)?.kind === "culture",
                      ).length
                    }
                  </strong>
                  Culture
                </span>
                <span>
                  <strong>{(journey.moments || []).length}</strong>
                  Moments
                </span>
                <span>
                  <strong>
                    {
                      journey.discoveries.filter(
                        (id) =>
                          sites.find((s) => s.id === id)?.kind === "hidden",
                      ).length
                    }
                  </strong>
                  Secrets
                </span>
              </div>
              <div className="game-stamp-list">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className={
                      journey.discoveries.includes(site.id) ? "found" : ""
                    }
                  >
                    <span>
                      {journey.discoveries.includes(site.id) ? (
                        <Check size={16} />
                      ) : (
                        <Compass size={16} />
                      )}
                    </span>
                    <div>
                      <strong>
                        {journey.discoveries.includes(site.id)
                          ? site.name
                          : "An unwritten story"}
                      </strong>
                      <small>
                        {journey.discoveries.includes(site.id)
                          ? site.kind.toUpperCase()
                          : "KEEP WANDERING"}
                      </small>
                    </div>
                    {journey.interactions.includes(site.id) && (
                      <Sparkles size={15} />
                    )}
                  </div>
                ))}
              </div>
              <h3 className="game-passport-heading">People met</h3>
              <p>
                {(life?.met || [])
                  .map((id) => RESIDENTS.find((r) => r.id === id)?.name)
                  .join(" · ") || "Familiar faces begin with a hello."}
              </p>
              <h3 className="game-passport-heading">Moments kept</h3>
              <div className="game-lived-memories">
                {memories.length ? (
                  [...memories].reverse().map((memory) => (
                    <article key={memory.id}>
                      <small>
                        DAY {memory.day} · {memory.place}
                      </small>
                      <p>{memory.text}</p>
                      {memory.id.startsWith("story-") &&
                        storyById(memory.id.slice(6)) && (
                          <button onClick={() => openStory(memory.id.slice(6))}>
                            {storyById(memory.id.slice(6))?.image
                              ? "Reopen photo story"
                              : "Reopen story"}
                          </button>
                        )}
                      <button
                        aria-pressed={memory.pinned}
                        onClick={() => engine.current?.pinMemory(memory.id)}
                      >
                        {memory.pinned ? "Unpin memory" : "Pin memory"}
                      </button>
                    </article>
                  ))
                ) : (
                  <p>Shared moments will find a place here as you wander.</p>
                )}
              </div>
              <h3 className="game-passport-heading">Quiet moments</h3>
              <div className="game-moment-list">
                {REST_SPOTS.map((spot) => {
                  const kept = (journey.moments || []).includes(spot.id);
                  return (
                    <span key={spot.id} className={kept ? "kept" : ""}>
                      {kept ? <Check size={13} /> : <Moon size={13} />}
                      {kept ? spot.name : "A place to sit, somewhere"}
                    </span>
                  );
                })}
              </div>
              <h3 className="game-passport-heading">Little adventures</h3>
              <div className="game-activity-list">
                {activities.map((a) => (
                  <article key={a.id}>
                    <Trophy size={20} />
                    <div>
                      <strong>{a.name}</strong>
                      <p>{a.description}</p>
                      <small>
                        {completed.includes(a)
                          ? `${a.badge} earned`
                          : `${a.requires.filter((id) => journey[a.source].includes(id)).length}/${a.requires.length} moments collected`}
                      </small>
                    </div>
                    {completed.includes(a) && <Check size={17} />}
                  </article>
                ))}
              </div>
              <p className="game-save-note">
                Saved in this browser and connected to your portal passport.
                Your collected stories remain when you leave the world.
              </p>
            </>
          )}
          {(panel === "pause" || panel === "help") && (
            <>
              <span className="game-overline">THERE'S NO NEED TO HURRY</span>
              <h2>
                {panel === "pause"
                  ? "Take a little breath."
                  : "Find your feet."}
              </h2>
              <p>The world is paused. Your journey is saved automatically.</p>
              {pilot.current && (
                <details className="game-playtest">
                  <summary>Local playtest summary</summary>
                  <p>
                    Only this browser. No uploads or personal information.
                    Select the summary to share it with your feedback.
                  </p>
                  <textarea
                    aria-label="Local playtest summary"
                    readOnly
                    value={playtestSummary(priorPilot.current, pilot.current)}
                  />
                  <button
                    className="game-secondary"
                    onClick={() => {
                      try {
                        localStorage.removeItem(PLAYTEST_KEY);
                      } catch {}
                      priorPilot.current = [];
                      pilot.current = createPlaytest(!firstVisit.current);
                      setPanel(null);
                    }}
                  >
                    Clear local summary
                  </button>
                </details>
              )}
              <div className="game-help-grid">
                <span>
                  <kbd>W A S D</kbd>
                  <kbd>ARROWS</kbd>
                  <strong>Walk in any direction</strong>
                </span>
                <span>
                  <kbd>SHIFT</kbd>
                  <strong>Hold to run</strong>
                </span>
                <span>
                  <kbd>DRAG</kbd>
                  <strong>Look around</strong>
                </span>
                <span>
                  <kbd>E</kbd>
                  <strong>Interact nearby</strong>
                </span>
                <span>
                  <kbd>R</kbd>
                  <strong>Ride / park the scooter</strong>
                </span>
                <span>
                  <kbd>B</kbd>
                  <strong>Naadan bus fast travel</strong>
                </span>
                <span>
                  <kbd>M</kbd>
                  <strong>Exploration map</strong>
                </span>
                <span>
                  <kbd>P</kbd>
                  <strong>Your passport</strong>
                </span>
              </div>
              <p className="game-touch-help">
                On touch screens, use the left joystick to move and drag the
                world to look around. Tap a nearby interaction to meet a local.
              </p>
              {life && (
                <p>
                  Day {lifeDay(life)} ·{" "}
                  {Math.floor(lifeHour(life)).toString().padStart(2, "0")}:
                  {Math.floor((lifeHour(life) % 1) * 60)
                    .toString()
                    .padStart(2, "0")}{" "}
                  in Kadal. Light overrides do not change people's routines.
                </p>
              )}
              <div className="game-settings">
                <button
                  aria-pressed={assistance}
                  onClick={() => {
                    const value = !assistance;
                    setAssistance(value);
                    engine.current?.setAssistance(value);
                    save({ ...journeyRef.current, assistance: value });
                  }}
                >
                  Exploration assistance<span>{assistance ? "On" : "Off"}</span>
                </button>
                <button
                  aria-pressed={captions}
                  onClick={() => {
                    setCaptions(!captions);
                    save({ ...journeyRef.current, captions: !captions });
                  }}
                >
                  Directional sound captions
                  <span>{captions ? "On" : "Off"}</span>
                </button>
                <label>
                  <Sun size={16} />
                  Light appearance
                  <select
                    aria-label="World atmosphere"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      engine.current.setTime(e.target.value);
                    }}
                  >
                    <option value="cycle">Follow the village clock</option>
                    <option value="day">Golden hour appearance</option>
                    <option value="night">Moonlight appearance</option>
                  </select>
                </label>
                <button
                  onClick={async () => {
                    const value = !sound;
                    const ok = await engine.current.setSound(value);
                    setSound(value && ok !== false);
                  }}
                >
                  {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}Ambient
                  audio<span>{sound ? "On" : "Off"}</span>
                </button>
                <button
                  onClick={() => {
                    setLow(!low);
                    engine.current.setQuality(!low);
                  }}
                >
                  <Settings2 size={17} />
                  Graphics<span>{low ? "Lightweight" : "Balanced"}</span>
                </button>
              </div>
              {import.meta.env.DEV &&
                life &&
                new URLSearchParams(location.search).has("life-debug") && (
                  <details className="game-life-debug">
                    <summary>Village simulation</summary>
                    <pre>
                      {JSON.stringify(
                        {
                          clock: life.clock,
                          weather: life.weather,
                          coir: life.coir,
                          ferry: life.ferry,
                          residents: life.residents.map(
                            ({ id, mode, destination }) => ({
                              id,
                              mode,
                              destination,
                            }),
                          ),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                )}
              <button className="game-primary" onClick={closePanel}>
                Back to the wandering <Play size={17} />
              </button>
              <button className="game-text-button" onClick={onExit}>
                <ArrowLeft size={15} />
                Return to the portal
              </button>
            </>
          )}
        </GameDialog>
      )}
    </div>
  );
}
