// A fictional small training crew, not a full-size chundan vallam or race.
const TAU = Math.PI * 2;
export function createBoatTraining(saved) {
  return {
    progress: Number.isFinite(saved?.progress)
      ? Math.max(0, Math.min(TAU, saved.progress))
      : 0,
    stroke: Number.isFinite(saved?.stroke) ? saved.stroke % TAU : 0,
    phase: ["training", "returning"].includes(saved?.phase)
      ? saved.phase
      : "resting",
  };
}
export function trainingPosition(state) {
  const a = state.progress;
  return {
    x: 190 - 14 * Math.cos(a),
    z: 480 + 30 * Math.sin(a),
    heading: Math.atan2(14 * Math.sin(a), 30 * Math.cos(a)),
  };
}
export function stepBoatTraining(state, dt, hour, rain) {
  const open =
    ((hour >= 7 && hour < 9) || (hour >= 16 && hour < 18)) && rain < 0.2;
  if (state.phase === "resting") {
    if (!open) return;
    state.phase = "training";
  }
  if (!open) state.phase = "returning";
  state.stroke = (state.stroke + dt * 3.4) % TAU;
  const speed = 2.2 + 0.5 * Math.sin(state.stroke);
  const metric = Math.hypot(
    14 * Math.sin(state.progress),
    30 * Math.cos(state.progress),
  );
  state.progress += (dt * speed) / metric;
  if (state.progress >= TAU) {
    state.progress -= TAU;
    if (state.phase === "returning") {
      state.progress = 0;
      state.phase = "resting";
    }
  }
}
