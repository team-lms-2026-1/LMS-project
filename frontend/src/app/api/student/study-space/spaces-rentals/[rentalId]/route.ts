import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = "/api/v1/student/spaces-rentals";

type Ctx = { params: { rentalId: string } };

/** ✅ 태그는 하나만 */
const TAG = "student:rentals";
const ADMIN_TAG = "admin:spaces-rentals";

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.rentalId)}`;
}

/** ✅ 단건 상세 조회 (반려 사유 확인용) */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 300, tags: [TAG] },
  });
}

/** ✅ 취소 */
export async function PATCH(req: Request, ctx: Ctx) {
  const upstreamPath = `${withId(ctx)}/cancel`;

  const res = await proxyToBackend(req, upstreamPath, {
    method: "PATCH",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) {
    revalidateTag(TAG);
    revalidateTag(ADMIN_TAG);
  }

  return res;
}
