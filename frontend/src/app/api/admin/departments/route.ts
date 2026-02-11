import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/depts");
}

export async function POST(req: Request) {
  const body = await req.json();
  return proxyToBackend(req, "/api/v1/admin/depts", {
    method: "POST",
    body,
  });
}
