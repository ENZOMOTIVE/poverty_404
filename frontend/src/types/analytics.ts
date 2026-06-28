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
  monthlyMetrics: MonthlyMetric[];
}

export interface AgentFinding {
  title: string;
  severity: PriorityLevel;
  evidence: string[];
  recommendation: string;
}

export type FollowUpActionType =
  | "Referral recording audit"
  | "Data quality cleanup"
  | "CSB follow-up coordination"
  | "Outreach load review";

export interface OperationsAgentStep {
  agent: string;
  decision: string;
  evidence: string[];
}

export interface FollowUpAction {
  id: string;
  areaId: string;
  areaName: string;
  region: string;
  district: string;
  priority: PriorityLevel;
  score: number;
  actionType: FollowUpActionType;
  action: string;
  owner: string;
  dueWindow: string;
  status: "Ready for field review";
  reason: string;
  evidence: string[];
  blockers: string[];
  metrics: {
    participants: number;
    sessions: number;
    referrals: number;
    referralGaps: number;
    dataQualityPenalty: number;
    highRiskSessions: number;
    outreachLoadScore: number;
    referralScore: number;
    riskIntensityScore: number;
    followupPriorityScore: number;
  };
}

export interface OperationsRationale {
  mode: "rules" | "llm-assisted";
  summary: string;
  agentSteps: OperationsAgentStep[];
  llmSummary?: string;
}

export interface FollowUpOperationsResult {
  generatedAt: string;
  subAgents: string[];
  summary: string;
  actions: FollowUpAction[];
  rationale?: OperationsRationale;
}

export type WhatIfScenarioId =
  | "followup-delay"
  | "referral-backlog"
  | "data-quality-drift";

export interface WhatIfScenarioConfig {
  id: WhatIfScenarioId;
  label: string;
  description: string;
  assumptions: string[];
}

export interface WhatIfForecastPoint {
  monthIndex: number;
  label: string;
  baseline: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface WhatIfAreaForecast {
  areaId: string;
  areaName: string;
  region: string;
  district: string;
  currentScore: number;
  projectedMedian: number;
  projectedP90: number;
  riskDelta: number;
  volatility: number;
  rank: number;
  drivers: string[];
  trajectory: WhatIfForecastPoint[];
}

export interface WhatIfRaceStanding {
  areaId: string;
  areaName: string;
  region: string;
  value: number;
  delta: number;
  rank: number;
}

export interface WhatIfRaceFrame {
  monthIndex: number;
  label: string;
  standings: WhatIfRaceStanding[];
}

export interface WhatIfRationale {
  mode: "rules" | "llm-assisted";
  summary: string;
  agentSteps: OperationsAgentStep[];
  llmSummary?: string;
}

export interface WhatIfForecastResult {
  generatedAt: string;
  scenario: WhatIfScenarioConfig;
  horizonMonths: number;
  iterations: number;
  subAgents: string[];
  summary: string;
  areas: WhatIfAreaForecast[];
  raceFrames: WhatIfRaceFrame[];
  rationale?: WhatIfRationale;
}

export interface AgentResult<T = unknown> {
  agent: string;
  operation: string;
  summary: string;
  findings: AgentFinding[];
  data: T;
  usedLLM: boolean;
}

export interface DetailedReport {
  generatedAt: string;
  title: string;
  dataset: SourceSummary;
  executiveSummary: string;
  usedLLM: boolean;
  sourceAgents: string[];
  agentResults: AgentResult[];
  siteMetrics: SiteMetric[];
  communeMetrics: Array<
    CommuneMetric & {
      totalOutreachMinutes?: number;
      highRiskSessions?: number;
      themeSessions?: number;
      dataQualityPenalty?: number;
      referralRate?: number;
    }
  >;
  monthlyMetrics: MonthlyMetric[];
  operations: FollowUpOperationsResult | undefined;
  chartData: {
    monthlyActivity: MonthlyMetric[];
    siteScores: SiteMetric[];
    communeQueue: Array<
      CommuneMetric & {
        totalOutreachMinutes?: number;
        highRiskSessions?: number;
        themeSessions?: number;
        dataQualityPenalty?: number;
        referralRate?: number;
      }
    >;
    operationsQueue: FollowUpAction[];
  };
}

export interface DetailedReportResponse {
  coordinator: string;
  operation: "detailed-report";
  plan: string[];
  report: DetailedReport;
}

export interface AgentRunResponse<T = unknown> {
  coordinator: string;
  operation: string;
  plan: string[];
  results: Array<AgentResult<T>>;
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
