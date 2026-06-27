export type ScoreKey =
  | "outreachLoadScore"
  | "referralScore"
  | "riskIntensityScore"
  | "followupPriorityScore";

export type PriorityLevel = "High" | "Medium" | "Low";

export type RiskLevel = "High" | "Medium" | "Low";

export interface SourceSummary {
  dataset: string;
  rows: number;
  columns: number;
  participants: number;
  men: number;
  women: number;
  referrals: number;
  regions: number;
  sites: number;
  months: number;
  gpsMissing: number;
  duplicateUidRows: number;
}

export interface SiteMetric {
  id: string;
  name: string;
  region: string;
  district: string;
  sessions: number;
  participants: number;
  referrals: number;
  uniqueFokontany: number;
  totalOutreachMinutes: number;
  barriers: number;
  highRiskSessions: number;
  dataQualityPenalty: number;
  referralGaps: number;
  outreachLoadScore: number;
  referralScore: number;
  riskIntensityScore: number;
  followupPriorityScore: number;
  referralRate: number;
}

export interface MonthlyMetric {
  month: string;
  sessions: number;
  participants: number;
  referrals: number;
  uniqueFokontany: number;
  outreachLoadScore: number;
  referralScore: number;
  riskIntensityScore: number;
  followupPriorityScore: number;
}

export interface CommuneMetric {
  id: string;
  name: string;
  region: string;
  district: string;
  sessions: number;
  participants: number;
  referrals: number;
  uniqueFokontany: number;
  referralGaps: number;
  barriers: number;
  outreachLoadScore: number;
  referralScore: number;
  riskIntensityScore: number;
  followupPriorityScore: number;
}

export interface BackendDatasetSummaryResponse {
  summary: SourceSummary;
  topSites: SiteMetric[];
  topCommunes: Array<
    CommuneMetric & {
      totalOutreachMinutes?: number;
      highRiskSessions?: number;
      themeSessions?: number;
      dataQualityPenalty?: number;
      referralRate?: number;
    }
  >;
}

export interface SimulationMonth {
  month: string;
  areaId: string;
  areaName: string;
  pressureIndex: number;
  priority: PriorityLevel;
  projectedPeopleExposed: number;
}

export interface SimulationResult {
  unprioritizedAreaId: string;
  months: number;
  timeline: SimulationMonth[];
  finalRanking: SimulationMonth[];
  narrative: string;
}

export interface AgentRunResponse<T = unknown> {
  coordinator: string;
  operation: string;
  plan: string[];
  results: Array<{
    agent: string;
    operation: string;
    summary: string;
    findings: Array<{
      title: string;
      severity: PriorityLevel;
      evidence: string[];
      recommendation: string;
    }>;
    data: T;
    usedLLM: boolean;
  }>;
}

export interface LocationMix {
  name: string;
  value: number;
}

export interface QueueItem {
  id: string;
  priority: PriorityLevel;
  location: string;
  region: string;
  score: number;
  reason: string;
  action: string;
  evidence: string[];
}

export interface QualitySignal {
  label: string;
  count: number;
  severity: PriorityLevel;
  description: string;
}
