import type {
  AgentRunResponse,
  BackendDatasetSummaryResponse,
  DatasetMetadata,
  DetailedReportResponse,
  FollowUpOperationsResult,
  WhatIfForecastResult,
  WhatIfScenarioId,
} from "../types/analytics";

const defaultApiBaseUrl = "http://127.0.0.1:8787";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? defaultApiBaseUrl;

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  signal?: AbortSignal,
) {
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    signal,
    headers,
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function queryForDataset(datasetId: string | undefined) {
  if (!datasetId || datasetId === "default") return "";

  return `?datasetId=${encodeURIComponent(datasetId)}`;
}

export function listDatasets(signal?: AbortSignal) {
  return apiFetch<{ datasets: DatasetMetadata[] }>(
    "/api/datasets",
    undefined,
    signal,
  );
}

export function uploadDataset(file: File, signal?: AbortSignal) {
  const formData = new FormData();

  formData.append("file", file);

  return apiFetch<{ dataset: DatasetMetadata }>(
    "/api/datasets/upload",
    {
      method: "POST",
      body: formData,
    },
    signal,
  );
}

export function deleteDataset(datasetId: string, signal?: AbortSignal) {
  return apiFetch<{ dataset: DatasetMetadata }>(
    `/api/datasets/${encodeURIComponent(datasetId)}`,
    {
      method: "DELETE",
    },
    signal,
  );
}

export function getDatasetSummary(
  datasetId?: string,
  signal?: AbortSignal,
) {
  return apiFetch<BackendDatasetSummaryResponse>(
    `/api/dataset/summary${queryForDataset(datasetId)}`,
    undefined,
    signal,
  );
}

export async function runFollowUpOperations(
  options: {
    limit?: number;
    includeRationale?: boolean;
  } = {},
  datasetId?: string,
  signal?: AbortSignal,
) {
  const response = await apiFetch<AgentRunResponse<FollowUpOperationsResult>>(
    "/api/operations/follow-up",
    {
      method: "POST",
      body: JSON.stringify({ datasetId, options }),
    },
    signal,
  );
  const operations = response.results.find(
    (result) => result.operation === "follow-up-operations",
  )?.data;

  if (!operations) {
    throw new Error("Operations response did not include action data.");
  }

  return operations;
}

export function generateDetailedReport(
  options: {
    limit?: number;
    includeRationale?: boolean;
  },
  datasetId?: string,
  signal?: AbortSignal,
) {
  return apiFetch<DetailedReportResponse>(
    "/api/reports/detailed",
    {
      method: "POST",
      body: JSON.stringify({
        datasetId,
        options,
        language: "en",
      }),
    },
    signal,
  );
}

export async function runWhatIfForecast(
  options: {
    limit?: number;
    includeRationale?: boolean;
    scenarioId?: WhatIfScenarioId;
    horizonMonths?: number;
    iterations?: number;
  } = {},
  datasetId?: string,
  signal?: AbortSignal,
) {
  const response = await apiFetch<AgentRunResponse<WhatIfForecastResult>>(
    "/api/forecast/what-if",
    {
      method: "POST",
      body: JSON.stringify({ datasetId, options }),
    },
    signal,
  );
  const forecast = response.results.find(
    (result) => result.operation === "what-if-forecast",
  )?.data;

  if (!forecast) {
    throw new Error("Forecast response did not include what-if data.");
  }

  return forecast;
}
