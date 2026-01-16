import { AccountStatus, AccountType, StudentEnrollmentStatus } from "../types";

export type MajorType = "PRIMARY" | "MINOR";

/** 공통 프로필(학생/교수 공용 + 일부 공통) */
export interface CommonProfileDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  memo?: string | null;

  deptId?: number;

  // STUDENT
  studentNo?: string;
  gradeLevel?: number;
  academicStatus?: StudentEnrollmentStatus;
  majors?: Array<{ majorId: number; majorType: MajorType }>;

  // PROFESSOR
  professorNo?: string;
}

/** 관리자 프로필 */
export interface AdminProfileDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  memo?: string | null;
}

/** 목록 Row */
export interface AccountRowDto {
  accountId: number;
  loginId: string;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;

  /**
   * 서버가 ADMIN도 profile로 내려주면 profile 사용
   * 서버가 ADMIN만 adminProfile로 내려주면 adminProfile 사용
   * (현재 생성 DTO가 adminProfile을 쓰고 있어서 둘 다 열어둠)
   */
  profile?: CommonProfileDto;
  adminProfile?: AdminProfileDto;
}

/** 목록 응답 */
export interface AccountsListResponseDto {
  items: AccountRowDto[];
  total: number;
}

/** 목록/검색 요청 (BFF가 POST로 요구하면 이 형태로 body 보내기 좋음) */
export interface AccountsListRequestDto {
  page: number;
  size: number;
  accountType?: AccountType;
  keyword?: string;
}

/** 생성 요청 */
export interface CreateStudentAccountRequestDto {
  loginId: string;
  password: string;
  accountType: "STUDENT";
  status: AccountStatus;
  profile: {
    name: string;
    email?: string | null;
    phone?: string | null;
    memo?: string | null;

    deptId: number;

    studentNo: string;
    gradeLevel: number;
    academicStatus: StudentEnrollmentStatus;

    majors: Array<{ majorId: number; majorType: MajorType }>;
  };
}

export interface CreateProfessorAccountRequestDto {
  loginId: string;
  password: string;
  accountType: "PROFESSOR";
  status: AccountStatus;
  profile: {
    name: string;
    email?: string | null;
    phone?: string | null;
    memo?: string | null;

    deptId: number;
    professorNo: string;
  };
}

/** 관리자(기존 유지) */
export interface CreateAdminAccountRequestDto {
  loginId: string;
  password: string;
  accountType: "ADMIN";
  status: AccountStatus;
  adminProfile: AdminProfileDto;
}

export type CreateAccountRequestDto =
  | CreateStudentAccountRequestDto
  | CreateProfessorAccountRequestDto
  | CreateAdminAccountRequestDto;

/** 수정 요청: PATCH/PUT 모두 대응하도록 전부 optional 권장 */
export interface UpdateAccountRequestDto {
  status?: AccountStatus;

  profile?: Partial<CommonProfileDto>;

  adminProfile?: Partial<AdminProfileDto>;
}
