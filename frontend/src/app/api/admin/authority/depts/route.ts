import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:depts";

export async function GET(req: Request) {
  // bff.ts proxyToBackend defaults cache to 'force-cache', which conflicts with revalidate.
  // Manually fetch to avoid touching shared code.
  const base = process.env.API_BASE_URL ?? process.env.ADMIN_API_BASE_URL ?? "http://localhost:8080";
  const { cookies } = await import("next/headers");
  const token = cookies().get("access_token")?.value;

  const res = await fetch(`${base}/api/v1/admin/depts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 600, tags: [TAG] },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json();

  const res = await proxyToBackend(req, "/api/v1/admin/depts", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store"
  });

  if (res.ok) revalidateTag(TAG);

  return res;
}
