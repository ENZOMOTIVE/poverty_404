# DfM MAFY Frontend

React, Vite, Tailwind CSS, React Router, Recharts, and lucide-react frontend for the Doctors for Madagascar MAFY monitoring use cases.

## Structure

```text
src/
  app/                 Route wiring and navigation metadata
  components/
    charts/            Reusable data visualisations
    layout/            Application shell and navigation
    ui/                Small reusable interface components
  data/                Static fixtures derived from the workbook and use cases
  pages/               Multi-page use-case screens
  styles/              Tailwind theme and global CSS
  types/               Shared analytics types
  utils/               Formatting and score helpers
```

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Backend Integration

The frontend reads live workbook metrics and simulation timelines from the Bun backend.

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787
```

If the analytics summary endpoint is unavailable, dashboard pages fall back to the bundled workbook fixtures. The simulation page requires the backend `SimulationAgent` endpoint because forecasts are no longer generated locally.
