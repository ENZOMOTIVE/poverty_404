# DfM MAFY Agent Backend

Bun backend for real dataset-driven multi-agent operations.

## Commands

```bash
bun install
bun run dev
bun run typecheck
```

## API

```text
GET  /health
GET  /api/dataset/summary
GET  /api/dataset/anonymization-report
GET  /api/dataset/anonymized
GET  /api/agents
POST /api/agents/run
POST /api/simulations/follow-up
```

## Agent Operations

`POST /api/agents/run`

```json
{
  "operation": "full-review",
  "scenario": {
    "unprioritizedAreaId": "toliary-i",
    "months": 6
  },
  "language": "en"
}
```

Supported operations:

```text
full-review
data-quality
outreach-load
referral-score
risk-intensity
follow-up-simulation
report
```

The backend works without an LLM key by running deterministic specialist agents. Add `OPENAI_API_KEY` to enable the report agent to produce AI-written recommendations from the deterministic findings.

## Anonymization

Before any LLM call, the report agent builds an LLM-safe payload that removes or pseudonymizes direct identifiers, GPS, exact timestamps, staff names, usernames, form links, raw observations, and raw participant questions.

To generate an anonymized workbook for upload or external testing:

```bash
bun run anonymize
```

Generated files are written under `../data/anonymized/` and ignored by git.
