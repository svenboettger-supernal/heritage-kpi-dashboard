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
