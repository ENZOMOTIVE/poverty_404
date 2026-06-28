# MAFY Pitch

## One-liner

MAFY is an AI-supported health operations console that turns anonymized outreach workbook data into follow-up actions, data confidence checks, scenario planning, and shareable reports for health teams working in Madagascar.

## Problem

Health organisations often collect valuable outreach and sensitisation data, but the data usually lives in spreadsheet exports. Field teams, healthcare specialists, programme leads, and M&E teams need to understand where attention is needed quickly, without manually scanning rows or making unsupported clinical assumptions.

The current gap is operational, not just analytical:

- outreach data is hard to turn into clear follow-up priorities,
- referral gaps can be missed or reviewed too late,
- data quality problems weaken reporting confidence,
- programme teams need planning support before pressure builds,
- sensitive data must be minimized before AI use.

## Solution

MAFY converts an anonymized MAFY sensitisation workbook into a multi-page health operations workspace. It helps teams review outreach coverage, referral signals, operational risk, data quality, follow-up actions, what-if scenarios, and downloadable reports.

The product is designed for action:

- field coordinators see which communes or sites may need review,
- healthcare specialists inspect referral and barrier signals,
- M&E teams validate data confidence before reporting,
- programme leads compare pressure across sites,
- partner organisations receive clear evidence packages.

## Agentic Infrastructure

MAFY uses a coordinator-led multi-agent backend. The `CoordinatorAgent` routes work to specialist agents that each own a focused operational question.

Key agents:

- `DataQualityAgent`: checks missing GPS, duplicate identifiers, and reliability signals.
- `OutreachAgent`: measures outreach load and coverage.
- `ReferralAgent`: reviews referral activity and possible referral gaps.
- `RiskAgent`: classifies operational risk signals from workbook evidence.
- `FollowUpOperationsAgent`: creates field-ready follow-up actions.
- `WhatIfForecastAgent`: runs Monte Carlo scenario planning.
- `ReportAgent`: packages summaries, findings, charts, and actions into downloadable reports.

The AI layer is intentionally bounded. Deterministic scoring remains grounded in the workbook. OpenAI assistance is used for narrative support from anonymized aggregate payloads when a valid key is configured.

## What Makes It Different

MAFY is not a dashboard that only looks good. It is a workflow tool built around real operations:

- evidence-grounded actions instead of generic recommendations,
- anonymization before LLM-facing payloads,
- explainable rationale for follow-up decisions,
- probabilistic scenario planning clearly labelled as what-if,
- downloadable reports that include charts, evidence, and actions,
- responsible AI boundaries that avoid diagnosis or disease-burden claims.

## Demo Flow

1. Start on the Madagascar-focused landing screen.
2. Open the MAFY Health Operations Console.
3. Review overview metrics: participants, referrals, sites, data issues.
4. Inspect outreach, referrals, risk, and quality views.
5. Open Operations to see current follow-up actions and rationale.
6. Open What-if to run Monte Carlo scenario planning.
7. Generate a report and download HTML, JSON, or CSV outputs.

## Responsible AI Position

MAFY is an M&E and operations assistant, not a clinical decision system.

It does not:

- diagnose patients,
- infer confirmed disease burden,
- replace local field review,
- expose raw identifiers to the LLM,
- claim that Monte Carlo outcomes will happen.

It does:

- support prioritisation,
- explain operational signals,
- check data confidence,
- help teams plan,
- create report-ready evidence packages.

## Current Build

- Frontend: React, Vite, Tailwind CSS, Recharts, Three.js.
- Backend: Bun service with coordinator and specialist agents.
- Dataset: anonymized MAFY sensitisation workbook.
- Reports: HTML, JSON, and CSV exports.
- Forecasting: seeded Monte Carlo what-if planning.
- Documentation: agent architecture, operations overview, MutaAgent submission notes.

## Links

- Repository: https://github.com/ENZOMOTIVE/poverty_404
- Agent implementation: https://github.com/ENZOMOTIVE/poverty_404/tree/main/backend/src/agents
- Agentic infrastructure docs: https://github.com/ENZOMOTIVE/poverty_404/blob/main/docs/AGENTIC_INFRASTRUCTURE.md
- Operations workflow docs: https://github.com/ENZOMOTIVE/poverty_404/blob/main/docs/OPERATIONS_OVERVIEW.md
- MutaAgent submission note: https://github.com/ENZOMOTIVE/poverty_404/blob/main/MUTAGENT_SUBMISSION.md
