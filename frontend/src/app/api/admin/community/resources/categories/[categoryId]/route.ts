import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = "/api/v1/admin/community/resources/categories";
const TAG = "admin:resources:categories";

type Ctx = { params: { categoryId: string } };

function withId(ctx: Ctx) {
  return `${BACKEND_BASE}/${encodeURIComponent(ctx.params.categoryId)}`;
}

/** 단건 조회 */
export async function GET(req: Request, ctx: Ctx) {
  return proxyToBackend(req, withId(ctx), {
    method: "GET",
    forwardQuery: true,
  });
}

/** 단건 수정 - PUT */
export async function PUT(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, withId(ctx), {
    method: "PUT",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}

/** 단건 부분 수정 - PATCH */
export async function PATCH(req: Request, ctx: Ctx) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, withId(ctx), {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}

/** 단건 삭제 */
export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, withId(ctx), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
