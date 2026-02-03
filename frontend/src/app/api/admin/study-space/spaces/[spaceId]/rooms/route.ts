import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:spaces";

type Ctx = { params: { spaceId: string } };

function upstreamBase(ctx: Ctx) {
  const spaceId = encodeURIComponent(ctx.params.spaceId);
  return `/api/v1/admin/spaces/${spaceId}/admin-rooms`;
}

/** ✅ 목록 조회 */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, upstreamBase(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "no-store",
  });
}

/** ✅ 스터디룸 생성 */
export async function POST(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, upstreamBase(ctx), {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
