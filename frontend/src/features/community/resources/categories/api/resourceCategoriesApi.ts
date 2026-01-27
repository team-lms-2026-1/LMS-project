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

function unwrapList(payload: ResourceCategoriesListResponseDto): any[] {
  const p: any = payload as any;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.data)) return p.data;
  if (Array.isArray(p?.data?.items)) return p.data.items;
  return [];
}

function normalizeOne(r: any): ResourceCategoryDto {
  return {
    categoryId: Number(r.categoryId),
    name: String(r.name ?? ""),
    bgColorHex: String(r.bgColorHex ?? r.bgColor ?? "#64748b"),
    textColorHex: String(r.textColorHex ?? r.textColor ?? "#ffffff"),
    postCount: r.postCount != null ? Number(r.postCount) : undefined,
    latestCreatedAt: typeof r.latestCreatedAt === "string" ? r.latestCreatedAt : undefined,
  };
}

function normalizeList(payload: ResourceCategoriesListResponseDto): ResourceCategoryDto[] {
  return unwrapList(payload).map(normalizeOne);
}

async function readError(res: Response, fallback: string) {
  try {
    const j = await res.json();
    return j?.error?.message || j?.message || fallback;
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

  async create(body: CreateResourceCategoryRequestDto): Promise<ResourceCategoryDto> {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readError(res, `카테고리 생성 실패 (${res.status})`));
    return normalizeOne((await res.json())?.data ?? (await res.json()));
  },

  async update(categoryId: number, body: UpdateResourceCategoryRequestDto): Promise<ResourceCategoryDto> {
    const res = await fetch(`${BASE}/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readError(res, `카테고리 수정 실패 (${res.status})`));
    return normalizeOne((await res.json())?.data ?? (await res.json()));
  },

  async remove(categoryId: number): Promise<true> {
    const res = await fetch(`${BASE}/${categoryId}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) throw new Error(await readError(res, `카테고리 삭제 실패 (${res.status})`));
    return true;
  },
};
