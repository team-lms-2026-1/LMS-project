import { getJson } from "@/lib/http";
import type {
  ResourcesListParams,
  ResourcesListResponseDto,
  ResourceListItemDto,
  CreateResourceRequestDto,
  UpdateResourceRequestDto,
} from "./dto";

const BASE = "/api/admin/community/resources";

function toQuery(params: ResourcesListParams) {
  const sp = new URLSearchParams();

  if (typeof params.categoryId === "number") sp.set("categoryId", String(params.categoryId));
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeOne(raw: any): ResourceListItemDto {
  const id = raw?.id ?? raw?.resourceId ?? raw?.noticeId ?? "";

  // categoryId가 string/number 어떤 형태로 오든 number로 정규화
  const cidRaw = raw?.categoryId ?? raw?.category?.categoryId;
  const cidNum = Number(cidRaw);

  return {
    id: String(id),
    no: raw?.no,

    categoryId: Number.isFinite(cidNum) ? cidNum : 0,
    categoryName: raw?.categoryName ?? raw?.category?.name,

    title: raw?.title ?? "",

    // ✅ 리스트에 없을 수 있음
    content: typeof raw?.content === "string" ? raw.content : undefined,

    author: raw?.author ?? raw?.authorName,
    createdAt: raw?.createdAt,
    views: raw?.views ?? raw?.viewCount,

    // ✅ 첨부 정규화 (files[] 또는 attachment 단일 모두 대응)
    attachment:
      raw?.attachment ??
      (Array.isArray(raw?.files) && raw.files.length > 0
        ? {
            name: raw.files[0].originalName ?? raw.files[0].name ?? "첨부파일",
            url: raw.files[0].url,
          }
        : undefined),
  };
}

function normalizeList(payload: ResourcesListResponseDto): ResourceListItemDto[] {
  const anyP: any = payload as any;

  const arr =
    Array.isArray(payload) ? payload :
    Array.isArray(anyP?.items) ? anyP.items :
    Array.isArray(anyP?.data) ? anyP.data :
    Array.isArray(anyP?.data?.items) ? anyP.data.items :
    [];

  return arr.map(normalizeOne);
}

export const resourcesApi = {
  async list(params: ResourcesListParams): Promise<ResourceListItemDto[]> {
    const payload = await getJson<ResourcesListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  async get(resourceId: string): Promise<ResourceListItemDto> {
    const raw = await getJson<any>(`${BASE}/${encodeURIComponent(resourceId)}`);
    return normalizeOne(raw);
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
