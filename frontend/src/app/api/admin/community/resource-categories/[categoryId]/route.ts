import { proxyStreamToBackend } from "@/lib/bff";

export const runtime = "nodejs";

const UPSTREAM = "/api/v1/admin/community/resources/categories";

export async function PUT(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`,
    method: "PUT",
    forwardQuery: false,
  });
}

export async function PATCH(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`,
    method: "PATCH",
    forwardQuery: false,
  });
}

export async function DELETE(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`,
    method: "DELETE",
    forwardQuery: false,
  });
}
