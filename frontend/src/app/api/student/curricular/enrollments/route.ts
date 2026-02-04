import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curricular-offering";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/curriculars/enrollList", { 
    method: "GET",
    cache: "force-cache",
    next: {revalidate: 600, tags: [TAG]}
  });
}