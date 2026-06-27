import { cn, scoreToPercent } from "../../utils/format";

interface ScoreBarProps {
  score: number;
  label?: string;
  tone?: "neon" | "cyan" | "amber" | "danger";
  showValue?: boolean;
}

const fillClasses = {
  neon: "bg-neon shadow-neon",
  cyan: "bg-cyan",
  amber: "bg-amber",
  danger: "bg-danger",
};

export default function ScoreBar({
  score,
  label,
  tone = "neon",
  showValue = true,
}: ScoreBarProps) {
  const percent = scoreToPercent(score);

  return (
    <div className="min-w-0">
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          {label && <span className="truncate text-ash">{label}</span>}
          {showValue && (
            <span className="shrink-0 font-mono text-white">{percent}</span>
          )}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-sm bg-grid/70">
        <div
          className={cn("h-full rounded-sm", fillClasses[tone])}
          style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}
