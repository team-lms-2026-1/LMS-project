import { proxyToBackend } from "@/lib/bff";

const BACKEND_PATH = "/api/v1/admin/community/faq";

export async function GET(req: Request) {
  return proxyToBackend(req, BACKEND_PATH, {
    method: "GET",
    forwardQuery: true,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, BACKEND_PATH, {
    method: "POST",
    body,
    forwardQuery: false,
  });
}
