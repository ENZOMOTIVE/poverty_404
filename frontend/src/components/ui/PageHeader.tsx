import type { ReactNode } from "react";

interface PageHeaderProps {
  kicker: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function PageHeader({
  kicker,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase text-neon">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ash">
          {description}
        </p>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
}
