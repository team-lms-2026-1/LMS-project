export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

export type DiagnosisTargetStatus = "PENDING" | "SUBMITTED" | string;

export enum DiagnosisRunStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum DiagnosisQuestionType {
  SCALE = "SCALE",
  SHORT = "SHORT",
}

export enum DiagnosisQuestionDomain {
  SKILL = "SKILL",
  APTITUDE = "APTITUDE",
}

export type StudentCompetencyListItemDto = {
  accountId: number;
  studentNumber: string;
  deptName: string;
  grade: number;
  name: string;
};

export type StudentCompetencyListResponse = ApiResponse<StudentCompetencyListItemDto[], PageMeta>;

export type StudentCompetencyTableProps = {
  items: StudentCompetencyListItemDto[];
  loading: boolean;
};

export type StudentCompetencyProfile = {
  name: string;
  studentNumber: string;
  deptName: string;
  grade: number;
};

export type StudentCompetencySummary = {
  maxScore: number | null;
  recentAvg: number | null;
  lastEvaluationDate: string | null;
};

export type StudentCompetencyRadarItem = {
  name?: string;
  label?: string;
  competencyName?: string;
  value?: number;
  score?: number;
  myScore?: number;
  avgScore?: number;
  maxScore?: number;
  weight?: number;
  [key: string]: any;
};

export type StudentCompetencyTrendSeries = {
  name: string;
  data: number[];
};

export type StudentCompetencyTrendChart = {
  categories: string[];
  series: StudentCompetencyTrendSeries[];
};

export type StudentCompetencyStatRow = {
  name?: string;
  competencyName?: string;
  myScore?: number;
  score?: number;
  avgScore?: number;
  maxScore?: number;
  deptAvgScore?: number;
  deptMaxScore?: number;
  [key: string]: any;
};

export type StudentCompetencyDashboard = {
  profile: StudentCompetencyProfile;
  summary: StudentCompetencySummary;
  radarChart: StudentCompetencyRadarItem[];
  trendChart: StudentCompetencyTrendChart;
  myStatsTable: StudentCompetencyStatRow[];
  comparisonTable: StudentCompetencyStatRow[];
};

export type StudentCompetencyDashboardResponse = ApiResponse<StudentCompetencyDashboard, null>;
