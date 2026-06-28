import {
  BrainCircuit,
  Gauge,
  Loader2,
  Play,
  RefreshCcw,
  Route,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ForecastTrajectoryChart from "../components/charts/ForecastTrajectoryChart";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { runWhatIfForecast } from "../services/backendApi";
import type {
  WhatIfForecastResult,
  WhatIfRaceFrame,
  WhatIfScenarioId,
} from "../types/analytics";
import { cn, formatNumber } from "../utils/format";

type ForecastStatus = "loading" | "ready" | "error";

const scenarioOptions: Array<{
  id: WhatIfScenarioId;
  label: string;
  detail: string;
}> = [
  {
    id: "followup-delay",
    label: "Follow-up delay",
    detail: "High-priority areas are not acted on.",
  },
  {
    id: "referral-backlog",
    label: "Referral backlog",
    detail: "Referral coordination demand keeps accumulating.",
  },
  {
    id: "data-quality-drift",
    label: "Data quality drift",
    detail: "Planning confidence falls from unresolved data issues.",
  },
];

const horizonOptions = [3, 6, 9];

export default function ForecastPage() {
  const { backendStatus, datasetId } = useAnalytics();
  const [scenarioId, setScenarioId] =
    useState<WhatIfScenarioId>("followup-delay");
  const [horizonMonths, setHorizonMonths] = useState(6);
  const [includeRationale, setIncludeRationale] = useState(true);
  const [forecast, setForecast] = useState<WhatIfForecastResult | null>(null);
  const [status, setStatus] = useState<ForecastStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    runWhatIfForecast(
      {
        scenarioId,
        horizonMonths,
        iterations: 1200,
        limit: 6,
        includeRationale,
      },
      datasetId,
      controller.signal,
    )
      .then((result) => {
        setForecast(result);
        setStatus("ready");
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setStatus("error");
        setForecast(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "MAFY scenario agents unavailable",
        );
      });

    return () => controller.abort();
  }, [datasetId, horizonMonths, includeRationale, scenarioId]);

  function queueForecastRefresh() {
    setStatus("loading");
    setError(null);
    setForecast(null);
  }

  const topArea = forecast?.areas[0];
  const scenario = scenarioOptions.find((item) => item.id === scenarioId);
  const metrics = [
    ["Scenario", forecast?.scenario.label ?? scenario?.label ?? "Pending"],
    ["Iterations", forecast ? formatNumber(forecast.iterations) : "Pending"],
    ["Horizon", forecast ? `${forecast.horizonMonths} months` : "Pending"],
    [
      "Mode",
      forecast?.rationale?.mode === "llm-assisted"
        ? "AI rationale"
        : "Monte Carlo",
    ],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY scenario planning"
        title="MAFY what-if scenario lab"
        description="A probabilistic planning view for health teams to stress-test future follow-up pressure from historical MAFY workbook signals."
      >
        <div className="flex items-center gap-2 rounded-md border border-grid bg-panel px-3 py-2">
          <Gauge className="size-4 text-neon" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase text-white">
            {backendStatus === "live"
              ? "MAFY forecast agents live"
              : "MAFY agents required"}
          </span>
        </div>
      </PageHeader>

      <Panel
        title="Scenario controls"
        subtitle="Changing a control reruns the MAFY scenario agents with the selected assumptions."
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="grid gap-3 md:grid-cols-3">
            {scenarioOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (scenarioId === item.id) return;
                  queueForecastRefresh();
                  setScenarioId(item.id);
                }}
                className={cn(
                  "rounded-md border p-4 text-left transition",
                  scenarioId === item.id
                    ? "border-neon/55 bg-neon/10 text-neon"
                    : "border-grid bg-panel-soft text-ash hover:border-neon/35",
                )}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="mt-2 block text-xs leading-5 text-muted">
                  {item.detail}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            {horizonOptions.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => {
                  if (horizonMonths === months) return;
                  queueForecastRefresh();
                  setHorizonMonths(months);
                }}
                className={cn(
                  "h-10 rounded-md border px-3 text-xs font-semibold uppercase transition",
                  horizonMonths === months
                    ? "border-neon/50 bg-neon/10 text-neon"
                    : "border-grid bg-panel text-ash hover:text-white",
                )}
              >
                {months} months
              </button>
            ))}
            <button
              type="button"
              aria-pressed={includeRationale}
              onClick={() => {
                queueForecastRefresh();
                setIncludeRationale((value) => !value);
              }}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold uppercase transition",
                includeRationale
                  ? "border-neon/50 bg-neon/10 text-neon"
                  : "border-grid bg-panel text-ash hover:text-white",
              )}
            >
              <BrainCircuit className="size-4" aria-hidden="true" />
              Rationale
            </button>
          </div>
        </div>
      </Panel>

      {status === "error" && (
        <Panel contentClassName="py-3">
          <p className="text-sm text-danger">
            MAFY scenario forecast unavailable. {error}
          </p>
        </Panel>
      )}

      {status === "loading" && (
        <Panel>
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <p className="text-sm">
              Running MAFY scenario agents on workbook evidence.
            </p>
          </div>
        </Panel>
      )}

      {forecast && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-grid bg-panel p-4"
              >
                <p className="text-xs font-semibold uppercase text-muted">
                  {label}
                </p>
                <p className="mt-2 break-words font-mono text-xl text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <Panel
            title="Scenario read"
            subtitle={forecast.scenario.description}
            action={
              <StatusPill
                status={
                  topArea?.projectedP90 && topArea.projectedP90 >= 0.7
                    ? "High"
                    : "Medium"
                }
              />
            }
          >
            <p className="text-sm leading-6 text-ash">{forecast.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {forecast.scenario.assumptions.map((item, index) => (
                <span
                  key={`${forecast.scenario.id}-assumption-${index}`}
                  className="rounded border border-grid bg-ink-2 px-2 py-1 text-xs text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </Panel>

          {forecast.rationale && (
            <Panel
              title="MAFY rationale"
              subtitle={`Mode: ${forecast.rationale.mode === "llm-assisted" ? "AI-assisted" : "dataset rules"}`}
            >
              <p className="text-sm leading-6 text-ash">
                {forecast.rationale.summary}
              </p>
            </Panel>
          )}

          <div className="grid gap-6 xl:grid-cols-12">
            <Panel
              title="Animated trajectory lab"
              subtitle="The active forecast month moves across P50 Monte Carlo trajectories."
              className="xl:col-span-7"
              action={<Route className="size-4 text-neon" />}
            >
              <ForecastTrajectoryChart areas={forecast.areas} />
            </Panel>

            <Panel
              title="Risk pressure race"
              subtitle="Animated standings show which areas gain pressure fastest."
              className="xl:col-span-5"
              action={<Play className="size-4 text-neon" />}
            >
              <ForecastRace frames={forecast.raceFrames} />
            </Panel>
          </div>

          <Panel
            title="Scenario drivers"
            subtitle="Top forecasted areas by projected movement and upper risk band."
            action={<RefreshCcw className="size-4 text-neon" />}
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {forecast.areas.slice(0, 6).map((area) => (
                <article
                  key={area.areaId}
                  className="rounded-md border border-grid bg-ink-2 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {area.areaName}
                      </p>
                      <p className="text-xs text-muted">{area.region}</p>
                    </div>
                    <span className="font-mono text-sm text-neon">
                      #{area.rank}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <Metric label="Now" value={area.currentScore} />
                    <Metric label="P50" value={area.projectedMedian} />
                    <Metric label="P90" value={area.projectedP90} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {area.drivers.slice(0, 3).map((driver, index) => (
                      <span
                        key={`${area.areaId}-driver-${index}`}
                        className="rounded border border-grid bg-panel px-2 py-1 text-xs text-muted"
                      >
                        {driver}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-grid bg-panel px-2 py-2">
      <p className="text-[11px] uppercase text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">
        {Math.round(value * 100)}
      </p>
    </div>
  );
}

function ForecastRace({ frames }: { frames: WhatIfRaceFrame[] }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const frame = frames[frameIndex] ?? frames[0];
  const maxValue = useMemo(() => {
    return Math.max(
      0.9,
      ...frames.flatMap((item) =>
        item.standings.map((standing) => standing.value),
      ),
    );
  }, [frames]);

  useEffect(() => {
    if (frames.length <= 1) return;

    const id = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length);
    }, 1100);

    return () => window.clearInterval(id);
  }, [frames.length]);

  if (!frame) {
    return <p className="text-sm text-muted">No race frames available.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-muted">
          Forecast month
        </p>
        <p className="font-mono text-sm text-neon">{frame.label}</p>
      </div>

      <div className="space-y-4">
        {frame.standings.slice(0, 5).map((standing) => {
          const left = Math.min((standing.value / maxValue) * 92, 92);
          const delta = Math.round(standing.delta * 100);

          return (
            <div key={standing.areaId} className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-white">
                  {standing.areaName}
                </p>
                <p className="font-mono text-xs text-muted">
                  {delta >= 0 ? "+" : ""}
                  {delta}
                </p>
              </div>
              <div className="relative h-9 overflow-hidden rounded-md border border-grid bg-panel-soft">
                <div className="absolute left-3 right-3 top-1/2 h-px bg-grid" />
                <div
                  className="absolute top-1/2 h-4 w-24 -translate-y-1/2 rounded-full bg-neon/10 blur-sm transition-all duration-700 ease-out"
                  style={{ left: `calc(${left}% - 3rem)` }}
                />
                <div
                  className="absolute top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full border border-neon bg-ink shadow-neon transition-all duration-700 ease-out"
                  style={{ left: `${left}%` }}
                >
                  <span className="size-2 rounded-full bg-neon" />
                </div>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted">
                  #{standing.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
