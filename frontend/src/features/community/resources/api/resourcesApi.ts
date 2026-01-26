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

function unwrapList(payload: ResourcesListResponseDto): any[] {
  const p: any = payload as any;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.data)) return p.data;
  if (Array.isArray(p?.data?.items)) return p.data.items;
  return [];
}

function normalizeOne(raw: any): ResourceListItemDto {
  const rid = raw?.resourceId ?? raw?.id ?? raw?.noticeId ?? raw?.data?.resourceId ?? raw?.data?.id ?? "";
  const cidRaw = raw?.categoryId ?? raw?.category?.categoryId ?? raw?.data?.categoryId;
  const cid = Number(cidRaw);

  return {
    id: String(rid),
    no: raw?.no ?? raw?.data?.no,
    categoryId: Number.isFinite(cid) ? cid : 0,
    categoryName: raw?.categoryName ?? raw?.category?.name ?? raw?.data?.categoryName,

    title: String(raw?.title ?? raw?.data?.title ?? ""),
    content: typeof (raw?.content ?? raw?.data?.content) === "string" ? (raw?.content ?? raw?.data?.content) : undefined,

    author: raw?.authorName ?? raw?.author ?? raw?.data?.authorName,
    createdAt: raw?.createdAt ?? raw?.data?.createdAt,
    views: raw?.viewCount ?? raw?.views ?? raw?.data?.viewCount,

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
  return unwrapList(payload).map(normalizeOne);
}

export const resourcesApi = {
  async list(params: ResourcesListParams): Promise<ResourceListItemDto[]> {
    const payload = await getJson<ResourcesListResponseDto>(`${BASE}${toQuery(params)}`);
    return normalizeList(payload);
  },

  async get(resourceId: string): Promise<ResourceListItemDto> {
    const raw = await getJson<any>(`${BASE}/${encodeURIComponent(resourceId)}`);
    // 백엔드가 {data:{...}}로 줄 수도 있으니 normalizeOne으로 통일
    return normalizeOne(raw?.data ?? raw);
  },

  async create(body: CreateResourceRequestDto) {
    return getJson<any>(`${BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async update(resourceId: string, body: UpdateResourceRequestDto) {
    return getJson<any>(`${BASE}/${encodeURIComponent(resourceId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },

  async remove(resourceId: string) {
    return getJson<any>(`${BASE}/${encodeURIComponent(resourceId)}`, { method: "DELETE" });
  },

  // ✅ CreatePage에서 쓰는 함수 추가 (TS 오류 해결)
  extractCreatedId(resp: any): string | null {
    const r = resp?.data ?? resp;
    const id = r?.resourceId ?? r?.id ?? r?.noticeId;
    return id != null ? String(id) : null;
  },
};
