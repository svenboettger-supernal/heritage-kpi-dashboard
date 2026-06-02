// src/views/about.js

export function renderAbout() {
  return `
    <a href="#/" class="back-link">← Overview</a>

    <section class="about-section">
      <h2>Framework legend</h2>
      <p>Two stages, watched over time, decomposable by domain, document type, reviewer, and question or placement. One number per stage, plus a per-stage drill-down. The same review every Heritage attorney already does — captured as data.</p>

      <h3 style="margin-top: 40px;">Stage 1 · Answer accuracy</h3>
      <p>For each eval question on a document, the reviewer either accepts the AI answer (closeness = 1.00) or edits it. Edited answers receive an LLM-judged closeness score in [0, 1]. The Stage 1 figure is the mean across questions.</p>
      <div class="formula">Stage 1 score = Σ (per-question closeness) ÷ N<sub>questions</sub></div>

      <h3>Stage 2 · Mapping accuracy</h3>
      <p>The AI places each validated answer into the domain's artifact — a row in a table or a node in a diagram. The reviewer doesn't grade anything; they just edit the artifact. An LLM judge compares the original AI version against the final user-adjusted version across all attributes and assigns a closeness score in [0, 1].</p>
      <div class="formula">Stage 2 score = Σ (per-placement closeness) ÷ N<sub>placements</sub></div>

      <h3>What gets logged</h3>
      <p>Five fields per record, plus document-level metadata.</p>
      <ul>
        <li><strong>Original</strong> — the AI version, before any edits.</li>
        <li><strong>Final</strong> — the user-validated version. Equal to the original if accepted unchanged.</li>
        <li><strong>Closeness</strong> — LLM-judged score in [0, 1]. The KPI itself.</li>
        <li><strong>Edit category</strong> — formatting, clarification, substantive correction, new information, or removal.</li>
        <li><strong>Rationale</strong> — short free-text note from the reviewer on why they edited.</li>
      </ul>
      <p>Per record: document type, domain, document ID, reviewer, timestamp. Stage 1 records are keyed by question; Stage 2 records are keyed by placement.</p>

      <h3>Weighting</h3>
      <ul>
        <li><strong>Across domains:</strong> equal by default (Stage 1 = sum ÷ 4, Stage 2 = sum ÷ 5). Adjustable.</li>
        <li><strong>Within a domain (Stage 1):</strong> every question weighted 1/N. Fixed.</li>
        <li><strong>Within a placement (Stage 2):</strong> every attribute equal by default. Open for discussion per domain — text/position/parent are typically substantive; color is less so.</li>
      </ul>

      <h3>Domains</h3>
      <ul>
        <li><strong>Insurance summary</strong>, <strong>Flow Diagram</strong>, <strong>Asset Sheet</strong>, <strong>Data Sheet</strong> — both stages.</li>
        <li><strong>Estate Distribution Chart</strong> — Stage 2 only; consumes validated answers from the other four.</li>
      </ul>

      <p style="color: var(--fg-muted); margin-top: 48px;">v1 demo · numbers are illustrative, anchored to current operational range from Keith's snapshot, the Kyle Woll review, and the Wool / Blau flow diagrams.</p>
    </section>
  `;
}
