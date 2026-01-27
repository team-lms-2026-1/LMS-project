import type {
  FaqListParams,
  FaqListItemDto,
  FaqDetailDto,
  BackendFaqListItem,
  BackendFaqDetail,
  CreateFaqRequestDto,
  UpdateFaqRequestDto,
} from "./dto";

const BASE = "/api/admin/community/faqs";

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

function pickNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pickString(v: any, fallback = "-") {
  return typeof v === "string" && v.trim().length ? v : fallback;
}

/** ✅ 백엔드 키가 달라도 최대한 흡수 */
function toListDto(b: any): FaqListItemDto {
  const id = pickNumber(b.faqId ?? b.id, -1);

  const categoryId = pickNumber(
    b.categoryId ?? b.category?.categoryId ?? b.category?.id,
    undefined as any
  );

  const categoryName = pickString(
    b.categoryName ?? b.category?.name ?? b.category?.categoryName,
    "미분류"
  );

  return {
    id,
    categoryId,
    categoryName,
    title: pickString(b.title ?? b.question, "-"),
    views: pickNumber(b.viewCount ?? b.views, 0),
    createdAt: pickString(b.createdAt, "-"),
    status: typeof b.status === "string" ? b.status : undefined,
  };
}

function toDetailDto(b: any): FaqDetailDto {
  const id = pickNumber(b.faqId ?? b.id, -1);
  return {
    id,
    categoryName: pickString(b.categoryName, "미분류"),
    title: pickString(b.title ?? b.question, "-"),
    content: pickString(b.content ?? b.answer, ""),
    authorName: pickString(b.authorName, "-"),
    createdAt: pickString(b.createdAt, "-"),
    views: pickNumber(b.viewCount ?? b.views, 0),
    status: pickString(b.status, "-"),
  };
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

export const faqsApi = {
  async list(params: FaqListParams): Promise<FaqListItemDto[]> {
    const q = buildQuery({
      page: params.page ?? 0,
      size: params.size ?? 20,
      keyword: params.keyword,
      categoryId: params.categoryId,
    });

    const res = await fetch(`${BASE}${q}`, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await parseError(res));

    const data = await safeJson(res);
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return arr.map((x: BackendFaqListItem) => toListDto(x));
  },

  async detail(faqId: string): Promise<FaqDetailDto> {
    const res = await fetch(`${BASE}/${encodeURIComponent(faqId)}`, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await parseError(res));

    const data = await safeJson(res);
    const raw = data?.data ?? data;
    return toDetailDto(raw as BackendFaqDetail);
  },

  /** ✅ 생성: POST JSON (FAQ는 multipart X) */
  async create(dto: CreateFaqRequestDto): Promise<void> {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto.request),
    });
    if (!res.ok) throw new Error(await parseError(res));
  },

  /** ✅ 수정: PATCH JSON (FAQ는 multipart X) */
  async update(faqId: string, dto: UpdateFaqRequestDto): Promise<void> {
    const res = await fetch(`${BASE}/${encodeURIComponent(faqId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto.request),
    });
    if (!res.ok) throw new Error(await parseError(res));
  },

  async remove(faqId: string): Promise<void> {
    const res = await fetch(`${BASE}/${encodeURIComponent(faqId)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await parseError(res));
  },
};
