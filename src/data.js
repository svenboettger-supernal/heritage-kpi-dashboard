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
// for any domain whose reviewer time exceeds (mean × 1.30).
export function getOutliers() {
  const r = root();
  const { reviewerSecondsPerDoc } = r.rollups.timing;
  const flags = [];
  for (const d of r.domains) {
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
