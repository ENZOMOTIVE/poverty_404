import {
  BrainCircuit,
  ClipboardCheck,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import MonthlyActivityChart from "../components/charts/MonthlyActivityChart";
import SiteScoreBars from "../components/charts/SiteScoreBars";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { generateDetailedReport } from "../services/backendApi";
import {
  buildDetailedReportCsv,
  buildDetailedReportHtml,
  downloadTextFile,
  reportFilename,
} from "../services/reportDownloads";
import type { DetailedReport } from "../types/analytics";
import { formatNumber } from "../utils/format";

type ReportStatus = "idle" | "loading" | "ready" | "error";

export default function ReportsPage() {
  const { backendStatus, datasetId } = useAnalytics();
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canDownload = status === "ready" && Boolean(report);
  const operationsCount = report?.operations?.actions.length ?? 0;
  const generatedAtLabel = report
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(report.generatedAt))
    : null;
  const statusLabel =
    status === "loading"
      ? "Generating report"
      : status === "ready"
        ? "Report ready"
        : status === "error"
          ? "Generation failed"
          : backendStatus === "live"
            ? "No report generated"
            : "MAFY agents required";
  const statusDetail =
    status === "loading"
      ? "MAFY is reading workbook metrics, building rationale, and preparing export data."
      : status === "ready"
        ? `Generated ${generatedAtLabel} with ${operationsCount} operational actions.`
        : status === "error"
          ? "The MAFY report service could not complete the request."
          : backendStatus === "live"
            ? "Generate a current report before downloading HTML, JSON, or CSV files."
            : "Connect the MAFY agent service to generate and download reports.";
  const reportContents = [
    {
      label: "Workbook metrics",
      value: report ? `${formatNumber(report.dataset.rows)} rows` : "Pending",
    },
    {
      label: "Evidence findings",
      value: report
        ? `${formatNumber(report.agentResults.length)} findings`
        : "Pending",
    },
    {
      label: "Action queue",
      value: report ? `${formatNumber(operationsCount)} actions` : "Pending",
    },
  ];

  async function generateReport() {
    setStatus("loading");
    setError(null);
    setReport(null);

    try {
      const response = await generateDetailedReport({
        limit: 12,
        includeRationale: true,
      }, datasetId);

      setReport(response.report);
      setStatus("ready");
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "MAFY report service unavailable",
      );
    }
  }

  function downloadHtml() {
    if (!report) return;

    downloadTextFile(
      reportFilename(report, "html"),
      buildDetailedReportHtml(report),
      "text/html;charset=utf-8",
    );
  }

  function downloadJson() {
    if (!report) return;

    downloadTextFile(
      reportFilename(report, "json"),
      JSON.stringify(report, null, 2),
      "application/json;charset=utf-8",
    );
  }

  function downloadCsv() {
    if (!report) return;

    downloadTextFile(
      reportFilename(report, "csv"),
      buildDetailedReportCsv(report),
      "text/csv;charset=utf-8",
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY reporting"
        title="MAFY programme reports"
        description="Generate a shareable health operations report with outreach coverage, referral signals, follow-up actions, charts, and evidence summaries."
      >
        <div className="flex items-center gap-2 rounded-md border border-grid bg-panel px-3 py-2">
          <BrainCircuit className="size-4 text-neon" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase text-white">
            {backendStatus === "live"
              ? "MAFY report agents live"
              : "MAFY agents required"}
          </span>
        </div>
      </PageHeader>

      <Panel
        title="Report package"
        subtitle="Reports are built from MAFY workbook evidence, agent review, and current follow-up actions."
        action={
          <StatusPill status={backendStatus === "live" ? "Live" : "Stable"} />
        }
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-md border border-neon/35 bg-neon/10 text-neon">
                {status === "loading" ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                ) : (
                  <FileText className="size-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {statusLabel}
                </p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                  {statusDetail}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-3">
              {reportContents.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-grid bg-panel-soft px-3 py-3"
                >
                  <p className="text-xs font-semibold uppercase text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              disabled={status === "loading" || backendStatus !== "live"}
              onClick={generateReport}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-neon/50 bg-neon px-4 text-sm font-semibold text-ink transition hover:bg-neon/85 disabled:cursor-not-allowed disabled:border-grid disabled:bg-grid disabled:text-muted"
            >
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileText className="size-4" aria-hidden="true" />
              )}
              Generate MAFY report
            </button>
            <button
              type="button"
              disabled={!canDownload}
              onClick={downloadHtml}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-grid bg-panel px-4 text-sm font-semibold text-ash transition hover:border-neon/40 hover:text-neon disabled:cursor-not-allowed disabled:text-muted"
            >
              <Download className="size-4" aria-hidden="true" />
              Download HTML
            </button>
            <button
              type="button"
              disabled={!canDownload}
              onClick={downloadJson}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-grid bg-panel px-4 text-sm font-semibold text-ash transition hover:border-neon/40 hover:text-neon disabled:cursor-not-allowed disabled:text-muted"
            >
              <FileJson className="size-4" aria-hidden="true" />
              Download JSON
            </button>
            <button
              type="button"
              disabled={!canDownload}
              onClick={downloadCsv}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-grid bg-panel px-4 text-sm font-semibold text-ash transition hover:border-neon/40 hover:text-neon disabled:cursor-not-allowed disabled:text-muted"
            >
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Download CSV
            </button>
          </div>
        </div>
      </Panel>

      {status === "error" && (
        <Panel contentClassName="py-3">
          <p className="text-sm text-danger">
            MAFY report generation failed. {error}
          </p>
        </Panel>
      )}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Rows", formatNumber(report.dataset.rows)],
              ["Participants", formatNumber(report.dataset.participants)],
              ["Actions", formatNumber(operationsCount)],
              ["Report text", report.usedLLM ? "AI assisted" : "Dataset based"],
            ].map(([label, value]) => (
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
            title="Executive summary"
            subtitle={`Generated from ${report.sourceAgents.join(", ")}`}
            action={<StatusPill status={report.usedLLM ? "Live" : "Stable"} />}
          >
            <p className="text-sm leading-6 text-ash">
              {report.executiveSummary}
            </p>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-12">
            <Panel
              title="Outreach activity chart"
              subtitle="Included in the downloadable HTML report."
              className="xl:col-span-7"
            >
              <MonthlyActivityChart data={report.chartData.monthlyActivity} />
            </Panel>
            <Panel
              title="Follow-up priority chart"
              subtitle="Included in the downloadable HTML report."
              className="xl:col-span-5"
            >
              <SiteScoreBars
                data={report.chartData.siteScores}
                scoreKey="followupPriorityScore"
              />
            </Panel>
          </div>

          <Panel
            title="Follow-up actions in report"
            subtitle="Current MAFY actions included in all downloads."
          >
            <div className="grid gap-3 md:grid-cols-3">
              {(report.operations?.actions ?? []).slice(0, 6).map((item) => (
                <article
                  key={item.id}
                  className="rounded-md border border-grid bg-ink-2 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {item.areaName}
                    </p>
                    <StatusPill status={item.priority} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-neon">
                    <ClipboardCheck className="size-4" aria-hidden="true" />
                    <p className="truncate text-sm font-semibold">
                      {item.actionType}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {item.owner} · {item.dueWindow} ·{" "}
                    {Math.round(item.score * 100)} score
                  </p>
                  <p className="mt-3 text-xs text-muted">
                    {item.reason}
                  </p>
                </article>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
