import type {
  AgentContext,
  AgentRequest,
  AreaMetric,
  SimulationMonth,
  SimulationResult,
} from "../types/domain";
import { priorityFromIndex } from "../utils/scoring";
import { result, type SpecialistAgent } from "./base";

const seasonalityBySite: Record<string, number[]> = {
  taolagnaro: [2, -1, -4, 3, 5, 1],
  "ampanihy-ouest": [5, 8, 6, 2, -1, 3],
  "toliary-i": [-2, 4, 9, 11, 7, 2],
};

const sensitivityBySite: Record<string, number> = {
  taolagnaro: 0.85,
  "ampanihy-ouest": 1.12,
  "toliary-i": 1.28,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pressureForArea(
  area: AreaMetric,
  monthIndex: number,
  unprioritizedAreaId: string,
) {
  const monthFactor = monthIndex + 1;
  const gapFactor = Math.min(area.referralGaps / 18, 1);
  const qualityFactor = Math.min(area.dataQualityPenalty / 30, 1);
  const participantFactor = area.participants / 1592;
  const sensitivity = sensitivityBySite[area.id] ?? 1;
  const seasonality = seasonalityBySite[area.id]?.[monthIndex % 6] ?? 0;
  const exposurePressure =
    area.outreachLoadScore * 5 +
    area.riskIntensityScore * 7 +
    gapFactor * 10 +
    qualityFactor * 4 -
    area.referralScore * 3;

  if (area.id === unprioritizedAreaId) {
    const skippedBacklog =
      8 + participantFactor * 5 + (area.referralScore < 0.15 ? 3 : 0);

    return clamp(
      area.followupPriorityScore * 100 +
        monthFactor * (exposurePressure * 0.72 + skippedBacklog) * sensitivity +
        seasonality * sensitivity,
    );
  }

  const routineMitigation =
    area.referralScore * 7 + area.riskIntensityScore * 2 + 2.2;

  return clamp(
    area.followupPriorityScore * 100 +
      monthFactor * (exposurePressure * 0.14 - routineMitigation) +
      seasonality * sensitivity,
  );
}

export class SimulationAgent implements SpecialistAgent<SimulationResult> {
  name = "SimulationAgent";
  operation = "follow-up-simulation" as const;

  async run(context: AgentContext, request: AgentRequest) {
    const unprioritizedAreaId =
      request.scenario?.unprioritizedAreaId ?? context.siteMetrics.at(-1)?.id;
    const months = Math.min(Math.max(request.scenario?.months ?? 6, 1), 12);

    if (!unprioritizedAreaId) {
      throw new Error("No site metrics are available for simulation.");
    }

    const timeline: SimulationMonth[] = [];

    for (let monthIndex = 0; monthIndex < months; monthIndex += 1) {
      context.siteMetrics.forEach((area) => {
        const pressureIndex = Math.round(
          pressureForArea(area, monthIndex, unprioritizedAreaId),
        );

        timeline.push({
          month: `Month ${monthIndex + 1}`,
          areaId: area.id,
          areaName: area.name,
          pressureIndex,
          priority: priorityFromIndex(pressureIndex),
          projectedPeopleExposed: Math.round(
            area.participants *
              (pressureIndex / 100) *
              (area.id === unprioritizedAreaId ? 1.12 : 0.68),
          ),
        });
      });
    }

    const finalRanking = timeline
      .filter((item) => item.month === `Month ${months}`)
      .sort((a, b) => b.pressureIndex - a.pressureIndex);
    const skippedArea = context.siteMetrics.find(
      (area) => area.id === unprioritizedAreaId,
    );

    const simulation: SimulationResult = {
      unprioritizedAreaId,
      months,
      timeline,
      finalRanking,
      narrative: `${skippedArea?.name ?? unprioritizedAreaId} is left without priority action for ${months} months; backlog pressure compounds while routine-prioritized areas can stabilize.`,
    };

    return result(
      this.name,
      this.operation,
      simulation.narrative,
      finalRanking.slice(0, 3).map((item) => ({
        title: `${item.areaName} projected pressure`,
        severity: item.priority,
        evidence: [
          `${item.pressureIndex}/100 pressure index`,
          `${item.projectedPeopleExposed} projected people exposed`,
          `${item.month} final ranking`,
        ],
        recommendation:
          item.priority === "High"
            ? "Prioritise field review before the next cycle."
            : "Keep under routine monitoring unless local context changes.",
      })),
      simulation,
    );
  }
}
