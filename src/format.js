// src/format.js
// Pure formatters. No DOM, no data dependency.

export function pct(value) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 100)}%`;
}

export function seconds(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function delta(current, prior) {
  const pts = Math.round((current - prior) * 100);
  if (pts === 0) return "0 pts";
  const sign = pts > 0 ? "+" : "−";
  return `${sign}${Math.abs(pts)} pts`;
}

// ISO week → "Mon DD" using the Monday of that week.
export function weekLabel(isoWeek) {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) return isoWeek;
  const year = Number(match[1]);
  const week = Number(match[2]);

  // ISO 8601: week 1 is the week containing the first Thursday of the year.
  // The Monday of that week may be in the previous year.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = (jan4.getUTCDay() + 6) % 7; // 0 = Monday
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - dayOfWeek);
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[target.getUTCMonth()]} ${target.getUTCDate()}`;
}
