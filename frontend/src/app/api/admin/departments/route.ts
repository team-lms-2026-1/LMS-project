import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";

async function handleRequest(req: Request) {
  const method = req.method as "GET" | "POST";
  let body = undefined;

  // Body 처리
  if (method !== "GET" && method !== "HEAD") {
    try {
      const bodyText = await req.text();
      if (bodyText) {
        body = JSON.parse(bodyText);
      }
    } catch (e) {
      console.warn("[DepartmentListBFF] Failed to parse request body", e);
    }
  }

  // /api/v1/admin/depts 로 프록시
  return proxyToBackend(req, "/api/v1/admin/depts", {
    method,
    body,
  });
}

export async function GET(req: Request) { return handleRequest(req); }
export async function POST(req: Request) { return handleRequest(req); }
