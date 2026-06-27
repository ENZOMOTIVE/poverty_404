import {
  Activity,
  MapPinned,
  RadioTower,
  ShieldAlert,
  Users,
} from "lucide-react";
import MonthlyActivityChart from "../components/charts/MonthlyActivityChart";
import SiteScoreBars from "../components/charts/SiteScoreBars";
import MetricCard from "../components/ui/MetricCard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import {
  monthlyMetrics,
  queueItems,
} from "../data/mafyData";
import { useAnalytics } from "../providers/analyticsContext";
import {
  formatNumber,
  formatPercent,
  priorityFromScore,
} from "../utils/format";

export default function DashboardPage() {
  const {
    summary: sourceSummary,
    siteMetrics,
    backendStatus,
    error,
  } = useAnalytics();
  const referralRate = sourceSummary.referrals / sourceSummary.participants;
  const topSite = siteMetrics[0];
  const marketTape = [
    ["Sessions", sourceSummary.rows.toString()],
    ["Participants", formatNumber(sourceSummary.participants)],
    ["Referrals", sourceSummary.referrals.toString()],
    ["Referral rate", formatPercent(referralRate)],
    ["Missing GPS", sourceSummary.gpsMissing.toString()],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY monitoring"
        title="Sensitisation operations console"
        description="Outreach concentration, referral momentum, operational risk, and follow-up priority from the current MAFY sensitisation export."
      >
        <div className="flex items-center gap-2 rounded-md border border-grid bg-panel px-3 py-2">
          <span className="size-2 rounded-full bg-neon shadow-neon" />
          <span className="text-xs font-semibold uppercase text-white">
            {backendStatus === "live" ? "Backend live" : "Static fallback"}
          </span>
        </div>
      </PageHeader>

      {backendStatus === "offline" && (
        <Panel contentClassName="py-3">
          <p className="text-sm text-amber">
            Backend unavailable, using cached workbook fixtures. {error}
          </p>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="People reached"
          value={formatNumber(sourceSummary.participants)}
          detail={`${formatNumber(sourceSummary.women)} women, ${formatNumber(
            sourceSummary.men,
          )} men recorded`}
          icon={Users}
          trend="up"
          accent="neon"
        />
        <MetricCard
          label="Activity rows"
          value={sourceSummary.rows.toString()}
          detail={`${sourceSummary.months} months, ${sourceSummary.regions} regions, ${sourceSummary.sites} sites`}
          icon={Activity}
          trend="neutral"
          accent="cyan"
        />
        <MetricCard
          label="Referrals made"
          value={sourceSummary.referrals.toString()}
          detail={`${formatPercent(referralRate)} referral rate across all participants`}
          icon={RadioTower}
          trend="up"
          accent="amber"
        />
        <MetricCard
          label="Data issues"
          value={sourceSummary.gpsMissing.toString()}
          detail={`${sourceSummary.duplicateUidRows} rows also carry duplicate UID signals`}
          icon={ShieldAlert}
          trend="down"
          accent="danger"
        />
      </div>

      <Panel contentClassName="p-0">
        <div className="grid divide-y divide-grid md:grid-cols-5 md:divide-x md:divide-y-0">
          {marketTape.map(([label, value]) => (
            <div key={label} className="px-4 py-3">
              <p className="text-[11px] uppercase text-muted">{label}</p>
              <p className="mt-1 font-mono text-lg text-white">{value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Monthly activity exchange"
          subtitle="Participants as volume, referrals as signal."
          className="xl:col-span-8"
        >
          <MonthlyActivityChart data={monthlyMetrics} />
        </Panel>
        <Panel
          title="Follow-up depth"
          subtitle="Top queue items by priority score."
          className="xl:col-span-4"
        >
          <div className="space-y-5">
            {queueItems.slice(0, 4).map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {item.location}
                    </p>
                    <p className="text-xs text-muted">{item.region}</p>
                  </div>
                  <StatusPill status={item.priority} />
                </div>
                <ScoreBar
                  score={item.score}
                  tone={item.priority === "High" ? "danger" : "neon"}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Site score board"
          subtitle="Follow-up score synthesizes referral, risk, outreach, gaps, and quality."
          className="xl:col-span-7"
        >
          <SiteScoreBars data={siteMetrics} scoreKey="followupPriorityScore" />
        </Panel>
        <Panel
          title="Primary signals"
          subtitle="Current operational read by site."
          className="xl:col-span-5"
        >
          <div className="space-y-4">
            {siteMetrics.map((site) => (
              <div
                key={site.id}
                className="grid gap-3 border-b border-grid/60 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {site.name}
                    </p>
                    <p className="text-xs text-muted">{site.region}</p>
                  </div>
                  <StatusPill status={priorityFromScore(site.followupPriorityScore)} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted">Participants</p>
                    <p className="mt-1 font-mono text-white">
                      {formatNumber(site.participants)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Referrals</p>
                    <p className="mt-1 font-mono text-white">
                      {site.referrals}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Gaps</p>
                    <p className="mt-1 font-mono text-white">
                      {site.referralGaps}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-md border border-neon/40 bg-neon/10 text-neon">
              <MapPinned className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Highest follow-up watch
              </p>
              <p className="text-xs text-muted">{topSite?.region}</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-ash">
            {topSite?.name} combines all recorded referrals with the strongest
            referral score. Ampanihy Ouest carries the largest outreach load but
            has zero referrals, making referral recording the clearest next
            review target.
          </p>
        </div>
      </Panel>
    </div>
  );
}
