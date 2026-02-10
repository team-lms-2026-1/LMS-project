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
  | "convergence";

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

export type DiagnosisCreatePayload = {
  deptValue: string;
  gradeValue: string;
  startedAt: string;
  endedAt: string;
  status: string;
  questions: DiagnosisQuestion[];
};

export type DiagnosisDetailValue = {
  deptValue: string;
  gradeValue: string;
  startedAt: string;
  endedAt: string;
  status: string;
  questions: DiagnosisQuestion[];
};

export type DiagnosisFormValue = DiagnosisDetailValue;

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
