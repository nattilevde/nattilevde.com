import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Flag,
  Footprints,
  HelpCircle,
  Leaf,
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
import { createGame } from "./engine.js";
import { REGION, sites, activities, readJourney } from "./world.js";
import "./game.css";

function WorldMap({ state, journey, large = false }) {
  const explored = new Set(journey.cells);
  return (
    <svg
      className={`game-map ${large ? "game-map-large" : ""}`}
      viewBox="0 0 224 304"
      role="img"
      aria-label={`Exploration map. ${journey.discoveries.length} of ${sites.length} locations discovered. Undiscovered terrain is concealed.`}
    >
      <rect width="224" height="304" rx="6" fill="#a8b882" />
      <path d="M0 0H28V304H0Z" fill="#559d9b" />
      <path d="M142 0H158V304H142Z" fill="#64a6a0" />
      <path d="M28 0H42V304H28Z" fill="#e3d4a2" />
      <path
        d="M112 17V288M38 152H208M38 62H208M170 28V270"
        fill="none"
        stroke="#dec998"
        strokeWidth="5"
      />
      <path d="M139 152H162M139 62H162" stroke="#eee3bc" strokeWidth="7" />
      {Array.from({ length: 14 * 19 }, (_, i) => {
        const x = i % 14,
          y = Math.floor(i / 14);
        return (
          !explored.has(`${x},${y}`) && (
            <rect
              key={i}
              x={x * 16}
              y={y * 16}
              width="16.3"
              height="16.3"
              fill="#213f37"
              opacity=".94"
            />
          )
        );
      })}
      {sites
        .filter((s) => journey.discoveries.includes(s.id))
        .map((s) => (
          <g key={s.id}>
            <circle
              cx={s.x + 112}
              cy={s.z + 152}
              r={s.kind === "hidden" ? 4 : 3}
              fill={s.kind === "hidden" ? "#f3cc79" : "#fff4d4"}
              stroke="#294e3b"
              strokeWidth="1.5"
            />
            {large && (
              <text
                x={s.x + 112}
                y={s.z + 164}
                textAnchor="middle"
                fill="#fff4d4"
                fontSize="5"
                stroke="#294e3b"
                strokeWidth="1.5"
                paintOrder="stroke"
              >
                {s.name}
              </text>
            )}
          </g>
        ))}
      <g
        transform={`translate(${state.x + 112},${state.z + 152}) rotate(${(-state.heading * 180) / Math.PI})`}
      >
        <circle r="8" fill="#f6e8bc" opacity=".2" />
        <path
          d="M0-6L4 5 0 3-4 5Z"
          fill="#fff4d0"
          stroke="#173d32"
          strokeWidth="1"
        />
      </g>
      <text x="12" y="19" fill="#e9edcf" fontSize="8">
        N
      </text>
      <path d="M14 25V39M11 28L14 25 17 28" stroke="#e9edcf" fill="none" />
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
  const [state, setState] = useState({
    ...journey.position,
    heading: 0,
    nearby: null,
    boating: false,
    night: false,
    moving: false,
  });
  const [ready, setReady] = useState(false),
    [started, setStarted] = useState(false),
    [error, setError] = useState("");
  const [panel, setPanel] = useState(null),
    [encounter, setEncounter] = useState(null),
    [notice, setNotice] = useState(null);
  const [sound, setSound] = useState(false),
    [time, setTime] = useState("day"),
    [low, setLow] = useState(false),
    [running, setRunning] = useState(false);
  const [beats, setBeats] = useState(0),
    [stick, setStick] = useState({ x: 0, y: 0 });
  const lastSave = useRef(0),
    noticeTimer = useRef(null);
  const completed = activities.filter((a) =>
    a.requires.every((id) => journey[a.source].includes(id)),
  );
  const objective = activities.find((a) => !completed.includes(a));
  const nearby = sites.find((s) => s.id === state.nearby);
  const encounterSite = sites.find((s) => s.id === encounter);

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
  function record(kind, id) {
    const old = journeyRef.current;
    if (old[kind].includes(id)) return;
    const next = { ...old, [kind]: [...old[kind], id] };
    save(next);
    const site = sites.find((s) => s.id === id);
    callbacks.current.onRecord(kind, site);
    const newlyCompleted = activities.filter(
      (a) =>
        a.requires.every((id) => next[a.source].includes(id)) &&
        !a.requires.every((id) => old[a.source].includes(id)),
    );
    newlyCompleted.forEach((a) => callbacks.current.onRecord("activity", a));
    announce(
      newlyCompleted.length
        ? {
            title: newlyCompleted[0].badge,
            subtitle: "ACTIVITY COMPLETE",
            text: newlyCompleted[0].name,
            badge: true,
          }
        : {
            title: site.name,
            subtitle:
              kind === "discoveries"
                ? site.kind === "hidden"
                  ? "A LITTLE SECRET, FOUND"
                  : "NEW PLACE DISCOVERED"
                : "A LITTLE KERALA, COLLECTED",
            text: site.line,
          },
    );
  }

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    callbacks.current.onRecord("restore", journeyRef.current);
    let game;
    try {
      game = createGame(container.current, {
        initial: journeyRef.current,
        onUpdate(next) {
          setState(next);
          if (Date.now() - lastSave.current > 1800) {
            save({
              ...journeyRef.current,
              cells: next.cells,
              position: game?.getPosition() || journeyRef.current.position,
            });
            lastSave.current = Date.now();
          }
        },
        onDiscover: (id) => record("discoveries", id),
        onInteract: (id) => {
          setBeats(0);
          setEncounter(id);
          setPanel("encounter");
        },
        onError: setError,
      });
      engine.current = game;
      setReady(true);
    } catch (e) {
      console.error("Kerala world could not initialize", e);
      setError(
        "This browser could not start WebGL. Enable hardware acceleration or try a recent browser. Your portal and passport are still available.",
      );
    }
    return () => {
      if (game) {
        const next = { ...journeyRef.current, position: game.getPosition() };
        try {
          localStorage.setItem("kerala-world-journey", JSON.stringify(next));
        } catch {}
        game.dispose();
      }
      engine.current = null;
      document.body.style.overflow = originalOverflow;
      clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    engine.current?.setPaused(!started || !!panel || !!error);
  }, [started, panel, error, ready]);
  useEffect(() => {
    const shortcut = (e) => {
      if (!started || e.repeat || e.target.closest("input")) return;
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
  };
  function completeEncounter() {
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
      className="kerala-game"
      data-testid="kerala-game"
      data-ready={ready}
      data-x={state.x.toFixed(1)}
      data-z={state.z.toFixed(1)}
      data-boating={state.boating}
    >
      <div className="game-canvas-host" ref={container} />
      <div className="game-vignette" />
      <header className="game-top">
        <button className="game-back" onClick={onExit}>
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
            The sea to your left. A village ahead.
            <br />
            And somewhere beyond the palms, a story you haven't found.
          </p>
          <button
            className="game-primary"
            disabled={!ready}
            onClick={() => setStarted(true)}
          >
            {ready
              ? journey.discoveries.length
                ? "Continue your journey"
                : "Step into Kerala"
              : "Preparing your little world..."}
            <ArrowRight size={18} />
          </button>
          <div className="game-intro-meta">
            <MapPin size={13} /> KADAL VILLAGE <span /> ALAPPUZHA-INSPIRED
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
            A handcrafted fictional village inspired by coastal Kerala.
          </small>
        </div>
      )}

      {started && !error && (
        <>
          <div className="game-region">
            <span>ALAPPUZHA / COASTAL CHAPTER</span>
            <h2>
              {state.boating
                ? "Along the backwaters"
                : nearby?.name || "Kadal Village"}
            </h2>
            <div>
              <span className="game-live-dot" />
              {state.night
                ? "Moonlit wandering"
                : "A little golden-hour wandering"}
            </div>
          </div>
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
          <button
            className="game-minimap"
            aria-label="Expand exploration map"
            onClick={() => setPanel("map")}
          >
            <WorldMap state={state} journey={journey} />
            <span>
              <Compass size={12} />
              {journey.discoveries.length} / {sites.length} discovered
              <Maximize size={11} />
            </span>
          </button>
          <div className="game-bottom-controls">
            <span>
              <kbd>W A S D</kbd> Move
            </span>
            <span>
              <kbd>SHIFT</kbd> Run
            </span>
            <span>Drag to look</span>
            <button
              onClick={() => setPanel("help")}
              aria-label="Show game controls"
            >
              <HelpCircle size={15} />
            </button>
          </div>
          {!panel && nearby && !state.boating && (
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
              aria-label="Toggle running"
              aria-pressed={running}
              onClick={() => {
                setRunning(!running);
                engine.current.setSprint(!running);
              }}
            >
              <Footprints size={20} />
              <small>{running ? "RUNNING" : "WALKING"}</small>
            </button>
          </div>
        </>
      )}

      {notice && started && (
        <div
          className={`game-discovery-notice ${notice.badge ? "badge" : ""}`}
          role="status"
        >
          <span className="game-discovery-symbol">
            {notice.badge ? <Trophy size={27} /> : <Compass size={27} />}
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

      {panel && (
        <GameDialog
          title={
            panel === "encounter"
              ? encounterSite.name
              : panel === "passport"
                ? "Kerala game passport"
                : panel === "map"
                  ? "Exploration map"
                  : "Game menu"
          }
          onClose={closePanel}
          className={`game-panel-${panel}`}
        >
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
              {encounterSite.kind === "culture" &&
                !journey.interactions.includes(encounter) && (
                  <div className="game-hands-on">
                    <span>
                      {encounter === "courtyard"
                        ? "Three beats. One small beginning."
                        : "Three turns of the spindle. Watch the fibres twist."}
                    </span>
                    <div>
                      {[0, 1, 2].map((i) => (
                        <i key={i} className={beats > i ? "done" : ""}>
                          {beats > i ? <Check size={18} /> : i + 1}
                        </i>
                      ))}
                    </div>
                  </div>
                )}
              {encounterSite.npc && (
                <button
                  className="game-primary"
                  disabled={journey.interactions.includes(encounter)}
                  onClick={completeEncounter}
                >
                  {journey.interactions.includes(encounter)
                    ? "A moment in your passport"
                    : encounterSite.kind === "culture"
                      ? encounter === "courtyard"
                        ? `Play beat ${beats + 1} of 3`
                        : `Turn the spindle ${beats + 1} of 3`
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
          {panel === "map" && (
            <>
              <span className="game-overline">THE WORLD, AS YOU KNOW IT</span>
              <h2>Let it unfold.</h2>
              <p>Only the paths you've walked and the places you've found.</p>
              <div className="game-large-map-wrap">
                <WorldMap state={state} journey={journey} large />
                <div>
                  <span className="game-overline">KADAL VILLAGE</span>
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
                    Look for bridges, follow sounds, and ask people for
                    directions. The quietest places have no markers until you
                    find them.
                  </p>
                  <small>
                    Coastal chapter / Alappuzha
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
                  <strong>
                    {journey.discoveries.includes("pond") ? 1 : 0}
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
              <div className="game-settings">
                <label>
                  <Sun size={16} />
                  Atmosphere
                  <select
                    aria-label="World atmosphere"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      engine.current.setTime(e.target.value);
                    }}
                  >
                    <option value="day">Golden hour</option>
                    <option value="night">Moonlight</option>
                    <option value="cycle">Day & night cycle</option>
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
