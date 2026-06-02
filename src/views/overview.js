// src/views/overview.js
import { pct, seconds, delta } from "../format.js";
import { sparkline } from "../charts/sparkline.js";
import { trendLine, secondsAxisFormatter } from "../charts/trend-line.js";
import { barSeries } from "../charts/bar-series.js";
import { getRollups, getDomains, getReviewers, getDocTypes, getWeeks, getOutliers } from "../data.js";

function vizVar(index) { return `var(--viz-${index})`; }

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

function trendArrow(values, opts = { higherIsBetter: true }) {
  const a = values[values.length - 1];
  const b = values[values.length - 9] ?? values[0];
  const eps = (Math.max(...values) - Math.min(...values)) * 0.02 || 0.005;
  if (a - b > eps)  return "↑";
  if (a - b < -eps) return "↓";
  return "→";
}

// Stage-timing card: AI processing + Reviewer time + Total, sparklines on AI and Reviewer trends.
function stageTimingCard(label, stage) {
  const total = stage.aiSeconds + stage.reviewerSeconds;
  return `
    <div class="timing-card">
      <div class="label-title">${label}</div>
      <div class="timing-grid">
        <div class="stat">
          <div class="label">AI processing</div>
          <div class="num">${seconds(stage.aiSeconds)}</div>
          <div class="spark">${sparkline(stage.aiSecondsTrend, { width: 100, height: 22 })}</div>
        </div>
        <div class="stat">
          <div class="label">Reviewer time</div>
          <div class="num">${seconds(stage.reviewerSeconds)}</div>
          <div class="spark">${sparkline(stage.reviewerSecondsTrend, { width: 100, height: 22 })}</div>
        </div>
      </div>
      <div class="timing-total"><span class="k">Stage total</span><span class="v">${seconds(total)}</span></div>
    </div>`;
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

  const outlierStages = new Set((outliersByDomain[d.slug] || []).map(o => o.stage));
  const s1Time = d.timing.stage1;
  const s2Time = d.timing.stage2;
  const s1Total = s1Time ? s1Time.aiSeconds + s1Time.reviewerSeconds : null;
  const s2Total = s2Time.aiSeconds + s2Time.reviewerSeconds;
  const s1TimeOutlier = outlierStages.has("stage1");
  const s2TimeOutlier = outlierStages.has("stage2");
  const s1TimeChip = s1TimeOutlier ? ` <span class="chip-warn">⚠</span>` : "";
  const s2TimeChip = s2TimeOutlier ? ` <span class="chip-warn">⚠</span>` : "";

  const s1TimeCell = s1Total === null
    ? `<span style="color: var(--fg-muted)">—</span>`
    : `${seconds(s1Total).replace(/(\d+)m \d+s/, "$1m")}${s1TimeChip}`;
  const s2TimeCell = `${seconds(s2Total).replace(/(\d+)m \d+s/, "$1m")}${s2TimeChip}`;

  return `
    <tr tabindex="0" role="link" aria-label="Open ${d.name} details" onclick="window.location.hash = '#/domain/${d.slug}'" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.hash = '#/domain/${d.slug}'; }">
      <td>
        <span class="domain-cell">
          <span class="domain-dot" style="${dotStyle}"></span>
          ${d.name}
        </span>
      </td>
      <td>${s1cell}</td>
      <td>${s2cell}</td>
      <td class="timing-cell ${s1TimeOutlier ? "outlier" : ""}">${s1TimeCell}</td>
      <td class="timing-cell ${s2TimeOutlier ? "outlier" : ""}">${s2TimeCell}</td>
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
    <h5 class="section-title section-title-first">Accuracy</h5>
    <section class="hero-rollups">
      ${rollupCard("Stage 1", "Answer accuracy — quality of the inputs",  r.stage1.score, r.stage1.trend, delta(r.stage1.score, s1Eight))}
      ${rollupCard("Stage 2", "Mapping accuracy — the end-to-end number", r.stage2.score, r.stage2.trend, delta(r.stage2.score, s2Eight))}
    </section>

    <h5 class="section-title">Accuracy trend · last 12 weeks</h5>
    <div class="card trend-card">
      ${trendLine({
        weeks,
        series: [
          { values: r.stage1.trend, stroke: "hsl(33 10% 34%)", label: "Stage 1 · Answer" },
          { values: r.stage2.trend, stroke: "hsl(33 4% 6%)",   label: "Stage 2 · Mapping" },
        ],
        width: 1136, height: 240,
      })}
    </div>

    <h5 class="section-title">Timing</h5>
    <p class="section-caption">AI processing and reviewer time are additive phases of the pipeline. Both should fall: AI gets faster; reviewer time shrinks as accuracy and trust grow.</p>
    <section class="timing-cards">
      ${stageTimingCard("Stage 1 · Answer", r.timing.stage1)}
      ${stageTimingCard("Stage 2 · Mapping", r.timing.stage2)}
    </section>

    <h5 class="section-title">Timing trend · last 12 weeks</h5>
    <div class="two-col timing-trend-grid">
      <div class="card trend-card">
        <div class="trend-card-title">Stage 1 · Answer</div>
        ${trendLine({
          weeks,
          series: [
            { values: r.timing.stage1.aiSecondsTrend,       stroke: "hsl(33 10% 34%)", label: "AI processing" },
            { values: r.timing.stage1.reviewerSecondsTrend, stroke: "hsl(33 4% 6%)",   label: "Reviewer time" },
          ],
          width: 568, height: 200,
          yMax: Math.max(...r.timing.stage1.reviewerSecondsTrend) * 1.1,
          yLabelFormat: secondsAxisFormatter,
        })}
      </div>
      <div class="card trend-card">
        <div class="trend-card-title">Stage 2 · Mapping</div>
        ${trendLine({
          weeks,
          series: [
            { values: r.timing.stage2.aiSecondsTrend,       stroke: "hsl(33 10% 34%)", label: "AI processing" },
            { values: r.timing.stage2.reviewerSecondsTrend, stroke: "hsl(33 4% 6%)",   label: "Reviewer time" },
          ],
          width: 568, height: 200,
          yMax: Math.max(...r.timing.stage2.reviewerSecondsTrend) * 1.1,
          yLabelFormat: secondsAxisFormatter,
        })}
      </div>
    </div>

    <h5 class="section-title">Per domain</h5>
    <table class="matrix">
      <thead>
        <tr class="matrix-group">
          <th></th>
          <th colspan="2" class="group-accuracy">Accuracy</th>
          <th colspan="2" class="group-timing">Timing</th>
        </tr>
        <tr>
          <th>Domain</th>
          <th>Stage 1 · Answer</th>
          <th>Stage 2 · Mapping</th>
          <th>Stage 1 · Total</th>
          <th>Stage 2 · Total</th>
        </tr>
      </thead>
      <tbody>
        ${domains.map(d => matrixRow(d, outliersByDomain)).join("")}
      </tbody>
    </table>

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
