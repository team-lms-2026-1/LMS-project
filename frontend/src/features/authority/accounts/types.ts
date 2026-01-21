export type AccountType = "STUDENT" | "PROFESSOR" | "ADMIN";
export type AccountStatus = "ACTIVE" | "INACTIVE";

export type StudentAcademicStatus = "ENROLLED" | "DROPPED" | "LEAVE" | "GRADUATED";
export type StudentEnrollmentStatus = StudentAcademicStatus;

/** 학생 전공 구분 */
export type MajorType = "PRIMARY" | "MINOR" | "DOUBLE";

export interface Account {
  accountId: number;
  loginId: string;
  accountType: AccountType;
  status: AccountStatus;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  accountId: number;
  studentNo: string;
  name: string;
  email?: string | null;
  phone?: string | null;

  deptId: number;
  gradeLevel: number;
  academicStatus: StudentAcademicStatus;

  majors: Array<{ majorId: number; majorType: MajorType }>;

  createdAt: string;
  updatedAt: string;
}

export interface ProfessorProfile {
  accountId: number;
  professorNo: string;
  name: string;
  email?: string | null;
  phone?: string | null;

  deptId: number;

  createdAt: string;
  updatedAt: string;
}

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
  studentProfile?: StudentProfile;
  professorProfile?: ProfessorProfile;
  adminProfile?: AdminProfile;
}
