import { DatabaseZap, Map, X } from "lucide-react";
import { lazy, Suspense, useCallback, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { navigationItems } from "../../app/navigation";
import { useAnalytics } from "../../providers/analyticsContext";
import type { GeoFilter } from "../../providers/analyticsContext";
import { cn, formatNumber, formatPercent } from "../../utils/format";
import StatusPill from "../ui/StatusPill";

const MapView = lazy(() => import("../map/MapView"));

export default function AppShell() {
  const { summary, backendStatus, allSiteMetrics, allCommuneMetrics, geoFilter, setGeoFilter } = useAnalytics();
  const [showMap, setShowMap] = useState(false);

  const handleMapSelect = useCallback(
    (filter: GeoFilter) => {
      setGeoFilter(filter);
      setShowMap(false);
    },
    [setGeoFilter],
  );

  const handleMapClose = useCallback(() => {
    setShowMap(false);
  }, []);

  const handleClearFilter = useCallback(() => {
    setGeoFilter(null);
  }, [setGeoFilter]);

  return (
    <div className="min-h-screen bg-ink text-ash terminal-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-grid/70 bg-ink/95 px-4 py-5 backdrop-blur lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-md border border-neon/40 bg-neon/10 text-neon">
            <DatabaseZap className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              MAFY
            </p>
            <p className="text-xs uppercase text-muted">
              Health Operations Console
            </p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition",
                  isActive
                    ? "border border-neon/40 bg-neon/10 text-neon"
                    : "text-ash hover:bg-panel-soft hover:text-white",
                )
              }
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-5 rounded-md border border-grid bg-panel/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase text-muted">
              MAFY workbook
            </span>
            <StatusPill status={backendStatus === "live" ? "Live" : "Stable"} />
          </div>
          <p className="mt-3 truncate text-xs text-ash">
            {summary.dataset}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted">Rows</p>
              <p className="mt-1 font-mono text-white">{summary.rows}</p>
            </div>
            <div>
              <p className="text-muted">Referral rate</p>
              <p className="mt-1 font-mono text-white">
                {formatPercent(
                  summary.referrals / summary.participants,
                )}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-grid/70 bg-ink/88 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs uppercase text-muted">
                MAFY live operations
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {formatNumber(summary.participants)} participants across{" "}
                {summary.sites} sites
              </p>
            </div>
            <div className="flex items-center gap-2">
              {geoFilter && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="flex items-center gap-2 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-xs font-semibold uppercase text-amber transition hover:bg-amber/20"
                >
                  <span>Showing: {geoFilter.value}</span>
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-3 py-2 text-xs font-semibold uppercase text-neon transition hover:bg-neon/20"
              >
                <Map className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">
                  {geoFilter ? "Change Region" : "Show Map View"}
                </span>
                <span className="md:hidden">🗺️</span>
              </button>
              <div className="hidden items-center gap-2 rounded-md border border-grid bg-panel px-3 py-2 text-xs font-semibold uppercase text-muted md:flex">
                <DatabaseZap className="size-4 text-neon" aria-hidden="true" />
                <span>
                  {backendStatus === "live" ? "MAFY data live" : "Cached MAFY data"}
                </span>
              </div>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-grid/50 px-4 py-2 thin-scrollbar lg:hidden">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-xs",
                    isActive
                      ? "border-neon/40 bg-neon/10 text-neon"
                      : "border-grid bg-panel text-ash",
                  )
                }
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {showMap && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 grid place-items-center bg-ink">
              <p className="text-sm text-muted">Loading map...</p>
            </div>
          }
        >
          <MapView
            siteMetrics={allSiteMetrics}
            communeMetrics={allCommuneMetrics}
            onSelect={handleMapSelect}
            onClose={handleMapClose}
          />
        </Suspense>
      )}
    </div>
  );
}
