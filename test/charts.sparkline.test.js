import { test } from "node:test";
import assert from "node:assert/strict";
import { sparkline } from "../src/charts/sparkline.js";

test("returns an <svg> string with the configured width/height", () => {
  const svg = sparkline([0.8, 0.85, 0.9, 0.95]);
  assert.match(svg, /^<svg /);
  assert.match(svg, /width="80"/);
  assert.match(svg, /height="24"/);
});

test("contains a polyline with N-1 segments", () => {
  const svg = sparkline([0.1, 0.5, 0.9]);
  // polyline points attribute has 3 coordinate pairs
  const pointsMatch = /points="([^"]+)"/.exec(svg);
  assert.ok(pointsMatch, "polyline points present");
  const coords = pointsMatch[1].trim().split(/\s+/);
  assert.equal(coords.length, 3);
});

test("uses currentColor by default", () => {
  const svg = sparkline([0.5, 0.7]);
  assert.match(svg, /stroke="currentColor"/);
});

test("respects custom width/height/stroke", () => {
  const svg = sparkline([0.5, 0.7], { width: 120, height: 32, stroke: "hsl(9 41% 55%)" });
  assert.match(svg, /width="120"/);
  assert.match(svg, /height="32"/);
  assert.match(svg, /stroke="hsl\(9 41% 55%\)"/);
});

test("empty or 1-point input returns an empty svg", () => {
  assert.match(sparkline([]),     /<svg [^>]*><\/svg>$/);
  assert.match(sparkline([0.5]),  /<svg [^>]*><\/svg>$/);
});
