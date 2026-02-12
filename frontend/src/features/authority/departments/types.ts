/* =========================
 *  ë°±ì—”???‘ë‹µ ?€??
 * ========================= */

// ?™ê³¼ ëª©ë¡ API ?„ì²´ ?‘ë‹µ
export type DeptListResponse = {
  data: DeptItem[];
  meta: PageMeta;
};

// ?™ê³¼ ?¨ê±´ (ë°±ì—”??DTO ê·¸ë?ë¡?
export type DeptItem = {
  deptId: number;
  deptCode: string;
  deptName: string;
  headProfessorName: string | null;
  studentCount?: number;
  professorCount?: number;
  isActive?: boolean;
};

// ?˜ì´ì§€ ë©”í? ?•ë³´
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
 *  ?”ë©´ ?„ìš© ?€??
 * ========================= */

// ?”ë©´(DeptsPage)?ì„œ ?¬ìš©?˜ëŠ” ?™ê³¼ ?€??
export type Department = {
  id: string;              // ?”ë©´?ì„œ??string ID ?¬ìš©
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
 *  ë§¤í•‘ ?¨ìˆ˜
 * ========================= */

// ë°±ì—”??DeptItem ???”ë©´ Department
export function mapDeptItemToDepartment(item: DeptItem): Department {
  return {
    id: String(item.deptId),                // number ??string
    code: item.deptCode,
    name: item.deptName,
    headProfessor: item.headProfessorName ?? "",
    studentCount: item.studentCount,
    professorCount: item.professorCount,
    isActive: item.isActive,
  };
}

// ë°°ì—´??ë§¤í•‘ (? íƒ)
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

