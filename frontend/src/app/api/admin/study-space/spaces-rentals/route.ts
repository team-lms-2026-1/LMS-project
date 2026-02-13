import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:spaces-rentals";
const STUDENT_TAG = "student:rentals";

export async function GET(req: Request) {
  const upstream = `/api/v1/admin/spaces-rentals`;

  return proxyToBackend(req, upstream, {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

export async function PATCH(req: Request) {
  const upstream = `/api/v1/admin/spaces-rentals`;
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, upstream, {
    method: "PATCH",
    body,
    forwardQuery: true,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}
