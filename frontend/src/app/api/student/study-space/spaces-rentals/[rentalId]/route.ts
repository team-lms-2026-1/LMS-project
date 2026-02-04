import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = "/api/v1/student/spaces-rentals";

type Ctx = { params: { rentalId: string } };

/** ✅ 단건 태그 + 목록 태그 */
const LIST_TAG = "student:rentals";
const ITEM_TAG = (rentalId: string) => `student:rentals:${rentalId}`;

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.rentalId)}`;
}

/** ✅ 단건 상세 조회 (반려 사유 확인용) */
export async function GET(req: Request, ctx: Ctx) {
  const rentalId = ctx.params.rentalId;

  return proxyToBackend(req, withId(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 300, tags: [ITEM_TAG(rentalId)] },
  });
}


export async function PATCH(req: Request, ctx: Ctx) {
  const rentalId = ctx.params.rentalId;


  const upstreamPath = `${withId(ctx)}/cancel`;

  const res = await proxyToBackend(req, upstreamPath, {
    method: "PATCH",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) {
    revalidateTag(LIST_TAG);
    revalidateTag(ITEM_TAG(rentalId));
  }

  return res;
}
