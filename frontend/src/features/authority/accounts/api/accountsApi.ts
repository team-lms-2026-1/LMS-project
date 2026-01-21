import { bffRequest } from "@/lib/bffClient";
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

    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 50));

    const url = `${BASE}?${qs.toString()}`;
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

  /**
   * ✅ 핵심: update 요청은 body를 절대 profile로 감싸지 않도록
   * - wrapper가 들어오면 flatten
   * - majors 등 응답전용 구조 제거/정규화
   */
  update(accountId: number, body: UpdateAccountRequestDto) {
    const payload = sanitizeUpdateBody(body);
    return bffRequest<void>(`${BASE}/${accountId}`, { method: "PATCH", body: payload });
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
