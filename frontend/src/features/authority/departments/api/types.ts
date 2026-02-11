// 학과 목록 아이템
export interface DepartmentListItem {
    deptId: number;
    deptCode: string; // 학과코드 (TH001)
    deptName: string; // 학과명 (신학과)
    headProfessorName: string | null; // 학과장 (김교수)
    studentCount: number; // 재학생수 (391명)
    professorCount: number; // 교수 수 (10명)
    isActive: boolean; // 사용여부 (on/off)
}

// 학과 상세 - Summary
export interface DepartmentDetailSummary {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    description: string;
    chairProfessor: {
        accountId: number;
        name: string;
    } | null;
    professorCount: number;
    studentCount: {
        enrolled: number;
        leaveOfAbsence: number;
        graduated: number;
    } | null; // 백엔드에서 null 가능성이 있으면
    majorCount: number;
}

// 학과 생성 요청
export interface CreateDepartmentRequest {
    deptCode: string;
    deptName: string;
    description: string;
}

// 학과 수정 요청
export interface UpdateDepartmentRequest {
    deptName: string;
    headProfessorAccountId: number | null;
    description: string;
}

// 학과 활성/비활성 요청
export interface UpdateDepartmentActiveRequest {
    isActive: boolean;
}

// 전공 목록 아이템
export interface MajorListItem {
    majorId: number;
    majorCode: string;
    majorName: string;
    enrolledStudentCount: number;
    isActive: boolean;
    description?: string; // 상세 조회시? 일단 목록엔 없을수도
}

// 전공 생성 요청
export interface CreateMajorRequest {
    majorCode: string;
    majorName: string;
    description: string;
    isActive: boolean;
}

// 전공 수정 요청
export interface UpdateMajorRequest {
    majorName: string;
    description: string;
    isActive: boolean;
}

export interface MajorEditResponse {
    majorId: number;
    majorCode: string; // 전공 코드는 수정 불가 readOnly?
    majorName: string;
    description: string;
    isActive: boolean;
}

// 공통 PageMeta (이미 global/api/types에 있을 수 있지만 여기서 정의하거나 import)
export interface PageMeta {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface DepartmentListResponse {
    data: DepartmentListItem[];
    meta: PageMeta;
}

export interface MajorListResponse {
    data: MajorListItem[];
    meta: PageMeta;
}

// 백엔드: DeptProfessorListItem (accountId, professorNo, name, email, phone)
export interface DepartmentProfessorListItem {
    accountId: number;
    professorNo: string;
    name: string;
    email: string;
    phone: string;
}

// 백엔드: DeptStudentListItem (accountId, studentNo, name, gradeLevel, academicStatus, majorName, email)
export interface DepartmentStudentListItem {
    accountId: number;
    studentNo: string;
    name: string;
    gradeLevel: number;
    academicStatus: string;
    majorName: string | null; // left join으로 null 가능
    email: string;
}

export interface DepartmentProfessorListResponse {
    data: DepartmentProfessorListItem[];
    meta: PageMeta;
}

export interface DepartmentStudentListResponse {
    data: DepartmentStudentListItem[];
    meta: PageMeta;
}

export interface ProfessorDropdownItem {
    accountId: number;
    name: string;
    professorNo: string;
}

export interface DeptUpdateForm {
    deptId: number;
    deptCode: string;
    deptName: string;
    description: string;
    headProfessorAccountId: number | null;
}

export interface DepartmentEditResponse {
    dept: DeptUpdateForm;
    professors: ProfessorDropdownItem[];
}

