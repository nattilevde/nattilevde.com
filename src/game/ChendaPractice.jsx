import { useEffect, useRef, useState } from "react";

import { PRACTICE_PATTERNS, matchesPractice } from "./chenda-practice.js";

export default function ChendaPractice({ onBeat, onComplete }) {
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [pulse, setPulse] = useState(-1);
  const [message, setMessage] = useState(
    "Listen to Hari, then answer at your own starting moment.",
  );
  const timers = useRef([]);
  const taps = useRef([]);
  const phaseRef = useRef("ready");
  const beatRef = useRef(onBeat);
  beatRef.current = onBeat;
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => {
    const cancel = () => {
      if (!document.hidden) return;
      clear();
      phaseRef.current = "ready";
      setPhase("ready");
      setPulse(-1);
      setMessage("Ready when you are. Listen again.");
    };
    document.addEventListener("visibilitychange", cancel);
    return () => {
      clear();
      document.removeEventListener("visibilitychange", cancel);
    };
  }, []);
  const pattern = PRACTICE_PATTERNS[stage];
  function listen() {
    clear();
    taps.current = [];
    phaseRef.current = "listen";
    setPhase("listen");
    setPulse(-1);
    setMessage("Hari plays. Watch the numbered beats or listen.");
    pattern.beats.forEach((time, i) => {
      timers.current.push(
        setTimeout(() => {
          beatRef.current?.();
          setPulse(i);
        }, time + 400),
      );
    });
    timers.current.push(
      setTimeout(
        () => {
          setPulse(-1);
          phaseRef.current = "answer";
          setPhase("answer");
          setMessage(
            "Your turn. Tap the same spacing — start whenever you like.",
          );
        },
        pattern.beats.at(-1) + 1000,
      ),
    );
  }
  function tap() {
    if (phaseRef.current !== "answer") return;
    beatRef.current?.();
    taps.current.push(performance.now());
    setPulse(taps.current.length - 1);
    if (taps.current.length !== pattern.beats.length) return;
    const matched = matchesPractice(taps.current, pattern.beats);
    phaseRef.current = "ready";
    setPhase("ready");
    setMessage(
      matched
        ? "That spacing felt good. Try another phrase whenever you like."
        : "Try leaving the same spaces between beats. There is no hurry.",
    );
    if (matched) {
      onComplete();
      setPulse(-1);
      setStage((stage + 1) % PRACTICE_PATTERNS.length);
    }
  }
  return (
    <section className="game-hands-on" aria-label="Chenda practice">
      <strong>{pattern.name}</strong>
      <p role="status">{message}</p>
      <div aria-hidden="true">
        {pattern.beats.map((_, i) => (
          <i key={i} className={pulse === i ? "done" : ""}>
            {i + 1}
          </i>
        ))}
      </div>
      <button className="game-secondary" onClick={listen}>
        Listen again
      </button>
      <button
        className="game-primary"
        disabled={phase !== "answer"}
        onClick={tap}
        onKeyDown={(e) => {
          if (e.repeat) e.preventDefault();
        }}
      >
        Tap drum
      </button>
      <small>
        Original practice patterns · sound is optional · Enter or Space also
        works on the tap button.
      </small>
    </section>
  );
}
