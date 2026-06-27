import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: PanelProps) {
  return (
    <section className={cn("panel-surface", className)}>
      {(title || subtitle || action) && (
        <div className="flex min-h-12 items-start justify-between gap-4 border-b border-grid/60 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold uppercase text-ash">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  );
}
