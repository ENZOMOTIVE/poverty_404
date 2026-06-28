import type { EnvConfig } from "../config/env";
import { CoordinatorAgent } from "../agents/coordinator-agent";
import { anonymizeRecords } from "../services/anonymization";
import {
  deleteUploadedDataset,
  listDatasets,
  loadContextForDataset,
  saveUploadedDataset,
} from "../services/dataset-store";
import { buildDetailedReport } from "../services/detailed-report";
import { createLlmClient } from "../services/llm";
import type { AgentRequest } from "../types/domain";
import { errorResponse, jsonResponse, optionsResponse } from "./response";

const supportedOperations = new Set<AgentRequest["operation"]>([
  "full-review",
  "data-quality",
  "outreach-load",
  "referral-score",
  "risk-intensity",
  "follow-up-operations",
  "what-if-forecast",
  "report",
]);

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function validateAgentRequest(body: Partial<AgentRequest>): AgentRequest {
  if (!body.operation || !supportedOperations.has(body.operation)) {
    throw new Error(
      `operation must be one of: ${[...supportedOperations].join(", ")}`,
    );
  }

  return {
    operation: body.operation,
    datasetId: body.datasetId,
    options: body.options,
    language: body.language ?? "en",
  };
}

async function readUploadFile(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Upload request must include a file field.");
  }

  return file;
}

function datasetIdFrom(url: URL, body?: Partial<AgentRequest>) {
  return body?.datasetId ?? url.searchParams.get("datasetId") ?? undefined;
}

export async function route(request: Request, config: EnvConfig) {
  const url = new URL(request.url);
  const llm = createLlmClient(config);
  const coordinator = new CoordinatorAgent(llm);

  if (request.method === "OPTIONS") {
    return optionsResponse(config);
  }

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(
        {
          ok: true,
          service: "dfm-mafy-agent-backend",
          llmEnabled: llm.enabled,
        },
        {},
        config,
      );
    }

    if (request.method === "GET" && url.pathname === "/api/agents") {
      return jsonResponse(
        {
          agents: coordinator.listAgents(),
          llmEnabled: llm.enabled,
        },
        {},
        config,
      );
    }

    if (request.method === "GET" && url.pathname === "/api/datasets") {
      return jsonResponse(
        {
          datasets: await listDatasets(config),
        },
        {},
        config,
      );
    }

    if (request.method === "POST" && url.pathname === "/api/datasets/upload") {
      const dataset = await saveUploadedDataset(await readUploadFile(request));

      return jsonResponse({ dataset }, { status: 201 }, config);
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/api/datasets/")) {
      const datasetId = decodeURIComponent(
        url.pathname.replace("/api/datasets/", ""),
      );
      const dataset = await deleteUploadedDataset(datasetId);

      return jsonResponse({ dataset }, {}, config);
    }

    if (request.method === "GET" && url.pathname === "/api/dataset/summary") {
      const context = await loadContextForDataset(
        config,
        datasetIdFrom(url),
      );

      return jsonResponse(
        {
          summary: context.summary,
          topSites: context.siteMetrics.slice(0, 5),
          topCommunes: context.communeMetrics.slice(0, 10),
          monthlyMetrics: context.monthlyMetrics,
        },
        {},
        config,
      );
    }

    if (
      request.method === "GET" &&
      url.pathname === "/api/dataset/anonymization-report"
    ) {
      const context = await loadContextForDataset(
        config,
        datasetIdFrom(url),
      );
      const { report } = anonymizeRecords(context.records);

      return jsonResponse({ report }, {}, config);
    }

    if (request.method === "GET" && url.pathname === "/api/dataset/anonymized") {
      const context = await loadContextForDataset(
        config,
        datasetIdFrom(url),
      );
      const { rows, report } = anonymizeRecords(context.records);

      return jsonResponse({ report, rows }, {}, config);
    }

    if (request.method === "POST" && url.pathname === "/api/agents/run") {
      const body = validateAgentRequest(
        await readJson<Partial<AgentRequest>>(request),
      );
      const context = await loadContextForDataset(config, body.datasetId);
      const output = await coordinator.run(context, body);

      return jsonResponse(output, {}, config);
    }

    if (request.method === "POST" && url.pathname === "/api/operations/follow-up") {
      const body = await readJson<Partial<AgentRequest>>(request);
      const context = await loadContextForDataset(
        config,
        datasetIdFrom(url, body),
      );
      const output = await coordinator.run(context, {
        operation: "follow-up-operations",
        datasetId: body.datasetId,
        options: {
          limit: body.options?.limit ?? 12,
          includeRationale: body.options?.includeRationale ?? true,
        },
        language: body.language ?? "en",
      });

      return jsonResponse(output, {}, config);
    }

    if (request.method === "POST" && url.pathname === "/api/forecast/what-if") {
      const body = await readJson<Partial<AgentRequest>>(request);
      const context = await loadContextForDataset(
        config,
        datasetIdFrom(url, body),
      );
      const output = await coordinator.run(context, {
        operation: "what-if-forecast",
        datasetId: body.datasetId,
        options: {
          limit: body.options?.limit ?? 6,
          includeRationale: body.options?.includeRationale ?? true,
          scenarioId: body.options?.scenarioId ?? "followup-delay",
          horizonMonths: body.options?.horizonMonths ?? 6,
          iterations: body.options?.iterations ?? 1200,
        },
        language: body.language ?? "en",
      });

      return jsonResponse(output, {}, config);
    }

    if (request.method === "POST" && url.pathname === "/api/reports/detailed") {
      const body = await readJson<Partial<AgentRequest>>(request);
      const context = await loadContextForDataset(
        config,
        datasetIdFrom(url, body),
      );
      const output = await coordinator.run(context, {
        operation: "report",
        datasetId: body.datasetId,
        options: {
          limit: body.options?.limit ?? 12,
          includeRationale: body.options?.includeRationale ?? true,
        },
        language: body.language ?? "en",
      });
      const report = buildDetailedReport(context, output.results);

      return jsonResponse(
        {
          coordinator: output.coordinator,
          operation: "detailed-report",
          plan: output.plan,
          report,
        },
        {},
        config,
      );
    }

    return errorResponse("Route not found.", 404, config, {
      method: request.method,
      path: url.pathname,
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Unexpected server error.",
      500,
      config,
    );
  }
}
