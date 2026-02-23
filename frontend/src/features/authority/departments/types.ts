/* =========================
 * Backend API response types
 * ========================= */

// Department list API response
export type DeptListResponse = {
  data: DeptItem[];
  meta: PageMeta;
};

// Department item (matches backend DTO)
export type DeptItem = {
  deptId: number;
  deptCode: string;
  deptName: string;
  headProfessorName: string | null;
  studentCount?: number;
  professorCount?: number;
  isActive?: boolean;
};

// Pagination metadata
export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

/* =========================
 * UI model types
 * ========================= */

// Department model used in the UI
export type Department = {
  id: string;              // UI uses string IDs
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
  status?: "ACTIVE" | "INACTIVE" | string;
  headProfessor?: string;
  studentCount?: number;
  professorCount?: number;
  isActive?: boolean;
};

/* =========================
 * Mapping helpers
 * ========================= */

// Backend DeptItem -> UI Department
export function mapDeptItemToDepartment(item: DeptItem): Department {
  return {
    id: String(item.deptId),                // number -> string
    code: item.deptCode,
    name: item.deptName,
    headProfessor: item.headProfessorName ?? "",
    studentCount: item.studentCount,
    professorCount: item.professorCount,
    isActive: item.isActive,
  };
}

// Map list
export function mapDeptItemsToDepartments(
  items: DeptItem[]
): Department[] {
  return items.map(mapDeptItemToDepartment);
}

export type Professor = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type Major = {
  id: string;
  code: string;
  name: string;
};

export type DepartmentDetail = {
  department: Department;
  professors: Professor[];
  students: Student[];
  majors: Major[];
};

export type DepartmentStatus = "ACTIVE" | "INACTIVE" | string;
