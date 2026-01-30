import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:notices";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/community/notices", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

function isMultipart(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  return ct.toLowerCase().includes("multipart/form-data");
}

export async function POST(req: Request) {
  // ✅ multipart 업로드는 스트리밍 프록시 사용 (Authorization 포함, boundary 유지)
  if (isMultipart(req)) {
    const res = await proxyStreamToBackend(req, {
      method: "POST",
      upstreamPath: "/api/v1/admin/community/notices",
      forwardQuery: false,
    });

    if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
    return res;
  }

  // ✅ JSON 요청(파일 없는 등록)은 기존대로
  const body = await req.json();

  const res = await proxyToBackend(req, "/api/v1/admin/community/notices", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
