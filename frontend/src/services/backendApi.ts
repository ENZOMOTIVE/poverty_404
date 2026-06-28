import type {
  AgentRunResponse,
  BackendDatasetSummaryResponse,
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
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function getDatasetSummary(signal?: AbortSignal) {
  return apiFetch<BackendDatasetSummaryResponse>(
    "/api/dataset/summary",
    undefined,
    signal,
  );
}

export async function runFollowUpOperations(
  options: {
    limit?: number;
    includeRationale?: boolean;
  } = {},
  signal?: AbortSignal,
) {
  const response = await apiFetch<AgentRunResponse<FollowUpOperationsResult>>(
    "/api/operations/follow-up",
    {
      method: "POST",
      body: JSON.stringify({ options }),
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
  signal?: AbortSignal,
) {
  return apiFetch<DetailedReportResponse>(
    "/api/reports/detailed",
    {
      method: "POST",
      body: JSON.stringify({
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
  signal?: AbortSignal,
) {
  const response = await apiFetch<AgentRunResponse<WhatIfForecastResult>>(
    "/api/forecast/what-if",
    {
      method: "POST",
      body: JSON.stringify({ options }),
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
