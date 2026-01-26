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

function normalizeList(payload: ResourceCategoriesListResponseDto): ResourceCategoryDto[] {
  const anyP: any = payload as any;

  const arr =
    Array.isArray(payload) ? payload :
    Array.isArray(anyP?.items) ? anyP.items :
    Array.isArray(anyP?.data) ? anyP.data :
    Array.isArray(anyP?.data?.items) ? anyP.data.items :
    [];

  return arr.map((r: any) => ({
    categoryId: Number(r.categoryId),
    name: String(r.name ?? ""),
    bgColorHex: String(r.bgColorHex ?? r.bgColor ?? "#64748b"),
    textColorHex: String(r.textColorHex ?? r.textColor ?? "#ffffff"),
    postCount: r.postCount != null ? Number(r.postCount) : undefined,
    latestCreatedAt: typeof r.latestCreatedAt === "string" ? r.latestCreatedAt : undefined,
  }));
}

export const resourceCategoriesApi = {
  async list(params: ResourceCategoriesListParams): Promise<ResourceCategoryDto[]> {
    const res = await fetch(`${BASE}${toQuery(params)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`카테고리 목록 조회 실패 (${res.status})`);
    const json = (await res.json()) as ResourceCategoriesListResponseDto;
    return normalizeList(json);
  },

  async create(body: CreateResourceCategoryRequestDto) {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), // ✅ categoryId 절대 보내지 않음
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`카테고리 생성 실패 (${res.status})`);
    return (await res.json()) as ResourceCategoryDto;
  },

  async update(categoryId: number, body: UpdateResourceCategoryRequestDto) {
    const res = await fetch(`${BASE}/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`카테고리 수정 실패 (${res.status})`);
    return (await res.json()) as ResourceCategoryDto;
  },

  async remove(categoryId: number) {
    const res = await fetch(`${BASE}/${categoryId}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`카테고리 삭제 실패 (${res.status})`);
    return true;
  },
};
