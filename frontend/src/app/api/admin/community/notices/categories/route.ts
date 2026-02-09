import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG_CATEGORIES = "admin:notices:categories";
const TAG_NOTICES = "admin:notices"; 

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/community/notices/categories", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG_CATEGORIES] },
    forwardQuery: true,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, "/api/v1/admin/community/notices/categories", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG_CATEGORIES);
    revalidateTag(TAG_NOTICES);
  }
  return res;
}
