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

export type ExtraOfferingStatus =
  | "DRAFT"
  | "OPEN"
  | "ENROLLMENT_CLOSED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | string;

export type ExtraSessionStatus = "OPEN" | "CLOSED" | "CANCELED" | string;
export type ExtraCompletionStatus = "IN_PROGRESS" | "PASSED" | "FAILED" | string;

export type CompetencyCode = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | string;

// DTO
export type ExtraCurricularOfferingUserListItemDto = {
  extraOfferingId: number;
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
};

export type ExtraCurricularOfferingDetailDto = {
  extraOfferingId: number;
  extraCurricularId: number;
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  hostContactPhone: string;
  hostContactEmail: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
  semesterId: number;
  semesterDisplayName: string;
  operationStartAt: string;
  operationEndAt: string;
  status: ExtraOfferingStatus;
  extraCurricularCode: string;
  extraCurricularName: string;
  hostOrgName: string;
  description: string;
};

export type ExtraCurricularOfferingCompetencyDto = {
  competencyId: number;
  code: CompetencyCode;
  name: string;
  description: string;
  weight: number | null;
};

export type ExtraCurricularEnrollmentListItemDto = {
  extraOfferingId: number;
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  semesterName: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
  status: ExtraOfferingStatus;
};

export type StudentExtraGradeTrendItemDto = {
  semesterId: number;
  semesterName: string;
  semesterEarnedPoints: number;
  semesterEarnedHours: number;
};

export type StudentExtraGradeDetailHeaderDto = {
  studentAccountId: number;
  studentName: string;
  studentNo: string;
  deptId: number;
  deptName: string;
  gradeLevel: number;
  totalEarnedPoints: number;
  totalEarnedHours: number;
  trend: StudentExtraGradeTrendItemDto[];
};

export type StudentExtraCompletionListItemDto = {
  applicationId: number;
  semesterId: number;
  semesterName: string;
  extraOfferingCode: string;
  extraOfferingName: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
  completionStatus: ExtraCompletionStatus;
};

export type ExtraSessionListItemDto = {
  sessionId: number;
  sessionName: string;
  startAt: string;
  endAt: string;
  rewardPoint: number;
  recognizedHours: number;
  status: ExtraSessionStatus;
  videoId: number;
  videoTitle: string;
  durationSeconds: number | null;
  isAttended: boolean;
};

export type ExtraSessionVideoDetailDto = {
  videoId: number;
  title: string;
  durationSeconds: number | null;
  previewUrl: string;
};

export type ExtraSessionDetailDto = {
  sessionId: number;
  extraOfferingId: number;
  sessionName: string;
  status: ExtraSessionStatus;
  startAt: string;
  endAt: string;
  rewardPoint: number;
  recognizedHours: number;
  video: ExtraSessionVideoDetailDto;
};

// Response
export type ExtraCurricularOfferingUserListResponse = ApiResponse<
  ExtraCurricularOfferingUserListItemDto[],
  PageMeta
>;
export type ExtraCurricularOfferingDetailResponse = ApiResponse<ExtraCurricularOfferingDetailDto, null>;
export type ExtraCurricularOfferingCompetencyResponse = ApiResponse<
  ExtraCurricularOfferingCompetencyDto[],
  null
>;
export type ExtraCurricularEnrollmentListResponse = ApiResponse<
  ExtraCurricularEnrollmentListItemDto[],
  PageMeta
>;
export type StudentExtraGradeDetailHeaderResponse = ApiResponse<
  StudentExtraGradeDetailHeaderDto,
  null
>;
export type StudentExtraCompletionListResponse = ApiResponse<
  StudentExtraCompletionListItemDto[],
  PageMeta
>;
export type ExtraSessionListResponse = ApiResponse<ExtraSessionListItemDto[], PageMeta>;
export type ExtraSessionDetailResponse = ApiResponse<ExtraSessionDetailDto, null>;
