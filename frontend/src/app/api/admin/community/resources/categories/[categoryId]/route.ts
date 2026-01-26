// src/app/api/admin/community/resources/categories/[categoryId]/route.ts
import { proxyToBackend } from "@/lib/bff";

const UPSTREAM = "/api/v1/admin/community/resources/categories";

// ✅ PATCH 추가
export async function PATCH(req: Request, ctx: { params: { categoryId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`, {
    method: "PATCH",
    body,
    forwardQuery: false,
  });
}

export async function PUT(req: Request, ctx: { params: { categoryId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`, {
    method: "PUT",
    body,
    forwardQuery: false,
  });
}

export async function DELETE(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.categoryId)}`, {
    method: "DELETE",
    forwardQuery: false,
  });
}
