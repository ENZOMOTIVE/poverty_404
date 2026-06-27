export type AgentOperation =
  | "full-review"
  | "data-quality"
  | "outreach-load"
  | "referral-score"
  | "risk-intensity"
  | "follow-up-simulation"
  | "report";

export type PriorityLevel = "High" | "Medium" | "Low";

export interface SensitisationRecord {
  referral: string;
  formid: string;
  region: string;
  district: string;
  commune: string;
  fokontany: string;
  gps: string;
  uid: string;
  dateActivity: string;
  startTime: string;
  endTime: string;
  staffResponsible: string;
  locationType: string;
  csbName: string;
  locationName: string;
  primaryThemeMafy: string;
  participantType: string;
  totalParticipants: number;
  menCount: number;
  womenCount: number;
  participantQuestions: string;
  referralsMade: number;
  observation: string;
  difficulties: string;
  successes: string;
  durationMinutes: number;
  site: string;
  month: string;
  period: string;
  raw: Record<string, unknown>;
}

export interface DatasetSummary {
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

export interface AreaMetric {
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
  themeSessions: number;
  dataQualityPenalty: number;
  referralGaps: number;
  referralRate: number;
  outreachLoadScore: number;
  referralScore: number;
  riskIntensityScore: number;
  followupPriorityScore: number;
}

export interface QualityFinding {
  id: string;
  label: string;
  count: number;
  severity: PriorityLevel;
  description: string;
  affectedIds: string[];
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

export interface AgentRequest {
  operation: AgentOperation;
  scenario?: {
    unprioritizedAreaId?: string;
    months?: number;
  } | undefined;
  language?: "en" | "fr" | undefined;
}

export interface AgentFinding {
  title: string;
  severity: PriorityLevel;
  evidence: string[];
  recommendation: string;
}

export interface AgentResult<T = unknown> {
  agent: string;
  operation: AgentOperation;
  summary: string;
  findings: AgentFinding[];
  data: T;
  usedLLM: boolean;
}

export interface AgentContext {
  records: SensitisationRecord[];
  summary: DatasetSummary;
  siteMetrics: AreaMetric[];
  communeMetrics: AreaMetric[];
}

export interface AnonymizedRecord {
  recordCode: string;
  regionCode: string;
  districtCode: string;
  communeCode: string;
  siteCode: string;
  month: string;
  locationType: string;
  themeCode: string;
  participantTypeCode: string;
  totalParticipants: number;
  menCount: number;
  womenCount: number;
  referralsMade: number;
  durationMinutes: number;
  hasGps: boolean;
  barrierSignal: boolean;
  highRiskGroupSignal: boolean;
  themeSignal: boolean;
  referralGap: boolean;
  dataQualityPenalty: number;
}

export interface AnonymizationReport {
  sourceRows: number;
  anonymizedRows: number;
  directIdentifierFieldsRemoved: string[];
  freeTextFieldsMinimized: string[];
  generalizedFields: string[];
  pseudonymizedFields: string[];
  retainedFields: string[];
  notes: string[];
}
