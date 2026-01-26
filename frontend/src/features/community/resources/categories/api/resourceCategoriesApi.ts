import type {
  ResourceCategoryDto,
  ResourceCategoriesListParams,
  ResourceCategoriesListResponseDto,
  CreateResourceCategoryRequestDto,
  UpdateResourceCategoryRequestDto,
} from "./dto";

const BASE = "/api/admin/community/resources/categories";

function toQuery(params: ResourceCategoriesListParams) {
  const sp = new URLSearchParams();
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object") {
    if ("data" in payload) return payload.data as T;
  }
  return payload as T;
}

function normalizeList(payload: ResourceCategoriesListResponseDto): ResourceCategoryDto[] {
  const p: any = unwrap<any>(payload);

  const arr =
    Array.isArray(p) ? p :
    Array.isArray(p?.items) ? p.items :
    Array.isArray(p?.data) ? p.data :
    Array.isArray(p?.data?.items) ? p.data.items :
    [];

  return arr.map((r: any) => ({
    categoryId: Number(r.categoryId),
    name: String(r.name ?? ""),
    // 백엔드가 bgColor/textColor 로 주거나 bgColorHex/textColorHex 로 주는 것 모두 대응
    bgColorHex: String(r.bgColorHex ?? r.bgColor ?? "#64748b"),
    textColorHex: String(r.textColorHex ?? r.textColor ?? "#ffffff"),
    postCount: r.postCount != null ? Number(r.postCount) : undefined,
    latestCreatedAt: typeof r.latestCreatedAt === "string" ? r.latestCreatedAt : undefined,
  }));
}

async function readError(res: Response, fallback: string) {
  try {
    const json = await res.json();
    return json?.message ?? json?.error ?? fallback;
  } catch {
    return fallback;
  }
}

export const resourceCategoriesApi = {
  async list(params: ResourceCategoriesListParams): Promise<ResourceCategoryDto[]> {
    const res = await fetch(`${BASE}${toQuery(params)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(await readError(res, `카테고리 목록 조회 실패 (${res.status})`));
    const json = (await res.json()) as ResourceCategoriesListResponseDto;
    return normalizeList(json);
  },

  async create(body: CreateResourceCategoryRequestDto) {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), // categoryId 보내지 않음
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readError(res, `카테고리 생성 실패 (${res.status})`));
    return unwrap<ResourceCategoryDto>(await res.json());
  },

  async update(categoryId: number, body: UpdateResourceCategoryRequestDto) {
    const res = await fetch(`${BASE}/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readError(res, `카테고리 수정 실패 (${res.status})`));
    return unwrap<ResourceCategoryDto>(await res.json());
  },

  async remove(categoryId: number) {
    const res = await fetch(`${BASE}/${categoryId}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) throw new Error(await readError(res, `카테고리 삭제 실패 (${res.status})`));
    return true;
  },
};
