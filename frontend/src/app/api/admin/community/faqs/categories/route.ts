import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_PATH = "/api/v1/admin/community/faq/categories";
const TAG = "admin:faq:categories";

export async function GET(req: Request) {
  return proxyToBackend(req, BACKEND_PATH, {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, BACKEND_PATH, {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);
  return res;
}
