# Operations Workflow Overview

The MAFY Data Console treats the anonymized sensitisation workbook as the source of truth for operational monitoring. The frontend reads live backend endpoints when available and only falls back to cached workbook fixtures for summary views when the backend cannot be reached.

## What The Console Does

| Area | Purpose |
| --- | --- |
| Overview | Shows current reach, referral rate, data issues, monthly activity, and priority scores. |
| Operations | Converts workbook evidence into assignable follow-up actions. |
| What-if | Runs Monte Carlo scenario forecasts for planning discussions. |
| Reports | Generates downloadable HTML, JSON, and CSV reports. |
| Quality | Highlights data issues that can weaken interpretation. |

## Backend Operations

| Endpoint | Workflow |
| --- | --- |
| `GET /api/dataset/summary` | Loads workbook summary, top sites, top communes, and monthly metrics. |
| `POST /api/operations/follow-up` | Runs the follow-up operations agent and returns current actions. |
| `POST /api/forecast/what-if` | Runs Monte Carlo what-if agents for probabilistic scenario forecasting. |
| `POST /api/reports/detailed` | Runs the report workflow and returns the payload used by downloads. |

## AI Usage

The backend uses deterministic dataset scoring for current operational actions. The What-if page is intentionally different: it uses seeded Monte Carlo simulation from historical workbook patterns to estimate probabilistic scenario movement.

When an OpenAI API key is configured, LLM assistance is used for narrative rationale and report language from anonymized aggregate payloads. The LLM does not receive raw identifiers or raw free-text workbook fields.

## Entry Screen

The app includes a one-time Three.js landing screen with a globe oriented toward Madagascar. Pressing the start button stores a local browser flag so later visits open directly to the console.

## Downloads

The Reports page creates local downloads after the backend returns a completed report:

- HTML includes report text, tables, and SVG charts.
- JSON contains the full report payload.
- CSV contains exportable tabular data for review.

## Local URLs

```text
Frontend: http://127.0.0.1:5173
Backend:  http://127.0.0.1:8787
```

## Related Docs

- [`AGENTIC_INFRASTRUCTURE.md`](AGENTIC_INFRASTRUCTURE.md)
- [`../README.md`](../README.md)
- [`../FOUR_DATA_USECASES.md`](../FOUR_DATA_USECASES.md)
