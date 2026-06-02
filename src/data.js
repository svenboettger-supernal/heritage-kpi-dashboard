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

// Helper: per-stage total seconds (AI + Reviewer) for a domain. Stage 1 returns null when N/A.
export function stageTotalSeconds(domain, stageKey) {
  const s = domain.timing[stageKey];
  if (!s) return null;
  return s.aiSeconds + s.reviewerSeconds;
}

// Rollup mean of per-stage total seconds across the domains that apply to that stage.
function rollupStageTotal(rollupStage) {
  return rollupStage.aiSeconds + rollupStage.reviewerSeconds;
}

// Returns an array of { domainSlug, stage, value, mean, deltaRatio }
// flagging any per-domain stage-total time that exceeds (rollup mean × 1.30).
// The two stages are additive phases — AI processing then human review — not a speed-up.
export function getOutliers() {
  const r = root();
  const s1Mean = rollupStageTotal(r.rollups.timing.stage1);
  const s2Mean = rollupStageTotal(r.rollups.timing.stage2);
  const flags = [];
  for (const d of r.domains) {
    const s1Total = stageTotalSeconds(d, "stage1");
    const s2Total = stageTotalSeconds(d, "stage2");
    if (s1Total !== null && s1Total > s1Mean * 1.30) {
      flags.push({
        domainSlug: d.slug, stage: "stage1",
        value: s1Total, mean: s1Mean,
        deltaRatio: s1Total / s1Mean - 1,
      });
    }
    if (s2Total !== null && s2Total > s2Mean * 1.30) {
      flags.push({
        domainSlug: d.slug, stage: "stage2",
        value: s2Total, mean: s2Mean,
        deltaRatio: s2Total / s2Mean - 1,
      });
    }
  }
  return flags;
}
