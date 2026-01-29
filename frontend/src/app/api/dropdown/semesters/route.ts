import { proxyToBackend } from "@/lib/bff";

const TAG = "dropdown:semesters";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/semesters/dropdown", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] },
  });
}