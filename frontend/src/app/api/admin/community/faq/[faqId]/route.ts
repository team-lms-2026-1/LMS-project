import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/admin/community/faq";

export async function GET(req: Request, ctx: { params: { faqId: string } }) {
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.faqId}`, {
    method: "GET",
    forwardQuery: true,
  });
}

export async function PUT(req: Request, ctx: { params: { faqId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.faqId}`, {
    method: "PUT",
    body,
    forwardQuery: false,
  });
}

export async function DELETE(req: Request, ctx: { params: { faqId: string } }) {
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.faqId}`, {
    method: "DELETE",
    forwardQuery: false,
  });
}
