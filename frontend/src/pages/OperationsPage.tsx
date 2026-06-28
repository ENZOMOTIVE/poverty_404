import {
  BrainCircuit,
  ClipboardCheck,
  DatabaseZap,
  Loader2,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import { runFollowUpOperations } from "../services/backendApi";
import type {
  FollowUpAction,
  FollowUpOperationsResult,
  PriorityLevel,
} from "../types/analytics";
import { cn, formatNumber } from "../utils/format";

type ActionFilter = PriorityLevel | "All";

const filters: ActionFilter[] = ["All", "High", "Medium", "Low"];

function actionTone(priority: PriorityLevel) {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "amber";

  return "neon";
}

export default function OperationsPage() {
  const { backendStatus } = useAnalytics();
  const [includeRationale, setIncludeRationale] = useState(true);
  const [operations, setOperations] =
    useState<FollowUpOperationsResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [filter, setFilter] = useState<ActionFilter>("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    runFollowUpOperations(
      {
        limit: 12,
        includeRationale,
      },
      controller.signal,
    )
      .then((result) => {
        setOperations(result);
        setStatus("ready");
        setError(null);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setOperations(null);
        setStatus("error");
        setError(
          caught instanceof Error
            ? caught.message
            : "Operations backend unavailable",
        );
      });

    return () => controller.abort();
  }, [includeRationale]);

  const actions = useMemo(() => operations?.actions ?? [], [operations]);
  const filteredActions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return actions.filter((action) => {
      const matchesFilter = filter === "All" || action.priority === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          action.areaName,
          action.region,
          action.district,
          action.owner,
          action.actionType,
          action.action,
          action.reason,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [actions, filter, query]);
  const highCount = actions.filter((action) => action.priority === "High").length;
  const referralAudits = actions.filter(
    (action) => action.actionType === "Referral recording audit",
  ).length;
  const metricCards = [
    {
      label: "Actions ready",
      value: formatNumber(actions.length),
      Icon: ClipboardCheck,
    },
    {
      label: "High priority",
      value: formatNumber(highCount),
      Icon: ShieldCheck,
    },
    {
      label: "Referral audits",
      value: formatNumber(referralAudits),
      Icon: UserRoundCheck,
    },
  ];

  function refreshActions(nextIncludeRationale = includeRationale) {
    setStatus("loading");
    setError(null);
    setOperations(null);
    setIncludeRationale(nextIncludeRationale);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Agentic operations"
        title="Follow-up operations"
        description="Current workbook evidence is converted into assignable follow-up actions for field, M&E, and data teams."
      >
        <div className="flex items-center gap-2 rounded-md border border-neon/40 bg-neon/10 px-3 py-2 text-neon">
          <DatabaseZap className="size-4" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase">
            {backendStatus === "live" ? "Operations backend live" : "Backend required"}
          </span>
        </div>
      </PageHeader>

      <Panel>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
            {metricCards.map(({ label, value, Icon }) => (
              <div
                key={label}
                className="rounded-md border border-grid bg-ink-2 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted">
                    {label}
                  </p>
                  <Icon className="size-4 text-neon" aria-hidden="true" />
                </div>
                <p className="mt-2 font-mono text-2xl text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              disabled={status === "loading"}
              onClick={() => refreshActions(includeRationale)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-neon/50 bg-neon px-4 text-sm font-semibold text-ink transition hover:bg-neon/85 disabled:cursor-not-allowed disabled:border-grid disabled:bg-grid disabled:text-muted"
            >
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ClipboardCheck className="size-4" aria-hidden="true" />
              )}
              Refresh actions
            </button>
            <button
              type="button"
              aria-pressed={includeRationale}
              onClick={() => refreshActions(!includeRationale)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition",
                includeRationale
                  ? "border-neon/60 bg-neon/10 text-neon"
                  : "border-grid bg-panel text-ash hover:border-neon/40 hover:text-neon",
              )}
            >
              <BrainCircuit className="size-4" aria-hidden="true" />
              Agent rationale
            </button>
          </div>
        </div>
      </Panel>

      {status === "error" && (
        <Panel contentClassName="py-3">
          <p className="text-sm text-danger">
            Follow-up operations API unavailable. {error}
          </p>
        </Panel>
      )}

      {includeRationale && operations?.rationale && (
        <Panel
          title="Agent rationale"
          subtitle={`Mode: ${operations.rationale.mode === "llm-assisted" ? "LLM-assisted" : "rules"}`}
        >
          <p className="text-sm leading-6 text-ash">
            {operations.rationale.summary}
          </p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {operations.rationale.agentSteps.map((step) => (
              <article
                key={step.agent}
                className="rounded-md border border-grid bg-panel-soft p-4"
              >
                <p className="text-xs font-semibold uppercase text-neon">
                  {step.agent}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {step.decision}
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
                  {step.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Panel>
      )}

      <Panel contentClassName="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "h-9 rounded-md border px-3 text-xs font-semibold uppercase transition",
                  filter === item
                    ? "border-neon/50 bg-neon/10 text-neon"
                    : "border-grid bg-panel text-ash hover:text-white",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-grid bg-panel px-3 text-sm text-ash lg:w-96">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted"
              placeholder="Search actions, owners, regions"
            />
          </label>
        </div>
      </Panel>

      <div className="grid gap-4">
        {filteredActions.map((action, index) => (
          <ActionPanel key={action.id} action={action} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

function ActionPanel({
  action,
  rank,
}: {
  action: FollowUpAction;
  rank: number;
}) {
  return (
    <Panel contentClassName="space-y-4">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-muted">#{rank}</span>
            <h2 className="text-xl font-semibold text-white">
              {action.areaName}
            </h2>
            <StatusPill status={action.priority} />
            <span className="rounded border border-grid bg-ink-2 px-2 py-1 text-xs text-ash">
              {action.actionType}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {action.region} · {action.district}
          </p>
        </div>
        <div className="w-full xl:w-72">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted">Follow-up score</span>
            <span className="font-mono text-white">
              {Math.round(action.score * 100)}%
            </span>
          </div>
          <ScoreBar
            score={action.score}
            tone={actionTone(action.priority)}
            showValue={false}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Action</p>
          <p className="mt-2 text-sm leading-6 text-ash">{action.action}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Owner</p>
          <p className="mt-2 text-sm leading-6 text-ash">
            {action.owner} · {action.dueWindow}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Reason</p>
          <p className="mt-2 text-sm leading-6 text-ash">{action.reason}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Evidence</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {action.evidence.map((item) => (
              <span
                key={item}
                className="rounded border border-grid bg-ink-2 px-2 py-1 text-xs text-ash"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Blockers</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {action.blockers.map((item) => (
              <span
                key={item}
                className="rounded border border-amber/30 bg-amber/10 px-2 py-1 text-xs text-amber"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
