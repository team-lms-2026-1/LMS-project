import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/admin/community/resources";

export async function GET(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.resourceId}`, {
    method: "GET",
    forwardQuery: true,
  });
}

export async function PUT(req: Request, ctx: { params: { resourceId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.resourceId}`, {
    method: "PUT",
    body,
    forwardQuery: false,
  });
}

export async function DELETE(req: Request, ctx: { params: { resourceId: string } }) {
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.resourceId}`, {
    method: "DELETE",
    forwardQuery: false,
  });
}
