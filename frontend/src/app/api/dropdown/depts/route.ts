import { proxyToBackend } from "@/lib/bff";

const TAG = "dropdown:depts";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/depts/dropdown", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}