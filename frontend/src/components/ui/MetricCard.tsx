import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/format";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accent?: "neon" | "cyan" | "amber" | "danger";
}

const accentClasses = {
  neon: "text-neon border-neon/35 bg-neon/8",
  cyan: "text-cyan border-cyan/35 bg-cyan/8",
  amber: "text-amber border-amber/35 bg-amber/8",
  danger: "text-danger border-danger/35 bg-danger/8",
};

export default function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  trend = "neutral",
  accent = "neon",
}: MetricCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="panel-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted">{label}</p>
          <p className="mt-3 truncate text-2xl font-semibold text-white">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-md border",
            accentClasses[accent],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-ash">
        {trend !== "neutral" && (
          <TrendIcon
            className={cn(
              "size-4",
              trend === "up" ? "text-neon" : "text-danger",
            )}
            aria-hidden="true"
          />
        )}
        <span className="line-clamp-2">{detail}</span>
      </div>
    </article>
  );
}
