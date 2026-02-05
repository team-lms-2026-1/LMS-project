import { proxyToBackend } from "@/lib/bff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_PATH = "/api/v1/student/spaces";


const TAG = "student:spaces:list";

export async function GET(req: Request) {
  return proxyToBackend(req, BACKEND_PATH, {
    method: "GET",
    forwardQuery: true,
    cache: "force-cache",
    next: { revalidate: 600, tags: [TAG] }, 
  });
}
