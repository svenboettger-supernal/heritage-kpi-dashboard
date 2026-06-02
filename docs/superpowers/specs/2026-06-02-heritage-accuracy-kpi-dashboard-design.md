# Heritage Accuracy KPI Dashboard — v1 demo · design spec

**Status:** approved 2026-06-02
**Owner:** Sven Boettger
**Audience for the demo:** Internal Heritage alignment meeting first; Tom Sr / Jens / Keith downstream
**Engineering hand-off target:** Jens Haakaas's v1 build (mid-June)

---

## 1. Goal

Stand up a self-contained, realistically populated demo of the Heritage Accuracy KPI Framework so the internal alignment meeting has something concrete to react to, and so Jens has a visual reference for the v1 build. The demo must:

- Make the **two-stage** framework legible at a glance (Stage 1 answer accuracy, Stage 2 mapping accuracy).
- Show **where accuracy and timing stand across all 5 domains and both stages on one screen** (Sven's primary UX requirement).
- Let the viewer **drill from any domain row** into per-question, per-placement, per-attribute, per-doc-type, and per-reviewer breakdowns.
- Sit cleanly inside Supernal's editorial brand system — quiet, magazine-like, not a stoplight dashboard.

## 2. Source material

- `~/Downloads/heritage-accuracy-kpi-framework.pdf` — the framework PDF (v1, internal). Defines the two-stage scoring, 5 domains, drill-down structure, what gets logged, and weighting rules.
- ProjectOS ticket "Accuracy KPI Dashboard: two-stage answer & mapping scoring with drill-downs" — comments from Merlin (4d ago, 5d ago) and Sven (May 14 / 16 / 18 notes).
- Heritage Obsidian vault, last ~6 weeks: 2026-05-14, -05-18, -05-21, -05-22 (Keith Wool/Blau reviews), -05-26 internal sync. Captured stakeholder positions, the 67–100% per-domain range, the Kyle Woll case (94% data / 84% formatting), Ryan's "uncontrollable metric" risk, Jens's mid-June target, the Naveen API blocker.
- `~/Supernal/heritage-demo/` — existing vanilla HTML5 + JS template. Sets the precedent for "open the file, no dev server".
- `~/Supernal/claude/skills/brand-design/SKILL.md` — canonical Supernal brand tokens (typography, color, status, viz palette, rules).
- `~/Supernal/pms/components/analytics/charts/*` — reference for hand-rolled SVG sparkline / bar-series / donut patterns.

## 3. Scope

**In:**
- Standalone HTML folder at `~/Supernal/heritage-kpi-dashboard/` (this repo).
- 7 routes: overview, 5 domain detail pages, framework legend.
- Trend over time (12 weeks) on rollups and per-domain pages.
- Timing KPIs (AI seconds / reviewer seconds per document) on overview and per domain.
- Realistic mid-state seed data anchored to vault numbers.
- Full Supernal brand application — Lora/Inter/JetBrains Mono, action teal reserved, warm surfaces, viz palette for domain identity, status colors used only on outlier flags.

**Out:**
- Cross-domain data-sync / consistency KPI (Sven excluded).
- Live data wiring (no Supabase, no API). Static `data.js`.
- Authentication, multi-tenant, multi-firm. One firm, one viewer.
- Mobile-first design — desktop-optimised, gracefully collapses, not native-feeling on phones.
- Build tooling. No npm, no bundler, no TypeScript.

## 4. Architecture

Vanilla HTML5 + CSS + tiny ES2022 JS. Hash-routed single-page app. No build step.

```
~/Supernal/heritage-kpi-dashboard/
├── index.html              # shell: <head>, fonts, root mount, footer
├── styles.css              # brand tokens + components, single file
├── app.js                  # router, view renderers, chart primitives, formatters
├── data.js                 # one window.HERITAGE_KPI_DATA object, deterministic
├── README.md               # what this is, how to open
├── docs/superpowers/specs/ # this file
└── assets/
    ├── supernal-mark.svg
    └── heritage-mark.svg
```

**Routes (`window.location.hash`):**
- `#/` (default) — overview
- `#/domain/insurance-summary`
- `#/domain/flow-diagram`
- `#/domain/asset-sheet`
- `#/domain/data-sheet`
- `#/domain/estate-distribution-chart`
- `#/about` — framework legend (formula, what gets logged, weighting)

**Module boundaries inside `app.js`:**
- `router` — listens to `hashchange`, dispatches to a view renderer.
- `views.*` — one pure render-to-string function per route. Returns innerHTML.
- `charts.*` — `sparkline(values, opts)`, `trendLine(seriesA, seriesB, opts)`, `barSeries(rows, opts)`. Each returns SVG string.
- `format.*` — `pct(0.94) → "94%"`, `seconds(134) → "2m 14s"`, `weekLabel("2026-W23") → "Jun 1"`, etc.
- `data` — a `getDomain(slug)` and `getRollups()` thin wrapper over `window.HERITAGE_KPI_DATA`.

Each unit testable in isolation by hand by loading the file and calling the function from devtools. No framework.

## 5. Information architecture

### 5.1 Overview (`#/`)

Above the fold, in this order:

1. **Hero rollups (two stages + timing strip).** Stage 1 score + 12-week sparkline + delta vs 8 weeks ago. Stage 2 score, same shape. Timing strip — AI 2m14s · Reviewer 28m · Lift 12.5×.
2. **Domain × Stage matrix.** Five rows (Insurance summary, Flow Diagram, Asset Sheet, Data Sheet, Estate Distribution). Three data columns: Stage 1 (score + 6-week sparkline + trend arrow), Stage 2 (same), Timing (AI / Reviewer). EDS row shows `—` for Stage 1. Outlier metrics flagged with a warning `⚠` chip — defined as ≥ pipeline-mean + 30% relative.
3. **12-week overlaid trend chart.** Stage 1 + Stage 2 lines, labelled y-axis 0–100, x-axis week labels. Thin strokes, no fills.
4. **Two compact bar series.** Top 5 reviewers (doc count), top 5 document types (doc count).
5. **Footer.** Demo timestamp, "v1 demo" marker, link to `#/about`.

### 5.2 Domain detail (`#/domain/<slug>`)

Same template for all five. EDS instance hides the Stage 1 section.

1. **Back link.** `← Overview`, action-color, action-color hover.
2. **Header.** Domain dot (viz colour), name, two-stage scores, two 12-week trends.
3. **Stage 1 · Answer accuracy section** (hidden on EDS).
   - Per-question table: question text, N answered, mean closeness, edit-category distribution as inline mini-bars (unchanged / formatting / clarification / substantive / new info / removal).
   - Per-document-type bar series.
   - Per-reviewer bar series.
4. **Stage 2 · Mapping accuracy section.**
   - Per-placement table: placement type, N, mean closeness, common adjustment.
   - Per-attribute bar series (text, color, parent, position — attributes vary by domain per the framework PDF).
   - Per-document-type bar series.
   - Per-reviewer bar series.
5. **Timing block.** AI seconds / doc, reviewer seconds / doc, last-edited timestamp + reviewer.

### 5.3 Framework legend (`#/about`)

Three short blocks: the formula (JetBrains Mono chip), what gets logged (Original / Final / Closeness / Edit category / Rationale), weighting rules. ~200 words of body text. The "v1 demo · not live data" caveat lives here.

## 6. Visual design

Applies `~/Supernal/claude/skills/brand-design/SKILL.md` directly. Key calls:

- **Typography.** Lora 600 for big numerals (Stage 1/2 scores, domain headers) and h1/h2. Inter 400/500/600 for all UI text and tables. JetBrains Mono 400 only for the formula chip on the about page.
- **Color discipline.** Body text `hsl(33 4% 6%)`. Big numbers also in body text colour — restraint is the brand. Action teal `hsl(167 16% 48%)` reserved for the back link, focus rings, hover states, and the active domain dot. Trend arrows `↑ → ↓` in muted foreground `hsl(33 10% 34%)` — no green/red. Status colours surface only inside the `⚠` outlier chip (warning bg + text).
- **Domain identity.** Domain dots use viz palette 0–4: Insurance summary = Amber (1), Flow Diagram = Terracotta (0), Asset Sheet = Slate blue (2), Data Sheet = Sand (3), Estate Distribution = Olive (4). The same colour is the only colour accent on that domain's detail page (header dot, sparkline stroke). Burgundy + Charcoal reserved for future domains.
- **Layout.** 12-col grid, content max-width 1200px, page padding top 80px / sides 64px on desktop, collapsing to 24px under 720px. Asymmetric — rollups span 8 cols left, the legend chip floats 4 cols right. The matrix is full-width.
- **Cards.** `hsl(30 8% 99%)` fill, 1px `hsl(33 18% 80%)` border, 0.5rem radius, `0 1px 1px 0 rgba(0,0,0,0.05)` shadow.
- **Buttons / pills.** Pill 9999px per brand SKILL. The only buttons in the demo are the back link (ghost pill) and a single "Open framework PDF" link on the about page.
- **Charts.**
  - Sparklines — single-stroke `currentColor`, 1.5px stroke, no fill, no axis, no labels, 80×24px default.
  - Trend chart — two lines, thin baseline at `hsl(33 18% 80%)`, y-axis 0–100 with 4 ticks, x-axis week labels every 2 weeks. **On the overview:** Stage 2 (the headline) in body text colour `hsl(33 4% 6%)`, Stage 1 (input quality, subordinate) in muted foreground `hsl(33 10% 34%)`. **On a domain page:** Stage 2 in that domain's viz colour, Stage 1 in muted foreground. Carries the "hierarchy through space and scale, not contrast" rule — Stage 2 reads as primary by weight, not by saturation.
  - Bar series — horizontal, viz-palette tinted bars (background tint variant) with base-colour stroke on the value bar. No status colours on bars ever.
- **Density.** Matrix rows 56px, table rows 44px, no zebra striping — whitespace and 1px row dividers in `hsl(33 18% 80%)`.
- **Motion.** None. No transitions on hover other than colour. The brief is editorial, not animated.

## 7. Data model

Single `window.HERITAGE_KPI_DATA` object. Deterministic (no random at render time — matters for screenshots).

```js
window.HERITAGE_KPI_DATA = {
  generatedAt: "2026-06-02T14:00:00Z",
  weeks: ["2026-W12", /* ...12 weeks... */, "2026-W23"],
  rollups: {
    stage1: { score: 0.94, trend: [/* 12 weekly values, 0..1 */] },
    stage2: { score: 0.88, trend: [/* 12 weekly values, 0..1 */] },
    timing: { aiSecondsPerDoc: 134, reviewerSecondsPerDoc: 1680, liftMultiplier: 12.5 }
  },
  domains: [/* 5 domain records, see below */],
  reviewers: [{ name: "K. McMahon", docs: 142 }, /* 4 more */],
  docTypes:  [{ name: "Revocable trust", docs: 31 }, /* 4 more */]
};
```

**Domain record:**
```js
{
  slug: "flow-diagram",
  name: "Flow Diagram",
  vizIndex: 0,
  stage1Applies: true,                       // false for EDS
  stage1: {
    score: 0.88,
    trend: [/* 12 weekly */],
    questions: [/* ~5 records, see below */],
    byDocType: [{ name, score, n }, ...],
    byReviewer: [{ name, score, n }, ...]
  },
  stage2: {
    score: 0.83,
    trend: [/* 12 weekly */],
    placements: [/* ~5 records */],
    byAttribute: [{ name, score }, ...],     // text, color, parent, position
    byDocType: [...],
    byReviewer: [...]
  },
  timing: { aiSeconds: 182, reviewerSeconds: 2460 }
}
```

**Per-question record** (Stage 1):
```js
{ id: "fd-q1", text: "Entities receiving a flow?", n: 47, closeness: 0.97,
  editCategories: { unchanged: 38, formatting: 4, clarification: 3,
                    substantive: 1, newInfo: 1, removal: 0 } }
```

**Per-placement record** (Stage 2):
```js
{ id: "fd-p1", type: "Beneficiary node", n: 142, closeness: 0.91,
  commonAdjustment: "color changed",
  byAttribute: { text: 0.94, color: 0.78, parent: 0.71, position: 0.93 } }
```

## 8. Demo seed data — realistic mid-state

Anchored to vault numbers. Tom Sr sees clear weak spots without it reading as broken.

| Domain | S1 | S2 | AI / doc | Reviewer / doc | Rationale (from vault) |
|---|---|---|---|---|---|
| Insurance summary | 0.96 | 0.92 | 1m 12s | 18m | Bullet-style, easy to extract |
| Flow Diagram | 0.88 | 0.83 | 3m 02s | 41m | Tom Sr's priority; the visible work area; Wool/Blau cases |
| Asset Sheet | 0.94 | 0.91 | 2m 04s | 24m | Tabular; mostly clean |
| Data Sheet | 0.98 | 0.95 | 0m 58s | 16m | Most structured input, near-ceiling |
| Estate Distribution | — | 0.78 | 2m 31s | 32m | Stage 2 only; compounds upstream errors (Kyle Woll pattern, ~84% formatting) |

**Rollups:** Stage 1 = 0.94, Stage 2 = 0.88, Pipeline timing AI 2m 14s · Reviewer 28m · Lift 12.5×.

**Trends:** all moving up over the 12-week window, but EDS and Flow Diagram still well below the ceiling — leaves room for the "training-data-from-Keith" narrative.

**Outlier flags (⚠):** Flow Diagram reviewer time (41m vs mean 28m, +46%). No others.

**Per-domain content:** ~5 eval-question records and ~5 placement records each, named in the domain's actual estate-planning vocabulary (e.g. Flow Diagram placements: Beneficiary node, Conditional · age trigger, Successor trustee, Bypass trust, Per stirpes branch). 5 named reviewers: K. McMahon, J. Haakaas, Sven Boettger, T. Foreman Jr, Remote Legal · L. Park. 5 doc types: Revocable trust, Healthcare proxy, Power of attorney, Last will, Pour-over.

## 9. Acceptance criteria

1. Opening `index.html` directly (file://) renders the overview cleanly in current Chrome and Safari, no console errors.
2. The overview matrix fits horizontally within a 1440px-wide viewport with no horizontal scroll, and all 5 domain rows plus the matrix header are visible in a single screen at 1440×900 (hero rollups may sit above the fold).
3. Clicking any domain row navigates to its detail page in ≤ 100ms (no network).
4. EDS detail page shows Stage 2 only, no Stage 1 section, no broken layout.
5. All numbers in the demo trace back to `data.js` — no hard-coded values in `app.js` or views.
6. Brand discipline: action teal appears only on interactive elements; status colours appear only on outlier chips; no vendor Tailwind colours anywhere.
7. README explains what the demo is, how to open it, and that data is illustrative.

## 10. Open items (resolved during brainstorm — recorded for traceability)

- **Cross-domain data-sync KPI** — explicitly out of scope (Sven, 2026-06-02).
- **Stage 1 weighting within a domain** — equal per-question, per framework PDF. Demo follows.
- **Attribute weighting within a placement (Stage 2)** — equal by default. Framework PDF flags this as "open for discussion with Heritage". Demo follows the default; the about page mentions weighting is configurable.
- **EDS Stage 1** — does not apply per framework PDF; confirmed (Sven, 2026-06-02). Demo hides Stage 1 section on the EDS page and shows `—` on the overview row.
