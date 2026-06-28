# Dataset-Grounded Use Cases

Dataset:

```text
data/SENSIBILISATION_STAFFDFM_MAFY-2026-06-27.xlsx
```

These use cases are grounded only in the available MAFY sensitisation fields. The workbook supports operational monitoring and follow-up prioritisation. It does not contain patient-level facility visits, consultation timestamps, confirmed diagnoses, lab results, or outcomes.

Because of that, the system does not make clinical claims. It helps teams interpret outreach activity, referral signals, operational risk, data quality, and follow-up priorities.

## Summary

| Use case | Question answered |
| --- | --- |
| Outreach load | Where is sensitisation activity concentrated? |
| Referral score | Where are referrals recorded, and where might referral recording need review? |
| Risk intensity | Which areas combine outreach, referral, theme, and barrier signals? |
| Follow-up operations | Which communes or sites should field, M&E, or data teams review next? |
| What-if forecasting | What could happen under a probabilistic planning scenario? |

## 1. Outreach Load

### Goal

Understand which sites, communes, districts, or regions are receiving the most outreach activity and where follow-up workload may increase.

### Fields Used

- region, district, commune, fokontany, site
- activity date, month, period
- location type and CSB/location name
- staff responsible
- total participants, men, women
- start time, end time, duration

### Formula

```text
session_count = count(activity rows)
total_people_reached = sum(total_participants)
unique_fokontany_reached = count_distinct(fokontany)
total_outreach_minutes = sum(duration_minutes)

outreach_load_score =
  0.40 * normalized(total_people_reached)
+ 0.25 * normalized(session_count)
+ 0.20 * normalized(unique_fokontany_reached)
+ 0.15 * normalized(total_outreach_minutes)
```

### Interpretation

High outreach load means many people reached, many sessions, broad fokontany coverage, or longer total activity time. It is a workload and coverage signal, not proof of disease burden.

## 2. Referral Score

### Goal

Estimate which communes or sites may need referral follow-up after awareness activities.

### Fields Used

- referrals made
- participant questions
- observations and difficulty notes
- total participants
- location type, CSB name, commune, district, region

### Formula

```text
referral_rate = referrals_made / total_participants

barrier_signal =
  1 if participant questions or observations mention cost, access, delay, or difficulty
  0 otherwise

referral_score =
  0.45 * normalized(referrals_made)
+ 0.25 * normalized(referral_rate)
+ 0.20 * barrier_signal
+ 0.10 * normalized(total_participants)

referral_gap =
  1 if total_participants is high and referrals_made = 0
  0 otherwise
```

### Interpretation

High referral score means referral activity is visible in the workbook. A referral gap means outreach was high but zero referrals were recorded, so teams may need to review whether referrals were not needed, not made, or not recorded.

## 3. Operational Risk Intensity

### Goal

Classify areas as low, medium, or high operational risk intensity based on outreach, participant profile, referral activity, themes, and barrier signals.

### Fields Used

- region, district, commune, fokontany
- primary MAFY theme
- participant type
- total participants
- referrals made
- participant questions
- observations and difficulty notes
- location type

### Formula

```text
high_risk_group_signal =
  1 if participant type contains high-risk group signal
  0 otherwise

theme_signal =
  1 if theme includes HTA, AVC symptoms, emergency response, smoking, alcohol, dyslipidemia, or sedentary lifestyle
  0 otherwise

barrier_signal =
  1 if questions or observations mention cost, access, delay, or difficulty
  0 otherwise

risk_intensity_score =
  0.30 * normalized(referrals_made)
+ 0.25 * high_risk_group_signal
+ 0.20 * barrier_signal
+ 0.15 * theme_signal
+ 0.10 * normalized(total_participants)
```

### Classification

```text
0.00 - 0.39 = Low
0.40 - 0.69 = Medium
0.70 - 1.00 = High
```

### Interpretation

High operational risk intensity means an area combines referral activity, high-risk participant groups, access/cost barriers, and AVC/HTA-related themes. It is not a clinical severity score.

## 4. Follow-up Operations

### Goal

Create a current queue of communes or sites that field, M&E, or data teams should review.

### Fields Used

- location and administrative fields
- GPS presence
- month and activity date
- participant totals
- referrals made
- participant questions
- observations and difficulty notes
- UID
- start time, end time, duration

### Formula

```text
data_quality_penalty =
  1 if GPS missing
+ 1 if duplicate UID signal exists
+ 1 if duration looks inconsistent
+ 1 if key fields are blank

followup_priority_score =
  0.30 * referral_score
+ 0.25 * risk_intensity_score
+ 0.20 * outreach_load_score
+ 0.15 * referral_gap
+ 0.10 * normalized(data_quality_penalty)
```

### Priority

```text
High   = score >= 0.70
Medium = score >= 0.40 and < 0.70
Low    = score < 0.40
```

### Output

Each action can include:

- priority level,
- commune or site,
- action type,
- reason,
- owner,
- due window,
- evidence,
- blockers.

Example:

```text
Priority: High
Reason: high outreach, referral gap, access/cost questions, and weak GPS data.
Action: verify referral recording and ask field staff whether follow-up is needed.
```

## 5. What-if Forecasting Layer

### Goal

Support planning conversations with clearly labelled probabilistic scenarios. This is the Monte Carlo feature in the What-if page.

### Scenarios

| Scenario | Planning question |
| --- | --- |
| Follow-up delay | What may happen if high-priority follow-up areas are not acted on? |
| Referral backlog | What may happen if referral coordination demand grows faster than teams can close loops? |
| Data quality drift | What may happen if unresolved data issues continue weakening planning confidence? |

### Method

The forecast agents use historical workbook patterns, current area scores, scenario assumptions, drift, volatility, and seeded Monte Carlo iterations to produce:

- P10, P50, and P90 trajectories,
- projected movement by area,
- risk-pressure race frames,
- scenario rationale.

### Interpretation

What-if forecasting is not a real-world prediction guarantee. It is a planning aid that helps teams discuss possible pressure if a scenario is not prioritized.
