# Doctors for Madagascar MAFY Monitoring Console

A practical monitoring and evaluation dashboard for turning MAFY sensitisation data into clear outreach, referral, risk, and follow-up insights.

This project is built around the Doctors for Madagascar MAFY outreach dataset:

```text
data/SENSIBILISATION_STAFFDFM_MAFY-2026-06-27.xlsx
```

The application is a React/Vite frontend that presents four data use cases defined in [`FOUR_DATA_USECASES.md`](FOUR_DATA_USECASES.md). These use cases help project and M&E teams understand where outreach is happening, where referrals may require attention, which areas show higher operational risk signals, and which facilities or communes should be prioritised for follow-up.

## Contents

- [Project Overview](#project-overview)
- [Dataset Scope](#dataset-scope)
- [Core Use Cases](#core-use-cases)
- [Application Views](#application-views)
- [Data Summary](#data-summary)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Method Notes](#method-notes)

## Project Overview

Doctors for Madagascar collects monitoring and evaluation data that can support project steering, reporting, quality improvement, and internal learning. However, raw data often requires time-consuming review before it becomes useful for decision-making.

This console helps transform the MAFY sensitisation workbook into practical monitoring signals:

| Area | Purpose |
| --- | --- |
| Outreach | Understand where field activity is concentrated |
| Referrals | Identify referral activity and possible referral gaps |
| Risk | Classify operational risk intensity by area |
| Follow-up | Prioritise facilities, communes, or activity records for review |
| Quality | Surface data issues that may affect interpretation |

## Dataset Scope

The workbook contains outreach and sensitisation activity records, including location fields, activity timing, participants reached, referral counts, participant questions, observations, themes, and data quality signals.

It does not contain:

- Patient-level facility visits
- Waiting-room or consultation timestamps
- Triage severity
- Staff availability
- Confirmed diagnoses
- Lab results
- Patient outcomes

Because of this, the project focuses on monitoring and follow-up prioritisation. It does not make clinical diagnoses or prove disease burden.

## Core Use Cases

### 1. Outreach Load Per Facility / Region

Measures where outreach activity is concentrated across facilities, communes, districts, regions, fokontany, and months.

| Signal | Description |
| --- | --- |
| Session count | Number of recorded outreach activities |
| People reached | Total participants reached |
| Coverage | Number of unique fokontany reached |
| Outreach time | Total activity duration |
| Average session size | Participants reached per session |

The outreach load score highlights where field activity is strongest and where follow-up demand may increase.

### 2. Referral Score

Estimates which facilities or communes may receive more people after awareness activities.

| Signal | Description |
| --- | --- |
| Referrals made | Number of people referred |
| Referral rate | Referrals relative to participants reached |
| Barrier signal | Cost, access, delay, or difficulty mentioned in questions or observations |
| Participant volume | Total people reached |

The referral score highlights strong referral activity. It also supports referral gap detection when high outreach activity produces zero recorded referrals.

### 3. Risk Intensity Classification By Area

Classifies areas as low, medium, or high operational risk intensity based on outreach, referral, participant, theme, and barrier signals.

| Signal | Description |
| --- | --- |
| Referral activity | Referrals recorded in the area |
| High-risk group signal | Participant type indicates a higher-risk group |
| Theme signal | AVC, HTA, emergency response, smoking, alcohol, dyslipidemia, or sedentary lifestyle themes |
| Barrier signal | Cost, access, delay, or difficulty mentioned |
| Participant volume | Total people reached |

This is an operational classification, not a clinical severity score.

### 4. Follow-Up Queueing Model

Creates a priority queue for facilities, communes, or activity records that may require review.

| Component | Weight |
| --- | ---: |
| Referral score | 30% |
| Risk intensity score | 25% |
| Outreach load score | 20% |
| Referral gap | 15% |
| Data quality penalty | 10% |

Priority labels:

| Score Range | Priority |
| --- | --- |
| `>= 0.70` | High |
| `>= 0.40` and `< 0.70` | Medium |
| `< 0.40` | Low |

Each queue item can include the priority level, facility or commune, reason for priority, supporting data fields, and a recommended field action.

## Application Views

The frontend includes the following screens:

| View | Description |
| --- | --- |
| Overview | High-level project and dataset summary |
| Outreach | Outreach load and geographic activity patterns |
| Referrals | Referral score, referral rate, and referral gaps |
| Risk | Operational risk intensity by site or area |
| Simulation | Scenario-style exploration of monitoring scores |
| Queue | Prioritised follow-up actions |
| Quality | Missing GPS, duplicate UID rows, and other quality signals |
| Scores | Score components and weighting logic |

## Data Summary

The static frontend fixtures currently summarise the dataset as follows:

| Metric | Value |
| --- | ---: |
| Activity rows | 71 |
| Columns | 90 |
| Participants | 2,891 |
| Men | 1,062 |
| Women | 1,829 |
| Referrals | 63 |
| Regions | 2 |
| Sites | 3 |
| Months | 6 |
| Rows missing GPS | 42 |
| Duplicate UID rows | 30 |

## Project Structure

```text
data/                  Source MAFY sensitisation workbook
docs/                  Supporting project documents
frontend/              React/Vite application
FOUR_DATA_USECASES.md  Detailed use-case definitions, fields, and formulas
README.md              Project overview
```

## Getting Started

Run the frontend from the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Additional commands:

```bash
npm run build
npm run lint
npm run preview
```

## Method Notes

The full formulas, dataset fields, and score definitions are documented in [`FOUR_DATA_USECASES.md`](FOUR_DATA_USECASES.md).

The current frontend uses static derived fixtures in:

```text
frontend/src/data/mafyData.ts
```

Scores should be interpreted as monitoring and follow-up prioritisation signals. They are not clinical diagnoses, patient-level triage scores, or proof of disease burden.
