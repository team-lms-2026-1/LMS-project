export type AccountType = "STUDENT" | "PROFESSOR" | "ADMIN";
export type AccountStatus = "ACTIVE" | "INACTIVE";

export type StudentAcademicStatus = "ENROLLED" | "DROPPED" | "LEAVE" | "GRADUATED";

/** 학생 전공 구분 */
export type MajorType = "PRIMARY" | "MINOR";

export interface Account {
  accountId: number;            // 계정_id (bigint)
  loginId: string;              // 로그인아이디
  accountType: AccountType;     // 계정유형
  status: AccountStatus;        // 상태
  lastLoginAt?: string | null;  // 최종로그인일시 ISO
  passwordChangedAt?: string | null;
  createdAt: string;            // 생성일시 ISO
  updatedAt: string;            // 수정일시 ISO
}

export type StudentEnrollmentStatus = StudentAcademicStatus;

/**
 * ✅ 새 규칙 반영
 * - deptId
 * - gradeLevel
 * - academicStatus
 * - majors[{majorId, majorType}]
 */
export interface StudentProfile {
  accountId: number;

  studentNo: string;            // 학번
  name: string;
  email?: string | null;
  phone?: string | null;

  deptId: number;               // 소속학과_id (규칙: deptId)
  gradeLevel: number;           // 1~4 (규칙: gradeLevel)
  academicStatus: StudentAcademicStatus; // (규칙: academicStatus)

  majors: Array<{ majorId: number; majorType: MajorType }>; // (규칙: majors)

  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ 새 규칙 반영
 * - deptId
 */
export interface ProfessorProfile {
  accountId: number;

  professorNo: string;          // 교번
  name: string;
  email?: string | null;
  phone?: string | null;

  deptId: number;               // 소속학과_id (규칙: deptId)

  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ 관리자는 기존 유지 (memo 유지)
 * (요청에서 "관리자는 일단 사용하던거 그대로"라고 했음)
 */
export interface AdminProfile {
  accountId: number;

  name: string;
  email?: string | null;
  phone?: string | null;
  memo?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface AccountRowView {
  account: Account;

  // 목록/수정 모달에서 “조인된 프로필”을 함께 둠 (없을 수 있음)
  studentProfile?: StudentProfile;
  professorProfile?: ProfessorProfile;
  adminProfile?: AdminProfile;
}

/**
 * 학과 옵션(교수/학생의 deptId 선택용)
 * - 기존 departmentId 명칭을 유지해도 되지만,
 *   실제 요청 규칙이 deptId라서, 옵션도 deptId 기반으로 쓰는 게 충돌이 적음.
 */
export interface DepartmentOption {
  deptId: number;
  name: string;
}

/**
 * (선택) 전공 옵션(majors 선택용)
 * 지금 UI에서 majorId를 숫자 input으로 받고 있다면 없어도 됩니다.
 * 드롭다운으로 바꿀 때 사용하세요.
 */
export interface MajorOption {
  majorId: number;
  name: string;
}
