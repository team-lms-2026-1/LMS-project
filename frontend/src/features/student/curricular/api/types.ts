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

export type CompetencyCode = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | string;

export type Grade = "A" | "B" | "C" | "D" | "E" | "F" | string;

/** DTO */
export type CurricularOfferingListItemDto = {
  offeringId: number ;
  offeringCode: string;
  curricularName: string;
  capacity: number;
  professorName: string;
  semesterName: string;
  credit: number;
  enrolledCount: number;
  competencyName1: string;
  competencyName2: string;
}

export type CurricularEnrollmentListItemDto = CurricularOfferingListItemDto

/** Response */
export type CurricularOfferingListResponse = ApiResponse<CurricularOfferingListItemDto[], PageMeta>;
export type CurricularEnrollmentListResponse = CurricularOfferingListResponse