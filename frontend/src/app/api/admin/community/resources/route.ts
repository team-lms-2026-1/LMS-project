import { proxyToBackend, proxyStreamToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = "admin:resources";
const STUDENT_TAG = "student:resources";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/community/resources", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

function isMultipart(req: Request) {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  return ct.startsWith("multipart/form-data");
}

export async function POST(req: Request) {
  if (isMultipart(req)) {
    const res = await proxyStreamToBackend(req, {
      method: "POST",
      upstreamPath: "/api/v1/admin/community/resources",
      forwardQuery: false,
    });

    if (res.ok) {
      revalidateTag(TAG);
      revalidateTag(STUDENT_TAG);
    }
    return res;
  }

  const res = await proxyToBackend(req, "/api/v1/admin/community/resources", {
    method: "POST",
    forwardQuery: false,
    cache: "no-store",
  });

  if (res.ok) {
    revalidateTag(TAG);
    revalidateTag(STUDENT_TAG);
  }
  return res;
}
