import type {
  DetailedReport,
  FollowUpAction,
  MonthlyMetric,
  SiteMetric,
} from "../types/analytics";

const palette = {
  ink: "#020403",
  panel: "#07110b",
  grid: "#163121",
  neon: "#39ff14",
  cyan: "#22d3ee",
  amber: "#f8cc45",
  danger: "#ff4d6d",
  ash: "#d8ffe1",
  muted: "#8aa095",
  white: "#ffffff",
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function compactMonth(month: string) {
  const date = new Date(`${month}-01T00:00:00`);

  if (Number.isNaN(date.valueOf())) return month;

  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function chartPoint(
  index: number,
  total: number,
  value: number,
  max: number,
  width: number,
  height: number,
  padding: number,
) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const x = padding + (total <= 1 ? 0 : (index / (total - 1)) * innerWidth);
  const y = padding + innerHeight - (max <= 0 ? 0 : (value / max) * innerHeight);

  return { x, y };
}

function monthlyActivitySvg(data: MonthlyMetric[]) {
  const width = 860;
  const height = 320;
  const padding = 44;
  const maxParticipants = Math.max(1, ...data.map((item) => item.participants));
  const maxReferrals = Math.max(1, ...data.map((item) => item.referrals));
  const barWidth = Math.max(
    26,
    (width - padding * 2) / Math.max(data.length, 1) - 18,
  );
  const referralPoints = data.map((item, index) =>
    chartPoint(
      index,
      data.length,
      item.referrals,
      maxReferrals,
      width,
      height,
      padding,
    ),
  );
  const line = referralPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly activity chart">
      <rect width="${width}" height="${height}" rx="8" fill="${palette.panel}" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="${palette.grid}" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="${palette.grid}" />
      ${data
        .map((item, index) => {
          const point = chartPoint(
            index,
            data.length,
            item.participants,
            maxParticipants,
            width,
            height,
            padding,
          );
          const barHeight = height - padding - point.y;
          const x = point.x - barWidth / 2;

          return `
            <rect x="${x}" y="${point.y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${palette.neon}" opacity="0.7" />
            <text x="${point.x}" y="${height - 18}" text-anchor="middle" fill="${palette.muted}" font-size="12">${escapeHtml(compactMonth(item.month))}</text>
          `;
        })
        .join("")}
      <path d="${line}" fill="none" stroke="${palette.cyan}" stroke-width="3" />
      ${referralPoints
        .map(
          (point) =>
            `<circle cx="${point.x}" cy="${point.y}" r="4" fill="${palette.cyan}" />`,
        )
        .join("")}
      <text x="${padding}" y="24" fill="${palette.ash}" font-size="14" font-weight="700">Participants by month, referrals as current signal</text>
    </svg>
  `;
}

function siteScoresSvg(data: SiteMetric[]) {
  const width = 860;
  const rowHeight = 50;
  const padding = 36;
  const labelWidth = 178;
  const height = padding * 2 + rowHeight * data.length;
  const barWidth = width - labelWidth - padding * 2;

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Site score chart">
      <rect width="${width}" height="${height}" rx="8" fill="${palette.panel}" />
      <text x="${padding}" y="24" fill="${palette.ash}" font-size="14" font-weight="700">Follow-up score by site</text>
      ${data
        .map((site, index) => {
          const y = padding + index * rowHeight + 18;
          const score = Math.round(site.followupPriorityScore * 100);
          const filled = (score / 100) * barWidth;
          const color =
            score >= 70 ? palette.danger : score >= 40 ? palette.amber : palette.neon;

          return `
            <text x="${padding}" y="${y}" fill="${palette.ash}" font-size="13">${escapeHtml(site.name)}</text>
            <rect x="${labelWidth}" y="${y - 12}" width="${barWidth}" height="16" rx="4" fill="${palette.grid}" />
            <rect x="${labelWidth}" y="${y - 12}" width="${filled}" height="16" rx="4" fill="${color}" />
            <text x="${width - padding}" y="${y}" text-anchor="end" fill="${palette.white}" font-size="13" font-family="monospace">${score}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function operationsSvg(actions: FollowUpAction[]) {
  const width = 860;
  const rowHeight = 48;
  const padding = 36;
  const labelWidth = 220;
  const visibleActions = actions.slice(0, 10);
  const height = padding * 2 + rowHeight * visibleActions.length;
  const barWidth = width - labelWidth - padding * 2;

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Operations action queue chart">
      <rect width="${width}" height="${height}" rx="8" fill="${palette.panel}" />
      <text x="${padding}" y="24" fill="${palette.ash}" font-size="14" font-weight="700">Ready follow-up actions</text>
      ${visibleActions
        .map((action, index) => {
          const y = padding + index * rowHeight + 18;
          const score = Math.round(action.score * 100);
          const filled = Math.max(4, (score / 100) * barWidth);
          const color =
            action.priority === "High"
              ? palette.danger
              : action.priority === "Medium"
                ? palette.amber
                : palette.neon;

          return `
            <text x="${padding}" y="${y}" fill="${palette.ash}" font-size="13">${escapeHtml(action.areaName)}</text>
            <rect x="${labelWidth}" y="${y - 12}" width="${barWidth}" height="16" rx="4" fill="${palette.grid}" />
            <rect x="${labelWidth}" y="${y - 12}" width="${filled}" height="16" rx="4" fill="${color}" />
            <text x="${width - padding}" y="${y}" text-anchor="end" fill="${palette.white}" font-size="13" font-family="monospace">${score}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function metricCards(report: DetailedReport) {
  const cards = [
    ["Rows", number(report.dataset.rows)],
    ["Participants", number(report.dataset.participants)],
    ["Referrals", number(report.dataset.referrals)],
    ["Actions", number(report.operations?.actions.length ?? 0)],
    ["Missing GPS", number(report.dataset.gpsMissing)],
    ["LLM text", report.usedLLM ? "Enabled" : "Deterministic"],
  ];

  return cards
    .map(
      ([label, value]) => `
        <div class="metric">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `,
    )
    .join("");
}

function siteRows(report: DetailedReport) {
  return report.siteMetrics
    .map(
      (site) => `
        <tr>
          <td>${escapeHtml(site.name)}</td>
          <td>${escapeHtml(site.region)}</td>
          <td>${number(site.participants)}</td>
          <td>${number(site.referrals)}</td>
          <td>${number(site.referralGaps)}</td>
          <td>${percent(site.followupPriorityScore)}</td>
        </tr>
      `,
    )
    .join("");
}

function operationRows(report: DetailedReport) {
  return (report.operations?.actions ?? [])
    .map(
      (action) => `
        <tr>
          <td>${escapeHtml(action.areaName)}</td>
          <td>${escapeHtml(action.priority)}</td>
          <td>${escapeHtml(action.actionType)}</td>
          <td>${escapeHtml(action.owner)}</td>
          <td>${escapeHtml(action.dueWindow)}</td>
          <td>${escapeHtml(action.reason)}</td>
          <td>${escapeHtml(action.evidence.join("; "))}</td>
        </tr>
      `,
    )
    .join("");
}

function communeRows(report: DetailedReport) {
  return report.chartData.communeQueue
    .map(
      (commune) => `
        <tr>
          <td>${escapeHtml(commune.name)}</td>
          <td>${escapeHtml(commune.region)}</td>
          <td>${number(commune.participants)}</td>
          <td>${number(commune.referrals)}</td>
          <td>${number(commune.referralGaps)}</td>
          <td>${percent(commune.followupPriorityScore)}</td>
        </tr>
      `,
    )
    .join("");
}

function findingRows(report: DetailedReport) {
  return report.agentResults
    .flatMap((agentResult) =>
      agentResult.findings.map(
        (finding) => `
          <tr>
            <td>${escapeHtml(agentResult.agent)}</td>
            <td>${escapeHtml(finding.title)}</td>
            <td>${escapeHtml(finding.severity)}</td>
            <td>${escapeHtml(finding.evidence.join("; "))}</td>
            <td>${escapeHtml(finding.recommendation)}</td>
          </tr>
        `,
      ),
    )
    .join("");
}

export function buildDetailedReportHtml(report: DetailedReport) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; background: ${palette.ink}; color: ${palette.ash}; font-family: Inter, Arial, sans-serif; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px; }
    header { border-bottom: 1px solid ${palette.grid}; padding-bottom: 24px; margin-bottom: 24px; }
    h1, h2, h3 { color: ${palette.white}; margin: 0; }
    h1 { font-size: 32px; }
    h2 { font-size: 18px; margin-top: 28px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0; }
    p { line-height: 1.6; }
    button { border: 1px solid ${palette.neon}; background: ${palette.neon}; color: ${palette.ink}; border-radius: 6px; padding: 10px 14px; font-weight: 700; }
    .meta { margin-top: 10px; color: ${palette.muted}; font-size: 13px; }
    .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
    .metric, .panel { border: 1px solid ${palette.grid}; border-radius: 8px; background: ${palette.panel}; padding: 16px; }
    .metric span { display: block; color: ${palette.muted}; font-size: 12px; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 8px; color: ${palette.white}; font-size: 24px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .chart { margin: 16px 0 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
    th, td { border-bottom: 1px solid ${palette.grid}; padding: 10px; text-align: left; vertical-align: top; font-size: 13px; }
    th { color: ${palette.neon}; text-transform: uppercase; font-size: 11px; }
    @media print { button { display: none; } main { padding: 18px; } .panel, .metric { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <button onclick="window.print()">Print or Save as PDF</button>
      <h1>${escapeHtml(report.title)}</h1>
      <p class="meta">Generated ${escapeHtml(new Date(report.generatedAt).toLocaleString())} from ${escapeHtml(report.dataset.dataset)}</p>
    </header>

    <section class="metrics">${metricCards(report)}</section>

    <section class="panel">
      <h2>Executive Summary</h2>
      <p>${escapeHtml(report.executiveSummary)}</p>
    </section>

    <section>
      <h2>Charts</h2>
      <div class="chart">${monthlyActivitySvg(report.chartData.monthlyActivity)}</div>
      <div class="chart">${siteScoresSvg(report.chartData.siteScores)}</div>
      <div class="chart">${operationsSvg(report.chartData.operationsQueue)}</div>
    </section>

    <section>
      <h2>Follow-up Actions</h2>
      <table>
        <thead><tr><th>Area</th><th>Priority</th><th>Action type</th><th>Owner</th><th>Due</th><th>Reason</th><th>Evidence</th></tr></thead>
        <tbody>${operationRows(report)}</tbody>
      </table>
    </section>

    <section>
      <h2>Site Metrics</h2>
      <table>
        <thead><tr><th>Site</th><th>Region</th><th>Participants</th><th>Referrals</th><th>Referral gaps</th><th>Follow-up score</th></tr></thead>
        <tbody>${siteRows(report)}</tbody>
      </table>
    </section>

    <section>
      <h2>Top Commune Queue</h2>
      <table>
        <thead><tr><th>Commune</th><th>Region</th><th>Participants</th><th>Referrals</th><th>Referral gaps</th><th>Follow-up score</th></tr></thead>
        <tbody>${communeRows(report)}</tbody>
      </table>
    </section>

    <section>
      <h2>Agent Findings</h2>
      <table>
        <thead><tr><th>Agent</th><th>Finding</th><th>Severity</th><th>Evidence</th><th>Recommendation</th></tr></thead>
        <tbody>${findingRows(report)}</tbody>
      </table>
    </section>
  </main>
</body>
</html>`;
}

function csvCell(value: unknown) {
  const text = String(value ?? "");

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function csvRows(rows: unknown[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function buildDetailedReportCsv(report: DetailedReport) {
  const sections = [
    csvRows([
      ["Report", report.title],
      ["Generated At", report.generatedAt],
      ["Dataset", report.dataset.dataset],
      ["Executive Summary", report.executiveSummary],
    ]),
    csvRows([
      [],
      ["Follow-up Actions"],
      ["Area", "Priority", "Action Type", "Owner", "Due", "Score", "Reason", "Evidence"],
      ...(report.operations?.actions ?? []).map((action) => [
        action.areaName,
        action.priority,
        action.actionType,
        action.owner,
        action.dueWindow,
        action.score,
        action.reason,
        action.evidence.join("; "),
      ]),
    ]),
    csvRows([
      [],
      ["Site Metrics"],
      ["Site", "Region", "Participants", "Referrals", "Referral Gaps", "Follow-up Score"],
      ...report.siteMetrics.map((site) => [
        site.name,
        site.region,
        site.participants,
        site.referrals,
        site.referralGaps,
        site.followupPriorityScore,
      ]),
    ]),
    csvRows([
      [],
      ["Top Commune Queue"],
      ["Commune", "Region", "Participants", "Referrals", "Referral Gaps", "Follow-up Score"],
      ...report.chartData.communeQueue.map((commune) => [
        commune.name,
        commune.region,
        commune.participants,
        commune.referrals,
        commune.referralGaps,
        commune.followupPriorityScore,
      ]),
    ]),
    csvRows([
      [],
      ["Monthly Activity"],
      ["Month", "Sessions", "Participants", "Referrals", "Follow-up Score"],
      ...report.monthlyMetrics.map((month) => [
        month.month,
        month.sessions,
        month.participants,
        month.referrals,
        month.followupPriorityScore,
      ]),
    ]),
    csvRows([
      [],
      ["Agent Findings"],
      ["Agent", "Title", "Severity", "Evidence", "Recommendation"],
      ...report.agentResults.flatMap((agentResult) =>
        agentResult.findings.map((finding) => [
          agentResult.agent,
          finding.title,
          finding.severity,
          finding.evidence.join("; "),
          finding.recommendation,
        ]),
      ),
    ]),
  ];

  return sections.join("\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  type: string,
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function reportFilename(report: DetailedReport, extension: string) {
  const date = report.generatedAt.slice(0, 10);

  return `mafy-agent-report-${date}.${extension}`;
}
