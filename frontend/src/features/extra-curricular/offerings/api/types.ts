import { Page } from "@/features/community/categories/api/types";

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

export type ExtraOfferingStatus = "DRAFT" | "OPEN" | "ENROLLMENT_CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | string;

export type ExtraSessionStatus = "OPEN" | "CLOSED" | "CANCELED" | string;

export type CompetencyCode = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | string;


/** DTO */
export type ExtraCurricularOfferingListItemDto = {
  extraOfferingId: number;
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
  status: ExtraOfferingStatus;
}

export type ExtraCurricularOfferingDetailDto = {
  // offering
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

  // ✅ extra curricular master (추가)
  extraCurricularCode: string;
  extraCurricularName: string;
  hostOrgName: string;
  description: string; // 비고에 표시
};

export type ExtraCurricularOfferingCompetencyDto = {
  competencyId: number;
  code: CompetencyCode;
  name: string;
  description: string;
  weight: number | null;
}

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
  durationSeconds: number;
}

export type ExtraSessionVideoDetailDto = {
  videoId: number;
  title: string;
  durationSeconds: number;
  previewUrl: string; // presigned GET url
};

export type ExtraSessionDetailDto = {
  sessionId: number;
  extraOfferingId: number;
  sessionName: string;
  status: ExtraSessionStatus;

  startAt: string; // ISO-8601
  endAt: string;   // ISO-8601

  rewardPoint: number;
  recognizedHours: number;

  video: ExtraSessionVideoDetailDto;
};

/** Response */
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;
export type ExtraCurricularOfferingListResponsee = ApiResponse<ExtraCurricularOfferingListItemDto[], PageMeta>;
export type ExtraCurricularOfferingDetailResponse = ApiResponse<ExtraCurricularOfferingDetailDto, null>;
export type ExtraCurricularOfferingCompetencyResponse = ApiResponse<ExtraCurricularOfferingCompetencyDto[], null>;
export type ExtraSessionListResponse = ApiResponse<ExtraSessionListItemDto[], PageMeta>;
export type ExtraSessionDetailResponse = ApiResponse<ExtraSessionDetailDto, null>

/** Request */
export type ExtraCurricularOfferingCreateRequest = {
  extraCurricularId: number;
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  hostContactPhone: string;
  hostContactEmail: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
  semesterId: number;
  operationStartAt: string;
  operationEndAt: string;
}

export type ExtraCurricularOfferingDetailUpdateRequest = {
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  hostContactPhone: string;
  hostContactEmail: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
  semesterId: number;
  operationStartAt: string;
  operationEndAt: string;
}

// 상태변경
export type ExtraCurricularOfferingStatusUpdateRequest = {
  status: ExtraOfferingStatus;
}

/** Request - 역량 맵핑(단건 아이템) */
export type ExtraCurricularOfferingCompetencyMappingItem = {
  competencyId: number;
  weight: number; // 1~6
};

/** Request - 역량 맵핑(일괄 수정) */
export type ExtraCurricularOfferingCompetencyMappingBulkUpdateRequest = {
  mappings: ExtraCurricularOfferingCompetencyMappingItem[];
};

// 세션생성
export type ExtraSessionVideoCreateRequest = {
  storageKey: string;
  title: string;
  durationSeconds: number;
};

export type ExtraCurricularSessionCreateRequest = {
  sessionName: string;
  startAt: string; // ISO-8601
  endAt: string;   // ISO-8601
  rewardPoint: number;
  recognizedHours: number;
  video: ExtraSessionVideoCreateRequest;
};

// 세션수정
export type ExtraSessionVideoPatchRequest = {
  title?: string | null;
  videoUrl?: string | null;     // 보통은 안 보냄(undefined)
  storageKey?: string | null;
  durationSeconds?: number | null;
};

export type ExtraSessionUpdateRequest = {
  sessionName?: string | null;
  startAt?: string | null;       // ISO-8601 "2026-02-06T00:00:00"
  endAt?: string | null;
  rewardPoint?: number | null;
  recognizedHours?: number | null;
  video?: ExtraSessionVideoPatchRequest | null;
};

// 세션 상태변경
export type ExtraSessionStatusChangeRequest = {
  targetStatus: ExtraSessionStatus;
};

/** ===== Presign (Request/Response) ===== */
export type ExtraSessionVideoPresignRequest = {
  originalFileName: string;
  contentType: string; // "video/mp4"
  contentLength: number; // bytes
};

export type ExtraSessionVideoPresignDto = {
  storageKey: string;
  uploadUrl: string;
  expiresAt: string; // ISO-8601
};

export type ExtraSessionVideoPresignResponse = ApiResponse<ExtraSessionVideoPresignDto, null>;
