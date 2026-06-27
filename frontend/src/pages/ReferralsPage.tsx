import { AlertTriangle, GitPullRequestArrow, Radio, Users } from "lucide-react";
import ReferralScatterChart from "../components/charts/ReferralScatterChart";
import SiteScoreBars from "../components/charts/SiteScoreBars";
import MetricCard from "../components/ui/MetricCard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { formatNumber, formatPercent } from "../utils/format";

export default function ReferralsPage() {
  const {
    communeMetrics,
    siteMetrics,
    summary: sourceSummary,
  } = useAnalytics();
  const gapCommunes = communeMetrics.filter((item) => item.referralGaps > 0);
  const zeroReferralParticipants = gapCommunes.reduce(
    (total, item) => total + item.participants,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Use case 2"
        title="Referral score and gap detection"
        description="Referral activity, referral rate, barrier signals, and participant volume expose where follow-up demand may arrive."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Referrals"
          value={sourceSummary.referrals.toString()}
          detail={`${formatPercent(
            sourceSummary.referrals / sourceSummary.participants,
          )} total referral rate`}
          icon={GitPullRequestArrow}
          accent="neon"
          trend="up"
        />
        <MetricCard
          label="Referral gaps"
          value={gapCommunes
            .reduce((total, item) => total + item.referralGaps, 0)
            .toString()}
          detail="High-participant records with zero referrals"
          icon={AlertTriangle}
          accent="danger"
          trend="down"
        />
        <MetricCard
          label="Gap exposure"
          value={formatNumber(zeroReferralParticipants)}
          detail="Participants in communes carrying referral gaps"
          icon={Users}
          accent="amber"
        />
        <MetricCard
          label="Barrier signal"
          value="1"
          detail="Narrative barrier signal detected in Manambaro"
          icon={Radio}
          accent="cyan"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Referral market map"
          subtitle="Participant volume against referrals; point size follows queue priority."
          className="xl:col-span-7"
        >
          <ReferralScatterChart data={communeMetrics} />
        </Panel>
        <Panel
          title="Referral score by site"
          subtitle="Taolagnaro carries all recorded referrals in the export."
          className="xl:col-span-5"
        >
          <SiteScoreBars
            data={siteMetrics}
            scoreKey="referralScore"
            color="#22d3ee"
          />
        </Panel>
      </div>

      <Panel
        title="Referral gap ledger"
        subtitle="High outreach with zero referrals should be reviewed for recording or behavior gaps."
      >
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-grid text-xs uppercase text-muted">
              <tr>
                <th className="pb-3 font-medium">Commune</th>
                <th className="pb-3 font-medium">District</th>
                <th className="pb-3 font-medium">Participants</th>
                <th className="pb-3 font-medium">Referrals</th>
                <th className="pb-3 font-medium">Gaps</th>
                <th className="pb-3 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid/70">
              {gapCommunes.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-white">{item.name}</td>
                  <td className="py-3 text-ash">{item.district}</td>
                  <td className="py-3 font-mono text-white">
                    {formatNumber(item.participants)}
                  </td>
                  <td className="py-3 font-mono text-white">
                    {item.referrals}
                  </td>
                  <td className="py-3 font-mono text-danger">
                    {item.referralGaps}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <StatusPill
                        status={
                          item.followupPriorityScore >= 0.4 ? "Medium" : "Low"
                        }
                      />
                      <div className="w-28">
                        <ScoreBar
                          score={item.followupPriorityScore}
                          showValue={false}
                          tone="amber"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
