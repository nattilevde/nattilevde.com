// Original game exercises, not transcriptions of a named traditional performance.
export const PRACTICE_PATTERNS = [
  { name: "Find the pulse", beats: [0, 700, 1400, 2100] },
  { name: "Leave a little space", beats: [0, 500, 1500, 2000] },
  { name: "A quicker response", beats: [0, 450, 900, 1800, 2250] },
];
export function matchesPractice(taps, beats) {
  return (
    taps.length === beats.length &&
    taps.every(
      (t, i) => Number.isFinite(t) && Math.abs(t - taps[0] - beats[i]) <= 220,
    )
  );
}
