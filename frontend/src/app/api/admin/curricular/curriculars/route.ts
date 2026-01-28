import { proxyToBackend } from "@/lib/bff";

const TAG = "admin:curriculars";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/admin/curriculars", { 
    method: "GET",
    cache: "force-cache",
    next: {revalidate: 600, tags: [TAG]}
  });
}
