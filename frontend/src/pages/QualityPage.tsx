import { CheckCircle2, Database, Fingerprint, MapPinOff } from "lucide-react";
import MetricCard from "../components/ui/MetricCard";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { formatNumber } from "../utils/format";
import type { QualitySignal } from "../types/analytics";

export default function QualityPage() {
  const { summary: sourceSummary } = useAnalytics();
  const qualitySignals: QualitySignal[] = [
    {
      label: "Missing GPS",
      count: sourceSummary.gpsMissing,
      severity: sourceSummary.gpsMissing > 10 ? "High" : "Medium",
      description: "Location coordinates are absent on activity rows.",
    },
    {
      label: "Duplicate UIDs",
      count: sourceSummary.duplicateUidRows,
      severity: sourceSummary.duplicateUidRows > 0 ? "High" : "Low",
      description: "Repeated sensibilisation identifiers need review.",
    },
    {
      label: "Blank key fields",
      count: 0,
      severity: "Low",
      description: "Region, commune, date, and participant totals are populated.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY data confidence"
        title="Data quality review"
        description="MAFY flags missing coordinates, duplicate identifiers, and completeness issues before reporting or field follow-up."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Workbook rows"
          value={sourceSummary.rows.toString()}
          detail={`${sourceSummary.columns} columns in the current export`}
          icon={Database}
          accent="neon"
        />
        <MetricCard
          label="Missing GPS"
          value={sourceSummary.gpsMissing.toString()}
          detail="Coordinates should be reviewed before map-based planning"
          icon={MapPinOff}
          accent="danger"
        />
        <MetricCard
          label="Duplicate UIDs"
          value={sourceSummary.duplicateUidRows.toString()}
          detail="Repeated identifiers need deduplication or merge rules"
          icon={Fingerprint}
          accent="amber"
        />
        <MetricCard
          label="Key blanks"
          value="0"
          detail="Region, commune, date, and participant total are populated"
          icon={CheckCircle2}
          accent="cyan"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Quality signals"
          subtitle="Signals extracted from the workbook before reporting or field follow-up."
          className="xl:col-span-7"
        >
          <div className="space-y-5">
            {qualitySignals.map((signal) => (
              <div key={signal.label} className="grid gap-3 md:grid-cols-[1fr_160px]">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{signal.label}</p>
                    <StatusPill status={signal.severity} />
                  </div>
                  <p className="mt-1 text-sm text-ash">{signal.description}</p>
                </div>
                <div>
                  <ScoreBar
                    score={Math.min(signal.count / sourceSummary.rows, 1)}
                    label={formatNumber(signal.count)}
                    tone={
                      signal.severity === "High"
                        ? "danger"
                        : signal.severity === "Medium"
                          ? "amber"
                          : "neon"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Review sequence"
          subtitle="Quality tasks ordered for the M&E team."
          className="xl:col-span-5"
        >
          <ol className="space-y-4">
            {[
              "Deduplicate repeated sensibilisation identifiers before aggregation.",
              "Recover missing GPS for high-priority follow-up areas first.",
              "Compare referral gaps with field notes and staff reports.",
              "Lock validated fields before donor or partner reporting.",
            ].map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-md border border-neon/40 bg-neon/10 font-mono text-xs text-neon">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-ash">{item}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
