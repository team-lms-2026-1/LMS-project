import { proxyToBackend } from "@/lib/bff";

const UPSTREAM = "/api/v1/admin/community/faq/categories";

export async function PATCH(req: Request, ctx: { params: { categoryId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`, {
    method: "PATCH",
    body,
    forwardQuery: false,
    cache: "no-store",
  });
}

export async function DELETE(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`, {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });
}
