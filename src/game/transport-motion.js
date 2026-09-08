import { busPosition } from "./bus.js";
import { autoPosition } from "./auto.js";
import { ferryPosition } from "./life.js";
import { LIFE_STEP } from "./life-data.js";

const poses = (life) => ({
  bus: busPosition(life.bus),
  auto: autoPosition(life.auto),
  ferry: ferryPosition(life),
});
// Rendering stays one simulation step behind. Never predict through a stop or
// change the authoritative positions used for boarding, collisions and saves.
export function createTransportMotion(life) {
  let previous = poses(life),
    current = previous;
  return {
    capture(state) {
      previous = current;
      current = poses(state);
    },
    reset(state) {
      previous = current = poses(state);
    },
    sample(remainder) {
      const t = Math.max(0, Math.min(1, remainder / LIFE_STEP));
      return Object.fromEntries(
        Object.keys(current).map((key) => {
          const a = previous[key],
            b = current[key];
          const angle = Math.atan2(
            Math.sin(b.heading - a.heading),
            Math.cos(b.heading - a.heading),
          );
          return [
            key,
            {
              x: a.x + (b.x - a.x) * t,
              z: a.z + (b.z - a.z) * t,
              heading: a.heading + angle * t,
            },
          ];
        }),
      );
    },
  };
}
