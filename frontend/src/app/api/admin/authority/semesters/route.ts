import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:semesters";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/semesters", { 
    method: "GET",
    cache: "force-cache",
    next: {revalidate: 600, tags: [TAG]}
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  const res = await proxyToBackend(req, "/api/v1/admin/semesters", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store"
  });

  // ✅ POST 성공 시: GET 캐시 무효화
  if (res.status >= 200 && res.status < 300) {
    revalidateTag(TAG);
  }

  return res;
  
}
