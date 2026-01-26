/* =========================
 *  백엔드 응답 타입
 * ========================= */

// 학과 목록 API 전체 응답
export type DeptListResponse = {
  data: DeptItem[];
  meta: PageMeta;
};

// 학과 단건 (백엔드 DTO 그대로)
export type DeptItem = {
  deptId: number;
  deptCode: string;
  deptName: string;
  headProfessorName: string | null;
  studentCount: number;
  professorCount: number;
  isActive: boolean;
};

// 페이지 메타 정보
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
 *  화면 전용 타입
 * ========================= */

// 화면(DeptsPage)에서 사용하는 학과 타입
export type Department = {
  id: string;              // 화면에서는 string ID 사용
  code: string;
  name: string;
  headProfessor: string;
  studentCount: number;
  professorCount: number;
  isActive: boolean;
};

/* =========================
 *  매핑 함수
 * ========================= */

// 백엔드 DeptItem → 화면 Department
export function mapDeptItemToDepartment(item: DeptItem): Department {
  return {
    id: String(item.deptId),                // number → string
    code: item.deptCode,
    name: item.deptName,
    headProfessor: item.headProfessorName ?? "",
    studentCount: item.studentCount,
    professorCount: item.professorCount,
    isActive: item.isActive,
  };
}

// 배열용 매핑 (선택)
export function mapDeptItemsToDepartments(
  items: DeptItem[]
): Department[] {
  return items.map(mapDeptItemToDepartment);
}
