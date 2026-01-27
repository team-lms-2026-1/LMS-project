import type {
  NoticeListParams,
  NoticeListItemDto,
  NoticeDetailDto,
  BackendNoticeListItem,
  BackendNoticeDetail,
  CreateNoticeRequestDto,
  UpdateNoticeRequestDto,
} from "./dto";

const BASE = "/api/admin/community/notices";

async function safeJson(res: Response) {
  try {
    if (res.status === 204 || res.status === 205) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}

function toListDto(b: BackendNoticeListItem): NoticeListItemDto {
  return {
    id: b.noticeId,
    categoryName: b.categoryName,
    title: b.title,
    views: b.viewCount,
    createdAt: b.createdAt,
    status: b.status,
  };
}

function toDetailDto(b: BackendNoticeDetail): NoticeDetailDto {
  return {
    id: b.noticeId,
    categoryName: b.categoryName,
    title: b.title,
    content: b.content,
    authorName: b.authorName,
    createdAt: b.createdAt,
    views: b.viewCount,
    status: b.status,
    files: Array.isArray(b.files) ? b.files : [],
  };
}

function buildMultipart(dto: { request: any; files?: File[] }) {
  const form = new FormData();
  form.append("request", new Blob([JSON.stringify(dto.request)], { type: "application/json" }));
  for (const f of dto.files ?? []) form.append("files", f);
  return form;
}

async function parseError(res: Response) {
  // BFF가 error.message까지 내려줄 수도 있고, text일 수도 있으니 모두 커버
  const t = await res.text().catch(() => "");
  try {
    const j = t ? JSON.parse(t) : null;
    const msg = j?.message || j?.error?.message;
    return typeof msg === "string" && msg.trim() ? msg : `요청 실패 (${res.status})`;
  } catch {
    return t?.trim() ? t : `요청 실패 (${res.status})`;
  }
}

export const noticesApi = {
  async list(params: NoticeListParams): Promise<NoticeListItemDto[]> {
    const q = buildQuery({
      page: params.page ?? 0,
      size: params.size ?? 20,
      keyword: params.keyword,
      categoryId: params.categoryId,
    });

    const res = await fetch(`${BASE}${q}`, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await parseError(res));

    const data = await safeJson(res);
    // 백엔드가 {data:[...]} 형태일 수도, 배열로 바로 줄 수도 있어 둘 다 대응
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return arr.map(toListDto);
  },

  async detail(noticeId: string): Promise<NoticeDetailDto> {
    const res = await fetch(`${BASE}/${encodeURIComponent(noticeId)}`, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await parseError(res));

    const data = await safeJson(res);
    const raw = data?.data ?? data; // {data:{...}} or {...}
    return toDetailDto(raw);
  },

  /** ✅ 생성: POST multipart(request + files) */
  async create(dto: CreateNoticeRequestDto): Promise<void> {
    const form = buildMultipart(dto);

    const res = await fetch(BASE, {
      method: "POST",
      body: form, // Content-Type 자동 설정(중요)
    });

    if (!res.ok) throw new Error(await parseError(res));
  },

  /** ✅ 수정: PATCH multipart(request + files) */
  async update(noticeId: string, dto: UpdateNoticeRequestDto): Promise<void> {
    const form = buildMultipart(dto);

    const res = await fetch(`${BASE}/${encodeURIComponent(noticeId)}`, {
      method: "PATCH",
      body: form,
    });

    if (!res.ok) throw new Error(await parseError(res));
  },

  async remove(noticeId: string): Promise<void> {
    const res = await fetch(`${BASE}/${encodeURIComponent(noticeId)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await parseError(res));
  },
};
