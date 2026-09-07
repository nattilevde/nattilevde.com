import { coastX } from "./world.js";

// A fully synthesised Kerala soundscape. Nothing is downloaded: every layer is
// built from noise buffers and oscillators, positioned in the world, and mixed
// by distance and bearing so a sound you can barely hear is a place to walk to.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const between = (a, b) => a + Math.random() * (b - a);

export function createSoundscape() {
  let ctx = null,
    master = null,
    disposed = false,
    started = false;
  const buffers = {};
  const listener = {
    x: 0,
    z: 0,
    yaw: 0,
    night: 0,
    rain: 0,
    boating: false,
    speed: 0,
    moving: false,
  };

  function noiseBuffer(kind, seconds = 3) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (kind === "white") {
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    } else if (kind === "brown") {
      let last = 0;
      for (let i = 0; i < length; i++) {
        last = (last + (Math.random() * 2 - 1) * 0.04) / 1.02;
        data[i] = clamp(last * 3.4, -1, 1);
      }
    } else {
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + w * 0.029;
        b1 = 0.985 * b1 + w * 0.032;
        b2 = 0.95 * b2 + w * 0.048;
        data[i] = clamp((b0 + b1 + b2 + w * 0.018) * 1.1, -1, 1);
      }
    }
    return buffer;
  }
  const noise = (kind) =>
    (buffers[kind] ||= noiseBuffer(kind, kind === "white" ? 2 : 3));

  // ---- small synth helpers -------------------------------------------------
  function source(kind, loop = true) {
    const node = ctx.createBufferSource();
    node.buffer = noise(kind);
    node.loop = loop;
    return node;
  }
  function filter(type, frequency, Q = 0.7) {
    const node = ctx.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = Q;
    return node;
  }
  function gain(value = 0) {
    const node = ctx.createGain();
    node.gain.value = value;
    return node;
  }
  // A slow oscillator swelling a gain node, for surf and wind.
  function swell(target, rate, depth, base) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const amount = gain(depth);
    lfo.connect(amount).connect(target.gain);
    target.gain.value = base;
    lfo.start();
    return lfo;
  }
  // A short filtered noise hit: splashes, footsteps, drum skin, clinks.
  function hit(out, { kind = "white", type = "bandpass", freq, q = 1, peak, decay, at = 0 }) {
    const t = ctx.currentTime + at;
    const node = source(kind, false);
    const band = filter(type, freq, q);
    const level = gain(0);
    level.gain.setValueAtTime(0, t);
    level.gain.linearRampToValueAtTime(peak, t + 0.008);
    level.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    node.connect(band).connect(level).connect(out);
    node.start(t);
    node.stop(t + decay + 0.05);
  }
  // A pitched body: drum thump, horn, bell partial, bird note.
  function tone(out, { type = "sine", from, to, peak, decay, at = 0, hold = 0 }) {
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to && to !== from)
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + decay);
    const level = gain(0);
    level.gain.setValueAtTime(0, t);
    level.gain.linearRampToValueAtTime(peak, t + 0.012);
    if (hold) level.gain.setValueAtTime(peak, t + hold);
    level.gain.exponentialRampToValueAtTime(0.0001, t + decay + hold);
    osc.connect(level).connect(out);
    osc.start(t);
    osc.stop(t + decay + hold + 0.05);
  }

  // ---- layer definitions ---------------------------------------------------
  // `at` places the layer, `when` gates it, `drone` runs continuously while in
  // range, and `every`/`fire` schedule one-shots. Distance sets level, bearing
  // sets stereo position, and far-away layers are rolled off so they read as far.
  const layers = [
    {
      id: "surf",
      range: 150,
      level: 0.85,
      // Always the nearest piece of shoreline, so the sea is a compass.
      at: (l) => ({ x: coastX(l.z) - 6, z: l.z }),
      drone(out) {
        const node = source("brown");
        const low = filter("lowpass", 520, 0.6);
        const body = gain(0.55);
        node.connect(low).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.085, 0.3, 0.5);
        const lfo2 = swell(body, 0.031, 0.18, 0.5);
        return () => {
          node.stop();
          lfo.stop();
          lfo2.stop();
        };
      },
    },
    {
      id: "canal",
      range: 70,
      level: 0.4,
      at: (l) => ({ x: 38, z: clamp(l.z, -150, 150) }),
      drone(out) {
        const node = source("white");
        const band = filter("bandpass", 1150, 0.9);
        const body = gain(0.1);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.22, 0.05, 0.1);
        return () => {
          node.stop();
          lfo.stop();
        };
      },
    },
    {
      id: "river",
      range: 90,
      level: 0.5,
      at: (l) => ({ x: clamp(l.x, -10, 420), z: -600 }),
      drone(out) {
        const node = source("white");
        const band = filter("bandpass", 780, 0.7);
        const body = gain(0.13);
        node.connect(band).connect(body).connect(out);
        node.start();
        return () => node.stop();
      },
    },
    {
      id: "lagoon",
      range: 120,
      level: 0.45,
      at: { x: 250, z: 450 },
      drone(out) {
        const node = source("white");
        const band = filter("bandpass", 900, 0.8);
        const body = gain(0.12);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.12, 0.06, 0.12);
        return () => {
          node.stop();
          lfo.stop();
        };
      },
    },
    {
      id: "waterfall",
      range: 110,
      level: 1,
      at: { x: 622, z: -186 },
      drone(out) {
        const node = source("white");
        const low = filter("lowpass", 2600, 0.5);
        const body = gain(0.3);
        node.connect(low).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.4, 0.05, 0.3);
        return () => {
          node.stop();
          lfo.stop();
        };
      },
    },
    // The wind through coconut fronds: the bed the whole world sits on.
    {
      id: "palms",
      range: Infinity,
      level: 0.34,
      at: (l) => ({ x: l.x, z: l.z }),
      drone(out) {
        const node = source("pink");
        const band = filter("bandpass", 1450, 0.55);
        const body = gain(0.09);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.07, 0.055, 0.085);
        const lfo2 = swell(body, 0.019, 0.03, 0.085);
        return () => {
          node.stop();
          lfo.stop();
          lfo2.stop();
        };
      },
    },
    {
      id: "crickets",
      range: Infinity,
      level: 0.5,
      at: (l) => ({ x: l.x, z: l.z }),
      when: (l) => l.night > 0.5,
      drone(out) {
        const node = source("white");
        const band = filter("bandpass", 5400, 12);
        const body = gain(0);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = ctx.createOscillator();
        lfo.type = "triangle";
        lfo.frequency.value = 22;
        const depth = gain(0.05);
        lfo.connect(depth).connect(body.gain);
        body.gain.value = 0.05;
        lfo.start();
        return () => {
          node.stop();
          lfo.stop();
        };
      },
    },
    {
      id: "birds",
      range: Infinity,
      level: 0.5,
      at: (l) => ({ x: l.x, z: l.z }),
      when: (l) => l.night < 0.5,
      every: () => between(2.4, 9),
      fire(out) {
        const base = between(1900, 3400);
        const notes = Math.round(between(2, 4));
        for (let i = 0; i < notes; i++)
          tone(out, {
            from: base * between(0.9, 1.25),
            to: base * between(0.75, 1.5),
            peak: between(0.05, 0.1),
            decay: between(0.06, 0.13),
            at: i * between(0.07, 0.16),
          });
      },
    },
    // Chenda melam: the pattern accelerates the way a real melam builds, then
    // settles back. From a distance it is just a pulse you want to walk towards.
    ...[
      { id: "chenda-courtyard", x: -22, z: -25, range: 105, drums: 3 },
      { id: "chenda-pooram", x: 90, z: -735, range: 150, drums: 5 },
      { id: "chenda-theyyam", x: 128, z: -1150, range: 120, drums: 4, wild: true },
    ].map((spot) => ({
      id: spot.id,
      range: spot.range,
      level: 0.9,
      at: { x: spot.x, z: spot.z },
      state: { beat: 0 },
      every(l, state) {
        const cycle = (state.beat % 96) / 96;
        // Tempo climbs across the cycle, then drops back for the next round.
        const tempo = 0.46 - cycle * 0.26;
        state.beat++;
        return spot.wild ? tempo * between(0.85, 1.05) : tempo;
      },
      fire(out, l, state) {
        const accent = state.beat % 4 === 0;
        for (let d = 0; d < spot.drums; d++) {
          const at = d * between(0.004, 0.02);
          hit(out, {
            freq: accent ? 2100 : 1500,
            q: 1.1,
            peak: (accent ? 0.28 : 0.16) / Math.sqrt(spot.drums),
            decay: accent ? 0.19 : 0.12,
            at,
          });
          tone(out, {
            from: accent ? 190 : 150,
            to: 58,
            peak: (accent ? 0.3 : 0.18) / Math.sqrt(spot.drums),
            decay: 0.2,
            at,
          });
        }
        // The elathalam cymbals ride on top of the accents.
        if (accent)
          hit(out, {
            type: "highpass",
            freq: 6200,
            peak: 0.07,
            decay: 0.22,
          });
      },
    })),
    // Temple bell and a low conch at the festival ground and the sacred grove.
    ...[
      { id: "bell-pooram", x: 88, z: -742, range: 130 },
      { id: "bell-kavu", x: 90, z: -68, range: 80 },
    ].map((spot) => ({
      id: spot.id,
      range: spot.range,
      level: 0.75,
      at: { x: spot.x, z: spot.z },
      every: () => between(11, 26),
      fire(out) {
        const root = between(520, 610);
        [1, 2.76, 5.4, 8.9].forEach((ratio, i) =>
          tone(out, {
            from: root * ratio,
            peak: 0.11 / (i + 1),
            decay: 3.4 - i * 0.5,
          }),
        );
      },
    })),
    // The chaayakkada: a stove hiss, glass on glass, and unhurried talk.
    {
      id: "chaayakkada",
      range: 46,
      level: 0.8,
      at: { x: -12, z: 30 },
      drone(out) {
        const node = source("pink");
        const band = filter("bandpass", 340, 1.4);
        const body = gain(0.055);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.55, 0.025, 0.055);
        return () => {
          node.stop();
          lfo.stop();
        };
      },
      every: (l) => between(2.6, 7) * (l.rain > 0.3 ? 0.6 : 1),
      fire(out) {
        if (Math.random() < 0.5) {
          // Glass tumbler set down on a steel counter.
          [1, 2.4].forEach((ratio, i) =>
            tone(out, {
              from: between(1500, 2100) * ratio,
              peak: 0.07 / (i + 1),
              decay: 0.32,
            }),
          );
        } else {
          // Chaya pulled between two glasses.
          hit(out, {
            kind: "white",
            type: "bandpass",
            freq: between(2400, 3600),
            q: 0.8,
            peak: 0.05,
            decay: between(0.4, 0.7),
          });
        }
      },
    },
    ...[
      { id: "market-malabar", x: -44, z: -1005, range: 62 },
      { id: "market-spice", x: -24, z: -870, range: 55 },
    ].map((spot) => ({
      id: spot.id,
      range: spot.range,
      level: 0.75,
      at: { x: spot.x, z: spot.z },
      drone(out) {
        const node = source("pink");
        const band = filter("bandpass", 420, 1.1);
        const body = gain(0.075);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.31, 0.03, 0.075);
        return () => {
          node.stop();
          lfo.stop();
        };
      },
      every: () => between(3.5, 9),
      fire(out) {
        // A vendor's call: two or three shouted syllables, not words.
        const base = between(230, 330);
        const syllables = Math.round(between(2, 3));
        for (let i = 0; i < syllables; i++)
          tone(out, {
            type: "sawtooth",
            from: base * between(0.85, 1.3),
            to: base * between(0.7, 1),
            peak: 0.028,
            decay: between(0.16, 0.3),
            at: i * between(0.18, 0.3),
          });
      },
    })),
    // The road: an auto putters past, a bus grinds through its gears, horns.
    {
      id: "road",
      range: 70,
      level: 0.8,
      at: (l) => ({ x: 1.5, z: clamp(l.z, -1445, 860) }),
      every: () => between(6, 17),
      fire(out) {
        const kind = Math.random();
        if (kind < 0.45) {
          // Auto-rickshaw: a two-stroke putter that passes and fades.
          const t = ctx.currentTime;
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(58, t);
          osc.frequency.linearRampToValueAtTime(78, t + 1.4);
          osc.frequency.linearRampToValueAtTime(52, t + 3.2);
          const level = gain(0);
          const low = filter("lowpass", 420, 1.2);
          level.gain.setValueAtTime(0, t);
          level.gain.linearRampToValueAtTime(0.075, t + 0.9);
          level.gain.setValueAtTime(0.075, t + 1.8);
          level.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
          osc.connect(low).connect(level).connect(out);
          osc.start(t);
          osc.stop(t + 3.5);
        } else if (kind < 0.75) {
          // Bus horn: the flat two-tone blare of a state carriage.
          [1, 1.26].forEach((ratio, i) =>
            tone(out, {
              type: "sawtooth",
              from: 262 * ratio,
              peak: 0.05,
              decay: 0.5,
              hold: 0.28,
              at: i * 0.02,
            }),
          );
        } else {
          tone(out, {
            type: "square",
            from: between(680, 880),
            peak: 0.035,
            decay: 0.22,
            hold: 0.1,
          });
        }
      },
    },
    // A bus idling at a stand, waiting on its conductor.
    {
      id: "stand",
      range: 42,
      level: 0.7,
      at: (l) => l.stand || { x: 1e6, z: 1e6 },
      when: (l) => !!l.stand,
      drone(out) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 41;
        const low = filter("lowpass", 260, 1.4);
        const body = gain(0.05);
        osc.connect(low).connect(body).connect(out);
        osc.start();
        const lfo = swell(body, 3.1, 0.014, 0.05);
        return () => {
          osc.stop();
          lfo.stop();
        };
      },
    },
    // A train somewhere inland, the way you hear one across paddy at night.
    {
      id: "train",
      range: Infinity,
      level: 0.55,
      at: (l) => ({ x: 900, z: clamp(l.z, -1400, 800) }),
      every: () => between(70, 190),
      fire(out) {
        [1, 1.19].forEach((ratio, i) =>
          tone(out, {
            type: "sawtooth",
            from: 196 * ratio,
            peak: 0.035,
            decay: 1.5,
            hold: 0.7,
            at: i * 0.05,
          }),
        );
        for (let i = 0; i < 22; i++)
          hit(out, {
            type: "lowpass",
            freq: 300,
            peak: 0.012,
            decay: 0.16,
            at: 1.4 + i * 0.19,
          });
      },
    },
    // Vanchipattu: the boat song that keeps a snake-boat crew together.
    {
      id: "vanchipattu",
      range: 80,
      level: 0.8,
      at: (l) => ({ x: 38, z: clamp(l.z, -140, 160) }),
      every: () => between(14, 34),
      fire(out) {
        const root = between(180, 230);
        // Call, then the crew answering on the stroke.
        for (let i = 0; i < 6; i++) {
          const answer = i > 2;
          tone(out, {
            type: "sawtooth",
            from: root * (answer ? 0.75 : 1) * between(0.95, 1.08),
            to: root * (answer ? 0.66 : 0.88),
            peak: answer ? 0.05 : 0.035,
            decay: 0.4,
            at: i * 0.62,
          });
          if (answer)
            hit(out, {
              kind: "white",
              type: "lowpass",
              freq: 900,
              peak: 0.07,
              decay: 0.25,
              at: i * 0.62 + 0.1,
            });
        }
      },
    },
    // The fishing shore: rope, hull, and men calling a boat in.
    {
      id: "fishing",
      range: 55,
      level: 0.7,
      at: { x: -73, z: 14 },
      every: () => between(6, 15),
      fire(out) {
        if (Math.random() < 0.5)
          hit(out, {
            kind: "brown",
            type: "lowpass",
            freq: 420,
            peak: 0.09,
            decay: 0.4,
          });
        else
          tone(out, {
            type: "sawtooth",
            from: between(200, 280),
            to: between(150, 200),
            peak: 0.03,
            decay: 0.45,
          });
      },
    },
    // Forest: cicada wall by day, and an elephant somewhere in it.
    {
      id: "forest",
      range: 95,
      level: 0.75,
      at: { x: 470, z: -500 },
      drone(out) {
        const node = source("white");
        const band = filter("bandpass", 4200, 6);
        const body = gain(0.03);
        node.connect(band).connect(body).connect(out);
        node.start();
        const lfo = swell(body, 0.14, 0.016, 0.03);
        return () => {
          node.stop();
          lfo.stop();
        };
      },
      every: () => between(25, 70),
      fire(out) {
        // A low rumble, then the trumpet if it feels like it.
        tone(out, { from: 44, to: 30, peak: 0.09, decay: 1.7 });
        if (Math.random() < 0.35)
          tone(out, {
            type: "sawtooth",
            from: between(320, 420),
            to: between(180, 260),
            peak: 0.05,
            decay: 0.8,
            hold: 0.25,
            at: 1.9,
          });
      },
    },
    // The estate: wind, and the shears and talk of a plucking line.
    {
      id: "estate",
      range: 70,
      level: 0.6,
      at: { x: 563, z: -262 },
      every: () => between(4, 11),
      fire(out) {
        hit(out, {
          type: "bandpass",
          freq: between(2600, 4200),
          q: 3,
          peak: 0.035,
          decay: 0.12,
        });
      },
    },
    // Rain, and the roof it falls on.
    {
      id: "rain",
      range: Infinity,
      level: 1,
      at: (l) => ({ x: l.x, z: l.z }),
      when: (l) => l.rain > 0.02,
      dynamic: (l) => l.rain,
      drone(out) {
        const node = source("white");
        const low = filter("lowpass", 4200, 0.5);
        const body = gain(0.22);
        node.connect(low).connect(body).connect(out);
        node.start();
        const drops = source("pink");
        const band = filter("bandpass", 1400, 0.8);
        const dropLevel = gain(0.1);
        drops.connect(band).connect(dropLevel).connect(out);
        drops.start();
        const lfo = swell(body, 0.09, 0.05, 0.22);
        return () => {
          node.stop();
          drops.stop();
          lfo.stop();
        };
      },
      every: () => between(18, 55),
      fire(out, l) {
        if (l.rain < 0.4) return;
        // Thunder: a long, soft, low collapse rather than a crack.
        const t = ctx.currentTime;
        const node = source("brown", false);
        const low = filter("lowpass", 190, 0.9);
        const level = gain(0);
        level.gain.setValueAtTime(0, t);
        level.gain.linearRampToValueAtTime(0.16, t + 0.35);
        level.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
        node.connect(low).connect(level).connect(out);
        node.start(t);
        node.stop(t + 3.7);
      },
    },
    // The paddle, tied to how hard the canoe is actually being driven.
    {
      id: "paddle",
      range: Infinity,
      level: 0.9,
      at: (l) => ({ x: l.x, z: l.z }),
      when: (l) => l.boating && l.speed > 0.35,
      every: (l) => clamp(1.5 - l.speed * 0.22, 0.55, 1.5),
      fire(out) {
        hit(out, {
          kind: "white",
          type: "bandpass",
          freq: between(700, 1100),
          q: 0.7,
          peak: 0.12,
          decay: 0.34,
        });
        hit(out, {
          kind: "white",
          type: "highpass",
          freq: 2600,
          peak: 0.05,
          decay: 0.2,
          at: 0.03,
        });
      },
    },
  ];

  function build(layer) {
    const out = gain(0);
    const tint = filter("lowpass", 18000, 0.4);
    const pan = ctx.createStereoPanner();
    out.connect(tint).connect(pan).connect(master);
    return {
      ...layer,
      volume: layer.level,
      out,
      tint,
      pan,
      live: null,
      nextAt: 0,
      state: { beat: 0 },
    };
  }
  let voices = [];

  function ensure() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return false;
    }
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    voices = layers.map(build);
    return true;
  }

  function activate(voice) {
    if (voice.live || !voice.drone) return;
    voice.live = voice.drone(voice.out, listener);
  }
  function deactivate(voice) {
    if (!voice.live) return;
    const stop = voice.live;
    voice.live = null;
    voice.out.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    setTimeout(() => {
      try {
        stop();
      } catch {
        /* the graph is already torn down */
      }
    }, 700);
  }

  function update(next) {
    Object.assign(listener, next);
    if (!ctx || !started || disposed) return;
    const t = ctx.currentTime;
    // Screen-right, so bearings map onto the stereo field the player sees.
    const rightX = Math.cos(listener.yaw);
    const rightZ = -Math.sin(listener.yaw);
    for (const voice of voices) {
      const spot = typeof voice.at === "function" ? voice.at(listener) : voice.at;
      const dx = spot.x - listener.x;
      const dz = spot.z - listener.z;
      const distance = Math.hypot(dx, dz);
      const inRange = distance < voice.range;
      const allowed = voice.when ? voice.when(listener) : true;
      const on = inRange && allowed;
      if (on && !voice.live && voice.drone) activate(voice);
      if (!on && voice.live) deactivate(voice);
      if (!on) continue;
      const falloff = Number.isFinite(voice.range)
        ? clamp(1 - distance / voice.range, 0, 1) ** 1.7
        : 1;
      const dynamic = voice.dynamic ? voice.dynamic(listener) : 1;
      voice.out.gain.setTargetAtTime(falloff * voice.volume * dynamic, t, 0.25);
      // Distance eats the top end long before it eats the volume.
      voice.tint.frequency.setTargetAtTime(
        420 + 15000 * falloff * falloff,
        t,
        0.4,
      );
      voice.pan.pan.setTargetAtTime(
        distance < 1.5
          ? 0
          : clamp(((dx * rightX + dz * rightZ) / distance) * 0.85, -1, 1),
        t,
        0.2,
      );
      if (voice.every) {
        if (!voice.nextAt) voice.nextAt = t + voice.every(listener, voice.state);
        else if (t >= voice.nextAt) {
          voice.fire(voice.out, listener, voice.state);
          voice.nextAt = t + voice.every(listener, voice.state);
        }
      }
    }
  }

  return {
    async enable(on) {
      if (!on) {
        started = false;
        if (ctx) {
          // Fade out before suspending, so muting never lands as a click.
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
          await new Promise((done) => setTimeout(done, 450));
          if (!disposed) await ctx.suspend().catch(() => {});
        }
        return true;
      }
      if (!ensure()) return false;
      try {
        await ctx.resume();
      } catch {
        return false;
      }
      started = true;
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6);
      return true;
    },
    setMaster(value) {
      if (ctx && started)
        master.gain.setTargetAtTime(value, ctx.currentTime, 0.12);
    },
    update,
    // Discovery: a short rising figure, not a videogame jingle.
    chime() {
      if (!ctx || !started) return;
      [523.25, 659.25, 783.99].forEach((f, i) =>
        tone(master, { from: f, peak: 0.05, decay: 0.7, at: i * 0.1 }),
      );
    },
    // The conductor's double bell: two taps on the body of the bus, then go.
    bell() {
      if (!ctx || !started) return;
      [0, 0.22].forEach((at) =>
        [1, 2.9, 5.1].forEach((ratio, i) =>
          tone(master, {
            from: 1180 * ratio,
            peak: 0.085 / (i + 1),
            decay: 0.9 - i * 0.2,
            at,
          }),
        ),
      );
    },
    beat() {
      if (!ctx || !started) return;
      tone(master, { from: 165, to: 55, peak: 0.16, decay: 0.24 });
      hit(master, { freq: 1700, q: 1.1, peak: 0.12, decay: 0.16 });
    },
    dispose() {
      disposed = true;
      voices.forEach((voice) => {
        if (voice.live)
          try {
            voice.live();
          } catch {
            /* already gone */
          }
      });
      voices = [];
      ctx?.close().catch(() => {});
      ctx = null;
    },
  };
}
