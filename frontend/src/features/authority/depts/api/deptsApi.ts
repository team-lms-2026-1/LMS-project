// features/authority/depts/api/deptsApi.ts

import { getJson } from "@/lib/http";
import {
  DeptListResponse,
  DeptListItemDto, // Imported for explicit mapping
  SuccessResponse,
  PageMeta,
  BackendDeptListResponse,
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
  DeptEditResponse,
  DeptUpdateRequest,
} from "./types";

export type DeptListQuery = {
  page?: number;
  size?: number;
  keyword?: string;
};

/* =========================
 *  학과 목록
 * ========================= */

export async function fetchDeptList(
  query: DeptListQuery
): Promise<DeptListResponse> {
  const sp = new URLSearchParams();
  if (query.page) sp.set("page", String(query.page));
  if (query.size) sp.set("size", String(query.size));
  if (query.keyword) sp.set("keyword", query.keyword);

  const qs = sp.toString();
  const url = qs
    ? `/api/admin/authority/depts?${qs}`
    : `/api/admin/authority/depts`;

  const res = await getJson<BackendDeptListResponse>(url);

  return {
    data: res.data.map<DeptListItemDto>((item) => ({
      deptId: item.deptId,
      deptCode: item.deptCode,
      deptName: item.deptName,
      headProfessorName: item.headProfessorName ?? "",
      studentCount: item.studentCount,
      professorCount: item.professorCount,
      isActive: item.isActive, // Map isActive -> isActive
    })),
    meta: res.meta,
  };
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
  query?: DeptDetailListQuery
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
  query?: DeptDetailListQuery
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
  query?: DeptDetailListQuery
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
// deptsApi.ts
// deptsApi.ts
export async function updateDeptStatus(deptId: number, active: boolean) {
  // Next API 라우트: /api/admin/authority/depts/[deptId]/active 로 호출
  return getJson<SuccessResponse<null>>(
    `/api/admin/authority/depts/${deptId}/active`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive: active, // ✅ 백엔드 원래 설계에 가깝게 되돌림
      }),
    }
  );
}




export async function createDept(body: DeptCreateRequest) {
  return getJson<SuccessResponse<null>>(`/api/admin/authority/depts`, {
    method: "POST",
    body: JSON.stringify({ ...body, status: body.active ? "ACTIVE" : "INACTIVE" }),
  });
}

export async function createMajor(
  deptId: number,
  body: MajorCreateRequest
) {
  return getJson<MajorCreateResponse>(
    `/api/admin/authority/depts/${deptId}/majors`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function getDeptEdit(deptId: number) {
  return getJson<SuccessResponse<DeptEditResponse>>(
    `/api/admin/authority/depts/${deptId}/edit`
  );
}

export async function updateDept(deptId: number, body: DeptUpdateRequest) {
  return getJson<SuccessResponse<null>>(`/api/admin/authority/depts/${deptId}/edit`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
