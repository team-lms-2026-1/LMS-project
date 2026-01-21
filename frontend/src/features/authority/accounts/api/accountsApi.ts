import { bffRequest } from "@/features/systemStatus/lib/bffClient";
import { AccountStatus, AccountType } from "../types";
import type {
  AccountsListResponseDto,
  UpdateAccountRequestDto,
  CreateAccountRequestDto,
  AccountRowDto,
  DeptDto,
  MajorDto,
} from "./dto";

const BASE = "/api/authority/accounts";

type AccountsListParams = {
  accountType?: AccountType;
  keyword?: string;
  page?: number;
  size?: number;
};

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
  const arr =
    raw?.data ??
    raw?.items ??
    raw?.content ??
    raw?.data?.items ??
    raw?.data?.content ??
    [];

  const items: AccountRowDto[] = Array.isArray(arr) ? arr.map(normalizeRow) : [];

  const total: number =
    raw?.total ??
    raw?.totalElements ??
    raw?.count ??
    raw?.data?.total ??
    raw?.data?.totalElements ??
    items.length;

  return { items, total };
}

// ✅ 공통: 서버가 {data: [...]} 형태인 경우 언랩
function unwrapArray(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.result)) return json.result;
  return [];
}

export const accountsApi = {
  async list(params?: AccountsListParams): Promise<AccountsListResponseDto> {
    const qs = new URLSearchParams();
    if (params?.accountType) qs.set("accountType", params.accountType);
    if (params?.keyword) qs.set("keyword", params.keyword);
    if (params?.page != null) qs.set("page", String(params.page));
    if (params?.size != null) qs.set("size", String(params.size));

    const url = qs.toString() ? `${BASE}?${qs.toString()}` : BASE;
    const raw = await bffRequest<any>(url);
    return normalizeListResponse(raw);
  },

  /** ✅ 수정 모달에서 "연락처/학과/주전공" 정확히 채우기 위해 상세 호출 */
  async detail(accountId: number): Promise<AccountRowDto> {
    const raw = await bffRequest<any>(`${BASE}/${accountId}`);
    // 백엔드가 {data:{...}} 형태여도 대응
    const obj = raw?.data ?? raw;
    return normalizeRow(obj);
  },

  create(body: CreateAccountRequestDto) {
    return bffRequest<{ accountId: number }>(BASE, { method: "POST", body });
  },

  update(accountId: number, body: UpdateAccountRequestDto) {
    return bffRequest<void>(`${BASE}/${accountId}`, { method: "PUT", body });
  },

  updateStatus(accountId: number, status: AccountStatus) {
    return bffRequest<void>(`${BASE}/${accountId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  resetPassword(accountId: number) {
    return bffRequest<void>(`${BASE}/${accountId}/password/reset`, {
      method: "POST",
      body: {},
    });
  },

  /** ✅ 학과 드롭다운 */
  async listDepts(): Promise<DeptDto[]> {
    const res = await fetch("/api/authority/depts/dropdown", { cache: "no-store" });
    if (!res.ok) throw new Error("학과 목록 조회 실패");

    const json = await res.json();
    const arr = unwrapArray(json);

    return arr.map((d: any) => ({
      deptId: Number(d.departmentId ?? d.deptId ?? d.id),
      deptName: String(d.name ?? d.deptName ?? d.label ?? ""),
    }));
  },

  /** ✅ 주전공(학과 선택 -> 해당 학과 전공만) */
  async listMajorsByDept(deptId: number): Promise<MajorDto[]> {
    const res = await fetch(`/api/authority/depts/${deptId}/majors/dropdown`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("전공 목록 조회 실패");

    const json = await res.json();
    const arr = unwrapArray(json);

    return arr.map((m: any) => ({
      majorId: Number(m.majorId ?? m.id ?? m.value),
      majorName: String(m.name ?? m.majorName ?? m.label ?? ""),
      deptId,
    }));
  },

  /** ✅ 부/복수전공: 학과 무관 전체 전공 */
  async listMajorsAll(): Promise<MajorDto[]> {
    // 프로젝트에 맞게 엔드포인트가 다르면 여기만 수정하면 됨
    const res = await fetch(`/api/authority/majors/dropdown`, { cache: "no-store" });
    if (!res.ok) throw new Error("전체 전공 목록 조회 실패");

    const json = await res.json();
    const arr = unwrapArray(json);

    return arr.map((m: any) => ({
      majorId: Number(m.majorId ?? m.id ?? m.value),
      majorName: String(m.name ?? m.majorName ?? m.label ?? ""),
      deptId: m.deptId ?? m.departmentId ?? undefined,
    }));
  },
};
