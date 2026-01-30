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
export type DeptListItemDto = {
            deptId: number;
            deptCode: string;
            deptName: string;
            headProfessorName: string;
            studentCount: number;
            professorCount: number;
            isActive: boolean;
}
export type DeptListResponse = ApiResponse<DeptListItemDto[],PageMeta>;
export type SuccessResponse = ApiResponse<{success: boolean},null>;
/** 상세 - 교수 DTO */
export type DeptProfessorListItemDto = {
            proId: string;            //교번
            proName: string;          //이름
            proEmail: string;         //이메일
            proAdd: string;           //연락처
}

export type DeptProfessorListItemDtoResponse = ApiResponse<DeptProfessorListItemDto[],PageMeta>;

export type BackendProfessorItem = {
  accountId: number;
  professorNo: string;
  name: string;
  email: string;
  phone: string;
};

/** 백엔드 교수 목록 응답 */
export type BackendProfessorListResponse = ApiResponse<BackendProfessorItem[], PageMeta>;

/** 상세 - 학생 DTO */
export type DeptStudentListItemDto = {
            stuId: string;              //학번
            stuName: string;            //이름
            stuClass: number;           //학년
            stuStatus: string;          //재학 상태
            stuMajor: string            //전공명
}

export type DeptStudentListItemDtoResponse = ApiResponse<DeptStudentListItemDto[],PageMeta>;

export type BackendStudentItem = {
  studentNo: string;
  name: string;
  gradeLevel: number;
  academicStatus: string;
  majorName: string;
};

/** 백엔드 학생 목록 응답 */
export type BackendStudentListResponse = ApiResponse<BackendStudentItem[], PageMeta>;

/** 상세 - 전공 DTO */
export type DeptMajorListItemDto = {
            majName: string;
            majCount: number;
}

export type DeptmajorListItemDtoResponse = ApiResponse<DeptMajorListItemDto[],PageMeta>;
/**Response */
export type BackendMajorItem = {
  majorId: number;
  majorName: string;
  studentCount: number;
};

/** 백엔드 전공 목록 응답 */
export type BackendMajorListResponse = ApiResponse<BackendMajorItem[], PageMeta>;