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

export type MajorType= "PRIMARY" | "DOUBLE" | "MINOR" | string;

/** DTO */
export type DeptListItemDto={
            deptId: number;
            deptCode: string;
            deptName: string;
            headProfessorName: string;
            studentCount: number;
            professorCount: number;
            isActive: boolean;
}

/**Response */
export type DeptListResponse = ApiResponse<DeptListItemDto[],PageMeta>;
export type SuccessResponse = ApiResponse<{success: boolean},null>;

