import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/admin/community/faq/categories"; 

export async function PUT(req: Request, ctx: { params: { categoryId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.categoryId}`, { method: "PUT", body, forwardQuery: false });
}
export async function DELETE(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.categoryId}`, { method: "DELETE", forwardQuery: false });
}
