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

const VIZ_COLORS = [
  "hsl(9 41% 55%)",    // 0 Terracotta
  "hsl(32 73% 69%)",   // 1 Amber
  "hsl(196 13% 50%)",  // 2 Slate blue
  "hsl(19 46% 72%)",   // 3 Sand
  "hsl(64 13% 45%)",   // 4 Olive
];

export function renderDomain(slug) {
  const d = getDomain(slug);
  if (!d) {
    return `<p style="color: var(--fg-muted)">Unknown domain: ${slug}. <a href="#/">Back to overview</a>.</p>`;
  }
  const weeks = getWeeks();
  const domainColor = VIZ_COLORS[d.vizIndex];

  const trendSeries = d.stage1Applies
    ? [
        { values: d.stage2.trend, stroke: domainColor,         label: "Stage 2" },
        { values: d.stage1.trend, stroke: "hsl(33 10% 34%)",   label: "Stage 1" },
      ]
    : [
        { values: d.stage2.trend, stroke: domainColor,         label: "Stage 2" },
      ];

  return `
    <a href="#/" class="back-link">← Overview</a>

    <header class="domain-header">
      <div class="id">
        <span class="big-dot" style="background: ${domainColor}"></span>
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
