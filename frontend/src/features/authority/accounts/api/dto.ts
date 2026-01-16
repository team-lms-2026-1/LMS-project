import { AccountStatus, AccountType, StudentEnrollmentStatus } from "../types";

export type MajorType = "PRIMARY" | "MINOR";

export interface AccountRowDto {
  accountId: number;
  loginId: string;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  profile?: {
    name: string;
    email?: string | null;
    phone?: string | null;

    deptId?: number;

    studentNo?: string;
    gradeLevel?: number;
    academicStatus?: StudentEnrollmentStatus;

    majors?: Array<{ majorId: number; majorType: MajorType }>;

    professorNo?: string;
    memo?: string | null;

  };
}

export interface AccountsListResponseDto {
  items: AccountRowDto[];
  total: number;
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

    deptId: number;

    studentNo: string;
    gradeLevel: number;
    academicStatus: StudentEnrollmentStatus;

    majors: Array<{ majorId: number; majorType: MajorType }>;
    memo?: string | null;
    
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
  adminProfile: {
    name: string;
    email?: string | null;
    phone?: string | null;
    memo?: string | null;
  };
}

export type CreateAccountRequestDto =
  | CreateStudentAccountRequestDto
  | CreateProfessorAccountRequestDto
  | CreateAdminAccountRequestDto;

/** 수정 요청(기존 쓰던 규칙 유지 or 추후 profile로 통일 가능) */
export interface UpdateAccountRequestDto {
  status?: AccountStatus;

  profile?: {
    name: string;
    email?: string | null;
    phone?: string | null;

    deptId?: number;

    studentNo?: string;
    gradeLevel?: number;
    academicStatus?: StudentEnrollmentStatus;

    majors?: Array<{ majorId: number; majorType: MajorType }>;

    professorNo?: string;
    memo?: string | null;

  };

  adminProfile?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    memo?: string | null;
  };
}
