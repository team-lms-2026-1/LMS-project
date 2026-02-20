import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:spaces";
const STUDENT_LIST_TAG = "student:spaces:list";
const STUDENT_DETAIL_TAG = (spaceId: string) => `student:spaces:detail:${spaceId}`;
const STUDENT_ROOMS_TAG = (spaceId: string) => `student:spaces:rooms:${spaceId}`;

type Ctx = { params: { spaceId: string; roomId: string } };

function upstreamOne(ctx: Ctx) {
  const spaceId = encodeURIComponent(ctx.params.spaceId);
  const roomId = encodeURIComponent(ctx.params.roomId);
  return `/api/v1/admin/spaces/${spaceId}/admin-rooms/${roomId}`;
}

/** ✅ 단건 조회 (필요 없으면 삭제해도 됨) */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, upstreamOne(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "no-store",
  });
}

/** ✅ 수정: 백엔드가 PATCH 지원 */
export async function PATCH(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, upstreamOne(ctx), {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_LIST_TAG);
    revalidateTag(STUDENT_DETAIL_TAG(ctx.params.spaceId));
    revalidateTag(STUDENT_ROOMS_TAG(ctx.params.spaceId));
  }
  return res;
}

/** ✅ 삭제 */
export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, upstreamOne(ctx), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_LIST_TAG);
    revalidateTag(STUDENT_DETAIL_TAG(ctx.params.spaceId));
    revalidateTag(STUDENT_ROOMS_TAG(ctx.params.spaceId));
  }
  return res;
}
