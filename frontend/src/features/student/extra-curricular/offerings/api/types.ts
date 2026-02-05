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
export type ExtraCurricularOfferingUserListItemDto = {
  extraOfferingId: number;
  extraOfferingCode: string;
  extraOfferingName: string;
  hostContactName: string;
  rewardPointDefault: number;
  recognizedHoursDefault: number;
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



/** Response */
export type ExtraCurricularOfferingUserListResponse = ApiResponse<ExtraCurricularOfferingUserListItemDto[], PageMeta>;
export type ExtraCurricularOfferingDetailResponse = ApiResponse<ExtraCurricularOfferingDetailDto, null>;

/** Request */


/** 화면용 */


