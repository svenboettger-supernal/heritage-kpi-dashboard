# Heritage Accuracy KPI Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained, realistically populated demo of the Heritage Accuracy KPI Framework — overview matrix + 5 domain detail pages + framework legend, applying Supernal's editorial brand.

**Architecture:** Vanilla HTML5 + CSS + ES2022 modules. No build step. Hash-routed SPA. Pure JS modules (`format`, `data`, `charts/*`) covered by `node --test`; views verified by opening `index.html`. Single deterministic `seed-data.js` file holds all numbers — `data.js` is the access layer.

**Tech Stack:** HTML5, CSS3, ES2022 modules, inline SVG, `node:test` (built-in, no dependencies). Google Fonts (Lora, Inter, JetBrains Mono) loaded via stylesheet.

**Spec:** `docs/superpowers/specs/2026-06-02-heritage-accuracy-kpi-dashboard-design.md`

---

## File structure

```
~/Supernal/heritage-kpi-dashboard/
├── index.html                              # shell + font loads + root mount
├── styles.css                              # all CSS in one file (brand tokens + components)
├── app.js                                  # router entry, calls views, mounts to #app
├── seed-data.js                            # deterministic numbers, attaches window.HERITAGE_KPI_DATA
├── src/
│   ├── data.js                             # getRollups, getDomain, getOutliers (pure)
│   ├── format.js                           # pct, seconds, weekLabel, delta (pure)
│   ├── router.js                           # hash → route record, dispatch (pure)
│   ├── charts/
│   │   ├── sparkline.js                    # values → SVG string (pure)
│   │   ├── trend-line.js                   # two series → SVG string (pure)
│   │   └── bar-series.js                   # rows → SVG/HTML string (pure)
│   └── views/
│       ├── overview.js                     # renderOverview() → innerHTML string
│       ├── domain.js                       # renderDomain(slug) → innerHTML string
│       └── about.js                        # renderAbout() → innerHTML string
├── test/
│   ├── format.test.js
│   ├── data.test.js
│   ├── router.test.js
│   ├── charts.sparkline.test.js
│   ├── charts.trend-line.test.js
│   └── charts.bar-series.test.js
├── assets/
│   ├── supernal-mark.svg
│   └── heritage-mark.svg
├── README.md
└── .gitignore
```

**Module boundaries:**
- `src/format.js` — pure, no DOM, no data. Numbers + strings in, strings out.
- `src/data.js` — pure read-layer over `window.HERITAGE_KPI_DATA`. In tests, the test injects a `globalThis.HERITAGE_KPI_DATA` fixture.
- `src/router.js` — pure. Takes a hash string, returns `{ view, params }`. The dispatch side-effect lives in `app.js`.
- `src/charts/*` — pure. Numbers in, SVG string out.
- `src/views/*` — pure. Take pre-fetched data, return HTML string. No DOM access.
- `app.js` — only place that touches `document` and `window.location.hash`.

Each file ≤ 200 lines.

---

## Task 1: Scaffolding

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `assets/supernal-mark.svg` (placeholder shape)
- Create: `assets/heritage-mark.svg` (placeholder shape)

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
node_modules/
*.log
.vscode/
.idea/
```

- [ ] **Step 2: Create minimal `README.md`**

```markdown
# Heritage Accuracy KPI Dashboard

Static HTML demo of the [Heritage Accuracy KPI Framework](docs/superpowers/specs/2026-06-02-heritage-accuracy-kpi-dashboard-design.md) — two-stage accuracy scoring (answer + mapping) across five estate-planning artifact domains, with trends, timing, and drill-downs.

## View it

Open `index.html` in a modern browser. No build step, no server required.

For a clean URL during screen-share:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Numbers

All values in `seed-data.js` are illustrative — anchored to the realistic mid-state range described in the spec. **Not live Heritage data.**

## Run the tests

```bash
node --test test/
```

Pure logic (format helpers, data accessors, router, chart string generators) is covered. Visual layout is verified by eye in the browser.

## Files

- `index.html` · shell
- `styles.css` · brand tokens + components
- `app.js` · router entry
- `seed-data.js` · deterministic numbers
- `src/` · modules (data, format, router, charts, views)
- `test/` · `node:test` suites
- `docs/superpowers/specs/` · design spec
- `docs/superpowers/plans/` · this plan
```

- [ ] **Step 3: Create `assets/supernal-mark.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 12 L12 4 L20 12 L12 20 Z"/>
  <path d="M8 12 L12 8 L16 12 L12 16 Z"/>
</svg>
```

- [ ] **Step 4: Create `assets/heritage-mark.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 9 L12 3 L21 9 V21 H3 Z"/>
  <path d="M10 21 V13 H14 V21"/>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore README.md assets/
git commit -m "chore: scaffold repo (gitignore, readme, brand marks)"
```

---

## Task 2: Seed data file

**Files:**
- Create: `seed-data.js`

The full deterministic dataset. Anchored to the spec Section 8 table.

- [ ] **Step 1: Write the seed-data.js file**

```js
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

  // Helper: monotonically-improving trend with mild noise, anchored to a target score.
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
      byDocType:  [ /* same shape as stage1.byDocType */
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
    timing: { aiSeconds: 72, reviewerSeconds: 1080 },
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
    timing: { aiSeconds: 182, reviewerSeconds: 2460 },
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
    timing: { aiSeconds: 124, reviewerSeconds: 1440 },
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
    timing: { aiSeconds: 58, reviewerSeconds: 960 },
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
    timing: { aiSeconds: 151, reviewerSeconds: 1920 },
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

  global.HERITAGE_KPI_DATA = {
    generatedAt: "2026-06-02T14:00:00Z",
    weeks: WEEKS,
    rollups: {
      stage1: { score: 0.94, trend: stage1Trend },
      stage2: { score: 0.88, trend: stage2Trend },
      timing: { aiSecondsPerDoc: 134, reviewerSecondsPerDoc: 1680, liftMultiplier: 12.5 },
    },
    domains: [insuranceSummary, flowDiagram, assetSheet, dataSheet, estateDistribution],
    reviewers,
    docTypes,
  };
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **Step 2: Sanity check the file loads in Node**

Run: `node -e "require('./seed-data.js'); console.log(Object.keys(globalThis.HERITAGE_KPI_DATA))"`
Expected: `[ 'generatedAt', 'weeks', 'rollups', 'domains', 'reviewers', 'docTypes' ]`

Note: this works because the IIFE attaches to `globalThis` when `window` is undefined.

- [ ] **Step 3: Commit**

```bash
git add seed-data.js
git commit -m "data: seed demo dataset for 5 domains, rollups, reviewers, doc types"
```

---

## Task 3: Format module + tests

**Files:**
- Create: `src/format.js`
- Test: `test/format.test.js`

Pure helpers: `pct`, `seconds`, `weekLabel`, `delta`.

- [ ] **Step 1: Write the failing test**

Create `test/format.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/format.test.js`
Expected: FAIL — module `../src/format.js` does not exist.

- [ ] **Step 3: Implement `src/format.js`**

```js
// src/format.js
// Pure formatters. No DOM, no data dependency.

export function pct(value) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 100)}%`;
}

export function seconds(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function delta(current, prior) {
  const pts = Math.round((current - prior) * 100);
  if (pts === 0) return "0 pts";
  const sign = pts > 0 ? "+" : "−";
  return `${sign}${Math.abs(pts)} pts`;
}

// ISO week → "Mon DD" using the Monday of that week.
export function weekLabel(isoWeek) {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) return isoWeek;
  const year = Number(match[1]);
  const week = Number(match[2]);

  // ISO 8601: week 1 is the week containing the first Thursday of the year.
  // The Monday of that week may be in the previous year.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = (jan4.getUTCDay() + 6) % 7; // 0 = Monday
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - dayOfWeek);
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[target.getUTCMonth()]} ${target.getUTCDate()}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/format.test.js`
Expected: PASS — all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/format.js test/format.test.js
git commit -m "feat: format helpers (pct, seconds, weekLabel, delta) + tests"
```

---

## Task 4: Data access layer + tests

**Files:**
- Create: `src/data.js`
- Test: `test/data.test.js`

Wraps `globalThis.HERITAGE_KPI_DATA`. Exposes `getRollups`, `getDomain`, `getDomains`, `getOutliers`, `getReviewers`, `getDocTypes`.

- [ ] **Step 1: Write the failing test**

Create `test/data.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/data.test.js`
Expected: FAIL — `../src/data.js` does not exist.

- [ ] **Step 3: Implement `src/data.js`**

```js
// src/data.js
// Pure read layer over globalThis.HERITAGE_KPI_DATA.

function root() {
  if (typeof globalThis.HERITAGE_KPI_DATA === "undefined") {
    throw new Error("HERITAGE_KPI_DATA not loaded — include seed-data.js before src/data.js.");
  }
  return globalThis.HERITAGE_KPI_DATA;
}

export function getRollups() { return root().rollups; }
export function getDomains() { return root().domains; }
export function getReviewers() { return root().reviewers; }
export function getDocTypes() { return root().docTypes; }
export function getWeeks() { return root().weeks; }
export function getGeneratedAt() { return root().generatedAt; }

export function getDomain(slug) {
  return root().domains.find(d => d.slug === slug) || null;
}

// Returns an array of { domainSlug, metric, value, mean, deltaRatio }
// for any per-domain timing metric that exceeds (mean × 1.30).
export function getOutliers() {
  const r = root();
  const { aiSecondsPerDoc, reviewerSecondsPerDoc } = r.rollups.timing;
  const flags = [];
  for (const d of r.domains) {
    if (d.timing.aiSeconds > aiSecondsPerDoc * 1.30) {
      flags.push({
        domainSlug: d.slug, metric: "aiSeconds",
        value: d.timing.aiSeconds, mean: aiSecondsPerDoc,
        deltaRatio: d.timing.aiSeconds / aiSecondsPerDoc - 1,
      });
    }
    if (d.timing.reviewerSeconds > reviewerSecondsPerDoc * 1.30) {
      flags.push({
        domainSlug: d.slug, metric: "reviewerSeconds",
        value: d.timing.reviewerSeconds, mean: reviewerSecondsPerDoc,
        deltaRatio: d.timing.reviewerSeconds / reviewerSecondsPerDoc - 1,
      });
    }
  }
  return flags;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/data.test.js`
Expected: PASS — all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data.js test/data.test.js
git commit -m "feat: data access layer (rollups, domains, outliers) + tests"
```

---

## Task 5: Router + tests

**Files:**
- Create: `src/router.js`
- Test: `test/router.test.js`

Pure: hash string → `{ view, params }`. Dispatch lives in `app.js`.

- [ ] **Step 1: Write the failing test**

Create `test/router.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHash } from "../src/router.js";

test("empty / root hash returns overview", () => {
  assert.deepEqual(parseHash(""),       { view: "overview", params: {} });
  assert.deepEqual(parseHash("#/"),     { view: "overview", params: {} });
  assert.deepEqual(parseHash("#"),      { view: "overview", params: {} });
});

test("about hash returns about", () => {
  assert.deepEqual(parseHash("#/about"), { view: "about", params: {} });
});

test("domain hash returns domain with slug param", () => {
  assert.deepEqual(parseHash("#/domain/flow-diagram"),
    { view: "domain", params: { slug: "flow-diagram" } });
  assert.deepEqual(parseHash("#/domain/estate-distribution-chart"),
    { view: "domain", params: { slug: "estate-distribution-chart" } });
});

test("unknown hash falls back to overview", () => {
  assert.deepEqual(parseHash("#/garbage"), { view: "overview", params: {} });
  assert.deepEqual(parseHash("#/domain/"), { view: "overview", params: {} });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/router.test.js`
Expected: FAIL — `../src/router.js` does not exist.

- [ ] **Step 3: Implement `src/router.js`**

```js
// src/router.js
// Pure hash router. Translates a window.location.hash value into a route record.

const DOMAIN_SLUGS = new Set([
  "insurance-summary",
  "flow-diagram",
  "asset-sheet",
  "data-sheet",
  "estate-distribution-chart",
]);

export function parseHash(hash) {
  const trimmed = (hash || "").replace(/^#\/?/, "");
  if (trimmed === "" || trimmed === "/") {
    return { view: "overview", params: {} };
  }
  if (trimmed === "about") {
    return { view: "about", params: {} };
  }
  const m = /^domain\/(.+)$/.exec(trimmed);
  if (m && DOMAIN_SLUGS.has(m[1])) {
    return { view: "domain", params: { slug: m[1] } };
  }
  return { view: "overview", params: {} };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/router.test.js`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/router.js test/router.test.js
git commit -m "feat: hash router (overview / domain / about) + tests"
```

---

## Task 6: Sparkline SVG generator + tests

**Files:**
- Create: `src/charts/sparkline.js`
- Test: `test/charts.sparkline.test.js`

Single-stroke SVG sparkline. Defaults: 80×24, 1.5px stroke, `currentColor`.

- [ ] **Step 1: Write the failing test**

Create `test/charts.sparkline.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/charts.sparkline.test.js`
Expected: FAIL — `../src/charts/sparkline.js` does not exist.

- [ ] **Step 3: Implement `src/charts/sparkline.js`**

```js
// src/charts/sparkline.js
// Minimal SVG sparkline. Single polyline, no axes, no labels.

export function sparkline(values, opts = {}) {
  const width  = opts.width  ?? 80;
  const height = opts.height ?? 24;
  const stroke = opts.stroke ?? "currentColor";
  const strokeWidth = opts.strokeWidth ?? 1.5;
  const pad = 2;

  if (!Array.isArray(values) || values.length < 2) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"></svg>`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * innerW;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">`
       + `<polyline fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>`
       + `</svg>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/charts.sparkline.test.js`
Expected: PASS — all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/charts/sparkline.js test/charts.sparkline.test.js
git commit -m "feat: sparkline SVG generator + tests"
```

---

## Task 7: TrendLine SVG generator + tests

**Files:**
- Create: `src/charts/trend-line.js`
- Test: `test/charts.trend-line.test.js`

Two overlaid series, fixed y-axis 0–1, x-axis week labels every 2 ticks.

- [ ] **Step 1: Write the failing test**

Create `test/charts.trend-line.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/charts.trend-line.test.js`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/charts/trend-line.js`**

```js
// src/charts/trend-line.js
// Overlaid line chart. Pure SVG string.

import { weekLabel } from "../format.js";

export function trendLine({ weeks, series, width = 720, height = 220 }) {
  const padLeft = 40, padRight = 16, padTop = 16, padBottom = 32;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  // y-axis: 0..1 fixed (we display 0..100)
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const yPos = v => padTop + innerH - v * innerH;
  const xPos = i => padLeft + (i / (weeks.length - 1)) * innerW;

  // y-axis tick lines + labels
  const ticks = yTicks.map(v => {
    const y = yPos(v);
    const label = String(Math.round(v * 100));
    return (
      `<line x1="${padLeft}" x2="${padLeft + innerW}" y1="${y}" y2="${y}" stroke="hsl(33 18% 80%)" stroke-width="0.5"/>` +
      `<text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" fill="hsl(33 10% 34%)" font-family="Inter, sans-serif" font-size="11">${label}</text>`
    );
  }).join("");

  // x-axis labels every 2nd week
  const xLabels = weeks.map((w, i) => {
    if (i % 2 !== 0) return "";
    const x = xPos(i);
    return `<text x="${x}" y="${height - 10}" text-anchor="middle" fill="hsl(33 10% 34%)" font-family="Inter, sans-serif" font-size="11">${weekLabel(w)}</text>`;
  }).join("");

  // series polylines
  const lines = series.map(s => {
    const pts = s.values.map((v, i) => `${xPos(i).toFixed(2)},${yPos(v).toFixed(2)}`).join(" ");
    return `<polyline fill="none" stroke="${s.stroke}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>`;
  }).join("");

  // legend (top-right)
  const legend = series.map((s, i) => {
    const x = padLeft + innerW - 8;
    const y = padTop + 4 + i * 14;
    return (
      `<line x1="${x - 28}" x2="${x - 16}" y1="${y - 3}" y2="${y - 3}" stroke="${s.stroke}" stroke-width="1.75"/>` +
      `<text x="${x - 12}" y="${y}" text-anchor="start" fill="hsl(33 10% 34%)" font-family="Inter, sans-serif" font-size="11">${s.label}</text>`
    );
  }).join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">` +
    ticks +
    lines +
    xLabels +
    legend +
    `</svg>`
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/charts.trend-line.test.js`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/charts/trend-line.js test/charts.trend-line.test.js
git commit -m "feat: trend line SVG generator + tests"
```

---

## Task 8: BarSeries generator + tests

**Files:**
- Create: `src/charts/bar-series.js`
- Test: `test/charts.bar-series.test.js`

Horizontal bars rendered as HTML strings (CSS bars, not SVG — easier for hover states and accessibility). Each row: label · bar · value.

- [ ] **Step 1: Write the failing test**

Create `test/charts.bar-series.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/charts.bar-series.test.js`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/charts/bar-series.js`**

```js
// src/charts/bar-series.js
// Horizontal bar series rendered as HTML (not SVG) so rows can be hovered/linked.

const DEFAULT_TINT   = "hsl(33 22% 89%)";
const DEFAULT_STROKE = "hsl(33 14% 67%)";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  }[c]));
}

export function barSeries(rows, opts = {}) {
  if (!rows || rows.length === 0) return `<div class="bar-series bar-series-empty"></div>`;

  const max = opts.max ?? 1;
  const formatValue = opts.formatValue ?? (v => v);

  const items = rows.map(r => {
    const pctWidth = Math.max(0, Math.min(100, (r.value / max) * 100));
    const tint   = r.tint   ?? DEFAULT_TINT;
    const stroke = r.stroke ?? DEFAULT_STROKE;
    const displayValue = r.displayValue ?? formatValue(r.value);
    const secondary = r.secondary ? `<span class="bar-secondary">${escapeHtml(r.secondary)}</span>` : "";
    return (
      `<div class="bar-row">` +
      `<span class="bar-label">${escapeHtml(r.label)}</span>` +
      `<span class="bar-track">` +
        `<span class="bar-fill" style="width: ${pctWidth.toFixed(1)}%; background: ${tint}; border-color: ${stroke};"></span>` +
      `</span>` +
      `<span class="bar-value">${escapeHtml(displayValue)}</span>` +
      secondary +
      `</div>`
    );
  }).join("");

  return `<div class="bar-series">${items}</div>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/charts.bar-series.test.js`
Expected: PASS — all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/charts/bar-series.js test/charts.bar-series.test.js
git commit -m "feat: bar-series HTML generator + tests"
```

---

## Task 9: Base styles (tokens, typography, page shell)

**Files:**
- Create: `styles.css` (first half — through .card)

- [ ] **Step 1: Write `styles.css` token + base block**

Create `styles.css`:

```css
/* styles.css
 * Heritage Accuracy KPI dashboard — applies Supernal brand tokens directly.
 * Source: ~/Supernal/claude/skills/brand-design/SKILL.md
 */

/* ---------- Fonts ---------- */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@600&family=JetBrains+Mono:wght@400&display=swap");

/* ---------- Tokens ---------- */
:root {
  /* page surfaces */
  --bg-page:        hsl(33 20% 97%);
  --bg-card:        hsl(30  8% 99%);
  --bg-sidebar:     hsl(33 22% 87%);

  /* action — interactive elements only */
  --action:         hsl(167 16% 48%);
  --action-hover:   hsl(167 14% 34%);
  --action-subtle:  hsl(167 14% 90%);
  --action-fg:      hsl(0    0% 100%);

  /* neutrals */
  --border:         hsl(33 18% 80%);
  --border-strong:  hsl(33 14% 67%);
  --muted-bg:       hsl(33 22% 89%);
  --placeholder:    hsl(33 12% 50%);
  --fg-muted:       hsl(33 10% 34%);
  --fg:             hsl(33  4%  6%);

  /* status */
  --success-bg:     hsl(139 76% 97%);
  --success-fg:     hsl(142 72% 29%);
  --success-border: hsl(141 79% 85%);
  --warning-bg:     hsl( 48 100% 96%);
  --warning-fg:     hsl( 26 91% 37%);
  --warning-border: hsl( 48 97% 77%);
  --error-bg:       hsl(  0 86% 97%);
  --error-fg:       hsl(  6 63% 46%);
  --error-border:   hsl(  0 96% 89%);

  /* viz palette */
  --viz-0:          hsl(  9 41% 55%);  --viz-0-tint: hsl(  9 30% 93%);  /* Terracotta · Flow Diagram */
  --viz-1:          hsl( 32 73% 69%);  --viz-1-tint: hsl( 32 50% 94%);  /* Amber      · Insurance summary */
  --viz-2:          hsl(196 13% 50%);  --viz-2-tint: hsl(196 10% 93%);  /* Slate blue · Asset Sheet */
  --viz-3:          hsl( 19 46% 72%);  --viz-3-tint: hsl( 19 32% 94%);  /* Sand       · Data Sheet */
  --viz-4:          hsl( 64 13% 45%);  --viz-4-tint: hsl( 64  9% 93%);  /* Olive      · Estate Distribution */

  /* spacing */
  --pad-page-y:     80px;
  --pad-page-x:     64px;
  --content-max:    1200px;
  --radius-card:    0.5rem;
  --radius-pill:    9999px;

  --shadow-input:   0 1px 1px 0 rgba(0, 0, 0, 0.05);
}

/* ---------- Reset + base ---------- */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  background: var(--bg-page);
  color: var(--fg);
  font-family: "Inter", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2 {
  font-family: "Lora", Georgia, serif;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}

h1 { font-size: 36px; line-height: 1.2;  letter-spacing: -0.02em; }
h2 { font-size: 30px; line-height: 1.25; }

h3, h4, h5, h6 {
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 600;
  margin: 0;
}

h3 { font-size: 20px; line-height: 1.3;  font-weight: 600; }
h4 { font-size: 16px; line-height: 1.4;  font-weight: 500; }
h5 { font-size: 14px; line-height: 1.4;  font-weight: 500; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.08em; }

p { margin: 0 0 1em; }

code, kbd, pre, samp {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.92em;
}

a { color: var(--action); text-decoration: none; }
a:hover { color: var(--action-hover); text-decoration: underline; }
a:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; border-radius: 2px; }

/* ---------- Shell ---------- */
.page {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--pad-page-y) var(--pad-page-x);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
}
.topbar .brand {
  display: flex; align-items: center; gap: 12px;
  color: var(--fg);
}
.topbar .brand h1 { font-size: 22px; }
.topbar .brand-sub {
  font-size: 12px;
  color: var(--fg-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.topbar .stamp {
  font-size: 12px;
  color: var(--fg-muted);
  font-family: "JetBrains Mono", monospace;
}

.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--action);
  font-size: 13px;
  margin-bottom: 24px;
}

/* ---------- Card ---------- */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 24px;
}
.card + .card { margin-top: 24px; }

@media (max-width: 720px) {
  :root { --pad-page-x: 24px; --pad-page-y: 40px; }
  .topbar { flex-direction: column; align-items: flex-start; gap: 12px; }
}
```

- [ ] **Step 2: Verify by opening a stub HTML**

Create a temporary `index.html` (we'll replace it in Task 11):

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Heritage KPI · Style smoke test</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="page">
    <div class="topbar">
      <div class="brand"><h1>Heritage</h1><span class="brand-sub">Accuracy KPI Framework</span></div>
      <span class="stamp">2026-06-02 · v1 demo</span>
    </div>
    <div class="card"><h2>Card sample</h2><p>If you see Lora display + Inter body on a warm cream background, base styles work.</p></div>
  </main>
</body>
</html>
```

Open in browser, confirm: warm cream page, Lora "Heritage" title, Inter body, card has subtle elevation. No console errors.

- [ ] **Step 3: Commit**

```bash
git add styles.css index.html
git commit -m "style: brand tokens, typography, page shell, card base"
```

---

## Task 10: Component styles (matrix, tables, bar series, sparklines, badges)

**Files:**
- Modify: `styles.css` (append component block)

- [ ] **Step 1: Append component styles to `styles.css`**

Append to `styles.css`:

```css
/* ---------- Hero rollups ---------- */
.hero-rollups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}
.rollup {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
}
.rollup .label {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 8px;
}
.rollup .label-title {
  font-family: "Lora", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 4px;
  text-transform: none;
  letter-spacing: 0;
}
.rollup .score {
  font-family: "Lora", serif;
  font-size: 60px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--fg);
}
.rollup .delta {
  font-size: 12px;
  color: var(--fg-muted);
  margin-top: 8px;
}
.rollup .spark { color: var(--fg-muted); }

/* timing strip */
.timing-strip {
  display: flex;
  gap: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 18px 24px;
  margin-bottom: 40px;
}
.timing-strip .item {
  display: flex; flex-direction: column; gap: 2px;
}
.timing-strip .item .k {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
}
.timing-strip .item .v {
  font-family: "Lora", serif;
  font-size: 22px;
  font-weight: 600;
}

/* ---------- Matrix ---------- */
.section-title {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin: 56px 0 16px;
}

.matrix {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}
.matrix thead th {
  text-align: left;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--border);
}
.matrix tbody tr {
  cursor: pointer;
}
.matrix tbody tr:hover {
  background: var(--action-subtle);
}
.matrix tbody td {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  height: 56px;
}
.matrix .domain-cell {
  display: flex; align-items: center; gap: 12px;
  font-weight: 500;
}
.matrix .domain-dot {
  width: 10px; height: 10px; border-radius: 50%;
  flex-shrink: 0;
}
.matrix .score-cell {
  display: flex; align-items: center; gap: 12px;
  font-variant-numeric: tabular-nums;
}
.matrix .score-cell .num {
  font-family: "Lora", serif;
  font-size: 18px;
  font-weight: 600;
  min-width: 48px;
}
.matrix .score-cell .arrow {
  font-size: 13px;
  color: var(--fg-muted);
}
.matrix .timing-cell {
  font-variant-numeric: tabular-nums;
  color: var(--fg-muted);
}
.matrix .timing-cell.outlier { color: var(--fg); }

/* warning chip */
.chip-warn {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--warning-bg);
  color: var(--warning-fg);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 6px;
}

/* ---------- Trend chart card ---------- */
.trend-card { padding: 24px 32px; }
.trend-card svg { width: 100%; height: auto; }

/* ---------- Bar series ---------- */
.bar-series {
  display: flex; flex-direction: column; gap: 8px;
  font-size: 13px;
}
.bar-row {
  display: grid;
  grid-template-columns: 180px 1fr 56px 96px;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.bar-row .bar-label {
  color: var(--fg);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-row .bar-track {
  position: relative;
  height: 8px;
  background: var(--muted-bg);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.bar-row .bar-fill {
  display: block;
  height: 100%;
  border: 1px solid;
  border-radius: var(--radius-pill);
}
.bar-row .bar-value {
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--fg-muted);
}
.bar-row .bar-secondary {
  font-size: 12px;
  color: var(--fg-muted);
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .bar-row { grid-template-columns: 140px 1fr 48px 80px; }
}

/* ---------- Domain header ---------- */
.domain-header {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 32px;
  align-items: end;
  margin-bottom: 40px;
}
.domain-header .id {
  display: flex; align-items: center; gap: 14px;
  align-self: start;
}
.domain-header .id .big-dot {
  width: 14px; height: 14px; border-radius: 50%;
}
.domain-header .stage-cell .label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 4px;
}
.domain-header .stage-cell .num {
  font-family: "Lora", serif;
  font-size: 44px;
  font-weight: 600;
  line-height: 1;
}

/* ---------- Detail tables ---------- */
.detail-section { margin-top: 48px; }
.detail-section h3 { margin-bottom: 16px; }
.detail-table {
  width: 100%;
  border-collapse: separate; border-spacing: 0;
  font-size: 13px;
}
.detail-table thead th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  font-weight: 500;
  padding: 0 12px 10px;
  border-bottom: 1px solid var(--border);
}
.detail-table tbody td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.detail-table tbody td.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.detail-table tbody td.q-text { font-weight: 500; }

.edit-cats {
  display: flex; gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.edit-cat {
  font-size: 11px;
  color: var(--fg-muted);
  display: inline-flex; align-items: center; gap: 4px;
}
.edit-cat .swatch {
  display: inline-block; width: 8px; height: 8px; border-radius: 2px;
}

/* ---------- About page ---------- */
.about-section { max-width: 720px; }
.about-section .formula {
  display: inline-block;
  background: var(--muted-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 10px 14px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  margin: 8px 0 24px;
}

/* footer */
.footer {
  margin-top: 80px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--fg-muted);
  display: flex;
  justify-content: space-between;
  gap: 24px;
}
```

- [ ] **Step 2: Visual sanity check**

Reload the stub `index.html`. Nothing should regress — the smoke-test card still renders. New classes (`.matrix`, `.bar-row`, etc.) aren't used yet but are present in the stylesheet.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style: matrix, bar series, detail tables, domain header, footer"
```

---

## Task 11: Final index.html shell

**Files:**
- Modify: `index.html` (replace stub with the real shell)

- [ ] **Step 1: Replace `index.html` with the production shell**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Heritage · Accuracy KPI Framework</title>
  <link rel="icon" href="assets/heritage-mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="page">
    <header class="topbar">
      <div class="brand">
        <span style="color: var(--viz-0); display: inline-flex;"><img src="assets/heritage-mark.svg" alt="" width="24" height="24" style="opacity: 0.85"></span>
        <div>
          <h1 style="font-size: 22px; line-height: 1;">Heritage</h1>
          <div class="brand-sub">Accuracy KPI Framework</div>
        </div>
      </div>
      <span class="stamp" id="stamp">v1 demo · 2026-06-02</span>
    </header>

    <div id="app"></div>

    <footer class="footer">
      <span>v1 demo · numbers are illustrative, anchored to current operational range</span>
      <a href="#/about">Framework legend</a>
    </footer>
  </main>

  <script src="seed-data.js"></script>
  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open in browser, confirm**

Open `index.html`. Confirm:
- Title bar reads "Heritage · Accuracy KPI Framework"
- "v1 demo · 2026-06-02" stamp visible top-right
- Footer with framework-legend link visible bottom
- `#app` is empty (no console errors; `app.js` not implemented yet)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: production shell (header, footer, mount, font + script loads)"
```

---

## Task 12: app.js entry — router wiring + scaffold view dispatch

**Files:**
- Create: `app.js`

This wires the hash router to renderers we haven't built yet — we'll stub each view to return a placeholder first, then fill them in Tasks 13–15.

- [ ] **Step 1: Create `app.js`**

```js
// app.js
// Entry point. Wires the hash router to view renderers. Only place that touches the DOM.

import { parseHash } from "./src/router.js";
import { renderOverview } from "./src/views/overview.js";
import { renderDomain }   from "./src/views/domain.js";
import { renderAbout }    from "./src/views/about.js";

function render() {
  const route = parseHash(window.location.hash);
  const app = document.getElementById("app");
  let html;
  switch (route.view) {
    case "domain":   html = renderDomain(route.params.slug); break;
    case "about":    html = renderAbout(); break;
    case "overview":
    default:         html = renderOverview(); break;
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
```

- [ ] **Step 2: Stub the three view modules so the page loads**

Create `src/views/overview.js`:

```js
export function renderOverview() {
  return `<p style="color: var(--fg-muted)">Overview view not built yet.</p>`;
}
```

Create `src/views/domain.js`:

```js
export function renderDomain(slug) {
  return `<p style="color: var(--fg-muted)">Domain view (${slug}) not built yet.</p>`;
}
```

Create `src/views/about.js`:

```js
export function renderAbout() {
  return `<p style="color: var(--fg-muted)">About view not built yet.</p>`;
}
```

- [ ] **Step 3: Reload `index.html`, confirm routing works**

- `#/` shows "Overview view not built yet."
- `#/domain/flow-diagram` shows "Domain view (flow-diagram) not built yet."
- `#/about` shows "About view not built yet."
- `#/garbage` falls back to the overview placeholder.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add app.js src/views/
git commit -m "feat: app entry + hash routing wired to view stubs"
```

---

## Task 13: Overview view

**Files:**
- Modify: `src/views/overview.js`

Renders hero rollups + timing strip + matrix + trend chart + reviewers/doc-type bar series.

- [ ] **Step 1: Implement `src/views/overview.js`**

```js
// src/views/overview.js
import { pct, seconds, delta } from "../format.js";
import { sparkline } from "../charts/sparkline.js";
import { trendLine } from "../charts/trend-line.js";
import { barSeries } from "../charts/bar-series.js";
import { getRollups, getDomains, getReviewers, getDocTypes, getWeeks, getOutliers } from "../data.js";

function vizVar(index)     { return `var(--viz-${index})`; }
function vizTintVar(index) { return `var(--viz-${index}-tint)`; }

function rollupCard(label, sub, score, trend, deltaText) {
  return `
    <div class="rollup">
      <div>
        <div class="label-title">${label}</div>
        <div class="label">${sub}</div>
        <div class="score">${pct(score)}</div>
        <div class="delta">${deltaText} · last 8 weeks</div>
      </div>
      <div class="spark">${sparkline(trend, { width: 120, height: 36, strokeWidth: 1.75 })}</div>
    </div>`;
}

function trendArrow(values) {
  const a = values[values.length - 1];
  const b = values[values.length - 9] ?? values[0];
  if (a - b > 0.005)  return "↑";
  if (a - b < -0.005) return "↓";
  return "→";
}

function matrixRow(d, outliersByDomain) {
  const dotStyle = `background: ${vizVar(d.vizIndex)};`;
  const s1cell = d.stage1Applies
    ? `<div class="score-cell">
         <span class="num">${pct(d.stage1.score)}</span>
         ${sparkline(d.stage1.trend.slice(-6), { width: 72, height: 22 })}
         <span class="arrow">${trendArrow(d.stage1.trend)}</span>
       </div>`
    : `<span style="color: var(--fg-muted)">—</span>`;
  const s2cell = `<div class="score-cell">
       <span class="num">${pct(d.stage2.score)}</span>
       ${sparkline(d.stage2.trend.slice(-6), { width: 72, height: 22, stroke: vizVar(d.vizIndex) })}
       <span class="arrow">${trendArrow(d.stage2.trend)}</span>
     </div>`;

  const outlierMetrics = (outliersByDomain[d.slug] || []).map(o => o.metric);
  const aiOutlier = outlierMetrics.includes("aiSeconds");
  const revOutlier = outlierMetrics.includes("reviewerSeconds");
  const aiClass = aiOutlier ? "outlier" : "";
  const revClass = revOutlier ? "outlier" : "";
  const aiChip = aiOutlier ? ` <span class="chip-warn">⚠</span>` : "";
  const revChip = revOutlier ? ` <span class="chip-warn">⚠</span>` : "";

  return `
    <tr onclick="window.location.hash = '#/domain/${d.slug}'">
      <td>
        <span class="domain-cell">
          <span class="domain-dot" style="${dotStyle}"></span>
          ${d.name}
        </span>
      </td>
      <td>${s1cell}</td>
      <td>${s2cell}</td>
      <td class="timing-cell ${aiClass}">AI ${seconds(d.timing.aiSeconds)}${aiChip}</td>
      <td class="timing-cell ${revClass}">Rev ${seconds(d.timing.reviewerSeconds).replace(/(\d+)m \d+s/, "$1m")}${revChip}</td>
    </tr>`;
}

export function renderOverview() {
  const r = getRollups();
  const weeks = getWeeks();
  const domains = getDomains();
  const reviewers = getReviewers();
  const docTypes = getDocTypes();

  const s1Eight = r.stage1.trend[r.stage1.trend.length - 9] ?? r.stage1.trend[0];
  const s2Eight = r.stage2.trend[r.stage2.trend.length - 9] ?? r.stage2.trend[0];

  const outliers = getOutliers();
  const outliersByDomain = {};
  for (const o of outliers) {
    (outliersByDomain[o.domainSlug] ||= []).push(o);
  }

  const reviewerMax = Math.max(...reviewers.map(r => r.docs));
  const docTypeMax  = Math.max(...docTypes.map(d => d.docs));

  return `
    <section class="hero-rollups">
      ${rollupCard("Stage 2", "Mapping accuracy — the end-to-end number", r.stage2.score, r.stage2.trend, delta(r.stage2.score, s2Eight))}
      ${rollupCard("Stage 1", "Answer accuracy — quality of the inputs",  r.stage1.score, r.stage1.trend, delta(r.stage1.score, s1Eight))}
    </section>

    <section class="timing-strip">
      <div class="item"><span class="k">AI · per document</span><span class="v">${seconds(r.timing.aiSecondsPerDoc)}</span></div>
      <div class="item"><span class="k">Reviewer · per document</span><span class="v">${seconds(r.timing.reviewerSecondsPerDoc)}</span></div>
      <div class="item"><span class="k">Lift</span><span class="v">${r.timing.liftMultiplier.toFixed(1)}×</span></div>
    </section>

    <h5 class="section-title">Domain × Stage matrix</h5>
    <table class="matrix">
      <thead>
        <tr>
          <th>Domain</th>
          <th>Stage 1 · Answer</th>
          <th>Stage 2 · Mapping</th>
          <th>AI / doc</th>
          <th>Reviewer / doc</th>
        </tr>
      </thead>
      <tbody>
        ${domains.map(d => matrixRow(d, outliersByDomain)).join("")}
      </tbody>
    </table>

    <h5 class="section-title">Trend · last 12 weeks</h5>
    <div class="card trend-card">
      ${trendLine({
        weeks,
        series: [
          { values: r.stage2.trend, stroke: "hsl(33 4% 6%)",   label: "Stage 2 · Mapping" },
          { values: r.stage1.trend, stroke: "hsl(33 10% 34%)", label: "Stage 1 · Answer" },
        ],
        width: 1136, height: 240,
      })}
    </div>

    <div class="two-col" style="margin-top: 56px;">
      <div>
        <h5 class="section-title" style="margin-top: 0;">Top reviewers</h5>
        ${barSeries(reviewers.map(rv => ({
          label: rv.name,
          value: rv.docs,
          displayValue: String(rv.docs),
          secondary: "docs",
        })), { max: reviewerMax })}
      </div>
      <div>
        <h5 class="section-title" style="margin-top: 0;">Top document types</h5>
        ${barSeries(docTypes.map(dt => ({
          label: dt.name,
          value: dt.docs,
          displayValue: String(dt.docs),
          secondary: "docs",
        })), { max: docTypeMax })}
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: Reload `index.html`, verify**

Reload at `#/`. Confirm:
- Hero shows two rollups: Stage 2 = 88%, Stage 1 = 94%, both with sparklines and delta text.
- Timing strip shows AI 2m 14s · Reviewer 28m 00s · Lift 12.5×.
- Matrix shows 5 rows; EDS row Stage 1 = "—".
- Flow Diagram row has ⚠ on the Reviewer column; no others.
- Hovering a matrix row tints background with action-subtle.
- Clicking Flow Diagram → URL becomes `#/domain/flow-diagram`, page shows "Domain view (flow-diagram) not built yet."
- Trend chart renders two overlaid lines, legend top-right, y-axis 0–100, x-axis week labels.
- Bottom: two bar-series (reviewers, doc types).
- Console: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/overview.js
git commit -m "feat: overview view (hero, timing, matrix, trend, bar series)"
```

---

## Task 14: Domain detail view

**Files:**
- Modify: `src/views/domain.js`

Renders the same template for any of the 5 domain slugs. Hides Stage 1 section when `stage1Applies === false`.

- [ ] **Step 1: Implement `src/views/domain.js`**

```js
// src/views/domain.js
import { pct, seconds } from "../format.js";
import { sparkline } from "../charts/sparkline.js";
import { trendLine } from "../charts/trend-line.js";
import { barSeries } from "../charts/bar-series.js";
import { getDomain, getWeeks } from "../data.js";

const EDIT_CATEGORIES = [
  { key: "unchanged",    label: "unchanged",    vizIndex: 4 }, // olive
  { key: "formatting",   label: "formatting",   vizIndex: 1 }, // amber
  { key: "clarification",label: "clarification",vizIndex: 2 }, // slate blue
  { key: "substantive",  label: "substantive",  vizIndex: 0 }, // terracotta
  { key: "newInfo",      label: "new info",     vizIndex: 3 }, // sand
  { key: "removal",      label: "removal",      vizIndex: 6 }, // charcoal (rare)
];

function vizVar(index)     { return `var(--viz-${index})`; }
function vizTintVar(index) { return `var(--viz-${index}-tint)`; }

function renderQuestionRow(q) {
  const total = Object.values(q.editCategories).reduce((a, b) => a + b, 0) || 1;
  const cats = EDIT_CATEGORIES.map(cat => {
    const count = q.editCategories[cat.key] || 0;
    if (count === 0) return "";
    const pctOfTotal = (count / total * 100).toFixed(0);
    return `<span class="edit-cat"><span class="swatch" style="background: var(--viz-${cat.vizIndex}-tint); border: 1px solid var(--viz-${cat.vizIndex});"></span>${cat.label} ${pctOfTotal}%</span>`;
  }).join("");
  return `
    <tr>
      <td class="q-text">${q.text}<div class="edit-cats">${cats}</div></td>
      <td class="num">${q.n}</td>
      <td class="num">${pct(q.closeness)}</td>
    </tr>`;
}

function renderPlacementRow(p) {
  return `
    <tr>
      <td class="q-text">${p.type}</td>
      <td class="num">${p.n}</td>
      <td class="num">${pct(p.closeness)}</td>
      <td>${p.commonAdjustment}</td>
    </tr>`;
}

function barSeriesByScore(rows, vizIndex) {
  return barSeries(rows.map(r => ({
    label: r.name,
    value: r.score,
    displayValue: pct(r.score),
    secondary: `n=${r.n}`,
    tint: vizTintVar(vizIndex),
    stroke: vizVar(vizIndex),
  })));
}

function stage1Section(d) {
  if (!d.stage1Applies) return "";
  return `
    <section class="detail-section">
      <h3>Stage 1 · Answer accuracy</h3>
      <h5 class="section-title" style="margin-top: 24px;">Per question</h5>
      <table class="detail-table">
        <thead><tr><th>Question</th><th class="num">N</th><th class="num">Mean closeness</th></tr></thead>
        <tbody>${d.stage1.questions.map(renderQuestionRow).join("")}</tbody>
      </table>

      <div class="two-col" style="margin-top: 32px;">
        <div>
          <h5 class="section-title" style="margin-top: 0;">Per document type</h5>
          ${barSeriesByScore(d.stage1.byDocType, d.vizIndex)}
        </div>
        <div>
          <h5 class="section-title" style="margin-top: 0;">Per reviewer</h5>
          ${barSeriesByScore(d.stage1.byReviewer, d.vizIndex)}
        </div>
      </div>
    </section>`;
}

function stage2Section(d) {
  return `
    <section class="detail-section">
      <h3>Stage 2 · Mapping accuracy</h3>
      <h5 class="section-title" style="margin-top: 24px;">Per placement type</h5>
      <table class="detail-table">
        <thead><tr><th>Placement</th><th class="num">N</th><th class="num">Mean closeness</th><th>Common adjustment</th></tr></thead>
        <tbody>${d.stage2.placements.map(renderPlacementRow).join("")}</tbody>
      </table>

      <h5 class="section-title">Per attribute</h5>
      ${barSeriesByScore(d.stage2.byAttribute.map(a => ({ name: a.name, score: a.score, n: "" })), d.vizIndex)}

      <div class="two-col" style="margin-top: 32px;">
        <div>
          <h5 class="section-title" style="margin-top: 0;">Per document type</h5>
          ${barSeriesByScore(d.stage2.byDocType, d.vizIndex)}
        </div>
        <div>
          <h5 class="section-title" style="margin-top: 0;">Per reviewer</h5>
          ${barSeriesByScore(d.stage2.byReviewer, d.vizIndex)}
        </div>
      </div>
    </section>`;
}

export function renderDomain(slug) {
  const d = getDomain(slug);
  if (!d) {
    return `<p style="color: var(--fg-muted)">Unknown domain: ${slug}. <a href="#/">Back to overview</a>.</p>`;
  }
  const weeks = getWeeks();
  const trendSeries = d.stage1Applies
    ? [
        { values: d.stage2.trend, stroke: `hsl(var(--viz-${d.vizIndex}-h, 9) var(--viz-${d.vizIndex}-s, 41%) var(--viz-${d.vizIndex}-l, 55%))`, label: "Stage 2" },
        { values: d.stage1.trend, stroke: "hsl(33 10% 34%)", label: "Stage 1" },
      ]
    : [
        { values: d.stage2.trend, stroke: `hsl(64 13% 45%)`, label: "Stage 2" },
      ];

  // Use a literal hsl color for the Stage 2 trend so SVG renders predictably.
  const vizColors = ["hsl(9 41% 55%)","hsl(32 73% 69%)","hsl(196 13% 50%)","hsl(19 46% 72%)","hsl(64 13% 45%)"];
  trendSeries[0].stroke = vizColors[d.vizIndex];

  return `
    <a href="#/" class="back-link">← Overview</a>

    <header class="domain-header">
      <div class="id">
        <span class="big-dot" style="background: ${vizColors[d.vizIndex]}"></span>
        <h2>${d.name}</h2>
      </div>
      ${d.stage1Applies
        ? `<div class="stage-cell"><div class="label">Stage 1 · Answer</div><div class="num">${pct(d.stage1.score)}</div></div>`
        : `<div class="stage-cell"><div class="label">Stage 1 · Answer</div><div class="num" style="color: var(--fg-muted)">—</div></div>`}
      <div class="stage-cell"><div class="label">Stage 2 · Mapping</div><div class="num">${pct(d.stage2.score)}</div></div>
    </header>

    <div class="card trend-card">
      ${trendLine({
        weeks,
        series: trendSeries,
        width: 1136, height: 200,
      })}
    </div>

    ${stage1Section(d)}
    ${stage2Section(d)}

    <section class="detail-section">
      <h3>Pipeline timing</h3>
      <div class="timing-strip" style="margin-top: 16px;">
        <div class="item"><span class="k">AI · per document</span><span class="v">${seconds(d.timing.aiSeconds)}</span></div>
        <div class="item"><span class="k">Reviewer · per document</span><span class="v">${seconds(d.timing.reviewerSeconds)}</span></div>
      </div>
    </section>
  `;
}
```

- [ ] **Step 2: Reload `index.html` at `#/domain/flow-diagram`, verify**

- Back link top-left in action teal.
- Header: terracotta dot, "Flow Diagram", Stage 1 = 88%, Stage 2 = 83%.
- Trend chart shows two lines (terracotta Stage 2, muted Stage 1).
- Stage 1 section: question table with edit-category swatches, then per-doc-type and per-reviewer bar series.
- Stage 2 section: placement table, per-attribute, per-doc-type, per-reviewer.
- Pipeline timing strip at bottom.
- Console: zero errors.

Then `#/domain/estate-distribution-chart`:
- Olive dot, Stage 1 column shows "—", no Stage 1 section.
- Stage 2 section renders normally; trend has single line (olive).

Visit each of the other three domains; confirm all render.

- [ ] **Step 3: Commit**

```bash
git add src/views/domain.js
git commit -m "feat: domain detail view (stage 1 + stage 2 + timing)"
```

---

## Task 15: About / framework legend view

**Files:**
- Modify: `src/views/about.js`

A short, magazine-style summary of the framework — formula, what gets logged, weighting.

- [ ] **Step 1: Implement `src/views/about.js`**

```js
// src/views/about.js

export function renderAbout() {
  return `
    <a href="#/" class="back-link">← Overview</a>

    <section class="about-section">
      <h2>Framework legend</h2>
      <p>Two stages, watched over time, decomposable by domain, document type, reviewer, and question or placement. One number per stage, plus a per-stage drill-down. The same review every Heritage attorney already does — captured as data.</p>

      <h3 style="margin-top: 40px;">Stage 1 · Answer accuracy</h3>
      <p>For each eval question on a document, the reviewer either accepts the AI answer (closeness = 1.00) or edits it. Edited answers receive an LLM-judged closeness score in [0, 1]. The Stage 1 figure is the mean across questions.</p>
      <div class="formula">Stage 1 score = Σ (per-question closeness) ÷ N<sub>questions</sub></div>

      <h3>Stage 2 · Mapping accuracy</h3>
      <p>The AI places each validated answer into the domain's artifact — a row in a table or a node in a diagram. The reviewer doesn't grade anything; they just edit the artifact. An LLM judge compares the original AI version against the final user-adjusted version across all attributes and assigns a closeness score in [0, 1].</p>
      <div class="formula">Stage 2 score = Σ (per-placement closeness) ÷ N<sub>placements</sub></div>

      <h3>What gets logged</h3>
      <p>Five fields per record, plus document-level metadata.</p>
      <ul>
        <li><strong>Original</strong> — the AI version, before any edits.</li>
        <li><strong>Final</strong> — the user-validated version. Equal to the original if accepted unchanged.</li>
        <li><strong>Closeness</strong> — LLM-judged score in [0, 1]. The KPI itself.</li>
        <li><strong>Edit category</strong> — formatting, clarification, substantive correction, new information, or removal.</li>
        <li><strong>Rationale</strong> — short free-text note from the reviewer on why they edited.</li>
      </ul>
      <p>Per record: document type, domain, document ID, reviewer, timestamp. Stage 1 records are keyed by question; Stage 2 records are keyed by placement.</p>

      <h3>Weighting</h3>
      <ul>
        <li><strong>Across domains:</strong> equal by default (Stage 1 = sum ÷ 4, Stage 2 = sum ÷ 5). Adjustable.</li>
        <li><strong>Within a domain (Stage 1):</strong> every question weighted 1/N. Fixed.</li>
        <li><strong>Within a placement (Stage 2):</strong> every attribute equal by default. Open for discussion per domain — text/position/parent are typically substantive; color is less so.</li>
      </ul>

      <h3>Domains</h3>
      <ul>
        <li><strong>Insurance summary</strong>, <strong>Flow Diagram</strong>, <strong>Asset Sheet</strong>, <strong>Data Sheet</strong> — both stages.</li>
        <li><strong>Estate Distribution Chart</strong> — Stage 2 only; consumes validated answers from the other four.</li>
      </ul>

      <p style="color: var(--fg-muted); margin-top: 48px;">v1 demo · numbers are illustrative, anchored to current operational range from Keith's snapshot, the Kyle Woll review, and the Wool / Blau flow diagrams.</p>
    </section>
  `;
}
```

- [ ] **Step 2: Reload `index.html` at `#/about`, verify**

- Back link top-left.
- "Framework legend" h2 in Lora.
- Stage 1 / Stage 2 / What gets logged / Weighting / Domains sections each with the right copy.
- Two formula chips in JetBrains Mono on muted background.
- Footer caveat in muted foreground.
- Footer link "Framework legend" (from main shell) navigates here.

- [ ] **Step 3: Commit**

```bash
git add src/views/about.js
git commit -m "feat: about / framework legend view"
```

---

## Task 16: Acceptance pass + README polish

**Files:**
- Modify: `README.md` (add screenshots note + ensure run instructions are accurate)

- [ ] **Step 1: Run the full test suite**

Run: `node --test test/`
Expected: PASS — all 6 test files green, no failures.

- [ ] **Step 2: Walk each acceptance criterion from the spec**

Open `index.html` in Chrome and Safari at 1440×900:

1. Page renders, no console errors. ✓ if no red in console.
2. Overview matrix fits horizontally with no scroll. ✓ if matrix doesn't overflow.
3. All 5 domain rows + matrix header visible in one screen. ✓ if scroll position 0 shows them.
4. Click each domain row — navigates to detail page in <100ms. ✓ if instant.
5. EDS detail: Stage 2 only, no Stage 1 section, layout clean. ✓
6. View source on a value (e.g. "88%") — trace back to `seed-data.js`. No hard-coded values in `app.js` or views. ✓
7. Inspect element on the back link — action teal. Inspect a number — body text colour. Inspect ⚠ chip — warning bg + text. Search the codebase for `text-green`, `bg-amber-` etc — zero hits. ✓
8. README explains the demo, how to open it, that data is illustrative. ✓

Note any failures; fix inline before commit.

- [ ] **Step 3: Append a "Screenshots" placeholder to `README.md`**

Append to `README.md`:

```markdown

## Screenshots

`assets/screenshots/` — populate after the alignment meeting if useful for hand-off to Jens. For now, open the live demo.

## Hand-off

- v1 build owner: Jens Haakaas (mid-June target).
- This demo is a visual reference, not a foundation-layer integration. Real numbers come from the API endpoint Naveen is wiring up.
- The two-stage scoring, drill-down structure, and field set are stable per the framework PDF and Sven/Tom Sr May 14 + May 21 syncs.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: hand-off notes + screenshots placeholder"
```

- [ ] **Step 5: Hold for explicit push confirmation**

Sven's standing rule: do not push until he says "push" or "ship it". Summarize what was built (file count, route map, test count) and ask for the green light before `git push`.

---

## Self-review

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §3 In: standalone HTML folder | Task 1, 11 |
| §3 In: 7 routes | Task 5, 12 |
| §3 In: 12-week trend on rollups + per domain | Task 7, 13, 14 |
| §3 In: timing KPIs on overview + per domain | Task 13, 14 |
| §3 In: realistic mid-state seed data | Task 2 |
| §3 In: Supernal brand application | Task 9, 10 |
| §3 Out: no build tooling, no live data | Architecture; no npm anywhere |
| §4 architecture & module boundaries | Task 3–8, 12 |
| §5.1 overview IA | Task 13 |
| §5.2 domain detail IA | Task 14 |
| §5.3 framework legend | Task 15 |
| §6 typography, color, layout, charts, density, motion | Task 9, 10 + chart impls |
| §7 data model | Task 2 (data shape) + Task 4 (accessors) |
| §8 demo seed data table | Task 2 (numbers match the spec table) |
| §9 acceptance criteria | Task 16 |
| §10 resolved open items | No code needed; tracked in spec |

**Placeholder scan:** None. All code blocks complete. No TBD/TODO/"add error handling".

**Type consistency check:**
- `getDomain(slug)` returns domain or null — used identically in `overview.js`, `domain.js`, and tests.
- Domain record shape: `{ slug, name, vizIndex, stage1Applies, stage1|null, stage2, timing }` — referenced consistently across Task 2 (data), Task 4 (test), Task 13 + 14 (consumers).
- Sparkline signature `sparkline(values, opts?)` — Task 6 defines, Task 13 + 14 call with same shape.
- `trendLine({ weeks, series, width?, height? })` — Task 7 defines, Task 13 + 14 call with the same key set.
- `barSeries(rows, opts?)` — Task 8 defines, Task 13 + 14 call with `{ label, value, displayValue?, secondary?, tint?, stroke? }`. Consistent.
- `parseHash(hash) → { view, params }` — Task 5 defines, Task 12 consumes. Same shape.
- `getOutliers()` return shape `{ domainSlug, metric, value, mean, deltaRatio }` — Task 4 defines, Task 13 consumes (only reads `domainSlug` and `metric`). Consistent.

No gaps found. Plan ready.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-02-heritage-accuracy-kpi-dashboard.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Which approach?
