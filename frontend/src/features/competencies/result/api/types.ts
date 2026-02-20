export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

export type ResultSummary = {
  totalCount?: number | null;
  calculatedCount?: number | null;
  averageScore?: number | null;
};

export type ResultCompetencyRadarItem = {
  name?: string;
  label?: string;
  competencyName?: string;
  value?: number;
  score?: number;
  avgScore?: number;
  weight?: number;
  [key: string]: any;
};

export type ResultCompetencyRadarSeries = {
  deptName?: string;
  department?: string;
  name?: string;
  label?: string;
  items?: ResultCompetencyRadarItem[];
  data?: ResultCompetencyRadarItem[];
  values?: ResultCompetencyRadarItem[];
  [key: string]: any;
};

export type ResultCompetencyTrendSeries = {
  name: string;
  data: number[];
};

export type ResultCompetencyTrendChart = {
  categories: string[];
  series: ResultCompetencyTrendSeries[];
};

export type ResultCompetencyStatRow = {
  name?: string;
  competencyName?: string;
  totalTargets?: number;
  calculatedTargets?: number;
  avgScore?: number;
  averageScore?: number;
  medianScore?: number;
  stdDev?: number;
  calculatedAt?: string;
  [key: string]: any;
};

export type ResultCompetencyDashboard = {
  summary?: ResultSummary;
  overview?: ResultSummary;
  deptNames?: string[];
  departments?: string[];
  radarChart?: ResultCompetencyRadarSeries[] | ResultCompetencyRadarItem[];
  radarCharts?: ResultCompetencyRadarSeries[] | ResultCompetencyRadarItem[];
  trendChart?: ResultCompetencyTrendChart;
  statsTable?: ResultCompetencyStatRow[];
  table?: ResultCompetencyStatRow[];
  [key: string]: any;
};

export type ResultCompetencyDashboardResponse = ApiResponse<ResultCompetencyDashboard, null>;
