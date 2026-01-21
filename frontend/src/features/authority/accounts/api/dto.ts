import { AccountStatus, AccountType, StudentEnrollmentStatus, MajorType } from "../types";

export type DeptDto = { deptId: number; deptName: string };
export type MajorDto = { majorId: number; majorName: string; deptId?: number };

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

/** 목록/상세 공용 Row */
export interface AccountRowDto {
  accountId: number;
  loginId: string;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;

  profile?: CommonProfileDto;
  adminProfile?: AdminProfileDto;
}

/** 목록 응답 */
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

/** 관리자(프로젝트 기존 유지: adminProfile) */
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

/** 수정 요청 */
export type UpdateAccountRequestDto = {
  // 공통
  status?: "ACTIVE" | "INACTIVE";
  name?: string | null;
  email?: string | null;
  phone?: string | null;

  // STUDENT 전용
  gradeLevel?: number | null;
  academicStatus?: "ENROLLED" | "LEAVE" | "DROPPED" | "GRADUATED" | null;
  majors?: Array<{
    majorId: number;
    majorType: "PRIMARY" | "MINOR" | "DOUBLE";
  }>;

  // PROFESSOR 전용
  deptId?: number | null;

  // ADMIN 전용
  memo?: string | null;

  // (백엔드에 password 필드가 있다면 유지, 없으면 제거)
  password?: string;
};