import { proxyStreamToBackend } from "@/lib/bff";

export const runtime = "nodejs";

const UPSTREAM = "/api/v1/admin/community/resources";

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

// 필요 시(부분 수정)
export async function PATCH(req: Request) {
  return proxyStreamToBackend(req, {
    upstreamPath: UPSTREAM,
    method: "PATCH",
    forwardQuery: false,
  });
}
