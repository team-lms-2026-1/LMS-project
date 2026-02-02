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

export type CurricularOfferingCompetencyDto = {
  competencyId: number;
  code: CompetencyCode;
  name: string;
  description: string;
  weight: number | null;
}

export type CurricularOfferingStudentListItemDto = {
  enrollmentId: number;
  studentAccountId: number;
  studentName: string;
  studentNo: string;
  gradeLevel: number;  // 학년
  deptName: string;
  rawScore: number;
  grade: Grade;  //A B C D E F
  enrollmentStatus: EnrollmentStatus;
  completionStatus: CompletionStatus;
}


/** Response */
export type CurricularOfferingListResponse = ApiResponse<CurricularOfferingListItemDto[], PageMeta>;
export type CurricularDetailFormResponse =ApiResponse<CurricularOfferingDetailDto, null>;
export type CurricularOfferingCompetencyResponse = ApiResponse<CurricularOfferingCompetencyDto[], null>;
export type CurricularOfferingStudentResponse = ApiResponse<CurricularOfferingStudentListItemDto[], PageMeta>

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

export type CurricularOfferingDetailUpdateRequest = {
  offeringCode: string;
  semesterId: number;
  dayOfWeek: DayOfWeekType;
  period: number;
  capacity: number;
  location: string;
  professorAccountId: number;
}

export type OfferingScorePatchRequest = {
  rawScore: number;
};

export type CurricularOfferingStatusUpdateRequest = {
  status: OfferingStatus;
}

/** Request - 역량 맵핑(단건 아이템) */
export type CurricularOfferingCompetencyMappingItem = {
  competencyId: number;
  weight: number; // 1~6
};

/** Request - 역량 맵핑(일괄 수정) */
export type CurricularOfferingCompetencyMappingBulkUpdateRequest = {
  mappings: CurricularOfferingCompetencyMappingItem[];
};

/** 화면용 */