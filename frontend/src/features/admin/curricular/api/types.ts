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

export type CompletionStatus = "IN_PROGRESS" | "PASSED" | "FAILED" | string;

export type DayOfWeekType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY" | string;

export type EnrollmentStatus = "ENROLLED" |  "CANCELED" | string;

export type OfferingStatus = "DRAFT" | "OPEN" | "ENROLLMENT_CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | string;

/** DTO */
export type CurricularListItemDto = {
    curricularId: number;
    curricularCode: string;
    curricularName: string;
    deptId: number;
    credits: number;
    isActive: boolean;
    deptName: string;
}

export type CurricularEditFormDto = {
  curricularId: number;
  curricularCode: string;
  curricularName: string;
  deptId: number;
  credits: number;
  description: string;
  isActive: boolean;
}

/** Response */
export type CurricularListResponse = ApiResponse<CurricularListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;
export type CurricularEditFormResponse =ApiResponse<CurricularEditFormDto, null>;

/** Request */

export type CurricularCreateRequest = {
  curricularCode: string;
  curricularName: string;
  deptId: number;
  credits: number;
  description: string;
}

export type CurricularPatchRequest = {
  curricularName: string;
  deptId: number;
  credits: number;
  description: string;
  isActive: boolean;
}


/** 화면용 */