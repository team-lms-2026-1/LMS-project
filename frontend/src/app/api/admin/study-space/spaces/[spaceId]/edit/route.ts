import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ✅ 백엔드 실제 엔드포인트 */
const BACKEND_BASE = "/api/v1/admin/spaces";

/** ✅ 목록/상세 캐시 태그 */
const TAG = "admin:spaces";

type Ctx = { params: { spaceId: string } };

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.spaceId)}`;
}

function isMultipart(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  return ct.toLowerCase().includes("multipart/form-data");
}

/**
 * ✅ 수정(PATCH)
 * - multipart: 이미지 포함(FormData boundary 유지) => proxyStreamToBackend
 * - json: 일반 수정 => proxyToBackend
 */
export async function PATCH(req: Request, ctx: Ctx) {
  if (isMultipart(req)) {
    const res = await proxyStreamToBackend(req, {
      method: "PATCH",
      upstreamPath: withId(ctx),
      forwardQuery: false,
    });

    if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
    return res;
  }

  const body = await req.json().catch(() => null);
  const res = await proxyToBackend(req, withId(ctx), {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
  return res;
}
