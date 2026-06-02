import { test } from "node:test";
import assert from "node:assert/strict";
import { pct, seconds, weekLabel, delta } from "../src/format.js";

test("pct rounds to whole percent", () => {
  assert.equal(pct(0.94),    "94%");
  assert.equal(pct(0.945),   "95%");
  assert.equal(pct(0.9449),  "94%");
  assert.equal(pct(1),       "100%");
  assert.equal(pct(0),       "0%");
});

test("pct handles null/undefined as em-dash", () => {
  assert.equal(pct(null),      "—");
  assert.equal(pct(undefined), "—");
});

test("seconds renders Xm YYs for >= 60", () => {
  assert.equal(seconds(134),  "2m 14s");
  assert.equal(seconds(60),   "1m 00s");
  assert.equal(seconds(3661), "61m 01s");
});

test("seconds renders 0m YYs for < 60", () => {
  assert.equal(seconds(58), "0m 58s");
  assert.equal(seconds(0),  "0m 00s");
});

test("weekLabel renders an ISO week code as a short month-day", () => {
  // 2026-W23 Mon = 2026-06-01
  assert.equal(weekLabel("2026-W23"), "Jun 1");
  assert.equal(weekLabel("2026-W12"), "Mar 16");
});

test("delta returns signed integer percentage-points", () => {
  assert.equal(delta(0.94, 0.90), "+4 pts");
  assert.equal(delta(0.88, 0.84), "+4 pts");
  assert.equal(delta(0.78, 0.80), "−2 pts");
  assert.equal(delta(0.94, 0.94), "0 pts");
});
