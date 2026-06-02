# Heritage Accuracy KPI Dashboard

Static HTML demo of the [Heritage Accuracy KPI Framework](docs/superpowers/specs/2026-06-02-heritage-accuracy-kpi-dashboard-design.md) — two-stage accuracy scoring (answer + mapping) across five estate-planning artifact domains, with trends, timing, and drill-downs.

## View it

Open `index.html` in a modern browser. No build step, no server required.

For a clean URL during screen-share:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Numbers

All values in `seed-data.js` are illustrative — anchored to the realistic mid-state range described in the spec. **Not live Heritage data.**

## Run the tests

```bash
node --test test/
```

Pure logic (format helpers, data accessors, router, chart string generators) is covered. Visual layout is verified by eye in the browser.

## Files

- `index.html` · shell
- `styles.css` · brand tokens + components
- `app.js` · router entry
- `seed-data.js` · deterministic numbers
- `src/` · modules (data, format, router, charts, views)
- `test/` · `node:test` suites
- `docs/superpowers/specs/` · design spec
- `docs/superpowers/plans/` · this plan
