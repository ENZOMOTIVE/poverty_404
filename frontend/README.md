# MAFY Console Frontend

React, Vite, Tailwind CSS, React Router, Recharts, lucide-react, and Three.js frontend for the Doctors for Madagascar MAFY Data Console.

The interface is designed for a pitch-ready AI4Good demo: dense operational data, clear navigation, neon green/black visual identity, report downloads, animated what-if forecasting, and a one-time Madagascar-focused landing screen.

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
  pages/               Multi-page product screens
  providers/           Dataset summary provider and backend status state
  services/            Backend API client and report download builders
  styles/              Tailwind theme and global CSS
  types/               Shared analytics and agent payload types
  utils/               Formatting and score helpers
```

## Main Screens

| Screen | Purpose |
| --- | --- |
| Landing | One-time Three.js globe view focused on Madagascar. |
| Overview | Dataset health, activity, referral, and priority summary. |
| Outreach | Outreach load and activity distribution. |
| Referrals | Referral score, rate, and possible gaps. |
| Risk | Operational risk intensity signals. |
| Operations | Backend-generated follow-up actions and rationale. |
| What-if | Monte Carlo scenario forecast with animated trajectory and race views. |
| Reports | Generate and download HTML, JSON, and CSV reports. |
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

## Backend Integration

By default, the frontend calls:

```text
http://127.0.0.1:8787
```

Override with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787 npm run dev
```

Important routes used by the UI:

| Frontend area | Backend route |
| --- | --- |
| Dashboard metrics | `GET /api/dataset/summary` |
| Operations | `POST /api/operations/follow-up` |
| What-if forecast | `POST /api/forecast/what-if` |
| Reports | `POST /api/reports/detailed` |

If the dataset summary endpoint is unavailable, summary pages fall back to cached workbook fixtures. Operations, What-if, and Reports require the backend because they run active agent workflows.

## UX Notes

- The landing screen stores `mafy-console-started` in local storage after the Start button is pressed.
- The What-if page is intentionally labelled as probabilistic scenario forecasting.
- Report downloads are generated locally from the structured backend report payload.
- Queue still exists as a route, but the main navigation favors Operations to avoid repeated action-list views.

## More Documentation

- [`../README.md`](../README.md)
- [`../docs/AGENTIC_INFRASTRUCTURE.md`](../docs/AGENTIC_INFRASTRUCTURE.md)
- [`../docs/OPERATIONS_OVERVIEW.md`](../docs/OPERATIONS_OVERVIEW.md)
