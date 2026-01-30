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
export type CurricularOfferingListItemDto = {
  offeringId: number ;
  offeringCode: string;
  curricularName: string;
  capacity: number;
  professorName: string;
  semesterName: string;
  location: string;
  credit: number;
  status: OfferingStatus;
}

export type CurricularOfferingDetailDto = {
  offeringId: number;
  offeringCode: string;

  curricularId: number;
  curricularName: string;
  credits: number;
  description: string;

  deptId: number;
  deptName: string;

  semesterId: number;
  semesterName: string;

  professorAccountId: number;
  professorName: string;
  email: string;
  phone: string;

  dayOfWeek: DayOfWeekType;
  period: number;

  capacity: number;
  enrolledCount: number;

  location: string;
  status: OfferingStatus;
}

/** Response */
export type CurricularOfferingListResponse = ApiResponse<CurricularOfferingListItemDto[], PageMeta>;
export type CurricularDetailFormResponse =ApiResponse<CurricularOfferingDetailDto, null>;

/** Request */
export type CurricularOfferingCreateRequest = {
  offeringCode: string;
  curricularId: number;
  semesterId: number;
  dayOfWeek: DayOfWeekType;
  period: number;
  capacity: number;
  location: string;
  professorAccountId: number;
}

/** 화면용 */