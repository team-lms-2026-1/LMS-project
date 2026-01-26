import { proxyStreamToBackend } from "@/lib/bff";

export const runtime = "nodejs";

const UPSTREAM = "/api/v1/admin/community/resources";

export async function GET(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`,
    method: "GET",
    forwardQuery: true,
  });
}

export async function PUT(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`,
    method: "PUT",
    forwardQuery: false,
  });
}

export async function PATCH(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`,
    method: "PATCH",
    forwardQuery: false,
  });
}

export async function DELETE(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyStreamToBackend(req, {
    upstreamPath: `${UPSTREAM}/${encodeURIComponent(ctx.params.resourceId)}`,
    method: "DELETE",
    forwardQuery: false,
  });
}
