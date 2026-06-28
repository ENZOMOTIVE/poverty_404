import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  communeMetrics as fallbackCommuneMetrics,
  monthlyMetrics as fallbackMonthlyMetrics,
  siteMetrics as fallbackSiteMetrics,
  sourceSummary as fallbackSummary,
} from "../data/mafyData";
import { getDatasetSummary } from "../services/backendApi";
import type {
  CommuneMetric,
  MonthlyMetric,
  SiteMetric,
  SourceSummary,
} from "../types/analytics";
import {
  AnalyticsContext,
  type AnalyticsContextValue,
  type BackendStatus,
} from "./analyticsContext";

function mapCommuneMetrics(
  values: AnalyticsContextValue["communeMetrics"],
): CommuneMetric[] {
  return values.map((value) => ({
    id: value.id,
    name: value.name,
    region: value.region,
    district: value.district,
    sessions: value.sessions,
    participants: value.participants,
    referrals: value.referrals,
    uniqueFokontany: value.uniqueFokontany,
    referralGaps: value.referralGaps,
    barriers: value.barriers,
    outreachLoadScore: value.outreachLoadScore,
    referralScore: value.referralScore,
    riskIntensityScore: value.riskIntensityScore,
    followupPriorityScore: value.followupPriorityScore,
  }));
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<SourceSummary>(fallbackSummary);
  const [siteMetrics, setSiteMetrics] =
    useState<SiteMetric[]>(fallbackSiteMetrics);
  const [communeMetrics, setCommuneMetrics] =
    useState<CommuneMetric[]>(fallbackCommuneMetrics);
  const [monthlyMetrics, setMonthlyMetrics] =
    useState<MonthlyMetric[]>(fallbackMonthlyMetrics);
  const [backendStatus, setBackendStatus] =
    useState<BackendStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getDatasetSummary(controller.signal)
      .then((data) => {
        setSummary(data.summary);
        setSiteMetrics(data.topSites);
        setCommuneMetrics(mapCommuneMetrics(data.topCommunes));
        setMonthlyMetrics(data.monthlyMetrics);
        setBackendStatus("live");
        setError(null);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setBackendStatus("offline");
        setError(caught instanceof Error ? caught.message : "API unavailable");
      });

    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => ({
      summary,
      siteMetrics,
      communeMetrics,
      monthlyMetrics,
      backendStatus,
      error,
    }),
    [backendStatus, communeMetrics, error, monthlyMetrics, siteMetrics, summary],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
