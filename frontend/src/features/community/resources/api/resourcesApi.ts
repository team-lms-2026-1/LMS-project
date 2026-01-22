import { getJson } from "@/lib/http";
import type {
  ResourcesListParams,
  ResourcesListResponseDto,
  ResourceListItemDto,
  CreateResourceRequestDto,
  UpdateResourceRequestDto,
} from "./dto";

const BASE = "/api/community/resources";

function toQuery(params: ResourcesListParams) {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "전체") sp.set("category", params.category);
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeList(payload: ResourcesListResponseDto): ResourceListItemDto[] {
  if (Array.isArray(payload)) return payload;

  const anyP: any = payload as any;
  if (Array.isArray(anyP?.items)) return anyP.items;
  if (Array.isArray(anyP?.data)) return anyP.data;
  if (Array.isArray(anyP?.data?.items)) return anyP.data.items;

  return [];
}

export const resourcesApi = {
  async list(params: ResourcesListParams): Promise<ResourceListItemDto[]> {
    const payload = await getJson<ResourcesListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  async get(resourceId: string): Promise<ResourceListItemDto> {
    return getJson<ResourceListItemDto>(`${BASE}/${encodeURIComponent(resourceId)}`);
  },

  async create(body: CreateResourceRequestDto) {
    return getJson(`${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async update(resourceId: string, body: UpdateResourceRequestDto) {
    return getJson(`${BASE}/${encodeURIComponent(resourceId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async remove(resourceId: string) {
    return getJson(`${BASE}/${encodeURIComponent(resourceId)}`, {
      method: "DELETE",
    });
  },
};
