import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = "/api/v1/admin/spaces";

/** ✅ 목록/상세에서 같이 쓰는 캐시 태그 */
const TAG = "admin:spaces";
const STUDENT_LIST_TAG = "student:spaces:list";
const STUDENT_DETAIL_TAG = (spaceId: string) => `student:spaces:detail:${spaceId}`;

type Ctx = { params: { spaceId: string } };

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.spaceId)}`;
}

/** ✅ 단건 상세 조회 */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), {
    method: "GET",
    forwardQuery: true,

    // 상세도 캐시 태그로 묶어두면 삭제/수정 시 invalidate 쉬움
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

/** ✅ 삭제 */
export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, withId(ctx), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  // ✅ 삭제 성공 시 목록/상세 캐시 무효화
  if (res.status >= 200 && res.status < 300) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_LIST_TAG);
    revalidateTag(STUDENT_DETAIL_TAG(ctx.params.spaceId));
  }

  return res;
}
