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
import { monthlyMetrics, siteMetrics } from "../data/mafyData";
import type { PriorityLevel, SiteMetric } from "../types/analytics";
import { cn, formatNumber } from "../utils/format";

const forecastMonths = [
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
];

const siteColors = ["#39ff14", "#22d3ee", "#f8cc45"];

const siteDynamics: Record<
  string,
  {
    seasonality: number[];
    sensitivity: number;
  }
> = {
  taolagnaro: {
    seasonality: [2, -1, -4, 3, 5, 1],
    sensitivity: 0.85,
  },
  "ampanihy-ouest": {
    seasonality: [5, 8, 6, 2, -1, 3],
    sensitivity: 1.12,
  },
  "toliary-i": {
    seasonality: [-2, 4, 9, 11, 7, 2],
    sensitivity: 1.28,
  },
};

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

function priorityFromPressure(pressure: number): PriorityLevel {
  if (pressure >= 74) return "High";
  if (pressure >= 42) return "Medium";
  return "Low";
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function chartKey(siteId: string) {
  return `site_${siteId.replaceAll("-", "_")}`;
}

function pressureForSite(
  site: SiteMetric,
  monthIndex: number,
  unprioritizedId: string,
) {
  const gapFactor = Math.min(site.referralGaps / 18, 1);
  const qualityFactor = Math.min(site.dataQualityPenalty / 30, 1);
  const participantFactor = site.participants / 1592;
  const dynamics = siteDynamics[site.id];
  const monthFactor = monthIndex + 1;
  const historicalPulse =
    monthlyMetrics[monthIndex % monthlyMetrics.length].followupPriorityScore;
  const exposurePressure =
    site.outreachLoadScore * 5 +
    site.riskIntensityScore * 7 +
    gapFactor * 10 +
    qualityFactor * 4 +
    historicalPulse * 3 -
    site.referralScore * 3;
  const seasonalPulse = dynamics.seasonality[monthIndex] * dynamics.sensitivity;

  if (site.id === unprioritizedId) {
    const skippedBacklog =
      8 + participantFactor * 5 + (site.referralScore < 0.15 ? 3 : 0);

    return clamp(
      site.followupPriorityScore * 100 +
        monthFactor *
          (exposurePressure * 0.72 + skippedBacklog) *
          dynamics.sensitivity +
        seasonalPulse,
    );
  }

  const routineMitigation =
    site.referralScore * 7 + site.riskIntensityScore * 2 + 2.2;

  return clamp(
    site.followupPriorityScore * 100 +
      monthFactor * (exposurePressure * 0.14 - routineMitigation) +
      seasonalPulse,
  );
}

function buildRace(monthIndex: number, unprioritizedId: string): RaceLane[] {
  return siteMetrics
    .map((site) => {
      const pressure = pressureForSite(site, monthIndex, unprioritizedId);
      const base = site.followupPriorityScore * 100;
      const peopleAtRisk = Math.round(
        site.participants *
          (pressure / 100) *
          (site.id === unprioritizedId ? 1.12 : 0.68),
      );

      return {
        id: site.id,
        name: site.name,
        region: site.region,
        pressure,
        pace: Math.max(0, pressure - base),
        peopleAtRisk,
        priority: priorityFromPressure(pressure),
        explanation:
          site.id === unprioritizedId
            ? "Skipped in this run"
            : "Routine follow-up remains active",
      };
    })
    .sort((a, b) => b.pressure - a.pressure);
}

function buildTrajectory(unprioritizedId: string) {
  return forecastMonths.map((month, monthIndex) => {
    const row: Record<string, number | string> = {
      month: month.slice(0, 3),
    };

    siteMetrics.forEach((site) => {
      row[chartKey(site.id)] = Math.round(
        pressureForSite(site, monthIndex, unprioritizedId),
      );
    });

    return row;
  });
}

function buildVisibleTrajectory(unprioritizedId: string, monthIndex: number) {
  return buildTrajectory(unprioritizedId).map((row, index) => {
    if (index <= monthIndex) return row;

    const hiddenRow: Record<string, number | string | null> = {
      month: row.month,
    };

    siteMetrics.forEach((site) => {
      hiddenRow[chartKey(site.id)] = null;
    });

    return hiddenRow;
  });
}

export default function SimulationPage() {
  const [unprioritizedId, setUnprioritizedId] = useState(siteMetrics[2].id);
  const [monthIndex, setMonthIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const race = useMemo(
    () => buildRace(monthIndex, unprioritizedId),
    [monthIndex, unprioritizedId],
  );
  const trajectory = useMemo(
    () => buildVisibleTrajectory(unprioritizedId, monthIndex),
    [monthIndex, unprioritizedId],
  );
  const selectedSite = siteMetrics.find((site) => site.id === unprioritizedId);
  const leader = race[0];
  const nextMonth = forecastMonths[monthIndex];
  const totalPeopleAtRisk = race.reduce(
    (total, lane) => total + lane.peopleAtRisk,
    0,
  );

  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setMonthIndex((current) => {
        if (current >= forecastMonths.length - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 1100);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  function resetRun() {
    setIsPlaying(false);
    setMonthIndex(0);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="AI scenario run"
        title="Follow-up pressure simulation"
        description="Choose an area to leave unprioritised, then play a six-month forecast. Rankings can change as skipped-area backlog compounds and routine follow-up stabilises other areas."
      >
        <div className="flex items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-3 py-2 text-neon">
          <BrainCircuit className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase">
            Transparent scenario model
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
                    setUnprioritizedId(site.id);
                    resetRun();
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
              onClick={() => setIsPlaying((current) => !current)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-neon/50 bg-neon px-4 text-sm font-semibold text-ink transition hover:bg-neon/85"
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

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Pressure ladder"
          subtitle={`${nextMonth} forecast. Markers move across low, medium, and high pressure zones as the scenario advances.`}
          className="xl:col-span-8"
          action={<StatusPill status={leader.priority} />}
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
                  {leader.name}
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
              {forecastMonths.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setMonthIndex(index);
                  }}
                  className="min-w-0 text-left"
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
          subtitle="Simple interpretation of the current run."
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
                {selectedSite?.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-ash">
                This run shows what could happen if the selected area is not
                prioritised while other areas receive routine attention.
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
          subtitle="The lines reveal one month at a time while the run plays."
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
          title="Prediction inputs"
          subtitle="Transparent scoring signals used in the scenario."
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
