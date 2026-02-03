import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:spaces";

function isMultipart(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  return ct.toLowerCase().includes("multipart/form-data");
}

export async function POST(req: Request) {
  if (isMultipart(req)) {
    const res = await proxyStreamToBackend(req, {
      method: "POST",
      upstreamPath: "/api/v1/admin/spaces",
      forwardQuery: false,
    });

    if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
    return res;
  }

  const body = await req.json().catch(() => null);
  const res = await proxyToBackend(req, "/api/v1/admin/spaces", {
    method: "POST",
    body,
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.status >= 200 && res.status < 300) revalidateTag(TAG);
  return res;
}
