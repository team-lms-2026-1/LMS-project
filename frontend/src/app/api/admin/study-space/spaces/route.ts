import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_PATH = "/api/v1/admin/spaces";

const TAG = "admin:spaces";

export async function GET(req: Request) {
  return proxyToBackend(req, BACKEND_PATH, {
    method: "GET",
    forwardQuery: true,

    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

/**
 * ✅ (선택) 생성도 여기서 처리 가능
 * - 네가 /spaces/new/route.ts를 따로 만들었으면, 이 POST는 안 써도 됨.
 * - 그래도 "다른 라우터처럼" base에 POST를 두고 싶으면 아래 그대로 사용.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, BACKEND_PATH, {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  // ✅ 생성 성공 시 목록 캐시 무효화
  if (res.status >= 200 && res.status < 300) revalidateTag(TAG);

  return res;
}
