import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "admin:curricular-grade-reports";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/curricular/grade-reports", { 
    method: "GET",
    cache: "force-cache",
    next: {revalidate: 600, tags: [TAG]}
  });
}