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
  const rid = raw?.resourceId ?? raw?.id ?? raw?.data?.resourceId ?? raw?.data?.id ?? "";
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
        ? { name: raw.files[0].originalName ?? raw.files[0].name ?? "첨부파일", url: raw.files[0].url }
        : undefined),
  };
}

function normalizeList(payload: ResourcesListResponseDto): ResourceListItemDto[] {
  return unwrapList(payload).map(normalizeOne);
}

async function safeJson(res: Response) {
  try {
    if (res.status === 204 || res.status === 205) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function parseError(res: Response) {
  const t = await res.text().catch(() => "");
  try {
    const j = t ? JSON.parse(t) : null;
    const msg = j?.message || j?.error?.message;
    return typeof msg === "string" && msg.trim() ? msg : `요청 실패 (${res.status})`;
  } catch {
    return t?.trim() ? t : `요청 실패 (${res.status})`;
  }
}

function buildMultipart(dto: { request: any; files?: File[] }) {
  const form = new FormData();
  form.append("request", new Blob([JSON.stringify(dto.request)], { type: "application/json" }));
  for (const f of dto.files ?? []) form.append("files", f);
  return form;
}

export const resourcesApi = {
  async list(params: ResourcesListParams): Promise<ResourceListItemDto[]> {
    const res = await fetch(`${BASE}${toQuery(params)}`, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await parseError(res));
    const data = await safeJson(res);
    return normalizeList(data);
  },

  async get(resourceId: string): Promise<ResourceListItemDto> {
    const res = await fetch(`${BASE}/${encodeURIComponent(resourceId)}`, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await parseError(res));
    const data = await safeJson(res);
    return normalizeOne(data?.data ?? data);
  },

  /** ✅ 생성: POST multipart(request + files) */
  async create(dto: CreateResourceRequestDto): Promise<any> {
    const form = buildMultipart(dto);
    const res = await fetch(BASE, { method: "POST", body: form });
    if (!res.ok) throw new Error(await parseError(res));
    return safeJson(res);
  },

  /** ✅ 수정: PATCH multipart(request + files) */
  async update(resourceId: string, dto: UpdateResourceRequestDto): Promise<any> {
    const form = buildMultipart(dto);
    const res = await fetch(`${BASE}/${encodeURIComponent(resourceId)}`, { method: "PATCH", body: form });
    if (!res.ok) throw new Error(await parseError(res));
    return safeJson(res);
  },

  async remove(resourceId: string): Promise<void> {
    const res = await fetch(`${BASE}/${encodeURIComponent(resourceId)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await parseError(res));
  },

  extractCreatedId(resp: any): string | null {
    const r = resp?.data ?? resp;
    const id = r?.resourceId ?? r?.id;
    return id != null ? String(id) : null;
  },
};
