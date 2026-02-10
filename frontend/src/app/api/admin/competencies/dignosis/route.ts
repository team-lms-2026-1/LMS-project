import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:diagnoses";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/diagnoses", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const res = await proxyToBackend(req, "/api/v1/admin/diagnoses", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store",
  });

  if (res.ok) revalidateTag(TAG);

  return res;
}
