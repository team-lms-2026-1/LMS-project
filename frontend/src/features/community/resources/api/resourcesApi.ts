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

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object") {
    if ("data" in payload) return payload.data as T;
  }
  return payload as T;
}

function normalizeOne(rawAny: any): ResourceListItemDto {
  const raw = unwrap<any>(rawAny);

  const id = raw?.id ?? raw?.resourceId ?? raw?.noticeId ?? "";

  const cidRaw = raw?.categoryId ?? raw?.category?.categoryId;
  const cidNum = Number(cidRaw);

  return {
    id: String(id),
    no: raw?.no,

    categoryId: Number.isFinite(cidNum) ? cidNum : 0,
    categoryName: raw?.categoryName ?? raw?.category?.name,

    title: raw?.title ?? "",

    content: typeof raw?.content === "string" ? raw.content : undefined,

    author: raw?.author ?? raw?.authorName,
    createdAt: raw?.createdAt,
    views: raw?.views ?? raw?.viewCount,

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

function normalizeList(payloadAny: ResourcesListResponseDto): ResourceListItemDto[] {
  const payload = unwrap<any>(payloadAny);

  const arr =
    Array.isArray(payload) ? payload :
    Array.isArray(payload?.items) ? payload.items :
    Array.isArray(payload?.data) ? payload.data :
    Array.isArray(payload?.data?.items) ? payload.data.items :
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

  // 등록 후 이동을 위해 “생성 응답에서 id를 최대한 뽑아내는” 헬퍼
  extractCreatedId(resp: any): string | null {
    const r = unwrap<any>(resp);
    const id = r?.id ?? r?.resourceId ?? r?.noticeId ?? r?.data?.id ?? r?.data?.resourceId;
    return id != null ? String(id) : null;
  },
};
