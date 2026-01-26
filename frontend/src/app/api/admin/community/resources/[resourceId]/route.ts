// src/app/api/admin/community/resources/[resourceId]/route.ts
import { proxyToBackend } from "@/lib/bff";

const UPSTREAM = "/api/v1/admin/community/resources";

export async function GET(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`, {
    method: "GET",
    forwardQuery: true,
  });
}

export async function PUT(req: Request, ctx: { params: { resourceId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`, {
    method: "PUT",
    body,
    forwardQuery: false,
  });
}

// ✅ PATCH 추가
export async function PATCH(req: Request, ctx: { params: { resourceId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`, {
    method: "PATCH",
    body,
    forwardQuery: false,
  });
}

export async function DELETE(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyToBackend(req, `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`, {
    method: "DELETE",
    forwardQuery: false,
  });
}
