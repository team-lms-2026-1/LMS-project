import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = "/api/v1/student/spaces-rentals";
const TAG = "student:rentals";

/** ✅ 목록 조회 */
export async function GET(req: Request) {
  return proxyToBackend(req, BACKEND_BASE, {
    method: "GET",
    forwardQuery: true,
    cache: "no-store",
  });
}

/** ✅ 신청(생성) */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, BACKEND_BASE, {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
  return res;
}
