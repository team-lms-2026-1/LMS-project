import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curricular-offering";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/curriculars", { 
    method: "GET",
    cache: "force-cache",
    next: {revalidate: 600, tags: [TAG]}
  });
}

// todo
export async function POST(req: Request) {
  const body = await req.json();

  const res = await proxyToBackend(req, "/api/v1/admin/curricular-offerings", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store"
  });

  if (res.ok) revalidateTag(TAG);

  return res;
}
