import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import ScoreBar from "../components/ui/ScoreBar";
import StatusPill from "../components/ui/StatusPill";
import { queueItems, scoreWeights } from "../data/mafyData";
import type { PriorityLevel } from "../types/analytics";
import { cn } from "../utils/format";

type QueueFilter = PriorityLevel | "All";

const filters: QueueFilter[] = ["All", "High", "Medium", "Low"];

export default function QueuePage() {
  const [filter, setFilter] = useState<QueueFilter>("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return queueItems.filter((item) => {
      const matchesFilter = filter === "All" || item.priority === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.location, item.region, item.reason, item.action]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Use case 4"
        title="Follow-up queue"
        description="Facilities, communes, and activity clusters are ordered by follow-up score, with reasons and recommended field actions attached."
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

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {filteredItems.map((item, index) => (
            <Panel key={item.id} contentClassName="space-y-4">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm text-muted">
                      #{index + 1}
                    </span>
                    <h2 className="text-xl font-semibold text-white">
                      {item.location}
                    </h2>
                    <StatusPill status={item.priority} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{item.region}</p>
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
                  <p className="text-xs font-semibold uppercase text-muted">
                    Reason
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ash">
                    {item.reason}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">
                    Field action
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ash">
                    {item.action}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.evidence.map((evidence) => (
                  <span
                    key={evidence}
                    className="rounded border border-grid bg-ink-2 px-2 py-1 text-xs text-ash"
                  >
                    {evidence}
                  </span>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <Panel
          title="Queue weighting"
          subtitle="Follow-up score composition."
          className="xl:col-span-4"
          action={<SlidersHorizontal className="size-4 text-neon" />}
        >
          <div className="space-y-5">
            {scoreWeights.map((weight) => (
              <div key={weight.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-ash">{weight.label}</span>
                  <span className="font-mono text-white">{weight.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-grid/70">
                  <div
                    className="h-full rounded-sm bg-neon"
                    style={{ width: `${weight.value}%` }}
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
