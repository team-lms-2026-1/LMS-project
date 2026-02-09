import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const BACKEND_BASE = "/api/v1/admin/community/notices/categories";
const TAG_CATEGORIES = "admin:notices:categories";
const TAG_NOTICES = "admin:notices";

type Ctx = { params: { categoryId: string } };

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.categoryId)}`;
}

/** 단건 조회 */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG_CATEGORIES] }, 
  });
}

/** 단건 부분 수정 */
export async function PATCH(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);
  const res = await proxyToBackend(req, withId(ctx), {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG_CATEGORIES);
    revalidateTag(TAG_NOTICES); 
  }
  return res;
}

/** 단건 삭제 */
export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, withId(ctx), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG_CATEGORIES);
    revalidateTag(TAG_NOTICES); 
  }
  return res;
}
