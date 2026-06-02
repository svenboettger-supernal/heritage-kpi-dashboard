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
  const m = /^domain\/(.+)$/.exec(trimmed);
  if (m && DOMAIN_SLUGS.has(m[1])) {
    return { view: "domain", params: { slug: m[1] } };
  }
  return { view: "overview", params: {} };
}
