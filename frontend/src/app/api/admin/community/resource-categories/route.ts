import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/admin/community/resources/categories";

export async function GET(req: Request) {
  // querystring(page, size, keyword 등) 그대로 forward
  return proxyToBackend(req, BACKEND_PATH, { method: "GET", forwardQuery: true });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, BACKEND_PATH, { method: "POST", body, forwardQuery: false });
}
