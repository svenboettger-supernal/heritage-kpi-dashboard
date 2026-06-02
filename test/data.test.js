import { test, before } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

before(() => {
  // Loads the IIFE; attaches to globalThis.
  require("../seed-data.js");
});

const { getRollups, getDomain, getDomains, getOutliers } = await import("../src/data.js");

test("getRollups returns stage1, stage2, per-stage timing", () => {
  const r = getRollups();
  assert.equal(r.stage1.score, 0.94);
  assert.equal(r.stage2.score, 0.88);
  assert.equal(r.stage1.trend.length, 12);
  // Per-stage timing: AI + Reviewer for each stage, plus trends.
  assert.ok(r.timing.stage1.aiSeconds > 0);
  assert.ok(r.timing.stage1.reviewerSeconds > 0);
  assert.ok(r.timing.stage2.aiSeconds > 0);
  assert.ok(r.timing.stage2.reviewerSeconds > 0);
  assert.equal(r.timing.stage1.aiSecondsTrend.length, 12);
  assert.equal(r.timing.stage2.reviewerSecondsTrend.length, 12);
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

test("getOutliers flags any per-domain stage-total time > 30% above rollup mean", () => {
  // Outliers are computed on stage TOTAL time (AI + Reviewer). The two stages are additive
  // phases of the pipeline, not a speed-up multiplier.
  // Flow Diagram has the heaviest review burden in both stages, so both should flag.
  const outliers = getOutliers();
  const fd1 = outliers.find(o => o.domainSlug === "flow-diagram" && o.stage === "stage1");
  const fd2 = outliers.find(o => o.domainSlug === "flow-diagram" && o.stage === "stage2");
  assert.ok(fd1, "expected Flow Diagram stage 1 timing outlier");
  assert.ok(fd2, "expected Flow Diagram stage 2 timing outlier");
  assert.ok(fd1.deltaRatio > 0.30);
  assert.ok(fd2.deltaRatio > 0.30);
});
