export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string; // YYYY-MM-DD
  status: DepartmentStatus;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Major {
  id: string;
  code: string;
  name: string;
}

export interface DepartmentDetail {
  department: Department;
  professors: Professor[];
  students: Student[];
  majors: Major[];
}
