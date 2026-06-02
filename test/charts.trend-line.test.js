import { test } from "node:test";
import assert from "node:assert/strict";
import { trendLine } from "../src/charts/trend-line.js";

const WEEKS = [
  "2026-W12","2026-W13","2026-W14","2026-W15",
  "2026-W16","2026-W17","2026-W18","2026-W19",
  "2026-W20","2026-W21","2026-W22","2026-W23",
];

const seriesA = WEEKS.map((_, i) => 0.80 + i * 0.01);
const seriesB = WEEKS.map((_, i) => 0.70 + i * 0.012);

test("returns an <svg> with default dimensions", () => {
  const svg = trendLine({
    weeks: WEEKS,
    series: [
      { values: seriesA, stroke: "hsl(33 10% 34%)", label: "Stage 1" },
      { values: seriesB, stroke: "hsl(33 4% 6%)",   label: "Stage 2" },
    ],
  });
  assert.match(svg, /^<svg /);
  assert.match(svg, /width="720"/);
  assert.match(svg, /height="220"/);
});

test("draws one polyline per series", () => {
  const svg = trendLine({
    weeks: WEEKS,
    series: [
      { values: seriesA, stroke: "#000", label: "A" },
      { values: seriesB, stroke: "#111", label: "B" },
    ],
  });
  const polylines = svg.match(/<polyline /g) || [];
  assert.equal(polylines.length, 2);
});

test("renders 4 y-axis ticks at 0/25/50/75/100", () => {
  const svg = trendLine({
    weeks: WEEKS,
    series: [{ values: seriesA, stroke: "#000", label: "A" }],
  });
  for (const label of ["0", "25", "50", "75", "100"]) {
    assert.ok(svg.includes(`>${label}</text>`), `y-axis label "${label}" missing`);
  }
});

test("renders week labels for every 2nd week", () => {
  const svg = trendLine({
    weeks: WEEKS,
    series: [{ values: seriesA, stroke: "#000", label: "A" }],
  });
  // Mar 16 (W12), Mar 30 (W14), Apr 13 (W16), Apr 27 (W18), May 11 (W20), May 25 (W22) → 6 labels
  const monthMatches = svg.match(/>(Mar|Apr|May|Jun) \d+<\/text>/g) || [];
  assert.equal(monthMatches.length, 6);
});
