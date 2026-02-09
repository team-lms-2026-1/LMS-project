import { proxyToBackend } from "@/lib/bff";

const TAG = "admin:extra-curricular-grade-reports";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/extra-curricular/grade-reports", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}
