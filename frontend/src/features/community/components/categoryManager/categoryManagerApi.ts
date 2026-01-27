export type CategoryId = number;

export type CategoryRow = {
  categoryId: number;
  name: string;
  postCount?: number;

  bgColor: string;   // #RRGGBB
  textColor: string; // #RRGGBB
  lastCreatedAt?: string;
};

// 백엔드 원본 row
type CategoryBackendRow = {
  categoryId: number;
  name: string;
  postCount?: number;
  bgColorHex: string;
  textColorHex: string;
  createdAt?: string;
};

type CategoryListResponseDto =
  | CategoryBackendRow[]
  | { items: CategoryBackendRow[]; total?: number }
  | { data: CategoryBackendRow[]; meta?: any };

export type CreateCategoryRequestDto = {
  name: string;
  bgColorHex: string;
  textColorHex: string;
};

export type UpdateCategoryRequestDto = CreateCategoryRequestDto;

type ListParams = { page?: number; size?: number };

function toQuery(params: ListParams) {
  const sp = new URLSearchParams();
  if (typeof params.page === "number") sp.set("page", String(params.page));
  if (typeof params.size === "number") sp.set("size", String(params.size));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeRow(b: CategoryBackendRow): CategoryRow {
  return {
    categoryId: b.categoryId,
    name: b.name,
    postCount: b.postCount ?? 0,
    bgColor: b.bgColorHex,
    textColor: b.textColorHex,
    lastCreatedAt: b.createdAt ?? "",
  };
}

function normalizeList(payload: CategoryListResponseDto): CategoryRow[] {
  let arr: CategoryBackendRow[] = [];

  if (Array.isArray(payload)) {
    arr = payload;
  } else if (payload && typeof payload === "object") {
    if (Array.isArray((payload as any).items)) arr = (payload as any).items;
    else if (Array.isArray((payload as any).data)) arr = (payload as any).data;
  }

  return arr.map(normalizeRow);
}

async function safeJson(res: globalThis.Response) {
  try {
    if (res.status === 204 || res.status === 205) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function parseError(res: globalThis.Response) {
  // 우선 json -> text 순서로 최대한 메시지를 뽑자
  const raw = await res.text().catch(() => "");
  try {
    const j = raw ? JSON.parse(raw) : null;
    const msg = j?.message || j?.error?.message;
    return typeof msg === "string" && msg.trim() ? msg : `요청 실패 (${res.status})`;
  } catch {
    return raw?.trim() ? raw : `요청 실패 (${res.status})`;
  }
}

export function makeCategoryManagerApi(basePath: string) {
  return {
    async list(params: ListParams = { page: 0, size: 200 }): Promise<CategoryRow[]> {
      const res = await fetch(`${basePath}${toQuery(params)}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await parseError(res));

      const payload = (await safeJson(res)) as CategoryListResponseDto;
      return normalizeList(payload);
    },

    async create(body: CreateCategoryRequestDto): Promise<void> {
      const res = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await parseError(res));
    },

    async update(categoryId: string, body: UpdateCategoryRequestDto): Promise<void> {
    const url = `${basePath}/${encodeURIComponent(categoryId)}`;

    let res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
    });

    if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
        });
    }

    if (!res.ok) throw new Error(await parseError(res));
    },

    async remove(categoryId: string): Promise<void> {
      const res = await fetch(`${basePath}/${encodeURIComponent(categoryId)}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await parseError(res));
    },
  };
}
