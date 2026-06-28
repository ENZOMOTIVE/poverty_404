import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

const LandingGate = lazy(() => import("../components/landing/LandingGate"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const DataPage = lazy(() => import("../pages/DataPage"));
const OutreachPage = lazy(() => import("../pages/OutreachPage"));
const ReferralsPage = lazy(() => import("../pages/ReferralsPage"));
const RiskPage = lazy(() => import("../pages/RiskPage"));
const OperationsPage = lazy(() => import("../pages/OperationsPage"));
const ForecastPage = lazy(() => import("../pages/ForecastPage"));
const QualityPage = lazy(() => import("../pages/QualityPage"));
const ScoresPage = lazy(() => import("../pages/ScoresPage"));

function RouteFallback() {
  return (
    <div className="panel-surface flex min-h-72 items-center justify-center">
      <div className="text-center">
        <span className="mx-auto block size-3 rounded-full bg-neon shadow-neon" />
        <p className="mt-4 text-xs font-semibold uppercase text-muted">
          Loading view
        </p>
      </div>
    </div>
  );
}

function page(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <LandingGate>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={page(<DashboardPage />)} />
            <Route path="data" element={page(<DataPage />)} />
            <Route path="outreach" element={page(<OutreachPage />)} />
            <Route path="referrals" element={page(<ReferralsPage />)} />
            <Route path="risk" element={page(<RiskPage />)} />
            <Route path="operations" element={page(<OperationsPage />)} />
            <Route path="forecast" element={page(<ForecastPage />)} />
            <Route path="quality" element={page(<QualityPage />)} />
            <Route path="scores" element={page(<ScoresPage />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </LandingGate>
    </Suspense>
  );
}
