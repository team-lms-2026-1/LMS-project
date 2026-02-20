import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { spaceId: string } };

const TAG = (spaceId: string) => `student:spaces:rooms:${spaceId}`;
const STUDENT_RENTALS_TAG = "student:rentals";
const ADMIN_RENTALS_TAG = "admin:spaces-rentals";

function backendPath(ctx: Ctx) {
  return `/api/v1/student/spaces/${encodeURIComponent(ctx.params.spaceId)}/rooms`;
}

export async function GET(req: Request, ctx: Ctx) {
  const spaceId = ctx.params.spaceId;

  return proxyToBackend(req, backendPath(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 300, tags: [TAG(spaceId)] },
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const spaceId = ctx.params.spaceId;

  // 일반적으로 룸 생성은 application/json
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, backendPath(ctx), {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  // ✅ 성공하면 rooms 목록 캐시 무효화
  if (res.status >= 200 && res.status < 300) {
    revalidateTag(TAG(spaceId));
    revalidateTag(STUDENT_RENTALS_TAG);
    revalidateTag(ADMIN_RENTALS_TAG);
  }

  return res;
}
