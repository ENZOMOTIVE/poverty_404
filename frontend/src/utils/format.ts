import type { PriorityLevel, RiskLevel } from "../types/analytics";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function scoreToPercent(score: number) {
  return Math.round(score * 100);
}

export function priorityFromScore(score: number): PriorityLevel {
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
}

export function riskFromScore(score: number): RiskLevel {
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
}

export function compactMonth(month: string) {
  const [, monthNumber] = month.split("-");
  const date = new Date(`${month}-01T00:00:00`);

  if (Number.isNaN(date.valueOf())) {
    return monthNumber ?? month;
  }

  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}
