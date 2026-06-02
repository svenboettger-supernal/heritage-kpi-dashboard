import { test } from "node:test";
import assert from "node:assert/strict";
import { barSeries } from "../src/charts/bar-series.js";

test("renders one row per input", () => {
  const html = barSeries([
    { label: "K. McMahon", value: 0.97, secondary: "142 docs" },
    { label: "J. Haakaas", value: 0.96, secondary:  "87 docs" },
  ]);
  const rows = html.match(/class="bar-row"/g) || [];
  assert.equal(rows.length, 2);
});

test("bar width is proportional to value (default scale 0..1)", () => {
  const html = barSeries([{ label: "x", value: 0.50 }]);
  assert.match(html, /width:\s*50%/);
});

test("supports a custom max for bars that aren't 0..1", () => {
  const html = barSeries([
    { label: "a", value: 31 },
    { label: "b", value: 22 },
  ], { max: 31 });
  // 22 / 31 ≈ 70.97 → rounded to 1dp
  assert.match(html, /width:\s*71(\.0)?%/);
});

test("secondary text renders when provided", () => {
  const html = barSeries([{ label: "K. McMahon", value: 0.97, secondary: "142 docs" }]);
  assert.ok(html.includes("142 docs"));
});

test("respects tint hsl per row when given", () => {
  const html = barSeries([
    { label: "x", value: 0.5, tint: "hsl(9 30% 93%)", stroke: "hsl(9 41% 55%)" },
  ]);
  assert.match(html, /background:\s*hsl\(9 30% 93%\)/);
  assert.match(html, /border-color:\s*hsl\(9 41% 55%\)/);
});
