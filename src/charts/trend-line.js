// src/charts/trend-line.js
// Overlaid line chart. Pure SVG string.
// Defaults to "percent" mode (y-axis 0..1, labels rounded to *100).
// Pass yMax + yLabelFormat for arbitrary scales (e.g. seconds).

import { weekLabel, seconds as fmtSeconds } from "../format.js";

export function trendLine({
  weeks,
  series,
  width = 720,
  height = 220,
  yMax,                  // optional — defaults to 1 (percent mode)
  yLabelFormat,          // optional — defaults to *100 integer (percent mode)
}) {
  const padLeft = 44, padRight = 16, padTop = 16, padBottom = 32;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const effYMax = yMax ?? 1;
  const fmt = yLabelFormat ?? (v => String(Math.round(v * 100)));

  // y-axis ticks at 0, 25%, 50%, 75%, 100% of effYMax
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * effYMax);
  const yPos = v => padTop + innerH - (v / effYMax) * innerH;
  const xPos = i => padLeft + (i / (weeks.length - 1)) * innerW;

  // y-axis tick lines + labels
  const ticks = yTicks.map(v => {
    const y = yPos(v);
    const label = fmt(v);
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

// Convenience: format seconds for y-axis labels (e.g. "2m" or "30s").
export function secondsAxisFormatter(v) {
  if (v >= 60) return `${Math.round(v / 60)}m`;
  return `${Math.round(v)}s`;
}
