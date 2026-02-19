import { getJson, postJson, patchJson, deleteJson } from "@/lib/http";
import { AccountStatus, AccountType } from "../types";
import type {
  AccountsListResponseDto,
  UpdateAccountRequestDto,
  CreateAccountRequestDto,
  AccountRowDto,
  DeptDto,
  MajorDto,
} from "./dto";

const BASE = "/api/admin/authority/accounts";

type AccountsListParams = {
  accountType?: AccountType;
  keyword?: string;
  page?: number; // ✅ 0-based로 보내는 걸 권장 (프론트에서 page-1 변환)
  size?: number;
};

// ✅ 공통: 서버가 다양한 포맷으로 리스트를 줄 때 "배열"만 안전하게 언랩
function unwrapListArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;

  // 흔한 케이스: { data: [...] }
  if (Array.isArray(raw?.data)) return raw.data;

  // 흔한 케이스: { items: [...] }
  if (Array.isArray(raw?.items)) return raw.items;

  // Spring Page: { content: [...] }
  if (Array.isArray(raw?.content)) return raw.content;

  // ApiResponse + Page: { data: { items: [...] } } or { data: { content: [...] } }
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  if (Array.isArray(raw?.data?.content)) return raw.data.content;

  // 혹시 result로 오는 경우
  if (Array.isArray(raw?.result)) return raw.result;
  if (Array.isArray(raw?.data?.result)) return raw.data.result;

  return [];
}

// ✅ 공통: 서버가 {data:[...]} 형태인 경우 언랩(드롭다운 등에 사용)
function unwrapArray(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.result)) return json.result;
  return [];
}

// 백엔드 목록 row가 flat(name/email이 최상위)로 오는 케이스를 프론트 DTO로 변환
function normalizeRow(r: any): AccountRowDto {
  const accountType: AccountType = r.accountType;

  const base: AccountRowDto = {
    accountId: r.accountId,
    loginId: r.loginId,
    accountType,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt ?? r.createdAt,
    profile: undefined,
    adminProfile: undefined,
  };

  const name = r.name;
  const email = r.email ?? null;
  const phone = r.phone ?? null;
  const memo = r.memo ?? null;

  if (accountType === "ADMIN") {
    base.adminProfile = name ? { name, email, phone, memo } : undefined;
  } else {
    base.profile = name
      ? {
        name,
        email,
        phone,
        memo,
        deptId: r.deptId,

        studentNo: r.studentNo,
        gradeLevel: r.gradeLevel,
        academicStatus: r.academicStatus,
        majors: r.majors,

        professorNo: r.professorNo,
      }
      : undefined;
  }

  if (r.profile) base.profile = r.profile;
  if (r.adminProfile) base.adminProfile = r.adminProfile;

  return base;
}

function normalizeListResponse(raw: any): AccountsListResponseDto {
  const arr = unwrapListArray(raw);
  const items: AccountRowDto[] = arr.map(normalizeRow);

  // ✅ meta 위치 보강
  const meta = raw?.meta ?? raw?.data?.meta;

  // ✅ total(총개수) 추출 경로 보강 (Spring Page / ApiResponse 등)
  const total: number =
    Number(meta?.totalElements ?? meta?.total ?? undefined) ||
    Number(
      raw?.total ??
      raw?.totalElements ??
      raw?.count ??
      raw?.data?.total ??
      raw?.data?.totalElements ??
      raw?.data?.count ??
      undefined
    ) ||
    items.length;

  return { items, total };
}

/**
 * ✅ update 요청에서 wrapper(profile/studentProfile/...)가 들어오면 강제로 평탄화
 * - { profile: { ... } } -> { ... }
 * - { studentProfile: { ... } } -> { ... }
 * - 나머지 필드(status 등)는 유지
 */
function flattenUpdateBody(input: any): any {
  if (!input || typeof input !== "object") return input;

  const wrapperKeys = ["profile", "studentProfile", "professorProfile", "adminProfile"] as const;

  for (const k of wrapperKeys) {
    const wrapped = (input as any)[k];
    if (wrapped && typeof wrapped === "object" && !Array.isArray(wrapped)) {
      const { [k]: _removed, ...rest } = input as any;
      return { ...rest, ...wrapped };
    }
  }

  return input;
}

/**
 * ✅ update 요청에서 응답전용 객체/불필요 필드를 제거하고 majors를 정규화
 */
function sanitizeUpdateBody(body: any): any {
  const b = flattenUpdateBody(body);
  if (!b || typeof b !== "object") return b;

  const out: any = { ...b };

  // 응답전용 객체가 섞여 들어오면 제거
  delete out.dept;
  delete out.primaryMajor;
  delete out.department;
  delete out.major;

  // majors가 "응답 객체 배열"로 들어오면 {majorId, majorType}만 남김
  if (Array.isArray(out.majors)) {
    out.majors = out.majors
      .map((m: any) => ({
        majorId: Number(m?.majorId),
        majorType: m?.majorType,
      }))
      .filter((m: any) => Number.isFinite(m.majorId) && typeof m.majorType === "string");
  }

  // deptId가 dept 객체에만 있을 때 보정
  if ((out.deptId == null || out.deptId === 0) && out.dept?.deptId != null) {
    out.deptId = Number(out.dept.deptId);
  }

  return out;
}

export const accountsApi = {
  async list(params?: AccountsListParams): Promise<AccountsListResponseDto> {
    const qs = new URLSearchParams();

    if (params?.accountType) qs.set("accountType", params.accountType);

    const kw = (params?.keyword ?? "").trim();
    if (kw) qs.set("keyword", kw);

    // ✅ 서버는 보통 0-based (프론트에서 page-1로 변환해서 넣는 걸 권장)
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 10));

    const url = `${BASE}?${qs.toString()}`;
    const raw = await getJson<any>(url);
    return normalizeListResponse(raw);
  },

  /** ✅ 수정 모달에서 "연락처/학과/주전공" 정확히 채우기 위해 상세 호출 */
  async detail(accountId: number): Promise<AccountRowDto> {
    const raw = await getJson<any>(`${BASE}/${accountId}`);
    const obj = raw?.data ?? raw; // {data:{...}} 대응
    return normalizeRow(obj);
  },

  create(body: CreateAccountRequestDto) {
    return postJson<{ accountId: number }>(BASE, body);
  },

  update(accountId: number, body: UpdateAccountRequestDto) {
    const payload = sanitizeUpdateBody(body);
    return patchJson<void>(`${BASE}/${accountId}`, payload);
  },

  updateStatus(accountId: number, status: AccountStatus) {
    return patchJson<void>(`${BASE}/${accountId}/status`, { status });
  },

  resetPassword(accountId: number) {
    return postJson<void>(`${BASE}/${accountId}/password/reset`, {});
  },

  /** ✅ 학과 드롭다운 */
  async listDepts(): Promise<DeptDto[]> {
    const json = await getJson<any>("/api/admin/authority/depts/dropdown", { cache: "no-store" });
    const arr = unwrapArray(json);

    return arr.map((d: any) => ({
      deptId: Number(d.departmentId ?? d.deptId ?? d.id),
      deptName: String(d.name ?? d.deptName ?? d.label ?? ""),
    }));
  },

  /** ✅ 주전공(학과 선택 -> 해당 학과 전공만) */
  async listMajorsByDept(deptId: number): Promise<MajorDto[]> {
    const json = await getJson<any>(`/api/admin/authority/depts/${deptId}/majors/dropdown`, {
      cache: "no-store",
    });
    const arr = unwrapArray(json);

    return arr.map((m: any) => ({
      majorId: Number(m.majorId ?? m.id ?? m.value),
      majorName: String(m.name ?? m.majorName ?? m.label ?? ""),
      deptId,
    }));
  },

  /** ✅ 부/복수전공: 학과 무관 전체 전공 */
  async listMajorsAll(): Promise<MajorDto[]> {
    const json = await getJson<any>(`/api/admin/authority/majors/dropdown`, { cache: "no-store" });
    const arr = unwrapArray(json);

    return arr.map((m: any) => ({
      majorId: Number(m.majorId ?? m.id ?? m.value),
      majorName: String(m.name ?? m.majorName ?? m.label ?? ""),
      deptId: m.deptId ?? m.departmentId ?? undefined,
    }));
  },

  /** ✅ 학생 프로필 이미지 업로드 */
  async uploadStudentProfileImage(accountId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/mypage/student/${accountId}/image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("프로필 이미지 업로드 실패");
    const json = await res.json();
    return json.data; // imageUrl
  },

  async updateStudentProfileImage(accountId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/mypage/student/${accountId}/image`, {
      method: "PATCH",
      body: formData,
    });
    if (!res.ok) throw new Error("프로필 이미지 수정 실패");
    const json = await res.json();
    return json.data; // imageUrl
  },

  async getStudentProfileImage(accountId: number): Promise<string> {
    const json = await getJson<any>(`/api/admin/mypage/student/${accountId}/image`);
    return json.data; // presignedImageUrl
  },

  /** ✅ 학생 프로필 이미지 삭제 */
  async deleteStudentProfileImage(accountId: number): Promise<void> {
    await deleteJson<void>(`/api/admin/mypage/student/${accountId}/image`);
  },
};
