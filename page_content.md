# MAFY Slide Content

## Slide 1: MAFY

**Title:** MAFY Health Operations Console

**Subtitle:** Agentic AI for outreach review, referral follow-up, and health operations planning in Madagascar.

**Key message:** MAFY turns anonymized programme workbook data into decisions health teams can review and act on.

**Visual direction:** Dark map/globe view of Madagascar with neon green operational signal points.

**Speaker note:** MAFY is built for field, healthcare, programme, and M&E teams who need to move from spreadsheet rows to practical follow-up decisions.

---

## Slide 2: The Problem

**Title:** Health outreach data is collected, but action is delayed

**Bullets:**

- Outreach and sensitisation data often lives in spreadsheet exports.
- Referral signals and gaps are hard to review manually.
- Data quality issues weaken reporting confidence.
- Programme teams need planning support before pressure builds.
- Sensitive data must be minimized before AI use.

**Visual direction:** Spreadsheet rows transforming into unresolved operational questions.

**Speaker note:** The challenge is not only analytics. It is turning monitoring data into timely, responsible operational review.

---

## Slide 3: The Solution

**Title:** MAFY converts workbook evidence into health operations workflows

**Bullets:**

- Shows outreach coverage and workload by site and area.
- Reviews referral activity and possible referral gaps.
- Flags operational risk and data confidence issues.
- Creates assignable follow-up actions with rationale.
- Generates downloadable reports for review and sharing.

**Visual direction:** Multi-panel console view with charts, action queue, and report card.

**Speaker note:** MAFY is designed as a working console, not a cosmetic dashboard. Every major view is tied to a real operational task.

---

## Slide 4: Who It Supports

**Title:** Built for the teams who act on the data

**Bullets:**

- Field coordinators: where to review first.
- Healthcare specialists: referral and barrier signals.
- M&E teams: data confidence before reporting.
- Programme leads: pressure and priority across sites.
- Partner organisations: shareable evidence packages.

**Visual direction:** Five user role cards connected to one MAFY workspace.

**Speaker note:** MAFY keeps the language practical for health organisations. It provides a solution workflow, not just technical tooling.

---

## Slide 5: Agentic Infrastructure

**Title:** Coordinator-led multi-agent operations

**Bullets:**

- `CoordinatorAgent` routes each workflow.
- Data quality, outreach, referral, and risk agents create evidence.
- Follow-up agents prepare actions, owners, blockers, and rationale.
- What-if agents run Monte Carlo scenario planning.
- Report agent packages summaries, charts, actions, and exports.

**Visual direction:** Simple agent graph: workbook to coordinator to specialist agents to console outputs.

**Speaker note:** The backend is agentic in structure. Each agent owns a focused question, and the coordinator assembles the workflow output.

---

## Slide 6: What-if Planning

**Title:** Scenario planning without pretending to predict reality

**Bullets:**

- Uses historical workbook patterns and current area scores.
- Runs seeded Monte Carlo simulations for planning scenarios.
- Shows P10, P50, and P90 forecast trajectories.
- Animates area movement over the selected horizon.
- Labels output clearly as probabilistic planning support.

**Visual direction:** Animated line trajectories and area ranking movement, styled like a scientific operations view.

**Speaker note:** The what-if layer helps teams ask what may happen if follow-up is delayed or referral demand grows. It is not a clinical prediction.

---

## Slide 7: Responsible AI

**Title:** Useful AI with clear health boundaries

**Bullets:**

- No diagnosis or patient-level triage.
- No confirmed disease-burden claims.
- No raw identifiers in LLM-facing payloads.
- Deterministic scoring remains grounded in workbook evidence.
- AI narrative falls back to dataset rules if model access fails.

**Visual direction:** Shield/checklist beside anonymized data flow.

**Speaker note:** MAFY is intentionally scoped as an M&E and operations assistant. It supports human review rather than replacing local judgement.

---

## Slide 8: Current Build and Ask

**Title:** Built, working, and ready for review

**Bullets:**

- Multi-page React and Tailwind frontend.
- Bun backend with coordinator and specialist agents.
- Dataset-backed actions, forecasts, and reports.
- Documentation for agent infrastructure and operations workflow.
- Repository: https://github.com/ENZOMOTIVE/poverty_404

**Visual direction:** Final product montage: landing screen, operations queue, forecast chart, report export.

**Speaker note:** The current build is ready to demonstrate as a health operations workflow. The next step is deployment, partner feedback, and validating the workflow with field users.
