import { createContext, useContext } from "react";
import type {
  CommuneMetric,
  SiteMetric,
  SourceSummary,
} from "../types/analytics";

export type BackendStatus = "loading" | "live" | "offline";

export interface AnalyticsContextValue {
  summary: SourceSummary;
  siteMetrics: SiteMetric[];
  communeMetrics: CommuneMetric[];
  backendStatus: BackendStatus;
  error: string | null;
}

export const AnalyticsContext =
  createContext<AnalyticsContextValue | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalytics must be used inside AnalyticsProvider.");
  }

  return context;
}
