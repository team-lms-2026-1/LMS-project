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

export type DiagnosisStatus = "DRAFT" | "OPEN" | "CLOSED" | string;

export type DiagnosisListItemDto = {
  diagnosisId: number;
  title: string;
  targetGrade: string;
  semesterName: string;
  semesterId?: number | string;
  deptId?: number | string;
  departmentId?: number | string;
  deptName: string;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  status: DiagnosisStatus;
};

export type DiagnosisListResponse = ApiResponse<DiagnosisListItemDto[], PageMeta>;

export type DiagnosisTableProps = {
  items: DiagnosisListItemDto[];
  loading: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export type DiagnosisQuestionType = "SCALE" | "SHORT";

export type DiagnosisCsKey =
  | "criticalThinking"
  | "character"
  | "communication"
  | "collaboration"
  | "creativity"
  | "citizenship";

export type DiagnosisScaleOption = {
  id: string;
  label: string;
  score: number;
};

export type DiagnosisQuestion = {
  id: string;
  title: string;
  type: DiagnosisQuestionType;
  scaleOptions: DiagnosisScaleOption[];
  shortAnswer: string;
  csScores: Record<DiagnosisCsKey, number>;
};

export type DiagnosisCreateQuestionPayload = {
  order: number;
  type: DiagnosisQuestionType;
  text: string;
  label1?: string;
  score1?: number;
  label2?: string;
  score2?: number;
  label3?: string;
  score3?: number;
  label4?: string;
  score4?: number;
  label5?: string;
  score5?: number;
  shortAnswerKey?: string;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
};

export type DiagnosisCreatePayload = {
  title: string;
  semesterId: number;
  targetGrade: number;
  deptId: number;
  startedAt: string;
  endedAt: string;
  status?: string;
  questions: DiagnosisCreateQuestionPayload[];
};

export type DiagnosisDetailValue = {
  title?: string;
  semesterId?: number;
  semesterName?: string;
  responseStats?: DiagnosisResponseStats;
  nonRespondents?: DiagnosisNonRespondentItem[];
  deptName?: string;
  deptValue: string;
  gradeValue: string;
  startedAt: string;
  endedAt: string;
  startedTime?: string;
  endedTime?: string;
  status: string;
  questions: DiagnosisQuestion[];
};

export type DiagnosisFormValue = DiagnosisDetailValue;

export type DiagnosisUpsertPayload = Omit<DiagnosisCreatePayload, "questions"> & {
  questions?: DiagnosisCreateQuestionPayload[];
};

export type DiagnosisResponsePoint = {
  name: string;
  score: number;
};

export type DiagnosisResponseItem = {
  key: DiagnosisCsKey;
  label: string;
  min: number;
  max: number;
  avg?: number;
  points: DiagnosisResponsePoint[];
};

export type DiagnosisResponseStats = {
  totalResponses: number;
  items: DiagnosisResponseItem[];
};

export type DiagnosisDistributionItem = {
  competencyCode?: string;
  score?: number;
  studentName?: string;
  studentHash?: string;
};

export type DiagnosisDistributionData = {
  totalResponseCount?: number;
  distribution?: DiagnosisDistributionItem[];
};

export type DiagnosisDistributionResponse = ApiResponse<DiagnosisDistributionData, null>;

export type DiagnosisNonRespondentItem = {
  id?: number | string;
  studentNumber?: string;
  name?: string;
  email?: string;
};

export type DiagnosisDetailResponse = {
  data?: any;
};

export type DiagnosisDeleteModalProps = {
  open: boolean;
  targetTitle?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
};

export type DiagnosisDeletePageProps = {
  dignosisId: string;
};

export type DiagnosisDetailModalProps = {
  open: boolean;
  onClose: () => void;
  value?: Partial<DiagnosisDetailValue>;
  onEdit?: () => void;
  dignosisId?: string;
  initialTab?: "QUESTION" | "ANSWER";
};

export type DiagnosisDetailLegendItem = {
  key: DiagnosisCsKey;
  label: string;
  min?: number;
  max?: number;
  avg?: number;
};

export type DiagnosisDetailPageProps = {
  dignosisId: string;
};

export type DiagnosisNonRespondentModalProps = {
  open: boolean;
  onClose: () => void;
  deptName?: string;
  dignosisId?: string;
  items?: DiagnosisNonRespondentItem[];
  onSendEmail?: (items: DiagnosisNonRespondentItem[]) => void;
};

export type DiagnosisNonRespondentPageItem = number | "ellipsis";

export type DiagnosisParticipantsItem = {
  targetId?: number;
  studentNumber?: string;
  studentNo?: string;
  name?: string;
  email?: string;
  status?: string | null;
};

export type DiagnosisParticipantsResponse = {
  data?: DiagnosisParticipantsItem[];
};

export type NonRespondentTableProps = {
  items: DiagnosisNonRespondentItem[];
  loading?: boolean;
  startIndex?: number;
};

export type DiagnosisEditPageProps = {
  dignosisId: string;
};

export type DiagnosisEditModalProps = {
  open: boolean;
  onClose: () => void;
  initialValue?: Partial<DiagnosisDetailValue>;
  onSubmit?: (payload: DiagnosisUpsertPayload) => void | Promise<void>;
  dignosisId?: string | number;
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
