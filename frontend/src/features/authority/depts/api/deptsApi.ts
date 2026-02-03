// features/authority/depts/api/deptsApi.ts

import { getJson } from "@/lib/http";
import {
  DeptListResponse,
  SuccessResponse,
  PageMeta,

  // 교수
  BackendProfessorListResponse,
  DeptProfessorListItemDto,
  DeptProfessorListItemDtoResponse,
  // 학생
  BackendStudentListResponse,
  DeptStudentListItemDto,
  DeptStudentListItemDtoResponse,
  // 전공
  BackendMajorListResponse,
  DeptMajorListItemDto,
  DeptmajorListItemDtoResponse,

  MajorCreateRequest,
  DeptCreateRequest,
  MajorCreateResponse,
} from "./types";

export type DeptListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

/* =========================
 *  학과 목록
 * ========================= */

export async function fetchDeptList(query: DeptListQuery) {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs
    ? `/api/admin/authority/depts?${qs}`
    : `/api/admin/authority/depts`;

  return getJson<DeptListResponse>(url);
}

/* =========================
 *  상세 공통 쿼리
 * ========================= */

export type DeptDetailListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

function buildDetailQuery(query?: DeptDetailListQuery) {
  const sp = new URLSearchParams();
  if (query?.page) sp.set("page", String(query.page));
  if (query?.size) sp.set("size", String(query.size));
  if (query?.keyword) sp.set("keyword", query.keyword);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/* =========================
 *  상세 - 교수 목록
 * ========================= */

export async function fetchDeptProfessorList(
  deptId: string | number,
  query?: DeptDetailListQuery,
): Promise<DeptProfessorListItemDtoResponse> {
  const qs = buildDetailQuery(query);
  const url = `/api/admin/authority/depts/${deptId}/professors${qs}`;

  // 백엔드 원본 응답
  const res = await getJson<BackendProfessorListResponse>(url);

  // 화면용 DTO로 변환
  const mapped: DeptProfessorListItemDtoResponse = {
    data: res.data.map<DeptProfessorListItemDto>((p) => ({
      proId: p.professorNo,
      proName: p.name,
      proEmail: p.email,
      proAdd: p.phone,
    })),
    meta: res.meta,
  };

  return mapped;
}

/* =========================
 *  상세 - 학생 목록
 * ========================= */

export async function fetchDeptStudentList(
  deptId: string | number,
  query?: DeptDetailListQuery,
): Promise<DeptStudentListItemDtoResponse> {
  const qs = buildDetailQuery(query);
  const url = `/api/admin/authority/depts/${deptId}/students${qs}`;

  const res = await getJson<BackendStudentListResponse>(url);

  const mapped: DeptStudentListItemDtoResponse = {
    data: res.data.map<DeptStudentListItemDto>((s) => ({
      stuId: s.studentNo,
      stuName: s.name,
      stuClass: s.gradeLevel,
      stuStatus: s.academicStatus,
      stuMajor: s.majorName,
    })),
    meta: res.meta,
  };

  return mapped;
}

/* =========================
 *  상세 - 전공 목록
 * ========================= */

export async function fetchDeptMajorList(
  deptId: string | number,
  query?: DeptDetailListQuery,
): Promise<DeptmajorListItemDtoResponse> {
  const qs = buildDetailQuery(query);
  const url = `/api/admin/authority/depts/${deptId}/majors${qs}`;

  const res = await getJson<BackendMajorListResponse>(url);

  const mapped: DeptmajorListItemDtoResponse = {
    data: res.data.map<DeptMajorListItemDto>((m) => ({
      majName: m.majorName,
      majCount: m.studentCount,
    })),
    meta: res.meta,
  };

  return mapped;
}

export async function updateDeptStatus(
  deptId: number,
  active: boolean
) {
  return getJson(`/api/admin/authority/depts/${deptId}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}


export async function createDept(body: DeptCreateRequest) {
  return getJson<SuccessResponse<null>>(`/api/admin/authority/depts`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createMajor(
  deptId: number,
  body: MajorCreateRequest
) {
  return getJson<MajorCreateResponse>(`/api/admin/authority/depts/${deptId}/majors`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}