import { BarChart3 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { formatNumber, priorityFromScore } from "../utils/format";

export default function ScoresPage() {
  const { communeMetrics, siteMetrics } = useAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Score engine"
        title="Formula outputs"
        description="A compact view of the four documented scores across site and commune levels."
      >
        <div className="grid size-11 place-items-center rounded-md border border-neon/40 bg-neon/10 text-neon">
          <BarChart3 className="size-5" aria-hidden="true" />
        </div>
      </PageHeader>

      <Panel
        title="Site matrix"
        subtitle="Outreach, referral, risk, and follow-up scores by site."
      >
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-grid text-xs uppercase text-muted">
              <tr>
                <th className="pb-3 font-medium">Site</th>
                <th className="pb-3 font-medium">Participants</th>
                <th className="pb-3 font-medium">Outreach</th>
                <th className="pb-3 font-medium">Referral</th>
                <th className="pb-3 font-medium">Risk</th>
                <th className="pb-3 font-medium">Follow-up</th>
                <th className="pb-3 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid/70">
              {siteMetrics.map((site) => (
                <tr key={site.id}>
                  <td className="py-4 font-semibold text-white">{site.name}</td>
                  <td className="py-4 font-mono text-white">
                    {formatNumber(site.participants)}
                  </td>
                  <td className="py-4">
                    <div className="w-32">
                      <ScoreBar score={site.outreachLoadScore} showValue={false} />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="w-32">
                      <ScoreBar
                        score={site.referralScore}
                        showValue={false}
                        tone="cyan"
                      />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="w-32">
                      <ScoreBar
                        score={site.riskIntensityScore}
                        showValue={false}
                        tone="amber"
                      />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="w-32">
                      <ScoreBar
                        score={site.followupPriorityScore}
                        showValue={false}
                      />
                    </div>
                  </td>
                  <td className="py-4">
                    <StatusPill
                      status={priorityFromScore(site.followupPriorityScore)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Commune ranking"
        subtitle="Sorted by follow-up priority score."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {communeMetrics.map((commune) => (
            <article
              key={commune.id}
              className="rounded-md border border-grid bg-panel-soft p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {commune.name}
                  </p>
                  <p className="text-xs text-muted">{commune.district}</p>
                </div>
                <StatusPill
                  status={priorityFromScore(commune.followupPriorityScore)}
                />
              </div>
              <div className="mt-4 space-y-3">
                <ScoreBar
                  label="Follow-up"
                  score={commune.followupPriorityScore}
                />
                <ScoreBar
                  label="Risk"
                  score={commune.riskIntensityScore}
                  tone="amber"
                />
                <ScoreBar
                  label="Referral"
                  score={commune.referralScore}
                  tone="cyan"
                />
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
