import type {
  AgentRunResponse,
  BackendDatasetSummaryResponse,
  SimulationResult,
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

export async function runFollowUpSimulation(
  scenario: { unprioritizedAreaId: string; months: number },
  signal?: AbortSignal,
) {
  const response = await apiFetch<AgentRunResponse<SimulationResult>>(
    "/api/simulations/follow-up",
    {
      method: "POST",
      body: JSON.stringify({ scenario }),
    },
    signal,
  );
  const simulation = response.results.find(
    (result) => result.operation === "follow-up-simulation",
  )?.data;

  if (!simulation) {
    throw new Error("Simulation response did not include simulation data.");
  }

  return simulation;
}
