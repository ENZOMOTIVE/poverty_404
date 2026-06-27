# Hackathon MVP Brief

## Product Concept

**HealthAtlas AI** is a 3D operational intelligence map for Doctors for Madagascar.

It turns raw M&E data, project indicators, funding data, health service data, and AI recommendations into one visual command center. Teams can see where care is reaching people, where gaps are emerging, where data quality is weak, and what action should be taken next.

## One-Liner

HealthAtlas AI helps Doctors for Madagascar turn raw M&E data into a 3D decision map that shows impact, funding, service gaps, data quality risks, and AI-recommended actions by district or facility.

## Core Pitch

Doctors for Madagascar collects valuable health and project data across TB, vaccination, maternal health, financial inclusion, hypertension, stroke prevention, community outreach, and facility support. But this data is often fragmented across systems and hard to interpret quickly.

HealthAtlas AI brings that data into a 3D map of Madagascar, allowing project teams to click on regions, districts, or facilities and instantly understand:

- what is happening
- what changed
- where attention is needed
- what data quality issues exist
- what impact has been achieved
- what remains to be done
- what the AI recommends next

## MVP 1: 3D Madagascar Mission Map

### Goal

Create a visual 3D map of Madagascar where each region, district, or facility displays health project status.

### Core Features

- 3D Madagascar map
- clickable regions, districts, or facility markers
- color-coded status:
  - green: stable
  - yellow: watch
  - red: needs action
  - blue: strong impact
- hover or click panels with key metrics
- simple time slider for monthly or quarterly trends

### Example Metrics

- children vaccinated
- zero-dose children identified
- TB screenings completed
- TB patients diagnosed
- HIV tests completed
- safe deliveries
- antenatal care visits
- ambulance referrals
- patients receiving financial support
- budget spent
- budget remaining
- data completeness score

### Why It Is Cool

It makes raw M&E data feel alive. Instead of opening spreadsheets, project teams can visually explore where impact is happening and where support is needed.

## MVP 2: Mission Remaining Layer

### Goal

Show what is still left to do in each district or project area.

### Core Features

- remaining children to vaccinate
- remaining TB patients needing follow-up
- facilities missing reports
- expected pregnant women not yet reached
- budget needed to complete target
- projected target gap

### Example Output

> Estimated remaining need: 3,240 zero-dose children. At the current outreach rate, this district may miss the quarterly target by 27%.

### Why It Is Cool

Most dashboards show what has already happened. This layer shows what still needs to happen.

## MVP 3: AI Alert Layer

### Goal

Automatically detect risk signals and display them on the map.

### Core Features

- pulsing markers for urgent alerts
- AI-generated alert explanations
- confidence level
- evidence summary
- recommended follow-up action

### Example Alerts

- ANC visits dropped by 34%
- TB follow-up missing for 12 patients
- vaccination numbers repeated for 3 months
- budget burn rate is unusually high
- facility report missing for 2 months
- service utilization decreased during rainy season
- reported values are inconsistent with historical trends

### Example Output

> Alert: TB follow-up appears delayed in District A. The number of diagnosed patients increased, but recorded follow-up visits dropped by 31%. This may indicate a reporting delay, transport barrier, or treatment continuity issue. Review facility registers and community health worker follow-up logs.

### Why It Is Cool

The product does not wait for users to ask questions. It proactively finds possible problems.

## MVP 4: Funding-to-Impact View

### Goal

Connect project spending with health outcomes and coverage.

### Core Features

- funding spent by region or district
- cost per person reached
- budget remaining
- activity completion rate
- impact per euro estimate
- AI explanation of spending versus outcome patterns

### Example Metrics

- cost per child vaccinated
- cost per TB screening
- cost per safe delivery supported
- cost per ambulance referral
- budget used versus target achieved

### Example Output

> District B has used 82% of its outreach budget but has reached only 54% of its vaccination target. This may require reviewing transport costs, outreach frequency, or population estimates.

### Why It Is Cool

It is useful for project managers, donors, and leadership because it connects money to real-world results.

## MVP 5: Facility Intelligence Panel

### Goal

When a user clicks on a facility or district, show a compact situation briefing.

### Panel Sections

- current status
- key indicators
- recent changes
- data quality issues
- AI explanation
- recommended actions
- chart suggestions
- generated summary

### Example Panel

**Facility:** Belafika Primary Care Facility  
**Status:** Watch  
**Main Signal:** Antenatal care visits decreased by 22% this month  
**Data Quality:** 2 missing weekly reports  
**AI Interpretation:** The decline may reflect reporting delay, reduced mobile clinic activity, or access barriers. Nearby facilities did not show the same decline, so this should be reviewed locally.  
**Recommended Action:** Check paper registers, confirm mobile clinic schedule, ask facility lead about staffing and transport constraints.

### Why It Is Cool

It turns each map click into a ready-made project briefing.

## MVP 6: Prediction Mode

### Goal

Use historical data to estimate future gaps or risks.

### Core Features

- time slider into the next month or quarter
- predicted districts likely to miss targets
- estimated budget shortfall
- service utilization risk
- seasonal risk indicators
- AI-generated planning recommendations

### Example Predictions

- likely vaccination target miss
- likely TB follow-up gap
- expected drop in service use during rainy season
- funding shortfall risk
- facilities likely to require supervision

### Example Output

> If the current outreach rate continues, District C may miss its vaccination target by approximately 18%. Adding two mobile outreach sessions in high-need communes could close most of the gap.

### Why It Is Cool

It turns M&E from retrospective reporting into anticipatory planning.

## MVP 7: Supervision Visit Planner

### Goal

Turn map insights into field action plans.

### Core Features

- recommend which facilities to visit
- explain why each facility matters
- generate checklist for supervision visit
- list records to verify
- suggest questions for facility staff
- generate follow-up priorities

### Example Output

**Recommended Visit:** Facility X  
**Reason:** ANC visits decreased while facility deliveries increased, which may indicate reporting mismatch or missed antenatal follow-up.  
**Records To Check:** ANC register, delivery register, mobile clinic records, referral logs.  
**Questions To Ask:** Were outreach sessions cancelled? Were there staffing gaps? Were pregnant women referred from other areas?

### Why It Is Cool

It connects analytics directly to operational action.

## MVP 8: Impact Story Generator

### Goal

Transform selected indicators into clear communication outputs.

### Core Features

- generate donor summary
- generate internal project summary
- generate partner/MOH summary
- suggest charts
- include caveats about data quality
- avoid unsupported claims

### Example Input

- 529 mobile TB clinics
- 4,572 people screened for TB
- 1,388 people diagnosed with TB
- 1,231 HIV tests

### Example Output

> Mobile TB clinics are helping close the distance barrier in remote communities by bringing screening and diagnosis closer to people who may otherwise not reach care. The next operational question is whether diagnosis is consistently followed by treatment start and completion.

### Why It Is Cool

It helps teams communicate impact without spending hours converting numbers into narratives.

## Recommended Hackathon Build

For the hackathon, build a focused version:

### Must-Have Features

1. 3D Madagascar map
2. clickable districts or facility markers
3. sample database with project indicators
4. layer switcher:
   - impact
   - funding
   - service gaps
   - data quality
   - AI alerts
5. side panel with charts and metrics
6. AI-generated recommendation for selected area
7. generate project brief button

### Nice-To-Have Features

- time slider
- prediction mode
- mission remaining layer
- supervision visit checklist
- donor story export
- PDF or slide export

## Suggested Demo Dataset

Create mock data for 5 to 10 districts or facilities.

### Tables

**facilities**

- facility_id
- facility_name
- district
- region
- latitude
- longitude
- facility_type

**monthly_indicators**

- month
- facility_id
- anc_visits
- safe_deliveries
- tb_screened
- tb_diagnosed
- tb_followup_completed
- children_vaccinated
- zero_dose_identified
- zero_dose_vaccinated
- ambulance_referrals
- patients_supported_financially

**funding**

- month
- district
- project_area
- budget_allocated
- budget_spent
- budget_remaining

**data_quality**

- month
- facility_id
- missing_fields_count
- duplicate_records_count
- late_reports_count
- suspicious_values_count
- completeness_score

**ai_alerts**

- alert_id
- month
- district
- facility_id
- severity
- alert_type
- evidence
- recommendation
- confidence

## Example Product Flow

1. User opens HealthAtlas AI.
2. The 3D Madagascar map loads with district markers.
3. The user selects the "AI Alerts" layer.
4. Three red pulsing markers appear.
5. The user clicks one district.
6. The side panel shows:
   - vaccination target at risk
   - budget spent at 81%
   - missing reports from 2 facilities
   - mobile outreach activity down 24%
7. AI recommendation appears:
   > This looks like a possible service access issue rather than only low demand. Review outreach transport logs, verify facility reports, and prioritize supervision in the two facilities with missing data.
8. User clicks "Generate Brief."
9. Product generates a one-page situation brief for the project manager.

## Tech Stack Ideas

### Frontend

- React
- Three.js or React Three Fiber
- Mapbox, deck.gl, or custom 3D model
- Recharts or ECharts for graphs

### Backend

- Node.js or Python FastAPI
- PostgreSQL or SQLite for hackathon
- simple CSV upload
- API endpoints for map metrics, alerts, and summaries

### AI Layer

- anomaly detection rules for MVP
- LLM-generated explanations
- recommendations based on indicator patterns
- prompt templates for project brief generation

## AI Logic For MVP

Use simple rules first, then let AI explain them.

### Example Rules

- If indicator drops by more than 25%, create alert.
- If budget spent is above 80% but target achieved is below 60%, create funding efficiency alert.
- If the same value appears for 3 months, create data quality alert.
- If completeness score is below 85%, create data quality alert.
- If diagnosed TB patients exceed follow-up records by more than 20%, create care cascade alert.
- If zero-dose identified is high but zero-dose vaccinated is low, create service gap alert.

### AI Explanation Prompt

Given the selected facility or district metrics, explain:

- what changed
- why it matters
- possible causes
- what data should be checked
- what action the project team should take next
- any caveats about data quality

## Best Pitch Version

### Product Name

**HealthAtlas AI**

### Tagline

See the gaps. Explain the data. Act earlier.

### Problem

DfM has valuable data, but it is fragmented and time-consuming to turn into decisions.

### Solution

HealthAtlas AI turns raw M&E data into a 3D operational map with AI alerts, impact views, funding insights, and action recommendations.

### Why Now

Health teams need faster ways to detect service gaps, explain trends, and plan action during funding uncertainty, climate shocks, and increasing pressure on health systems.

### Why It Matters

The tool helps teams move from monthly reporting to earlier intervention.

## Final Recommended MVP Scope

Build this exact version:

**A 3D Madagascar map where users can switch between Impact, Funding, Gaps, Data Quality, and AI Alerts. Clicking a district opens a side panel with graphs, metrics, and an AI-generated recommendation. A button generates a project manager situation brief.**

This is visually impressive, useful, and directly aligned with the hackathon challenge.
