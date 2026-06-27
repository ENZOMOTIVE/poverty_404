import {
  BrainCircuit,
  CircleDot,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Target,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { runFollowUpSimulation } from "../services/backendApi";
import type { PriorityLevel, SimulationResult } from "../types/analytics";
import { cn, formatNumber } from "../utils/format";

const forecastMonths = [
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
];

const siteColors = ["#39ff14", "#22d3ee", "#f8cc45", "#ff4d6d"];

interface RaceLane {
  id: string;
  name: string;
  region: string;
  pressure: number;
  pace: number;
  peopleAtRisk: number;
  priority: PriorityLevel;
  explanation: string;
}

function chartKey(siteId: string) {
  return `site_${siteId.replaceAll("-", "_")}`;
}

function monthKey(index: number) {
  return `Month ${index + 1}`;
}

function monthLabel(index: number) {
  return forecastMonths[index] ?? monthKey(index);
}

export default function SimulationPage() {
  const { siteMetrics, backendStatus } = useAnalytics();
  const [unprioritizedId, setUnprioritizedId] = useState("toliary-i");
  const [monthIndex, setMonthIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unprioritizedId) return;

    const controller = new AbortController();

    runFollowUpSimulation(
      { unprioritizedAreaId: unprioritizedId, months: 6 },
      controller.signal,
    )
      .then((result) => {
        setSimulation(result);
        setStatus("ready");
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setSimulation(null);
        setStatus("error");
        setError(
          caught instanceof Error
            ? caught.message
            : "Simulation backend unavailable",
        );
      });

    return () => controller.abort();
  }, [unprioritizedId]);

  const monthCount = simulation?.months ?? 6;
  const monthLabels = useMemo(
    () => Array.from({ length: monthCount }, (_, index) => monthLabel(index)),
    [monthCount],
  );
  const race = useMemo<RaceLane[]>(() => {
    if (!simulation) return [];

    return simulation.timeline
      .filter((item) => item.month === monthKey(monthIndex))
      .map((item) => {
        const site = siteMetrics.find((candidate) => candidate.id === item.areaId);
        const base = (site?.followupPriorityScore ?? 0) * 100;

        return {
          id: item.areaId,
          name: item.areaName,
          region: site?.region ?? "",
          pressure: item.pressureIndex,
          pace: Math.max(0, item.pressureIndex - base),
          peopleAtRisk: item.projectedPeopleExposed,
          priority: item.priority,
          explanation:
            item.areaId === unprioritizedId
              ? "Skipped in this backend run"
              : "Routine follow-up remains active",
        };
      })
      .sort((a, b) => b.pressure - a.pressure);
  }, [monthIndex, simulation, siteMetrics, unprioritizedId]);
  const trajectory = useMemo(() => {
    if (!simulation) return [];

    return Array.from({ length: simulation.months }, (_, index) => {
      const row: Record<string, number | string | null> = {
        month: monthLabel(index).slice(0, 3),
      };

      siteMetrics.forEach((site) => {
        const value = simulation.timeline.find(
          (item) =>
            item.month === monthKey(index) && item.areaId === site.id,
        )?.pressureIndex;

        row[chartKey(site.id)] = index <= monthIndex ? (value ?? null) : null;
      });

      return row;
    });
  }, [monthIndex, simulation, siteMetrics]);
  const selectedSite = siteMetrics.find((site) => site.id === unprioritizedId);
  const leader = race[0];
  const nextMonth = monthLabel(monthIndex);
  const totalPeopleAtRisk = race.reduce(
    (total, lane) => total + lane.peopleAtRisk,
    0,
  );

  useEffect(() => {
    if (!isPlaying || status !== "ready") return;

    const interval = window.setInterval(() => {
      setMonthIndex((current) => {
        if (current >= monthCount - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 1100);

    return () => window.clearInterval(interval);
  }, [isPlaying, monthCount, status]);

  function resetRun() {
    setIsPlaying(false);
    setMonthIndex(0);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Agentic backend run"
        title="Follow-up pressure simulation"
        description="Choose an area to leave unprioritised. The backend SimulationAgent returns the six-month forecast, and the frontend only animates the returned timeline."
      >
        <div className="flex items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-3 py-2 text-neon">
          <BrainCircuit className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase">
            {backendStatus === "live" ? "Backend agent live" : "API required"}
          </span>
        </div>
      </PageHeader>

      <Panel>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted">
              Area left without priority action
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {siteMetrics.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => {
                    setStatus("loading");
                    setError(null);
                    setSimulation(null);
                    setIsPlaying(false);
                    setMonthIndex(0);
                    setUnprioritizedId(site.id);
                  }}
                  className={cn(
                    "min-w-0 rounded-md border px-3 py-3 text-left transition",
                    unprioritizedId === site.id
                      ? "border-neon/60 bg-neon/10 text-neon"
                      : "border-grid bg-panel-soft text-ash hover:border-neon/40",
                  )}
                >
                  <span className="block truncate text-sm font-semibold">
                    {site.name}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {site.region}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              disabled={status !== "ready"}
              onClick={() => setIsPlaying((current) => !current)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-neon/50 bg-neon px-4 text-sm font-semibold text-ink transition hover:bg-neon/85 disabled:cursor-not-allowed disabled:border-grid disabled:bg-grid disabled:text-muted"
            >
              {isPlaying ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              {isPlaying ? "Pause" : "Play run"}
            </button>
            <button
              type="button"
              onClick={resetRun}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-grid bg-panel px-4 text-sm font-semibold text-ash transition hover:border-neon/40 hover:text-neon"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </Panel>

      {status === "error" && (
        <Panel contentClassName="py-3">
          <p className="text-sm text-danger">
            SimulationAgent API unavailable. Start the backend on
            http://127.0.0.1:8787. {error}
          </p>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Pressure ladder"
          subtitle={`${nextMonth} forecast. Markers move across low, medium, and high pressure zones as the backend scenario advances.`}
          className="xl:col-span-8"
          action={
            leader ? <StatusPill status={leader.priority} /> : undefined
          }
        >
          <div className="simulation-board">
            <div className="grid gap-4 border-b border-grid/70 pb-5 md:grid-cols-3">
              <div className="rounded-md border border-grid bg-ink-2 p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Forecast month
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {nextMonth}
                </p>
              </div>
              <div className="rounded-md border border-grid bg-ink-2 p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Current leader
                </p>
                <p className="mt-2 truncate text-xl font-semibold text-white">
                  {leader?.name ?? "Loading"}
                </p>
              </div>
              <div className="rounded-md border border-grid bg-ink-2 p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  People exposed
                </p>
                <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-white">
                  <UsersRound className="size-5 text-neon" aria-hidden="true" />
                  {formatNumber(totalPeopleAtRisk)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-6 gap-2">
              {monthLabels.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  disabled={status !== "ready"}
                  onClick={() => {
                    setIsPlaying(false);
                    setMonthIndex(index);
                  }}
                  className="min-w-0 text-left disabled:cursor-not-allowed"
                >
                  <div
                    className={cn(
                      "h-2 rounded-sm bg-grid transition",
                      index <= monthIndex && "bg-neon shadow-neon",
                    )}
                  />
                  <p
                    className={cn(
                      "mt-2 truncate text-[10px] uppercase text-muted",
                      index === monthIndex && "text-neon",
                    )}
                  >
                    {month.slice(0, 3)}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-[1fr_auto_auto] gap-x-3 px-1 text-[10px] font-semibold uppercase text-muted">
              <span>Projected pressure index</span>
              <span>42 medium</span>
              <span>74 high</span>
            </div>

            <div className="mt-3 space-y-5">
              {race.map((lane, index) => (
                <article key={lane.id} className="min-w-0">
                  <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-grid bg-ink-2 font-mono text-xs text-neon">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {lane.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          +{Math.round(lane.pace)} index points ·{" "}
                          {lane.explanation}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusPill status={lane.priority} />
                      <span className="font-mono text-sm text-white">
                        {Math.round(lane.pressure)}
                      </span>
                    </div>
                  </div>

                  <div className="scenario-track">
                    <div className="absolute inset-y-0 left-[42%] w-px bg-amber/50" />
                    <div className="absolute inset-y-0 left-[74%] w-px bg-danger/50" />
                    <div
                      className={cn(
                        "scenario-fill",
                        lane.priority === "High"
                          ? "bg-danger/70"
                          : lane.priority === "Medium"
                            ? "bg-amber/70"
                            : "bg-neon/70",
                      )}
                      style={{ width: `${lane.pressure}%` }}
                    />
                    <div
                      className={cn(
                        "scenario-marker",
                        isPlaying && "scenario-marker-active",
                        lane.priority === "High" && "scenario-marker-danger",
                      )}
                      style={{
                        left: `calc(${Math.min(lane.pressure, 98)}% - 10px)`,
                      }}
                    >
                      <CircleDot className="size-3.5" aria-hidden="true" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          title="Health-worker readout"
          subtitle="Simple interpretation of the current backend run."
          className="xl:col-span-4"
        >
          <div className="space-y-5">
            <div className="rounded-md border border-grid bg-ink-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-muted">
                  Scenario focus
                </p>
                <Target className="size-4 text-neon" aria-hidden="true" />
              </div>
              <p className="mt-3 text-lg font-semibold text-white">
                {selectedSite?.name ?? "Loading"}
              </p>
              <p className="mt-2 text-sm leading-6 text-ash">
                {simulation?.narrative ??
                  "The backend SimulationAgent is calculating the pressure timeline."}
              </p>
            </div>

            <div className="space-y-4">
              {race.slice(0, 3).map((lane) => (
                <ScoreBar
                  key={lane.id}
                  label={`${lane.name} · ${formatNumber(
                    lane.peopleAtRisk,
                  )} people exposed`}
                  score={lane.pressure / 100}
                  tone={
                    lane.priority === "High"
                      ? "danger"
                      : lane.priority === "Medium"
                        ? "amber"
                        : "neon"
                  }
                />
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Moving forecast trajectories"
          subtitle="The lines reveal backend-returned months one at a time while the run plays."
          className="xl:col-span-8"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trajectory}
                margin={{ top: 8, right: 18, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#163121" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8aa095", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8aa095", fontSize: 12 }}
                  width={36}
                />
                <ReferenceLine
                  x={nextMonth.slice(0, 3)}
                  stroke="#39ff14"
                  strokeDasharray="4 4"
                />
                <Tooltip
                  contentStyle={{
                    background: "#07110b",
                    border: "1px solid #163121",
                    borderRadius: 6,
                    color: "#eafff0",
                  }}
                />
                {siteMetrics.map((site, index) => (
                  <Line
                    key={site.id}
                    type="monotone"
                    dataKey={chartKey(site.id)}
                    name={site.name}
                    stroke={siteColors[index % siteColors.length]}
                    strokeWidth={site.id === unprioritizedId ? 3 : 2}
                    dot={{ r: site.id === unprioritizedId ? 4 : 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                    isAnimationActive
                    animationDuration={650}
                    animationEasing="ease-out"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Backend agent inputs"
          subtitle="Signals used by the SimulationAgent."
          className="xl:col-span-4"
        >
          <div className="space-y-4">
            {[
              [
                "Outreach load",
                "Higher activity volume increases future follow-up pressure.",
              ],
              [
                "Risk intensity",
                "AVC/HTA themes and high-risk participant groups increase projected pressure.",
              ],
              [
                "Referral gap",
                "High participation with zero referrals raises review priority.",
              ],
              [
                "Data quality",
                "Missing GPS or duplicate UIDs make follow-up harder to plan.",
              ],
            ].map(([title, detail]) => (
              <div
                key={title}
                className="rounded-md border border-grid bg-panel-soft p-4"
              >
                <div className="flex items-center gap-2 text-neon">
                  <Gauge className="size-4" aria-hidden="true" />
                  <p className="text-sm font-semibold text-white">{title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-ash">{detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
