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
