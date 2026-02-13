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

export type DiagnosisStatus = "PENDING" | "SUBMITTED" | string;

export type DiagnosisListItemDto = {
  diagnosisId: number;
  title: string;
  semesterName: string;
  startedAt: string;
  endedAt: string;
  status: DiagnosisStatus;
  diagnosisStatus?: string;
  displayNo?: number;
};

export type DiagnosisListResponse = ApiResponse<DiagnosisListItemDto[], null>;

export type DiagnosisTableProps = {
  items: DiagnosisListItemDto[];
  loading: boolean;
  onRowClick?: (row: DiagnosisListItemDto) => void;
};

export type DiagnosisBasicInfoDto = {
  diagnosisId: number;
  title: string;
  semesterId?: number;
  targetGrade?: number;
  deptId?: number;
  startedAt?: string;
  endedAt?: string;
  status?: DiagnosisStatus;
};

export type DiagnosisQuestionType = "SCALE" | "SHORT" | string;

export type DiagnosisQuestionDetailDto = {
  questionId: number;
  type: DiagnosisQuestionType;
  text: string;
  order?: number;
  weights?: Record<string, number>;
};

export type DiagnosisDetailDto = {
  basicInfo?: DiagnosisBasicInfoDto;
  questions?: DiagnosisQuestionDetailDto[];
};

export type DiagnosisDetailResponse = ApiResponse<DiagnosisDetailDto, null>;

export type DiagnosisSubmitAnswer = {
  questionId: number;
  scaleValue?: number | null;
  shortText?: string | null;
};

export type DiagnosisSubmitPayload = {
  answers: DiagnosisSubmitAnswer[];
};

export type DignosisDetailModalProps = {
  open: boolean;
  onClose: () => void;
  dignosisId?: number | string;
  onSubmitted?: () => void;
};
