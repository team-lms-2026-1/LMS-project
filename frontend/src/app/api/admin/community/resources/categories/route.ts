// src/app/api/admin/community/resources/categories/route.ts
import { proxyToBackend } from "@/lib/bff";

const UPSTREAM = "/api/v1/admin/community/resources/categories";

export async function GET(req: Request) {
  return proxyToBackend(req, UPSTREAM, { method: "GET", forwardQuery: true });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return proxyToBackend(req, UPSTREAM, { method: "POST", body, forwardQuery: false });
}
