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

export type SemesterStatus = "PLANNED" | "ACTIVE" | "CLOSED" | string;
export type SemesterTerm = "FIRST" | "SECOND" | "SUMMER" | "WINTER" | string;

/** DTO */
export type SemesterListItemDto = {
  semesterId: number;
  year: number;
  term: SemesterTerm;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
};

export type SemesterDetailDto = {
  semesterId: number;
  year: number;
  term: SemesterTerm;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
};

/** Response */
export type SemesterListResponse = ApiResponse<SemesterListItemDto[], PageMeta>;
export type SemesterDetailResponse = ApiResponse<SemesterDetailDto, null>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

/** Request */
export type SemesterCreateRequest = {
  year: number;
  term: SemesterTerm;
  startDate: string;
  endDate: string;
};

export type SemesterPatchRequest = {
  status: SemesterStatus;
  startDate: string;
  endDate: string;  
}

/** 화면용 */
export type SemesterItem = {
  id: string;
  year: number;
  term: SemesterTerm;
  startDate: string;
  endDate: string;
  period: string;
  status: SemesterStatus;
};
