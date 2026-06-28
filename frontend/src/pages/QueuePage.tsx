import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { runFollowUpOperations } from "../services/backendApi";
import type {
  FollowUpAction,
  FollowUpOperationsResult,
  PriorityLevel,
} from "../types/analytics";
import { cn } from "../utils/format";

type QueueFilter = PriorityLevel | "All";

const filters: QueueFilter[] = ["All", "High", "Medium", "Low"];
const weights = [
  ["Referral gaps", 15],
  ["Referral signal", 30],
  ["Risk intensity", 25],
  ["Outreach load", 20],
  ["Data quality", 10],
];

export default function QueuePage() {
  const [filter, setFilter] = useState<QueueFilter>("All");
  const [query, setQuery] = useState("");
  const [operations, setOperations] =
    useState<FollowUpOperationsResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    runFollowUpOperations(
      { limit: 12, includeRationale: false },
      controller.signal,
    )
      .then((result) => {
        setOperations(result);
        setStatus("ready");
        setError(null);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setStatus("error");
        setError(
          caught instanceof Error
            ? caught.message
            : "Follow-up operations unavailable",
        );
      });

    return () => controller.abort();
  }, []);

  const actions = useMemo(() => operations?.actions ?? [], [operations]);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return actions.filter((item) => {
      const matchesFilter = filter === "All" || item.priority === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.areaName, item.region, item.reason, item.action, item.owner]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [actions, filter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY action queue"
        title="Follow-up action queue"
        description="Communes and activity clusters are ordered by current MAFY evidence, with reasons and field actions prepared for programme review."
      />

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
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-grid bg-panel px-3 text-sm text-ash lg:w-80">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted"
              placeholder="Search queue"
            />
          </label>
        </div>
      </Panel>

      {status === "error" && (
        <Panel contentClassName="py-3">
          <p className="text-sm text-danger">
            MAFY follow-up agents unavailable. {error}
          </p>
        </Panel>
      )}

      {status === "loading" && (
        <Panel>
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <p className="text-sm">Loading current MAFY action queue.</p>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {filteredItems.map((item, index) => (
            <ActionCard key={item.id} item={item} rank={index + 1} />
          ))}
        </div>

        <Panel
          title="Follow-up weighting"
          subtitle="How MAFY balances referral gaps, risk, workload, and data confidence."
          className="xl:col-span-4"
          action={<SlidersHorizontal className="size-4 text-neon" />}
        >
          <div className="space-y-5">
            {weights.map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-ash">{label}</span>
                  <span className="font-mono text-white">{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-grid/70">
                  <div
                    className="h-full rounded-sm bg-neon"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ActionCard({ item, rank }: { item: FollowUpAction; rank: number }) {
  return (
    <Panel contentClassName="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-muted">#{rank}</span>
            <h2 className="text-xl font-semibold text-white">
              {item.areaName}
            </h2>
            <StatusPill status={item.priority} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {item.region} · {item.actionType}
          </p>
        </div>
        <div className="w-full md:w-44">
          <ScoreBar
            score={item.score}
            tone={item.priority === "High" ? "danger" : "neon"}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Reason</p>
          <p className="mt-2 text-sm leading-6 text-ash">{item.reason}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">
            Field action
          </p>
          <p className="mt-2 text-sm leading-6 text-ash">{item.action}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Owner</p>
          <p className="mt-2 text-sm leading-6 text-ash">
            {item.owner} · {item.dueWindow}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Blockers</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.blockers.map((blocker, index) => (
              <span
                key={`${item.id}-blocker-${index}`}
                className="rounded border border-grid bg-ink-2 px-2 py-1 text-xs text-ash"
              >
                {blocker}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
