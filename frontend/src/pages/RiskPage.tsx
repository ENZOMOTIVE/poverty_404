import { Flame, Gauge, ShieldAlert, UsersRound } from "lucide-react";
import RiskRadarChart from "../components/charts/RiskRadarChart";
import MetricCard from "../components/ui/MetricCard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { communeMetrics, siteMetrics } from "../data/mafyData";
import { formatNumber, riskFromScore } from "../utils/format";

export default function RiskPage() {
  const mediumOrHigh = communeMetrics.filter(
    (item) => item.riskIntensityScore >= 0.4,
  );
  const highRiskSessions = siteMetrics.reduce(
    (total, site) => total + site.highRiskSessions,
    0,
  );
  const barrierSignals = communeMetrics.reduce(
    (total, commune) => total + commune.barriers,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Use case 3"
        title="Operational risk intensity"
        description="Referral activity, high-risk participant groups, barrier signals, theme signals, and participant volume classify area intensity."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Risk areas"
          value={mediumOrHigh.length.toString()}
          detail="Communes with medium-or-higher operational risk"
          icon={Gauge}
          accent="danger"
        />
        <MetricCard
          label="High-risk sessions"
          value={highRiskSessions.toString()}
          detail="Rows containing high-risk participant group signals"
          icon={UsersRound}
          accent="amber"
        />
        <MetricCard
          label="Barrier signals"
          value={barrierSignals.toString()}
          detail="Narrative access, cost, or difficulty signal count"
          icon={ShieldAlert}
          accent="cyan"
        />
        <MetricCard
          label="AVC/HTA themes"
          value="71"
          detail="All records contain MAFY stroke or hypertension themes"
          icon={Flame}
          accent="neon"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Risk radar"
          subtitle="Risk, referral, and outreach score balance by site."
          className="xl:col-span-5"
        >
          <RiskRadarChart data={siteMetrics} />
        </Panel>
        <Panel
          title="Risk heatmap"
          subtitle="Commune intensity by score band."
          className="xl:col-span-7"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {communeMetrics.map((commune) => {
              const risk = riskFromScore(commune.riskIntensityScore);

              return (
                <article
                  key={commune.id}
                  className="rounded-md border border-grid bg-panel-soft p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {commune.name}
                      </p>
                      <p className="text-xs text-muted">{commune.district}</p>
                    </div>
                    <StatusPill status={risk} />
                  </div>
                  <div className="mt-4">
                    <ScoreBar
                      score={commune.riskIntensityScore}
                      tone={risk === "High" ? "danger" : "amber"}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted">People</p>
                      <p className="mt-1 font-mono text-white">
                        {formatNumber(commune.participants)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Refs</p>
                      <p className="mt-1 font-mono text-white">
                        {commune.referrals}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Gaps</p>
                      <p className="mt-1 font-mono text-white">
                        {commune.referralGaps}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
