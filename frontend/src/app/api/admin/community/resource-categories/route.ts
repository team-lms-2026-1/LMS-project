import { proxyStreamToBackend } from "@/lib/bff";

export const runtime = "nodejs";

const UPSTREAM = "/api/v1/admin/community/resources/categories";

export async function GET(req: Request) {
  return proxyStreamToBackend(req, {
    upstreamPath: UPSTREAM,
    method: "GET",
    forwardQuery: true,
  });
}

export async function POST(req: Request) {
  return proxyStreamToBackend(req, {
    upstreamPath: UPSTREAM,
    method: "POST",
    forwardQuery: false,
  });
}
