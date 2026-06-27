import type { EnvConfig } from "../config/env";
import { CoordinatorAgent } from "../agents/coordinator-agent";
import { anonymizeRecords } from "../services/anonymization";
import { createLlmClient } from "../services/llm";
import { loadAgentContext } from "../services/workbook";
import type { AgentRequest } from "../types/domain";
import { errorResponse, jsonResponse, optionsResponse } from "./response";

const supportedOperations = new Set<AgentRequest["operation"]>([
  "full-review",
  "data-quality",
  "outreach-load",
  "referral-score",
  "risk-intensity",
  "follow-up-simulation",
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
    scenario: body.scenario,
    language: body.language ?? "en",
  };
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

    if (request.method === "GET" && url.pathname === "/api/dataset/summary") {
      const context = loadAgentContext(config.datasetPath);

      return jsonResponse(
        {
          summary: context.summary,
          topSites: context.siteMetrics.slice(0, 5),
          topCommunes: context.communeMetrics.slice(0, 10),
        },
        {},
        config,
      );
    }

    if (
      request.method === "GET" &&
      url.pathname === "/api/dataset/anonymization-report"
    ) {
      const context = loadAgentContext(config.datasetPath);
      const { report } = anonymizeRecords(context.records);

      return jsonResponse({ report }, {}, config);
    }

    if (request.method === "GET" && url.pathname === "/api/dataset/anonymized") {
      const context = loadAgentContext(config.datasetPath);
      const { rows, report } = anonymizeRecords(context.records);

      return jsonResponse({ report, rows }, {}, config);
    }

    if (request.method === "POST" && url.pathname === "/api/agents/run") {
      const body = validateAgentRequest(
        await readJson<Partial<AgentRequest>>(request),
      );
      const context = loadAgentContext(config.datasetPath);
      const output = await coordinator.run(context, body);

      return jsonResponse(output, {}, config);
    }

    if (
      request.method === "POST" &&
      url.pathname === "/api/simulations/follow-up"
    ) {
      const body = await readJson<Partial<AgentRequest>>(request);
      const context = loadAgentContext(config.datasetPath);
      const output = await coordinator.run(context, {
        operation: "follow-up-simulation",
        scenario: body.scenario,
        language: body.language ?? "en",
      });

      return jsonResponse(output, {}, config);
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
