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

export type SemesterListItemDto = {
  semesterId: number;
  year: number;
  term: SemesterTerm;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
};

export type SemesterListResponse = {
  data: SemesterListItemDto[];
  meta: PageMeta;
};

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

export type SemesterCreateRequest = {
  year: number;
  term: "FIRST" | "SECOND" | "SUMMER" | "WINTER" | string;
  startDate: string; // "2026-03-02"
  endDate: string;   // "2026-06-20"
  status: "PLANNED" | "ACTIVE" | "CLOSED" | string;
};

export type SuccessResponse = {
    data: { success: boolean};
    meta: null;
}