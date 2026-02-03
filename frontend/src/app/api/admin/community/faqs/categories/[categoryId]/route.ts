import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = "/api/v1/admin/community/faq/categories";
const TAG = "admin:faq:categories";

type Ctx = { params: { categoryId: string } };

function withId(ctx: Ctx) {
  return `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`;
}

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

export async function DELETE(req: Request, ctx: Ctx) {
  const res = await proxyToBackend(req, withId(ctx), {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
