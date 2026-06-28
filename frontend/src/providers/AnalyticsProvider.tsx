import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  communeMetrics as fallbackCommuneMetrics,
  monthlyMetrics as fallbackMonthlyMetrics,
  siteMetrics as fallbackSiteMetrics,
  sourceSummary as fallbackSummary,
} from "../data/mafyData";
import {
  deleteDataset as deleteDatasetFile,
  getDatasetSummary,
  listDatasets,
  uploadDataset as uploadDatasetFile,
} from "../services/backendApi";
import type {
  CommuneMetric,
  DatasetMetadata,
  MonthlyMetric,
  SiteMetric,
  SourceSummary,
} from "../types/analytics";
import {
  AnalyticsContext,
  type AnalyticsContextValue,
  type BackendStatus,
  type GeoFilter,
} from "./analyticsContext";

const activeDatasetStorageKey = "mafy-active-dataset-id";

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
  const [datasetId, setDatasetIdState] = useState(() => {
    return window.localStorage.getItem(activeDatasetStorageKey) ?? "default";
  });
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
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
  const [geoFilter, setGeoFilter] = useState<GeoFilter | null>(null);

  const setDatasetId = useCallback((nextDatasetId: string) => {
    setBackendStatus("loading");
    setError(null);
    setDatasetIdState(nextDatasetId);
    window.localStorage.setItem(activeDatasetStorageKey, nextDatasetId);
  }, []);

  const refreshDatasets = useCallback(async () => {
    const data = await listDatasets();

    setDatasets(data.datasets);
  }, []);

  const uploadDataset = useCallback(
    async (file: File) => {
      const response = await uploadDatasetFile(file);

      await refreshDatasets();

      if (response.dataset.status === "ready") {
        setDatasetId(response.dataset.id);
      }

      return response.dataset;
    },
    [refreshDatasets, setDatasetId],
  );

  const deleteDataset = useCallback(
    async (targetDatasetId: string) => {
      const response = await deleteDatasetFile(targetDatasetId);

      if (targetDatasetId === datasetId) {
        setDatasetId("default");
      }

      await refreshDatasets();

      return response.dataset;
    },
    [datasetId, refreshDatasets, setDatasetId],
  );

  useEffect(() => {
    const controller = new AbortController();

    listDatasets(controller.signal)
      .then((data) => {
        setDatasets(data.datasets);
      })
      .catch(() => {
        setDatasets([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getDatasetSummary(datasetId, controller.signal)
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
  }, [datasetId]);

  const filteredSiteMetrics = useMemo(() => {
    if (!geoFilter) return siteMetrics;
    return siteMetrics.filter((site) =>
      geoFilter.level === "region"
        ? site.region === geoFilter.value
        : site.district === geoFilter.value,
    );
  }, [siteMetrics, geoFilter]);

  const filteredCommuneMetrics = useMemo(() => {
    if (!geoFilter) return communeMetrics;
    return communeMetrics.filter((commune) =>
      geoFilter.level === "region"
        ? commune.region === geoFilter.value
        : commune.district === geoFilter.value,
    );
  }, [communeMetrics, geoFilter]);

  const filteredSummary = useMemo(() => {
    if (!geoFilter) return summary;
    const sites = filteredSiteMetrics;
    return {
      ...summary,
      participants: sites.reduce((t, s) => t + s.participants, 0),
      referrals: sites.reduce((t, s) => t + s.referrals, 0),
      rows: sites.reduce((t, s) => t + s.sessions, 0),
      sites: sites.length,
      regions: new Set(sites.map((s) => s.region)).size,
    };
  }, [summary, geoFilter, filteredSiteMetrics]);

  const value = useMemo(
    () => ({
      summary: filteredSummary,
      siteMetrics: filteredSiteMetrics,
      communeMetrics: filteredCommuneMetrics,
      monthlyMetrics,
      backendStatus,
      error,
      datasetId,
      datasets,
      allSiteMetrics: siteMetrics,
      allCommuneMetrics: communeMetrics,
      geoFilter,
      setGeoFilter,
      setDatasetId,
      refreshDatasets,
      uploadDataset,
      deleteDataset,
    }),
    [
      backendStatus,
      communeMetrics,
      filteredCommuneMetrics,
      filteredSiteMetrics,
      filteredSummary,
      datasetId,
      datasets,
      deleteDataset,
      error,
      geoFilter,
      monthlyMetrics,
      refreshDatasets,
      setDatasetId,
      siteMetrics,
      uploadDataset,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
