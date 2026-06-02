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
      ${rollupCard("Stage 1", "Quality of the inputs",  r.stage1.score, r.stage1.trend, delta(r.stage1.score, s1Eight))}
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
