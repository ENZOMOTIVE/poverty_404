import type { PriorityLevel, RiskLevel } from "../../types/analytics";
import { cn } from "../../utils/format";

type Status = PriorityLevel | RiskLevel | "Live" | "Stable";

interface StatusPillProps {
  status: Status;
}

const statusClasses: Record<Status, string> = {
  High: "border-danger/45 bg-danger/10 text-danger",
  Medium: "border-amber/45 bg-amber/10 text-amber",
  Low: "border-neon/45 bg-neon/10 text-neon",
  Live: "border-neon/45 bg-neon/10 text-neon",
  Stable: "border-cyan/45 bg-cyan/10 text-cyan",
};

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded border px-2 text-[11px] font-semibold uppercase",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}
