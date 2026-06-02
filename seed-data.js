// seed-data.js
// Deterministic demo data for the Heritage Accuracy KPI dashboard.
// All numbers are illustrative; anchored to the realistic mid-state range
// described in docs/superpowers/specs/2026-06-02-heritage-accuracy-kpi-dashboard-design.md.

(function attachSeedData(global) {
  const WEEKS = [
    "2026-W12", "2026-W13", "2026-W14", "2026-W15",
    "2026-W16", "2026-W17", "2026-W18", "2026-W19",
    "2026-W20", "2026-W21", "2026-W22", "2026-W23",
  ];

  const reviewers = [
    { name: "K. McMahon",            docs: 142 },
    { name: "J. Haakaas",            docs:  87 },
    { name: "T. Foreman Jr",         docs:  64 },
    { name: "Sven Boettger",         docs:  41 },
    { name: "Remote Legal · L. Park",docs:  23 },
  ];

  const docTypes = [
    { name: "Revocable trust",    docs: 31 },
    { name: "Healthcare proxy",   docs: 22 },
    { name: "Last will",          docs: 18 },
    { name: "Power of attorney",  docs: 14 },
    { name: "Pour-over",          docs:  9 },
  ];

  // Helper: monotonically-improving accuracy trend with mild noise, anchored to a target score.
  // Returns an array of 12 values in [0,1] rising toward `target`.
  function trend(start, target) {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const base = start + (target - start) * t;
      const noise = ((i * 7919) % 13 - 6) / 400;       // ±0.015, deterministic
      out.push(Math.max(0, Math.min(1, base + noise)));
    }
    out[11] = target;                                   // last value matches headline
    return out;
  }

  // Helper: timing trend that improves (decreases) over 12 weeks toward `targetSeconds`.
  // Starts ~35% higher than target. The story: AI is getting faster AND reviewers spend less time
  // as accuracy + trust improve. Deterministic, no randomness.
  function timingTrend(targetSeconds) {
    const out = [];
    const startSeconds = targetSeconds * 1.35;
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const base = startSeconds + (targetSeconds - startSeconds) * t;
      const noise = (((i * 6151) % 11 - 5) / 100) * targetSeconds; // ±5% deterministic noise
      out.push(Math.max(targetSeconds * 0.92, base + noise));
    }
    out[11] = targetSeconds;
    return out;
  }

  // Helper: bundle timing block for a single stage (AI + reviewer seconds + their trends).
  function stageTiming(aiSeconds, reviewerSeconds) {
    return {
      aiSeconds,
      reviewerSeconds,
      aiSecondsTrend: timingTrend(aiSeconds),
      reviewerSecondsTrend: timingTrend(reviewerSeconds),
    };
  }

  const insuranceSummary = {
    slug: "insurance-summary",
    name: "Insurance summary",
    vizIndex: 1, // Amber
    stage1Applies: true,
    stage1: {
      score: 0.96,
      trend: trend(0.91, 0.96),
      questions: [
        { id: "is-q1", text: "Policy carrier?",                      n: 47, closeness: 1.00, editCategories: { unchanged: 47, formatting: 0, clarification: 0, substantive: 0, newInfo: 0, removal: 0 } },
        { id: "is-q2", text: "Policy face amount?",                  n: 47, closeness: 0.98, editCategories: { unchanged: 44, formatting: 3, clarification: 0, substantive: 0, newInfo: 0, removal: 0 } },
        { id: "is-q3", text: "Beneficiary designation?",             n: 47, closeness: 0.94, editCategories: { unchanged: 38, formatting: 4, clarification: 3, substantive: 1, newInfo: 1, removal: 0 } },
        { id: "is-q4", text: "Premium schedule?",                    n: 47, closeness: 0.93, editCategories: { unchanged: 36, formatting: 5, clarification: 4, substantive: 2, newInfo: 0, removal: 0 } },
        { id: "is-q5", text: "Cash value / surrender value?",        n: 47, closeness: 0.95, editCategories: { unchanged: 39, formatting: 4, clarification: 3, substantive: 1, newInfo: 0, removal: 0 } },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.97, n: 31 },
        { name: "Last will",         score: 0.96, n: 18 },
        { name: "Pour-over",         score: 0.94, n:  9 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
        { name: "Power of attorney", score: 0.92, n: 14 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.97, n: 142 },
        { name: "J. Haakaas",             score: 0.96, n:  87 },
        { name: "T. Foreman Jr",          score: 0.95, n:  64 },
        { name: "Sven Boettger",          score: 0.94, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.98, n:  23 },
      ],
    },
    stage2: {
      score: 0.92,
      trend: trend(0.85, 0.92),
      placements: [
        { id: "is-p1", type: "Policy row · carrier column",   n: 142, closeness: 0.98, commonAdjustment: "text clarified",   byAttribute: { text: 0.99, column: 0.97 } },
        { id: "is-p2", type: "Policy row · face amount cell", n: 142, closeness: 0.96, commonAdjustment: "currency format",  byAttribute: { text: 0.95, column: 0.97 } },
        { id: "is-p3", type: "Beneficiary row",               n: 142, closeness: 0.88, commonAdjustment: "split-row",        byAttribute: { text: 0.91, column: 0.85 } },
        { id: "is-p4", type: "Premium row",                   n: 142, closeness: 0.90, commonAdjustment: "frequency label",  byAttribute: { text: 0.92, column: 0.88 } },
        { id: "is-p5", type: "Cash-value row",                n: 142, closeness: 0.89, commonAdjustment: "footnote attach",  byAttribute: { text: 0.91, column: 0.87 } },
      ],
      byAttribute: [
        { name: "text",   score: 0.95 },
        { name: "column", score: 0.91 },
      ],
      byDocType:  [
        { name: "Revocable trust",   score: 0.93, n: 31 },
        { name: "Last will",         score: 0.92, n: 18 },
        { name: "Pour-over",         score: 0.90, n:  9 },
        { name: "Power of attorney", score: 0.89, n: 14 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.93, n: 142 },
        { name: "J. Haakaas",             score: 0.92, n:  87 },
        { name: "T. Foreman Jr",          score: 0.91, n:  64 },
        { name: "Sven Boettger",          score: 0.90, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.94, n:  23 },
      ],
    },
    timing: {
      stage1: stageTiming(24, 360),
      stage2: stageTiming(48, 720),
    },
  };

  const flowDiagram = {
    slug: "flow-diagram",
    name: "Flow Diagram",
    vizIndex: 0, // Terracotta
    stage1Applies: true,
    stage1: {
      score: 0.88,
      trend: trend(0.79, 0.88),
      questions: [
        { id: "fd-q1", text: "Entities receiving a flow?",         n: 47, closeness: 0.97, editCategories: { unchanged: 38, formatting: 4, clarification: 3, substantive: 1, newInfo: 1, removal: 0 } },
        { id: "fd-q2", text: "Outright or in trust?",              n: 47, closeness: 0.81, editCategories: { unchanged: 22, formatting: 5, clarification: 8, substantive: 9, newInfo: 3, removal: 0 } },
        { id: "fd-q3", text: "Order of succession?",               n: 47, closeness: 0.90, editCategories: { unchanged: 31, formatting: 6, clarification: 5, substantive: 4, newInfo: 1, removal: 0 } },
        { id: "fd-q4", text: "Conditional triggers (age, event)?", n: 47, closeness: 0.74, editCategories: { unchanged: 14, formatting: 4, clarification: 9, substantive: 13, newInfo: 7, removal: 0 } },
        { id: "fd-q5", text: "Per stirpes or per capita?",         n: 47, closeness: 0.88, editCategories: { unchanged: 29, formatting: 7, clarification: 6, substantive: 4, newInfo: 1, removal: 0 } },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.86, n: 31 },
        { name: "Last will",         score: 0.90, n: 18 },
        { name: "Pour-over",         score: 0.87, n:  9 },
        { name: "Power of attorney", score: 0.89, n: 14 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.91, n: 142 },
        { name: "J. Haakaas",             score: 0.87, n:  87 },
        { name: "T. Foreman Jr",          score: 0.85, n:  64 },
        { name: "Sven Boettger",          score: 0.84, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.92, n:  23 },
      ],
    },
    stage2: {
      score: 0.83,
      trend: trend(0.70, 0.83),
      placements: [
        { id: "fd-p1", type: "Beneficiary node",         n: 142, closeness: 0.91, commonAdjustment: "color changed",       byAttribute: { text: 0.94, color: 0.78, parent: 0.95, position: 0.93 } },
        { id: "fd-p2", type: "Bypass trust node",        n:  87, closeness: 0.86, commonAdjustment: "label clarified",     byAttribute: { text: 0.88, color: 0.84, parent: 0.90, position: 0.85 } },
        { id: "fd-p3", type: "Conditional · age trigger",n:  38, closeness: 0.62, commonAdjustment: "reparented + text",   byAttribute: { text: 0.75, color: 0.71, parent: 0.45, position: 0.60 } },
        { id: "fd-p4", type: "Successor trustee node",   n:  47, closeness: 0.88, commonAdjustment: "text clarified",      byAttribute: { text: 0.85, color: 0.92, parent: 0.91, position: 0.86 } },
        { id: "fd-p5", type: "Per stirpes branch",       n:  64, closeness: 0.84, commonAdjustment: "branch reorder",      byAttribute: { text: 0.87, color: 0.81, parent: 0.86, position: 0.81 } },
      ],
      byAttribute: [
        { name: "text",     score: 0.86 },
        { name: "color",    score: 0.81 },
        { name: "parent",   score: 0.81 },
        { name: "position", score: 0.81 },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.81, n: 31 },
        { name: "Last will",         score: 0.86, n: 18 },
        { name: "Pour-over",         score: 0.83, n:  9 },
        { name: "Power of attorney", score: 0.84, n: 14 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.87, n: 142 },
        { name: "J. Haakaas",             score: 0.82, n:  87 },
        { name: "T. Foreman Jr",          score: 0.81, n:  64 },
        { name: "Sven Boettger",          score: 0.79, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.88, n:  23 },
      ],
    },
    timing: {
      stage1: stageTiming(60, 820),
      stage2: stageTiming(122, 1640),
    },
  };

  const assetSheet = {
    slug: "asset-sheet",
    name: "Asset Sheet",
    vizIndex: 2, // Slate blue
    stage1Applies: true,
    stage1: {
      score: 0.94,
      trend: trend(0.88, 0.94),
      questions: [
        { id: "as-q1", text: "Asset class?",         n: 47, closeness: 0.97, editCategories: { unchanged: 39, formatting: 4, clarification: 3, substantive: 1, newInfo: 0, removal: 0 } },
        { id: "as-q2", text: "Current valuation?",   n: 47, closeness: 0.91, editCategories: { unchanged: 28, formatting: 6, clarification: 7, substantive: 5, newInfo: 1, removal: 0 } },
        { id: "as-q3", text: "Ownership / title?",   n: 47, closeness: 0.95, editCategories: { unchanged: 36, formatting: 5, clarification: 4, substantive: 2, newInfo: 0, removal: 0 } },
        { id: "as-q4", text: "Encumbrances?",        n: 47, closeness: 0.92, editCategories: { unchanged: 30, formatting: 6, clarification: 6, substantive: 4, newInfo: 1, removal: 0 } },
        { id: "as-q5", text: "Custodian / location?",n: 47, closeness: 0.95, editCategories: { unchanged: 37, formatting: 5, clarification: 3, substantive: 2, newInfo: 0, removal: 0 } },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.95, n: 31 },
        { name: "Last will",         score: 0.93, n: 18 },
        { name: "Pour-over",         score: 0.92, n:  9 },
        { name: "Power of attorney", score: 0.94, n: 14 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.95, n: 142 },
        { name: "J. Haakaas",             score: 0.94, n:  87 },
        { name: "T. Foreman Jr",          score: 0.93, n:  64 },
        { name: "Sven Boettger",          score: 0.92, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.96, n:  23 },
      ],
    },
    stage2: {
      score: 0.91,
      trend: trend(0.84, 0.91),
      placements: [
        { id: "as-p1", type: "Asset row · class column",      n: 142, closeness: 0.96, commonAdjustment: "label tweak",      byAttribute: { text: 0.97, column: 0.95 } },
        { id: "as-p2", type: "Asset row · valuation column",  n: 142, closeness: 0.87, commonAdjustment: "currency format",  byAttribute: { text: 0.89, column: 0.85 } },
        { id: "as-p3", type: "Asset row · ownership column",  n: 142, closeness: 0.92, commonAdjustment: "split-owner",      byAttribute: { text: 0.93, column: 0.91 } },
        { id: "as-p4", type: "Encumbrance footnote",          n:  64, closeness: 0.88, commonAdjustment: "footnote attach",  byAttribute: { text: 0.90, column: 0.86 } },
        { id: "as-p5", type: "Custodian row",                 n:  87, closeness: 0.92, commonAdjustment: "address normalize",byAttribute: { text: 0.93, column: 0.91 } },
      ],
      byAttribute: [
        { name: "text",   score: 0.92 },
        { name: "column", score: 0.90 },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.92, n: 31 },
        { name: "Last will",         score: 0.91, n: 18 },
        { name: "Pour-over",         score: 0.89, n:  9 },
        { name: "Power of attorney", score: 0.90, n: 14 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.93, n: 142 },
        { name: "J. Haakaas",             score: 0.91, n:  87 },
        { name: "T. Foreman Jr",          score: 0.90, n:  64 },
        { name: "Sven Boettger",          score: 0.89, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.94, n:  23 },
      ],
    },
    timing: {
      stage1: stageTiming(42, 480),
      stage2: stageTiming(82, 960),
    },
  };

  const dataSheet = {
    slug: "data-sheet",
    name: "Data Sheet",
    vizIndex: 3, // Sand
    stage1Applies: true,
    stage1: {
      score: 0.98,
      trend: trend(0.94, 0.98),
      questions: [
        { id: "ds-q1", text: "Client legal name?",          n: 47, closeness: 1.00, editCategories: { unchanged: 47, formatting: 0, clarification: 0, substantive: 0, newInfo: 0, removal: 0 } },
        { id: "ds-q2", text: "Date of birth?",              n: 47, closeness: 1.00, editCategories: { unchanged: 47, formatting: 0, clarification: 0, substantive: 0, newInfo: 0, removal: 0 } },
        { id: "ds-q3", text: "Marital status?",             n: 47, closeness: 0.97, editCategories: { unchanged: 43, formatting: 2, clarification: 2, substantive: 0, newInfo: 0, removal: 0 } },
        { id: "ds-q4", text: "Children (full names + DOB)?",n: 47, closeness: 0.96, editCategories: { unchanged: 40, formatting: 4, clarification: 3, substantive: 0, newInfo: 0, removal: 0 } },
        { id: "ds-q5", text: "Primary residence?",          n: 47, closeness: 0.98, editCategories: { unchanged: 44, formatting: 2, clarification: 1, substantive: 0, newInfo: 0, removal: 0 } },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.99, n: 31 },
        { name: "Last will",         score: 0.98, n: 18 },
        { name: "Pour-over",         score: 0.97, n:  9 },
        { name: "Power of attorney", score: 0.98, n: 14 },
        { name: "Healthcare proxy",  score: 0.99, n: 22 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.99, n: 142 },
        { name: "J. Haakaas",             score: 0.98, n:  87 },
        { name: "T. Foreman Jr",          score: 0.97, n:  64 },
        { name: "Sven Boettger",          score: 0.97, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.99, n:  23 },
      ],
    },
    stage2: {
      score: 0.95,
      trend: trend(0.90, 0.95),
      placements: [
        { id: "ds-p1", type: "Client info row",      n: 142, closeness: 0.98, commonAdjustment: "format tweak",   byAttribute: { text: 0.99, column: 0.97 } },
        { id: "ds-p2", type: "Spouse info row",      n:  87, closeness: 0.94, commonAdjustment: "name format",    byAttribute: { text: 0.95, column: 0.93 } },
        { id: "ds-p3", type: "Child info row",       n: 142, closeness: 0.93, commonAdjustment: "DOB format",     byAttribute: { text: 0.94, column: 0.92 } },
        { id: "ds-p4", type: "Residence row",        n: 142, closeness: 0.95, commonAdjustment: "address parse",  byAttribute: { text: 0.96, column: 0.94 } },
        { id: "ds-p5", type: "Contact / attorney row",n: 142, closeness: 0.96, commonAdjustment: "phone format",   byAttribute: { text: 0.97, column: 0.95 } },
      ],
      byAttribute: [
        { name: "text",   score: 0.96 },
        { name: "column", score: 0.94 },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.96, n: 31 },
        { name: "Last will",         score: 0.95, n: 18 },
        { name: "Pour-over",         score: 0.94, n:  9 },
        { name: "Power of attorney", score: 0.95, n: 14 },
        { name: "Healthcare proxy",  score: 0.96, n: 22 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.96, n: 142 },
        { name: "J. Haakaas",             score: 0.95, n:  87 },
        { name: "T. Foreman Jr",          score: 0.94, n:  64 },
        { name: "Sven Boettger",          score: 0.93, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.97, n:  23 },
      ],
    },
    timing: {
      stage1: stageTiming(18, 320),
      stage2: stageTiming(40, 640),
    },
  };

  const estateDistribution = {
    slug: "estate-distribution-chart",
    name: "Estate Distribution",
    vizIndex: 4, // Olive
    stage1Applies: false,
    stage1: null,
    stage2: {
      score: 0.78,
      trend: trend(0.62, 0.78),
      placements: [
        { id: "ed-p1", type: "Tier 1 distribution node",   n: 142, closeness: 0.84, commonAdjustment: "share % adjusted",   byAttribute: { text: 0.86, color: 0.82, parent: 0.85, position: 0.83 } },
        { id: "ed-p2", type: "Spouse share",               n:  87, closeness: 0.81, commonAdjustment: "label clarified",    byAttribute: { text: 0.83, color: 0.78, parent: 0.84, position: 0.79 } },
        { id: "ed-p3", type: "Children share",             n: 142, closeness: 0.76, commonAdjustment: "branch split",       byAttribute: { text: 0.79, color: 0.72, parent: 0.78, position: 0.75 } },
        { id: "ed-p4", type: "Conditional distribution",   n:  38, closeness: 0.55, commonAdjustment: "trigger reparented", byAttribute: { text: 0.68, color: 0.61, parent: 0.42, position: 0.49 } },
        { id: "ed-p5", type: "Residuary clause",           n:  47, closeness: 0.74, commonAdjustment: "scope clarified",    byAttribute: { text: 0.78, color: 0.71, parent: 0.76, position: 0.71 } },
      ],
      byAttribute: [
        { name: "text",     score: 0.79 },
        { name: "color",    score: 0.73 },
        { name: "parent",   score: 0.73 },
        { name: "position", score: 0.71 },
      ],
      byDocType: [
        { name: "Revocable trust",   score: 0.79, n: 31 },
        { name: "Last will",         score: 0.81, n: 18 },
        { name: "Pour-over",         score: 0.76, n:  9 },
        { name: "Power of attorney", score: 1.00, n:  0 },
        { name: "Healthcare proxy",  score: 1.00, n:  0 },
      ],
      byReviewer: [
        { name: "K. McMahon",             score: 0.81, n: 142 },
        { name: "J. Haakaas",             score: 0.77, n:  87 },
        { name: "T. Foreman Jr",          score: 0.76, n:  64 },
        { name: "Sven Boettger",          score: 0.74, n:  41 },
        { name: "Remote Legal · L. Park", score: 0.83, n:  23 },
      ],
    },
    timing: {
      stage1: null,
      stage2: stageTiming(151, 1920),
    },
  };

  // Rollup trends are means of the contributing domain trends.
  function mean(values) { return values.reduce((a, b) => a + b, 0) / values.length; }
  function zipMean(arrays) {
    return arrays[0].map((_, i) => mean(arrays.map(arr => arr[i])));
  }

  const stage1Trend = zipMean([
    insuranceSummary.stage1.trend,
    flowDiagram.stage1.trend,
    assetSheet.stage1.trend,
    dataSheet.stage1.trend,
  ]);
  const stage2Trend = zipMean([
    insuranceSummary.stage2.trend,
    flowDiagram.stage2.trend,
    assetSheet.stage2.trend,
    dataSheet.stage2.trend,
    estateDistribution.stage2.trend,
  ]);

  // Aggregated timing per stage. Stage 1 averages the 4 domains that apply (EDS skipped).
  // Stage 2 averages all 5. Trends are means of contributing domain trends.
  function avg(values) { return values.reduce((a, b) => a + b, 0) / values.length; }
  const s1Domains = [insuranceSummary, flowDiagram, assetSheet, dataSheet];
  const s2Domains = [insuranceSummary, flowDiagram, assetSheet, dataSheet, estateDistribution];

  const rollupTimingStage1 = {
    aiSeconds: Math.round(avg(s1Domains.map(d => d.timing.stage1.aiSeconds))),
    reviewerSeconds: Math.round(avg(s1Domains.map(d => d.timing.stage1.reviewerSeconds))),
    aiSecondsTrend: zipMean(s1Domains.map(d => d.timing.stage1.aiSecondsTrend)),
    reviewerSecondsTrend: zipMean(s1Domains.map(d => d.timing.stage1.reviewerSecondsTrend)),
  };
  const rollupTimingStage2 = {
    aiSeconds: Math.round(avg(s2Domains.map(d => d.timing.stage2.aiSeconds))),
    reviewerSeconds: Math.round(avg(s2Domains.map(d => d.timing.stage2.reviewerSeconds))),
    aiSecondsTrend: zipMean(s2Domains.map(d => d.timing.stage2.aiSecondsTrend)),
    reviewerSecondsTrend: zipMean(s2Domains.map(d => d.timing.stage2.reviewerSecondsTrend)),
  };

  global.HERITAGE_KPI_DATA = {
    generatedAt: "2026-06-02T14:00:00Z",
    weeks: WEEKS,
    rollups: {
      stage1: { score: 0.94, trend: stage1Trend },
      stage2: { score: 0.88, trend: stage2Trend },
      timing: {
        stage1: rollupTimingStage1,
        stage2: rollupTimingStage2,
      },
    },
    domains: [insuranceSummary, flowDiagram, assetSheet, dataSheet, estateDistribution],
    reviewers,
    docTypes,
  };
})(typeof window !== "undefined" ? window : globalThis);
