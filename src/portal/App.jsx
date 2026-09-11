import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Compass,
  Map,
  BookOpen,
  Flag,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  MapPin,
  Leaf,
  Utensils,
  Landmark,
  Drama,
  X,
  Plus,
  Minus,
  LocateFixed,
  Check,
  Send,
  Volume2,
  VolumeX,
  Menu,
  Globe2,
  Footprints,
  Stamp,
  Bookmark,
  Sun,
  Trophy,
} from "lucide-react";
import { districts, quests } from "./data.js";
import KeralaMap from "./KeralaMap.jsx";
import {
  sites as worldSites,
  activities as worldActivities,
} from "../game/world.js";

const Game = lazy(() => import("../game/Game.jsx"));

const photo =
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=85";
const icons = {
  All: Compass,
  Nature: Leaf,
  Heritage: Landmark,
  Culture: Drama,
  Food: Utensils,
};
const initialProgress = {
  districts: [],
  places: [],
  foods: [],
  cultures: [],
  quests: [],
  worldDiscoveries: [],
  worldInteractions: [],
  worldActivities: [],
  worldMemories: [],
};
function getProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem("kerala-passport"));
    return Object.fromEntries(
      Object.keys(initialProgress).map((key) => [
        key,
        Array.isArray(saved?.[key])
          ? saved[key].filter((v) => typeof v === "string")
          : [],
      ]),
    );
  } catch {
    return initialProgress;
  }
}

function mergePassport(current, incoming) {
  return Object.fromEntries(
    Object.keys(initialProgress).map((key) => [
      key,
      [...new Set([...(current[key] || []), ...(incoming[key] || [])])].slice(
        key === "worldMemories" ? -40 : 0,
      ),
    ]),
  );
}

function Modal({ children, onClose, title, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button
        className="close-button icon-button"
        aria-label="Close dialog"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}

export default function App() {
  const [playing, setPlaying] = useState(
    () => window.location.hash === "#world",
  );
  const [progress, setProgress] = useState(getProgress);
  const [selected, setSelected] = useState("alappuzha");
  const [filter, setFilter] = useState("All");
  const [activeNav, setActiveNav] = useState("Explore Kerala");
  const [modal, setModal] = useState(null);
  const [place, setPlace] = useState(null);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [messages, setMessages] = useState([]);
  const [guideInput, setGuideInput] = useState("");
  const [sound, setSound] = useState(false);
  const audioRef = useRef(null);
  const chatRef = useRef(null);
  const district = districts.find((d) => d.id === selected);
  useEffect(() => {
    const changed = () => setPlaying(window.location.hash === "#world");
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  function enterWorld() {
    setModal(null);
    setMobileNav(false);
    audioRef.current?.suspend();
    setSound(false);
    window.location.hash = "world";
    setPlaying(true);
  }
  function leaveWorld() {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setPlaying(false);
  }
  function recordWorld(kind, item) {
    if (kind === "memories") {
      setProgress((p) => ({
        ...p,
        worldMemories: [...new Set([...p.worldMemories, ...item])].slice(-40),
      }));
      return;
    }
    if (kind === "restore") {
      setProgress((p) =>
        mergePassport(p, {
          districts: item.discoveries.length ? ["alappuzha"] : [],
          worldDiscoveries: item.discoveries,
          worldInteractions: item.interactions,
          worldActivities: worldActivities
            .filter((a) =>
              a.requires.every((id) => item[a.source].includes(id)),
            )
            .map((a) => a.id),
        }),
      );
      return;
    }
    const key =
      kind === "discoveries"
        ? "worldDiscoveries"
        : kind === "activity"
          ? "worldActivities"
          : "worldInteractions";
    setProgress((p) => ({
      ...p,
      districts: [...new Set([...p.districts, "alappuzha"])],
      [key]: [...new Set([...p[key], item.id])],
    }));
  }
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, modal]);
  useEffect(() => {
    try {
      const merged = mergePassport(progress, getProgress());
      localStorage.setItem("kerala-passport", JSON.stringify(merged));
      if (JSON.stringify(merged) !== JSON.stringify(progress))
        setProgress(merged);
    } catch {
      /* Exploration still works when storage is unavailable. */
    }
  }, [progress]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === "kerala-passport")
        setProgress((p) => mergePassport(p, getProgress()));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(
    () => () => {
      audioRef.current?.close();
    },
    [],
  );
  const notify = (text) => setToast(text);
  const collect = (kind, id, label) => {
    setProgress((p) => ({ ...p, [kind]: [...new Set([...p[kind], id])] }));
    notify(`${label} added to your passport`);
  };
  const chooseDistrict = (id) => {
    setSelected(id);
    setFilter("All");
  };
  const exploreDistrict = (id = selected) => {
    setSelected(id);
    collect("districts", id, districts.find((d) => d.id === id).name);
    setModal("district");
  };
  const openPlace = (p, d) => {
    setSelected(d.id);
    setPlace({ ...p, district: d });
    setModal("place");
  };
  const nav = (name) => {
    setActiveNav(name);
    setMobileNav(false);
    if (name === "Explore Kerala") setModal(null);
    else if (name === "My Passport") setModal("passport");
    else if (name === "Quests & Trails") setModal("quests");
    else if (name === "Your Local Guide") setModal("guide");
    else setModal("discoveries");
  };
  const closeModal = () => {
    setModal(null);
    setActiveNav("Explore Kerala");
  };
  const allPlaces = districts.flatMap((d) =>
    d.places.map((p) => ({ ...p, district: d })),
  );
  const featured = ["alappuzha", "idukki", "ernakulam"].map((id) => {
    const d = districts.find((d) => d.id === id);
    return { ...d.places[0], district: d };
  });
  const discoveryCards =
    filter === "All"
      ? featured
      : filter === "Food" || filter === "Culture"
        ? [district, ...districts.filter((d) => d.id !== selected)]
            .slice(0, 3)
            .map((d) => ({
              id: `${d.id}-${filter}`,
              name: filter === "Food" ? d.food.name : d.culture.name,
              type: filter,
              image: d.places[0].image,
              district: d,
            }))
        : allPlaces.filter((p) => p.type === filter).slice(0, 3);
  const searchResults = query.trim()
    ? [
        ...districts
          .filter((d) =>
            `${d.name} ${d.tagline}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((d) => ({ title: d.name, subtitle: "District", district: d })),
        ...allPlaces
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
          .map((p) => ({
            title: p.name,
            subtitle: p.district.name,
            place: p,
            district: p.district,
          })),
      ].slice(0, 6)
    : [];
  function askGuide(question) {
    if (!question.trim()) return;
    const q = question.toLowerCase();
    const context =
      districts.find(
        (d) =>
          q.includes(d.name.toLowerCase()) ||
          d.places.some((p) => q.includes(p.name.toLowerCase())),
      ) || district;
    let answer;
    if (/food|eat|dish|taste|hungry/.test(q))
      answer = `In ${context.name}, start with ${context.food.name}. ${context.food.description} You can collect it in this district's discovery panel. Ask local kitchens about ingredients and dietary preferences before ordering.`;
    else if (/day|itinerary|24 hour/.test(q))
      answer = `For one day, keep it local rather than crossing the whole state. In ${context.name}, start at ${context.places[0].name}, pause for ${context.food.name}, then explore ${context.places[1].name}. Allow time for travel and check opening hours locally. Want a different pace? Ask me about nature, history, or food.`;
    else if (/history|historic|story/.test(q))
      answer = `${context.fact} For a closer look, explore ${context.places.find((p) => p.type === "Heritage")?.name || context.places[0].name}. ${context.culture.description}`;
    else if (/next|go|recommend/.test(q)) {
      const next =
        districts[
          (districts.findIndex((d) => d.id === context.id) + 1) %
            districts.length
        ];
      answer = `Stay curious: ${context.places[1].name} is a lovely next discovery in ${context.name}. For a new district, try ${next.name}: ${next.tagline.toLowerCase()} Its ${next.places[0].name} is a good place to begin. Select the district on your map to travel there.`;
    } else if (/culture|festival|tradition|art/.test(q))
      answer = `${context.culture.name} is part of ${context.name}'s cultural story. ${context.culture.description} Festival and performance dates vary, so check the local calendar before a real-world visit.`;
    else if (/special|place|hello|hi|nature|about|kerala/.test(q))
      answer = `${context.name}: ${context.description} Begin with ${context.places[0].name}. A little detail to take with you: ${context.fact}`;
    else
      answer = `I'm your offline Kerala field guide, drawing on this experience's district stories rather than live AI or web results. I can help with ${context.name}'s places, food, culture, history, or a one-day route. What would you like to discover?`;
    setMessages((m) => [
      ...m,
      { role: "user", text: question },
      { role: "guide", text: answer },
    ]);
    setGuideInput("");
  }
  async function toggleSound() {
    if (sound) {
      await audioRef.current?.suspend();
      setSound(false);
      return;
    }
    try {
      if (!audioRef.current) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + Math.random() * 0.04 - 0.02) / 1.02;
          data[i] = last * 3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 450;
        const gain = ctx.createGain();
        gain.gain.value = 0.22;
        source.connect(lowpass).connect(gain).connect(ctx.destination);
        source.start();
        audioRef.current = ctx;
      }
      await audioRef.current.resume();
      setSound(true);
    } catch {
      notify("Ambient audio is not available in this browser.");
    }
  }

  if (playing)
    return (
      <Suspense
        fallback={
          <div className="world-loading">
            <Leaf size={35} />
            <h2>Your next chapter is taking shape.</h2>
            <p>Preparing the Kerala world...</p>
            <button onClick={leaveWorld}>Return to the portal</button>
          </div>
        }
      >
        <Game onExit={leaveWorld} onRecord={recordWorld} />
      </Suspense>
    );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            nav("Explore Kerala");
          }}
        >
          <span className="brand-symbol">
            <Leaf size={29} strokeWidth={1.5} />
            <span />
          </span>
          <span>
            kerala<span className="brand-subtitle">U N F O L D E D</span>
          </span>
        </a>
        <div className="sidebar-intro">A world within a world.</div>
        <div className="nav-label">YOUR JOURNEY</div>
        <nav>
          {[
            ["Explore Kerala", Map],
            ["My Discoveries", Compass],
            ["Quests & Trails", Flag],
            ["My Passport", BookOpen],
          ].map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-item ${activeNav === name ? "active" : ""}`}
              onClick={() => nav(name)}
            >
              <Icon size={19} strokeWidth={1.6} />
              <span>{name}</span>
              {name === "Explore Kerala" && <span className="nav-dot" />}
              {name === "Quests & Trails" && (
                <span className="nav-number">3</span>
              )}
            </button>
          ))}
        </nav>
        <button className="nav-item world-nav" onClick={enterWorld}>
          <Footprints size={19} />
          <span>Enter the 3D World</span>
          <ArrowUpRight size={15} />
        </button>
        <div className="sidebar-rule" />
        <button
          className="nav-item guide-nav"
          onClick={() => nav("Your Local Guide")}
        >
          <Sparkles size={19} strokeWidth={1.6} />
          <span>Your Local Guide</span>
          <span className="ai-label">ASK</span>
        </button>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <div className="journey-symbol">
              <Footprints size={24} strokeWidth={1.5} />
              <span className="little-star">✧</span>
            </div>
            <h3>Go a little further.</h3>
            <p>
              Every path has a story.
              <br />
              Every discovery, a little magic.
            </p>
            <button onClick={() => setModal("quests")}>
              Find your next adventure <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="profile" onClick={() => setModal("passport")}>
            <span className="avatar">A</span>
            <span>
              <strong>Hey, Explorer</strong>
              <small>Your story starts here</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        >
          <X />
        </button>
      </aside>
      {mobileNav && (
        <div className="nav-scrim" onClick={() => setMobileNav(false)} />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={22} />
            </button>
            <span>YOUR NEXT STORY STARTS HERE</span>
            <span className="header-spark">✧</span>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Search places and districts"
                placeholder="Find a little wonder..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="search-shortcut">⌕</span>
              {query && (
                <div className="search-results">
                  {searchResults.length ? (
                    searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery("");
                          r.place
                            ? openPlace(r.place, r.district)
                            : exploreDistrict(r.district.id);
                        }}
                      >
                        <MapPin size={16} />
                        <span>
                          {r.title}
                          <small>{r.subtitle}</small>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                    ))
                  ) : (
                    <p>No discoveries found. Try Munnar or Kochi.</p>
                  )}
                </div>
              )}
            </div>
            <button
              className="notification-button icon-button"
              aria-label="View journey updates"
              onClick={() => setModal("updates")}
            >
              <Bell size={19} />
              <i />
            </button>
            <button
              className="top-avatar"
              aria-label="Open your passport"
              onClick={() => setModal("passport")}
            >
              A
            </button>
          </div>
        </header>
        <main>
          <section className="welcome">
            <div>
              <div className="eyebrow">
                <span /> NOT JUST A PLACE. A FEELING.
              </div>
              <h1>
                A little curiosity.
                <br className="mobile-break" /> A whole lot of <em>Kerala.</em>
              </h1>
              <p>
                Wander through 14 districts. Collect moments. Find your own
                Kerala.
              </p>
            </div>
            <button
              className="explorer-progress"
              onClick={() => setModal("passport")}
            >
              <span className="progress-icon">
                <Footprints size={22} />
              </span>
              <span>
                <strong>THE JOURNEY IS YOURS</strong>
                <span>
                  <b>{progress.districts.length}</b> / 14 districts explored
                </span>
                <span className="progress-track">
                  <i
                    style={{
                      width: `${(progress.districts.length / 14) * 100}%`,
                    }}
                  />
                </span>
              </span>
              <ChevronRight size={16} />
            </button>
          </section>

          <button className="world-entry-banner" onClick={enterWorld}>
            <span className="world-entry-symbol">
              <Footprints size={26} />
            </span>
            <span>
              <small>YOUR NEXT CHAPTER IS PLAYABLE</small>
              <strong>Don't just discover Kerala. Step inside.</strong>
              <span>A coastal village. Open paths. Your own pace.</span>
            </span>
            <span className="world-entry-action">
              Enter the 3D world <ArrowRight size={17} />
            </span>
          </button>

          <section
            className="world-panel"
            aria-label="Explore the Kerala world map"
          >
            <div className="map-toolbar">
              <div className="map-title">
                <Globe2 size={17} />
                <span>Your world to explore</span>
                <span className="live-dot" />
              </div>
              <button
                onClick={() => {
                  setZoom(1);
                  setSelected("alappuzha");
                }}
                className="map-view"
              >
                <Map size={14} /> World view <ChevronDown size={13} />
              </button>
            </div>
            <div className="map-intro">
              <span className="map-kicker">14 DISTRICTS. ENDLESS STORIES.</span>
              <h2>
                Where will your <br />
                curiosity take you?
              </h2>
              <p>
                Pick a district. <br />
                Let the unfolding begin.
              </p>
              <div className="map-filter">
                {["All", "Nature", "Culture", "Food", "Heritage"].map(
                  (name) => {
                    const Icon = icons[name];
                    return (
                      <button
                        key={name}
                        className={filter === name ? "chosen" : ""}
                        onClick={() => setFilter(name)}
                      >
                        <Icon size={14} />
                        {name === "All" ? "Everything" : name}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
            <div className="map-canvas">
              <KeralaMap
                selected={selected}
                onSelect={chooseDistrict}
                visited={progress.districts}
                zoom={zoom}
              />
              <div className="map-district-card" key={district.id}>
                <div className="district-cover">
                  <img
                    src={district.places[0].image || photo}
                    alt={district.places[0].name}
                  />
                  <span className="district-cover-tag">
                    <span />
                    {progress.districts.includes(selected)
                      ? "A CHAPTER IN YOUR STORY"
                      : "A GOOD PLACE TO BEGIN"}
                  </span>
                  <div className="district-cover-title">
                    <span>
                      {selected === "alappuzha"
                        ? "THE VENICE OF THE EAST"
                        : "A DIFFERENT SIDE OF KERALA"}
                    </span>
                    <h3>{district.name}</h3>
                  </div>
                </div>
                <div className="district-card-body">
                  <p>
                    {district.tagline}
                    <br />A slower kind of beautiful.
                  </p>
                  <div className="district-tags">
                    <span>
                      <Leaf size={12} />
                      {selected === "alappuzha"
                        ? "Backwaters"
                        : district.places[0].type}
                    </span>
                    <span>
                      <Drama size={12} />
                      Living culture
                    </span>
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => exploreDistrict()}
                  >
                    Explore {district.name} <ArrowRight size={16} />
                  </button>
                  <small>
                    <MapPin size={11} /> {district.places.length} places. So
                    many possibilities.
                  </small>
                </div>
              </div>
              <div className="map-legend">
                <span>
                  <i className="legend-unexplored" />
                  Yet to discover
                </span>
                <span>
                  <i className="legend-explored" />
                  Explored
                </span>
                <span>
                  <i className="legend-you" />
                  Your next stop
                </span>
              </div>
              <div className="map-controls">
                <button
                  aria-label="Zoom in"
                  disabled={zoom >= 1.5}
                  onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
                >
                  <Plus size={17} />
                </button>
                <button
                  aria-label="Zoom out"
                  disabled={zoom <= 0.85}
                  onClick={() => setZoom((z) => Math.max(0.85, z - 0.15))}
                >
                  <Minus size={17} />
                </button>
                <span />
                <button aria-label="Reset map view" onClick={() => setZoom(1)}>
                  <LocateFixed size={17} />
                </button>
              </div>
              <button
                className={`sound-toggle ${sound ? "sound-on" : ""}`}
                onClick={toggleSound}
              >
                {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} Ambient
                sound {sound ? "on" : "off"}
              </button>
            </div>
            <div className="map-footer">
              <span>
                <Sparkles size={14} /> Take the road less scrolled.
              </span>
              <span>
                An entire state. One beautiful adventure.{" "}
                <ArrowUpRight size={13} />
              </span>
            </div>
          </section>

          <section className="discover-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">A FEW WAYS TO GET LOST</div>
                <h2>
                  {filter === "All"
                    ? "Follow a little wonder"
                    : `${filter}, waiting to be discovered`}
                  <span className="heading-dot">.</span>
                </h2>
              </div>
              <button
                className="text-button"
                onClick={() => setModal("all-discoveries")}
              >
                Explore all discoveries <ArrowRight size={16} />
              </button>
            </div>
            <div className="discovery-grid">
              {discoveryCards.map((p, i) => (
                <button
                  className="discovery-card"
                  key={p.id}
                  onClick={() => {
                    if (p.type === "Food" || p.type === "Culture") {
                      setSelected(p.district.id);
                      setModal("district");
                    } else openPlace(p, p.district);
                  }}
                >
                  <div className="discovery-image">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    <span
                      className={`image-category category-${p.type.toLowerCase()}`}
                    >
                      {React.createElement(icons[p.type] || Leaf, { size: 12 })}
                      {p.type === "Nature" && i === 0
                        ? "SLOW LIVING"
                        : p.type === "Nature"
                          ? "INTO THE WILD"
                          : p.type.toUpperCase()}
                    </span>
                    <span className="card-arrow">
                      <ArrowUpRight size={19} />
                    </span>
                    {progress.places.includes(p.id) && (
                      <span className="collected-mark">
                        <Check size={13} /> Discovered
                      </span>
                    )}
                  </div>
                  <div className="discovery-info">
                    <div>
                      <span className="location-label">
                        <MapPin size={11} />
                        {p.district.name}
                      </span>
                      <h3>{p.name}</h3>
                    </div>
                    <span className="discovery-kind">
                      {p.type === "Nature" ? (
                        <Leaf size={17} />
                      ) : p.type === "Heritage" ? (
                        <Landmark size={17} />
                      ) : (
                        <Sparkles size={17} />
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section className="bottom-strip">
            <div>
              <span className="strip-icon">
                <Stamp size={24} strokeWidth={1.4} />
              </span>
              <span>
                <strong>Not souvenirs. Stories.</strong>
                <p>
                  Your Kerala Passport keeps a little piece of every discovery.
                </p>
              </span>
            </div>
            <button
              className="text-button"
              onClick={() => setModal("passport")}
            >
              Meet your passport <ArrowRight size={16} />
            </button>
          </section>
          <section className="portal-game-about" aria-label="About Nattilevde">
            <h2>Nattilevde — a Kerala 3D browser game</h2>
            <p>
              Kerala Unfolded is a free, open-source exploration game and
              discovery portal. Drive a jeep through fictional coastal villages,
              paddy lanes and highland roads, or discover real Kerala through
              our district guides.
            </p>
            <a href="/game/">About the game and how to play →</a>
          </section>
          <footer className="page-footer">
            <div className="project-support">
              <p>
                Open source. Made with care for Kerala. Explore the code,
                contribute, or support the project.
              </p>
              <nav aria-label="Project and support">
                <a
                  href="https://github.com/nattilevde/nattilevde.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open source on GitHub ↗
                </a>
                <a
                  href="https://buymeacoffee.com/nabeelc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy me a coffee ↗
                </a>
              </nav>
            </div>
            <a className="credits-link" href="/districts/">
              Browse district guides
            </a>
            <span>Made for the curious. Rooted in Kerala.</span>
            <button
              className="credits-link"
              onClick={() => setModal("credits")}
            >
              Photo credits & map note
            </button>
            <span>
              Explore slowly. Discover deeply. <Leaf size={12} />
            </span>
          </footer>
        </main>
        <button className="floating-guide" onClick={() => setModal("guide")}>
          <span>
            <Sparkles size={18} />
          </span>
          <span>
            A little local wisdom?<small>Ask your Kerala guide</small>
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={16} />
          </span>
          {toast}
        </div>
      )}

      {modal && (
        <Modal
          onClose={closeModal}
          title={
            modal === "guide" ? "Your local Kerala guide" : "Kerala discovery"
          }
          wide={[
            "district",
            "passport",
            "all-discoveries",
            "discoveries",
          ].includes(modal)}
        >
          {modal === "district" && (
            <>
              <div className="modal-hero">
                <img
                  src={district.places[0].image}
                  alt={district.places[0].name}
                />
                <div>
                  <span className="eyebrow">YOUR NEXT CHAPTER</span>
                  <h2>{district.name}</h2>
                  <p>{district.tagline}</p>
                </div>
              </div>
              <div className="modal-content">
                <p className="district-description">{district.description}</p>
                <a
                  className="story-page-link"
                  href={`/districts/${district.id}/`}
                >
                  Open the full district guide ↗
                </a>
                <div className="fact-box">
                  <Sparkles size={20} />
                  <p>
                    <strong>A little thing to know</strong>
                    {district.fact}
                  </p>
                </div>
                <h3 className="subheading">Follow the story</h3>
                <div className="place-list">
                  {district.places.map((p) => (
                    <button key={p.id} onClick={() => openPlace(p, district)}>
                      <img src={p.image} alt="" />
                      <span>
                        <small>{p.type}</small>
                        <strong>{p.name}</strong>
                        <span>{p.description}</span>
                      </span>
                      {progress.places.includes(p.id) ? (
                        <Check size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="culture-food-grid">
                  {[
                    ["foods", district.food, Utensils, "A taste of here"],
                    ["cultures", district.culture, Drama, "Living traditions"],
                  ].map(([kind, item, Icon, label]) => (
                    <article key={kind}>
                      <Icon size={21} />
                      <small>{label}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <button
                        className="text-button"
                        disabled={progress[kind].includes(district.id)}
                        onClick={() => collect(kind, district.id, item.name)}
                      >
                        {progress[kind].includes(district.id) ? (
                          <>
                            <Check size={15} /> Added to passport
                          </>
                        ) : (
                          <>
                            Collect this discovery <Plus size={15} />
                          </>
                        )}
                      </button>
                    </article>
                  ))}
                </div>
                {!progress.districts.includes(district.id) && (
                  <button
                    className="primary-button"
                    onClick={() =>
                      collect("districts", district.id, district.name)
                    }
                  >
                    Stamp this district in my passport <Stamp size={17} />
                  </button>
                )}
              </div>
            </>
          )}
          {modal === "place" && place && (
            <>
              <div className="modal-hero">
                <img src={place.image} alt={place.name} />
                <div>
                  <span className="eyebrow">
                    {place.district.name} / {place.type}
                  </span>
                  <h2>{place.name}</h2>
                </div>
              </div>
              <div className="modal-content">
                <p className="district-description">{place.description}</p>
                <a className="story-page-link" href={`/places/${place.id}/`}>
                  Read the full story and share this place ↗
                </a>
                <div className="fact-box">
                  <Sun size={21} />
                  <p>
                    <strong>A tip from your local guide</strong>
                    {place.tip}
                  </p>
                </div>
                <p className="muted-text">
                  A place is more than a pin on a map. Keep this discovery in
                  your passport and continue its story in {place.district.name}.
                </p>
                <button
                  className="primary-button"
                  disabled={progress.places.includes(place.id)}
                  onClick={() => {
                    collect("places", place.id, place.name);
                    setProgress((p) => ({
                      ...p,
                      districts: [
                        ...new Set([...p.districts, place.district.id]),
                      ],
                    }));
                  }}
                >
                  {progress.places.includes(place.id) ? (
                    <>
                      Discovered & collected <Check size={17} />
                    </>
                  ) : (
                    <>
                      Add to my discoveries <Bookmark size={17} />
                    </>
                  )}
                </button>
                <button
                  className="text-button modal-back"
                  onClick={() => {
                    setSelected(place.district.id);
                    setModal("district");
                  }}
                >
                  Explore more of {place.district.name} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {modal === "passport" && (
            <div className="modal-content passport-content">
              <div className="passport-emblem">
                <Leaf size={35} strokeWidth={1.2} />
              </div>
              <div className="eyebrow centered">A WORLD WITHIN A WORLD</div>
              <h2 className="modal-title">Your Kerala Passport</h2>
              <p className="modal-subtitle">
                Little moments. A growing story. Uniquely yours.
              </p>
              <div className="passport-stats">
                {[
                  ["Districts", progress.districts.length, 14],
                  ["Places", progress.places.length, allPlaces.length],
                  ["Foods", progress.foods.length, 14],
                  ["Traditions", progress.cultures.length, 14],
                ].map(([label, value, total]) => (
                  <div key={label}>
                    <strong>
                      {value}
                      <small>/{total}</small>
                    </strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="passport-stamps">
                {districts.map((d, i) => (
                  <button
                    key={d.id}
                    className={
                      progress.districts.includes(d.id) ? "stamped" : ""
                    }
                    onClick={() => exploreDistrict(d.id)}
                  >
                    <span>
                      {progress.districts.includes(d.id) ? (
                        <Stamp size={26} strokeWidth={1.3} />
                      ) : (
                        <MapPin size={23} strokeWidth={1.2} />
                      )}
                    </span>
                    <strong>{d.name}</strong>
                    <small>
                      {progress.districts.includes(d.id)
                        ? "EXPLORED"
                        : `CHAPTER ${String(i + 1).padStart(2, "0")}`}
                    </small>
                  </button>
                ))}
              </div>
              <div className="passport-badge">
                <Trophy size={26} />
                <span>
                  <strong>
                    {progress.districts.length === 14
                      ? "Kerala, through and through"
                      : progress.districts.length >= 3
                        ? "Curiosity looks good on you"
                        : "Every explorer starts somewhere"}
                  </strong>
                  <p>
                    {progress.districts.length === 14
                      ? "All 14 districts explored. Your whole-state badge is unlocked!"
                      : progress.districts.length >= 3
                        ? `First Footsteps earned! ${14 - progress.districts.length} districts still have stories for you.`
                        : `Explore ${3 - progress.districts.length} more districts to earn your First Footsteps badge.`}
                  </p>
                </span>
              </div>
              <section className="world-passport-section">
                <div>
                  <span className="eyebrow">STORIES FROM THE 3D WORLD</span>
                  <h3>Your coastal chapter</h3>
                  <p>
                    {progress.worldDiscoveries.length}/{worldSites.length}{" "}
                    places found. {progress.worldInteractions.length} local
                    encounters. {progress.worldActivities.length}/
                    {worldActivities.length} adventures complete.
                  </p>
                </div>
                {progress.worldDiscoveries.length > 0 && (
                  <div className="world-passport-list">
                    {worldSites
                      .filter((site) =>
                        progress.worldDiscoveries.includes(site.id),
                      )
                      .map((site) => (
                        <span key={site.id}>
                          <Check size={13} />
                          {site.name}
                          {site.kind === "hidden" ? " / Hidden discovery" : ""}
                        </span>
                      ))}
                  </div>
                )}
                {progress.worldMemories.length > 0 && (
                  <div className="world-passport-list">
                    <h4>Moments from Kadal</h4>
                    {progress.worldMemories.slice(-8).map((text) => (
                      <p key={text}>{text}</p>
                    ))}
                  </div>
                )}
                {progress.worldActivities.map((id) => (
                  <p key={id}>
                    <Trophy size={14} />{" "}
                    {worldActivities.find((a) => a.id === id)?.badge}
                  </p>
                ))}
                <button className="primary-button" onClick={enterWorld}>
                  Continue in the world <ArrowRight size={16} />
                </button>
              </section>
            </div>
          )}
          {modal === "quests" && (
            <div className="modal-content">
              <span className="eyebrow">TAKE THE SCENIC ROUTE</span>
              <h2 className="modal-title left">
                A little purpose to your wandering.
              </h2>
              <p className="modal-subtitle left">
                Small adventures, unforgettable discoveries.
              </p>
              <div className="quest-list">
                {quests.map((q, i) => {
                  const count = Math.min(
                    progress[q.kind]?.length || 0,
                    q.target,
                  );
                  const complete = progress.quests.includes(q.id);
                  return (
                    <article key={q.id}>
                      <span className="quest-number">0{i + 1}</span>
                      <h3>{q.title}</h3>
                      <p>{q.description}</p>
                      <div className="quest-progress">
                        <span
                          style={{ width: `${(count / q.target) * 100}%` }}
                        />
                      </div>
                      <div className="quest-meta">
                        <small>
                          {count} / {q.target} discovered
                        </small>
                        <span>
                          <Trophy size={13} />
                          {q.reward}
                        </span>
                      </div>
                      <button
                        className="text-button"
                        disabled={complete}
                        onClick={() => {
                          if (count >= q.target)
                            collect("quests", q.id, q.title + " badge");
                          else {
                            closeModal();
                            notify(
                              `Your trail: discover ${q.target} ${q.kind} to earn this badge.`,
                            );
                          }
                        }}
                      >
                        {complete
                          ? "Badge earned"
                          : count >= q.target
                            ? "Claim your badge"
                            : "Follow this trail"}
                        {complete ? (
                          <Check size={15} />
                        ) : (
                          <ArrowRight size={15} />
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
          {["all-discoveries", "discoveries"].includes(modal) && (
            <div className="modal-content">
              <span className="eyebrow">
                THE MORE YOU WANDER, THE MORE YOU FIND
              </span>
              <h2 className="modal-title left">
                {modal === "discoveries"
                  ? "Your little collection."
                  : "A world of discoveries."}
              </h2>
              <p className="modal-subtitle left">
                {modal === "discoveries"
                  ? "Places, flavors, and traditions you have made part of your story."
                  : "Choose a story and see where it takes you."}
              </p>
              {modal === "discoveries" &&
              !progress.places.length &&
              !progress.foods.length &&
              !progress.cultures.length ? (
                <div className="empty-state">
                  <Compass size={45} strokeWidth={1.2} />
                  <h3>Your first discovery is waiting.</h3>
                  <p>
                    Explore a district, open a place, and add it to your
                    passport.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => exploreDistrict()}
                  >
                    Start in {district.name} <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="place-list">
                  {allPlaces
                    .filter(
                      (p) =>
                        modal === "all-discoveries" ||
                        progress.places.includes(p.id),
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openPlace(p, p.district)}
                      >
                        <img src={p.image} alt="" loading="lazy" />
                        <span>
                          <small>
                            {p.district.name} / {p.type}
                          </small>
                          <strong>{p.name}</strong>
                        </span>
                        <ArrowUpRight size={19} />
                      </button>
                    ))}
                  {modal === "discoveries" &&
                    districts.flatMap((d) =>
                      [
                        ["foods", d.food],
                        ["cultures", d.culture],
                      ]
                        .filter(([kind]) => progress[kind].includes(d.id))
                        .map(([kind, item]) => (
                          <button
                            key={`${d.id}-${kind}`}
                            onClick={() => {
                              setSelected(d.id);
                              setModal("district");
                            }}
                          >
                            <span className="collection-icon">
                              {kind === "foods" ? <Utensils /> : <Drama />}
                            </span>
                            <span>
                              <small>
                                {d.name} /{" "}
                                {kind === "foods" ? "Food" : "Culture"}
                              </small>
                              <strong>{item.name}</strong>
                            </span>
                            <Check size={18} />
                          </button>
                        )),
                    )}
                </div>
              )}
            </div>
          )}
          {modal === "guide" && (
            <div className="modal-content guide-content">
              <div className="guide-heading">
                <span>
                  <Sparkles size={26} />
                </span>
                <div>
                  <h2>Your local guide</h2>
                  <p>A little wisdom for the road.</p>
                </div>
              </div>
              <div className="guide-context">
                <MapPin size={13} />
                Exploring {district.name}
                <span>OFFLINE FIELD GUIDE</span>
              </div>
              <div
                className="chat-messages"
                ref={chatRef}
                role="log"
                aria-live="polite"
                aria-label="Guide conversation"
              >
                <div className="chat-message guide">
                  <span className="chat-label">YOUR KERALA GUIDE</span>
                  Namaskaram! Think of me as a friend who knows a few lovely
                  corners of Kerala. You're looking at {district.name}. What are
                  you curious about?
                </div>
                {messages.map((m, i) => (
                  <div key={i} className={`chat-message ${m.role}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="suggestion-chips">
                {[
                  "What is special about this place?",
                  "What food should I try here?",
                  "Where should I go next?",
                  "I have one day.",
                ].map((q) => (
                  <button key={q} onClick={() => askGuide(q)}>
                    {q}
                    <ArrowUpRight size={12} />
                  </button>
                ))}
              </div>
              <form
                className="guide-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  askGuide(guideInput);
                }}
              >
                <input
                  aria-label="Ask your Kerala guide"
                  placeholder="Let your curiosity do the talking..."
                  value={guideInput}
                  onChange={(e) => setGuideInput(e.target.value)}
                />
                <button
                  aria-label="Send question"
                  disabled={!guideInput.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="guide-disclaimer">
                Curated local knowledge, not live travel information. Always
                check current access and timings.
              </p>
            </div>
          )}
          {modal === "credits" && (
            <div className="modal-content">
              <span className="eyebrow">BEHIND THE SCENERY</span>
              <h2 className="modal-title left">A few well-deserved credits.</h2>
              <p className="muted-text">
                The map is an illustrative exploration guide, not a precise
                administrative or navigation map. Some discovery photographs are
                representative scenery, rather than documentary images of the
                named attraction.
              </p>
              <div className="photo-credits">
                <p>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Tea_plantations_in_Munnar_-_panoramio.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tea plantations in Munnar
                  </a>{" "}
                  by www.eatoutzone.com.{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/3.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 3.0
                  </a>
                  . Cropped for display.
                </p>
                <p>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Kochi,_Fishing_nets_at_sunset,_Kerala,_India.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Kochi fishing nets at sunset
                  </a>{" "}
                  by Vyacheslav Argenberg.{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 4.0
                  </a>
                  . Cropped for display.
                </p>
                <p>
                  Additional scenery supplied through Unsplash. District stories
                  are curated summaries; verify access, seasons, and local
                  customs before travel.
                </p>
              </div>
            </div>
          )}
          {modal === "updates" && (
            <div className="modal-content">
              <span className="eyebrow">A NOTE FOR THE JOURNEY</span>
              <h2 className="modal-title left">
                Something to look forward to.
              </h2>
              <div className="fact-box">
                <Sparkles />
                <p>
                  <strong>All 14 districts are ready to explore</strong>From
                  Kasaragod's forts to Thiruvananthapuram's coastal stories,
                  your next discovery is just a map tap away.
                </p>
              </div>
              <div className="fact-box">
                <Flag />
                <p>
                  <strong>Three little adventures await</strong>Collect places,
                  taste regional food, and travel through every district to earn
                  your trail badges.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => setModal("quests")}
              >
                See your trails <ArrowRight size={17} />
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
