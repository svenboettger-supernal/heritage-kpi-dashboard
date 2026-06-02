import { test, before } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

before(() => {
  // Loads the IIFE; attaches to globalThis.
  require("../seed-data.js");
});

const { getRollups, getDomain, getDomains, getOutliers } = await import("../src/data.js");

test("getRollups returns stage1, stage2, timing", () => {
  const r = getRollups();
  assert.equal(r.stage1.score, 0.94);
  assert.equal(r.stage2.score, 0.88);
  assert.equal(r.timing.aiSecondsPerDoc, 134);
  assert.equal(r.stage1.trend.length, 12);
});

test("getDomains returns all 5 in canonical order", () => {
  const slugs = getDomains().map(d => d.slug);
  assert.deepEqual(slugs, [
    "insurance-summary",
    "flow-diagram",
    "asset-sheet",
    "data-sheet",
    "estate-distribution-chart",
  ]);
});

test("getDomain returns the matching record", () => {
  const fd = getDomain("flow-diagram");
  assert.equal(fd.name, "Flow Diagram");
  assert.equal(fd.stage1.score, 0.88);
  assert.equal(fd.stage2.score, 0.83);
});

test("getDomain returns null for unknown slug", () => {
  assert.equal(getDomain("does-not-exist"), null);
});

test("EDS has stage1Applies false and stage1 is null", () => {
  const eds = getDomain("estate-distribution-chart");
  assert.equal(eds.stage1Applies, false);
  assert.equal(eds.stage1, null);
});

test("getOutliers flags reviewer time > 30% above mean", () => {
  // Flow Diagram reviewer = 2460s vs mean 1680s = +46%; flagged.
  // Others within range; nothing else flagged.
  const outliers = getOutliers();
  assert.equal(outliers.length, 1);
  assert.equal(outliers[0].domainSlug, "flow-diagram");
  assert.equal(outliers[0].metric, "reviewerSeconds");
});
