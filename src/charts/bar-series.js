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
        `<span class="bar-fill" style="width: ${pctWidth.toFixed(1).replace(/\.0$/, "")}%; background: ${tint}; border-color: ${stroke};"></span>` +
      `</span>` +
      `<span class="bar-value">${escapeHtml(displayValue)}</span>` +
      secondary +
      `</div>`
    );
  }).join("");

  return `<div class="bar-series">${items}</div>`;
}
