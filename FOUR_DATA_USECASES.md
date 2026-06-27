# Four Ideas Grounded In The MAFY Sensitisation Dataset

Dataset:

`data/SENSIBILISATION_STAFFDFM_MAFY-2026-06-27.xlsx`

These four ideas use only the available outreach/sensitisation fields. The dataset does not contain patient-level facility visits, so facility queueing is handled as a **follow-up queue**, not a real waiting-room queue.

## 1. Outreach Load Per Facility / Region

### Goal

Use the data to understand which facilities, communes, districts, or regions are receiving the most outreach activity and where awareness activities may create future follow-up demand.

### Dataset Fields Used

- `form.identifiant1.region`
- `form.identifiant1.district`
- `form.identifiant1.commune`
- `form.identifiant1.fokontany`
- `SITE`
- `Commune`
- `form.identifiant1.coordonne_gps`
- `form.question15.date_activity`
- `form.question15.start_time`
- `form.question15.end_time`
- `MOIS`
- `PERIODE`
- `form.activite_de_sensibilisation.location_type`
- `form.activite_de_sensibilisation.location_name_csb`
- `form.activite_de_sensibilisation.location_name`
- `form.question15.staff_responsible`
- `form.participant.total_participants`
- `form.participant.men_count`
- `form.participant.women_count`

### Formula

Group by facility, commune, district, region, or month.

```text
session_count = count(activity rows)

total_people_reached = sum(total_participants)

unique_fokontany_reached = count_distinct(fokontany)

duration_minutes = end_time - start_time

total_outreach_minutes = sum(duration_minutes)

average_session_size = total_people_reached / session_count
```

Outreach load score:

```text
outreach_load_score =
  0.40 * normalized(total_people_reached)
+ 0.25 * normalized(session_count)
+ 0.20 * normalized(unique_fokontany_reached)
+ 0.15 * normalized(total_outreach_minutes)
```

### Output

```text
High outreach load = many people reached, many sessions, broad fokontany coverage, and long total activity time.
```

This does not prove disease burden. It shows where field activity is concentrated and where follow-up demand may increase.

## 2. Referral Score

### Goal

Estimate which facility or commune may receive more people after awareness activities.

### Dataset Fields Used

- `form.question_commune_et_personnes_referees_aux_centre_de_sante.referrals_made`
- `form.question_commune_et_personnes_referees_aux_centre_de_sante.participant_questions_question`
- `form.question_commune_et_personnes_referees_aux_centre_de_sante.participant_questions`
- `form.participant.total_participants`
- `form.activite_de_sensibilisation.location_name_csb`
- `form.activite_de_sensibilisation.location_type`
- `form.identifiant1.commune`
- `form.identifiant1.district`
- `form.identifiant1.region`
- `form.observation.dfis`
- `form.observation.observation`

### Formula

```text
referral_rate = referrals_made / total_participants
```

Barrier signal:

```text
barrier_signal =
  1 if participant_questions contains cost/access concern
  1 if observation/dfis mentions cost, access, delay, or difficulty
  0 otherwise
```

Referral score:

```text
referral_score =
  0.45 * normalized(referrals_made)
+ 0.25 * normalized(referral_rate)
+ 0.20 * barrier_signal
+ 0.10 * normalized(total_participants)
```

Referral gap:

```text
referral_gap =
  1 if total_participants is high AND referrals_made = 0
  0 otherwise
```

### Output

```text
High referral score = this facility/commune may receive more people after awareness.

Referral gap = outreach was high but referrals were zero, so referral recording or referral behavior should be checked.
```

## 3. Risk Intensity Classification By Area

### Goal

Classify each area as low, medium, or high operational risk intensity based on outreach, participant profile, referral activity, and barrier signals.

This is not clinical severity because the dataset does not contain confirmed diagnoses, lab results, or patient outcomes.

### Dataset Fields Used

- `form.identifiant1.region`
- `form.identifiant1.district`
- `form.identifiant1.commune`
- `form.identifiant1.fokontany`
- `form.question16.primary_theme_mafy`
- `form.participant.type_de_participant`
- `form.participant.total_participants`
- `form.question_commune_et_personnes_referees_aux_centre_de_sante.referrals_made`
- `form.question_commune_et_personnes_referees_aux_centre_de_sante.participant_questions`
- `form.observation.dfis`
- `form.observation.succs`
- `form.activite_de_sensibilisation.location_type`

### Formula

High-risk participant signal:

```text
high_risk_group_signal =
  1 if type_de_participant contains groupe__risque_avc
  0 otherwise
```

Theme signal:

```text
theme_signal =
  1 if primary_theme_mafy includes HTA, AVC symptoms, emergency response, smoking, alcohol, dyslipidemia, or sedentary lifestyle
  0 otherwise
```

Barrier signal:

```text
barrier_signal =
  1 if participant_questions or dfis mentions cost/access/difficulty
  0 otherwise
```

Risk intensity score:

```text
risk_intensity_score =
  0.30 * normalized(referrals_made)
+ 0.25 * high_risk_group_signal
+ 0.20 * barrier_signal
+ 0.15 * theme_signal
+ 0.10 * normalized(total_participants)
```

Classification:

```text
0.00 - 0.39 = Low
0.40 - 0.69 = Medium
0.70 - 1.00 = High
```

### Output

```text
High risk intensity = the area combines referral activity, high-risk participant groups, access/cost barriers, and AVC/HTA-related themes.
```

## 4. Follow-Up Queueing Model

### Goal

Create a queue of facilities, communes, or activity records for follow-up because the dataset is missing direct priority scores.

This is not a real facility waiting queue. A real queue would need patient arrival time, consultation time, triage severity, staff availability, and waiting time.

### Dataset Fields Used

- `form.activite_de_sensibilisation.location_name_csb`
- `form.identifiant1.region`
- `form.identifiant1.district`
- `form.identifiant1.commune`
- `form.identifiant1.fokontany`
- `form.identifiant1.coordonne_gps`
- `form.question15.date_activity`
- `MOIS`
- `form.participant.total_participants`
- `form.question_commune_et_personnes_referees_aux_centre_de_sante.referrals_made`
- `form.question_commune_et_personnes_referees_aux_centre_de_sante.participant_questions`
- `form.observation.dfis`
- `form.observation.observation`
- `form.question15.uid_sensibilisation`
- `form.question15.start_time`
- `form.question15.end_time`
- `form.question15.duration_minutes`

### Formula

Data quality penalty:

```text
data_quality_penalty =
  1 if GPS missing
+ 1 if duplicate uid_sensibilisation
+ 1 if duration_minutes does not match start_time/end_time
+ 1 if key fields are blank
```

Follow-up priority score:

```text
followup_priority_score =
  0.30 * referral_score
+ 0.25 * risk_intensity_score
+ 0.20 * outreach_load_score
+ 0.15 * referral_gap
+ 0.10 * normalized(data_quality_penalty)
```

Queue order:

```text
Sort facilities/communes/activity records by followup_priority_score descending.
```

Priority labels:

```text
High priority   = score >= 0.70
Medium priority = score >= 0.40 and < 0.70
Low priority    = score < 0.40
```

### Output

```text
Follow-up queue item:
- priority level
- facility/commune
- reason for priority
- supporting dataset fields
- recommended field action
```

Example:

```text
Priority: High
Reason: high outreach, referral gap, access/cost questions, and weak GPS data.
Action: verify referral recording and ask field staff whether an in-person follow-up visit is needed.
```
