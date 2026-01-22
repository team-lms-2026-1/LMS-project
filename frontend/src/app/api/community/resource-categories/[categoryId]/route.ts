import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/admin/resource-categories"; // TODO 실제 경로로 수정

export async function PUT(req: Request, ctx: { params: { categoryId: string } }) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.categoryId}`, { method: "PUT", body, forwardQuery: false });
}
export async function DELETE(req: Request, ctx: { params: { categoryId: string } }) {
  return proxyToBackend(req, `${BACKEND_PATH}/${ctx.params.categoryId}`, { method: "DELETE", forwardQuery: false });
}
