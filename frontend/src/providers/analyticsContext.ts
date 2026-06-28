import { createContext, useContext } from "react";
import type {
  CommuneMetric,
  DatasetMetadata,
  MonthlyMetric,
  SiteMetric,
  SourceSummary,
} from "../types/analytics";

export type BackendStatus = "loading" | "live" | "offline";

export interface GeoFilter {
  level: "region" | "district";
  value: string;
}

export interface AnalyticsContextValue {
  summary: SourceSummary;
  siteMetrics: SiteMetric[];
  communeMetrics: CommuneMetric[];
  monthlyMetrics: MonthlyMetric[];
  backendStatus: BackendStatus;
  error: string | null;
  datasetId: string;
  datasets: DatasetMetadata[];
  allSiteMetrics: SiteMetric[];
  allCommuneMetrics: CommuneMetric[];
  geoFilter: GeoFilter | null;
  setGeoFilter: (filter: GeoFilter | null) => void;
  setDatasetId: (datasetId: string) => void;
  refreshDatasets: () => Promise<void>;
  uploadDataset: (file: File) => Promise<DatasetMetadata>;
  deleteDataset: (datasetId: string) => Promise<DatasetMetadata>;
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
