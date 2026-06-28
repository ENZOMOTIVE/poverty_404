# MAFY Health Operations Console Frontend

Frontend implementation for the MAFY Health Operations Console. It uses React, Vite, Tailwind CSS, React Router, Recharts, lucide-react, and Three.js.

The interface is designed for a pitch-ready AI4Good experience: dense health operations data, clear navigation, neon green/black visual identity, report downloads, animated what-if planning, and a one-time Madagascar-focused landing screen.

## Structure

```text
src/
  app/                 Route wiring and navigation metadata
  components/
    charts/            Reusable Recharts visualisations
    landing/           One-time Three.js landing gate
    layout/            Application shell and navigation
    ui/                Small reusable interface components
  data/                Cached workbook fixtures for offline summary fallback
  pages/               Multi-page MAFY workspace screens
  providers/           Dataset summary provider and service status state
  services/            MAFY agent service client and report download builders
  styles/              Tailwind theme and global CSS
  types/               Shared analytics and agent payload types
  utils/               Formatting and score helpers
```

## Main Screens

| Screen | Purpose |
| --- | --- |
| Landing | One-time Three.js globe view focused on Madagascar. |
| Overview | Dataset health, activity, referral, and priority summary. |
| Data | Upload XLSX, XLS, or CSV datasets and choose the active feed. |
| Outreach | Outreach load and activity distribution. |
| Referrals | Referral score, rate, and possible gaps. |
| Risk | Operational risk intensity signals. |
| Operations | MAFY-generated follow-up actions and rationale. |
| What-if | Monte Carlo scenario forecast with animated trajectory and race views. |
| Quality | Data quality findings and implications. |
| Scores | Score component transparency. |

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## MAFY Agent Service Integration

By default, the frontend calls:

```text
http://127.0.0.1:8787
```

Override with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787 npm run dev
```

Important routes used by the workspace:

| MAFY area | Service route |
| --- | --- |
| Dashboard metrics | `GET /api/dataset/summary` |
| Dataset input | `GET /api/datasets`, `POST /api/datasets/upload` |
| Operations | `POST /api/operations/follow-up` |
| What-if forecast | `POST /api/forecast/what-if` |
| Navbar PDF download | `POST /api/reports/detailed` |

If the dataset summary endpoint is unavailable, summary pages fall back to cached workbook fixtures. Operations, What-if, navbar PDF downloads, and dataset upload require the MAFY agent service because they run active agent workflows or write dataset files.

The active dataset id is stored in browser local storage as `mafy-active-dataset-id`.

## UX Notes

- The landing screen stores `mafy-console-started` in local storage after the Start button is pressed.
- The What-if page is intentionally labelled as probabilistic scenario forecasting.
- PDF downloads are generated locally from the structured service report payload.
- Operations owns the follow-up action workflow to avoid repeated action-list views.

## More Documentation

- [`../README.md`](../README.md)
- [`../docs/AGENTIC_INFRASTRUCTURE.md`](../docs/AGENTIC_INFRASTRUCTURE.md)
- [`../docs/OPERATIONS_OVERVIEW.md`](../docs/OPERATIONS_OVERVIEW.md)
