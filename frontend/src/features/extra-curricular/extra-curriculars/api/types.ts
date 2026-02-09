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

/** DTO */
export type ExtraCurricularListItemDto = {
  extraCurricularId: number;
  extraCurricularCode: string;
  extraCurricularName: string;
  hostOrgName: string;
  isActive: boolean;
  createdAt: string;
}

export type ExtraCurricularEditFormDto = {
  extraCurricularId: number;
  extraCurricularCode: string;
  extraCurricularName: string;
  description: string;
  hostOrgName: string;
  isActive: boolean;
}

/** Response */
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;
export type ExtraCurricularListResponse = ApiResponse<ExtraCurricularListItemDto[], PageMeta>;
export type ExtraCurricularEditFormResponse = ApiResponse<ExtraCurricularEditFormDto, null>; // 단건

/** Request */
export type ExtraCurricularCreateRequest = {
  extraCurricularCode: string;
  extraCurricularName: string;
  description: string;
  hostOrgName: string;
}

export type ExtraCurricularPatchRequest = {
  extraCurricularName: string;
  description: string;
  hostOrgName: string;
  isActive: boolean;
}

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