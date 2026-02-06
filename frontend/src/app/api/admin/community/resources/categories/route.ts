import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const UPSTREAM = "/api/v1/admin/community/resources/categories";

const TAG_CATEGORIES = "admin:resources:categories";
const TAG_RESOURCES = "admin:resources";

export async function GET(req: Request) {
  return proxyToBackend(req, UPSTREAM, {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG_CATEGORIES] },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, UPSTREAM, {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG_CATEGORIES);
    revalidateTag(TAG_RESOURCES); 
  }
  return res;
}
