import { Layers, Map, Timer, Users } from "lucide-react";
import LocationMixChart from "../components/charts/LocationMixChart";
import MonthlyActivityChart from "../components/charts/MonthlyActivityChart";
import SiteScoreBars from "../components/charts/SiteScoreBars";
import MetricCard from "../components/ui/MetricCard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import { locationMix } from "../data/mafyData";
import { useAnalytics } from "../providers/analyticsContext";
import { formatNumber } from "../utils/format";

export default function OutreachPage() {
  const { siteMetrics, communeMetrics, monthlyMetrics } = useAnalytics();
  const totalSessions = siteMetrics.reduce((total, site) => total + site.sessions, 0);
  const totalFokontany = siteMetrics.reduce(
    (total, site) => total + site.uniqueFokontany,
    0,
  );
  const totalMinutes = siteMetrics.reduce(
    (total, site) => total + site.totalOutreachMinutes,
    0,
  );
  const topCommunes = [...communeMetrics].sort(
    (a, b) => b.outreachLoadScore - a.outreachLoadScore,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY outreach coverage"
        title="Outreach coverage and workload"
        description="People reached, session activity, fokontany coverage, and outreach duration show where field teams may need support."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sessions"
          value={totalSessions.toString()}
          detail="Activity rows grouped across the three recorded sites"
          icon={Layers}
          accent="neon"
        />
        <MetricCard
          label="Participants"
          value={formatNumber(
            siteMetrics.reduce((total, site) => total + site.participants, 0),
          )}
          detail="Total people reached in sensitisation activities"
          icon={Users}
          accent="cyan"
        />
        <MetricCard
          label="Fokontany"
          value={totalFokontany.toString()}
          detail="Unique coverage count after grouping by site"
          icon={Map}
          accent="amber"
        />
        <MetricCard
          label="Minutes"
          value={totalMinutes.toString()}
          detail="Derived outreach duration signal in the current export"
          icon={Timer}
          accent="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Activity volume"
          subtitle="Participant volume by month with referrals overlaid."
          className="xl:col-span-8"
        >
          <MonthlyActivityChart data={monthlyMetrics} />
        </Panel>
        <Panel
          title="Location mix"
          subtitle="Where sensitisation activities were recorded."
          className="xl:col-span-4"
        >
          <LocationMixChart data={locationMix} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Outreach load by site"
          subtitle="Weighted score from participants, sessions, coverage, and duration."
          className="xl:col-span-7"
        >
          <SiteScoreBars
            data={siteMetrics}
            scoreKey="outreachLoadScore"
            color="#39ff14"
          />
        </Panel>
        <Panel
          title="Commune coverage board"
          subtitle="Top communes by outreach load score."
          className="xl:col-span-5"
        >
          <div className="space-y-4">
            {topCommunes.slice(0, 7).map((commune) => (
              <ScoreBar
                key={commune.id}
                label={`${commune.name} · ${commune.participants} reached`}
                score={commune.outreachLoadScore}
                tone="neon"
              />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
